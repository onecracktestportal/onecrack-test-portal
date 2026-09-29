import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudentProfile, ExamSubmission, CorrectionRequest, TestDefinition } from '../types/exam';
import { DEFAULT_AVAILABLE_TESTS } from '../data/defaultTests';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Strict OC Roll Number Generator: Always "OC" followed by random 6-digit number
export function generateOCRollNumber(): string {
  return `OC-${Math.floor(100000 + Math.random() * 900000)}`;
}

// Test Firestore connection on boot
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline:", error.message);
      return false;
    }
    return true;
  }
}

// Google Sign-In with Firebase Auth
export async function signInWithGoogle(): Promise<{ user: FirebaseUser; profile: StudentProfile }> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  // Look up if user already registered in Firestore
  const studentRef = doc(db, 'students', user.uid);
  const snap = await getDoc(studentRef);
  
  if (snap.exists()) {
    const data = snap.data() as StudentProfile;
    localStorage.setItem('cbt_active_student', JSON.stringify(data));
    return { user, profile: data };
  } else {
    // Generate new student profile with strict OC Roll number
    const cleanAppNo = `NEET2026-NTA-${Math.floor(100000 + Math.random() * 900000)}`;
    const newProfile: StudentProfile = {
      uid: user.uid,
      name: user.displayName || 'Candidate Aspirant',
      email: user.email || 'onecracktestportal@gmail.com',
      category: 'General / Unreserved (UR)',
      applicationNumber: cleanAppNo,
      rollNumber: generateOCRollNumber(),
      photoUrl: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      systemId: `LAB-02 / NODE-${Math.floor(10 + Math.random() * 89)}`,
      examCenter: 'OneCrack Central Assessment Center - Center Code: OC-DL01',
      role: 'student',
      isRegistered: true,
      registeredAt: new Date().toISOString()
    };
    await setDoc(studentRef, newProfile);
    localStorage.setItem('cbt_active_student', JSON.stringify(newProfile));
    return { user, profile: newProfile };
  }
}

// Register student with UID / Email and Password
export async function registerStudentWithCredentials(
  profileData: Omit<StudentProfile, 'systemId' | 'examCenter' | 'isRegistered' | 'registeredAt'>,
  password?: string
): Promise<StudentProfile> {
  // Respect candidate's chosen UID or generate strict clean UID
  const cleanUid = profileData.uid?.trim() 
    ? profileData.uid.trim() 
    : `UID-${Math.floor(100000 + Math.random() * 900000)}`;

  let firebaseUid = cleanUid;
  if (profileData.email && password && password.length >= 6) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, profileData.email, password);
      if (cred.user?.uid) {
        firebaseUid = cred.user.uid;
      }
    } catch (err: unknown) {
      console.warn("Firebase Auth account creation notice:", err);
    }
  }

  const generatedRoll = profileData.rollNumber?.startsWith('OC-') ? profileData.rollNumber : generateOCRollNumber();
  const generatedAppNo = profileData.applicationNumber?.trim() 
    ? profileData.applicationNumber.trim() 
    : `NEET2026-NTA-${Math.floor(100000 + Math.random() * 900000)}`;

  const fullProfile: StudentProfile = {
    ...profileData,
    uid: cleanUid,
    applicationNumber: generatedAppNo,
    rollNumber: generatedRoll,
    systemId: `LAB-02 / NODE-${Math.floor(10 + Math.random() * 89)}`,
    examCenter: 'OneCrack CBT Testing Hub - Sector 62 (Evaluation Block)',
    role: profileData.role || 'student',
    isRegistered: true,
    registeredAt: new Date().toISOString()
  };

  // Save to Firestore under both cleanUid and firebaseUid
  try {
    const studentRef = doc(db, 'students', fullProfile.uid);
    await setDoc(studentRef, fullProfile);
    if (firebaseUid && firebaseUid !== fullProfile.uid) {
      await setDoc(doc(db, 'students', firebaseUid), fullProfile);
    }
  } catch (err) {
    console.warn("Could not save to Firestore directly, persisting locally:", err);
  }

  // Sync to Cloud SQL PostgreSQL in background
  try {
    fetch('/api/sql/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullProfile)
    }).catch(() => {});
  } catch {
    // Non-blocking
  }

  // Save credentials locally for instant offline / UID login
  const usersRaw = localStorage.getItem('cbt_registered_users');
  const userMap: Record<string, { profile: StudentProfile; passwordHash?: string }> = usersRaw ? JSON.parse(usersRaw) : {};
  userMap[fullProfile.uid] = { profile: fullProfile, passwordHash: password || 'default' };
  userMap[fullProfile.uid.toLowerCase()] = { profile: fullProfile, passwordHash: password || 'default' };
  userMap[fullProfile.applicationNumber] = { profile: fullProfile, passwordHash: password || 'default' };
  userMap[fullProfile.rollNumber] = { profile: fullProfile, passwordHash: password || 'default' };
  if (fullProfile.email) {
    userMap[fullProfile.email.toLowerCase()] = { profile: fullProfile, passwordHash: password || 'default' };
  }
  localStorage.setItem('cbt_registered_users', JSON.stringify(userMap));
  localStorage.setItem('cbt_active_student', JSON.stringify(fullProfile));

  try {
    window.dispatchEvent(new CustomEvent('cbt_students_updated', { detail: fullProfile }));
  } catch {
    // Ignore in non-browser context
  }

  return fullProfile;
}

// Login student with UID / Roll Number / Email and Password
export async function loginStudentWithCredentials(
  identifier: string,
  password?: string
): Promise<StudentProfile> {
  const trimmed = identifier.trim();

  // Official Admin Access (ADMIN / 6767)
  if (trimmed.toUpperCase() === 'ADMIN' && password === '6767') {
    const adminProfile: StudentProfile = {
      uid: 'ADMIN',
      name: 'Chief Examination Controller',
      email: 'onecracktestportal@gmail.com',
      category: 'General / Unreserved (UR)',
      applicationNumber: 'ADMIN-KEY-6767',
      rollNumber: 'ADMIN',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
      systemId: 'ADMIN-HQ-NODE',
      examCenter: 'OneCrack Central Command HQ',
      role: 'admin',
      isRegistered: true,
      registeredAt: new Date().toISOString()
    };
    localStorage.setItem('cbt_active_student', JSON.stringify(adminProfile));
    return adminProfile;
  }

  // 1. Try Local Registered Users map first for instant access
  const usersRaw = localStorage.getItem('cbt_registered_users');
  if (usersRaw) {
    const userMap: Record<string, { profile: StudentProfile; passwordHash?: string }> = JSON.parse(usersRaw);
    const found = userMap[trimmed] || userMap[trimmed.toLowerCase()] || userMap[trimmed.toUpperCase()];
    if (found) {
      localStorage.setItem('cbt_active_student', JSON.stringify(found.profile));
      return found.profile;
    }
  }

  // 2. Try direct Firestore lookup by document ID
  try {
    const studentRef = doc(db, 'students', trimmed);
    const snap = await getDoc(studentRef);
    if (snap.exists()) {
      const profile = snap.data() as StudentProfile;
      localStorage.setItem('cbt_active_student', JSON.stringify(profile));
      return profile;
    }
  } catch (err) {
    console.warn("Firestore lookup failed:", err);
  }

  // 3. Query Firestore across Roll Number, Application Number, Email
  try {
    const studentsCol = collection(db, 'students');
    const queries = [
      query(studentsCol, where('rollNumber', '==', trimmed)),
      query(studentsCol, where('applicationNumber', '==', trimmed)),
      query(studentsCol, where('email', '==', trimmed.toLowerCase()))
    ];

    for (const q of queries) {
      const snap = await getDocs(q);
      if (!snap.empty) {
        const profile = snap.docs[0].data() as StudentProfile;
        localStorage.setItem('cbt_active_student', JSON.stringify(profile));
        return profile;
      }
    }
  } catch (err) {
    console.warn("Firestore multi-query notice:", err);
  }

  // 4. Try Firebase Auth if identifier is an email
  if (trimmed.includes('@') && password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, trimmed, password);
      const studentRef = doc(db, 'students', cred.user.uid);
      const snap = await getDoc(studentRef);
      if (snap.exists()) {
        const profile = snap.data() as StudentProfile;
        localStorage.setItem('cbt_active_student', JSON.stringify(profile));
        return profile;
      }
    } catch {
      // Fallback
    }
  }

  // 5. Query Cloud SQL PostgreSQL backend
  try {
    const sqlResp = await fetch(`/api/sql/student/${encodeURIComponent(trimmed)}`);
    if (sqlResp.ok) {
      const sqlData = await sqlResp.json();
      if (sqlData.success && sqlData.student) {
        const profile: StudentProfile = {
          ...sqlData.student,
          isRegistered: true,
          registeredAt: sqlData.student.createdAt || new Date().toISOString()
        };
        localStorage.setItem('cbt_active_student', JSON.stringify(profile));
        return profile;
      }
    }
  } catch {
    // Non-blocking
  }

  throw new Error("Candidate credentials not found. Please register as a new candidate first.");
}

// Submit a Profile Correction Request (since Name & Category cannot be changed directly)
export async function submitProfileCorrectionRequest(request: CorrectionRequest): Promise<boolean> {
  try {
    const reqRef = doc(db, 'correction_requests', request.id);
    await setDoc(reqRef, request);

    const studentRef = doc(db, 'students', request.studentUid);
    await setDoc(studentRef, {
      correctionRequested: true,
      pendingCorrectionNote: `${request.requestedField} correction requested on ${new Date().toLocaleDateString()}`
    }, { merge: true });

    return true;
  } catch (err) {
    console.error("Failed to submit correction request to Firestore:", err);
    const raw = localStorage.getItem('cbt_correction_requests');
    const list: CorrectionRequest[] = raw ? JSON.parse(raw) : [];
    list.unshift(request);
    localStorage.setItem('cbt_correction_requests', JSON.stringify(list));
    return true;
  }
}

// Fetch candidate's submitted correction tickets
export async function fetchCandidateCorrectionRequests(studentUid: string): Promise<CorrectionRequest[]> {
  try {
    const q = query(
      collection(db, 'correction_requests'),
      where('studentUid', '==', studentUid),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as CorrectionRequest);
    }
  } catch (err) {
    console.warn("Fetching local correction requests:", err);
  }

  const raw = localStorage.getItem('cbt_correction_requests');
  if (raw) {
    try {
      const list: CorrectionRequest[] = JSON.parse(raw);
      return list.filter(r => r.studentUid === studentUid);
    } catch {
      return [];
    }
  }
  return [];
}

// Save complete test submission
export async function saveTestSubmission(submission: ExamSubmission): Promise<boolean> {
  try {
    const existingRaw = localStorage.getItem('cbt_all_submissions');
    const existingList: ExamSubmission[] = existingRaw ? JSON.parse(existingRaw) : [];
    existingList.unshift(submission);
    localStorage.setItem('cbt_all_submissions', JSON.stringify(existingList.slice(0, 100)));
    localStorage.setItem('cbt_latest_submission', JSON.stringify(submission));

    const subRef = doc(db, 'submissions', submission.id);
    await setDoc(subRef, {
      id: submission.id,
      testId: submission.testId || 'test-biotech-50q',
      testTitle: submission.testTitle || 'Biotechnology: Principles & Applications',
      studentUid: submission.studentUid,
      studentName: submission.studentName,
      studentEmail: submission.studentEmail,
      rollNumber: submission.rollNumber,
      applicationNumber: submission.applicationNumber,
      score: submission.score,
      maxScore: submission.maxScore,
      totalQuestions: submission.totalQuestions,
      correctCount: submission.correctCount,
      incorrectCount: submission.incorrectCount,
      unattemptedCount: submission.unattemptedCount,
      accuracy: submission.accuracy,
      percentage: submission.percentage,
      timeTakenSeconds: submission.timeTakenSeconds,
      tabSwitches: submission.tabSwitches,
      submittedAt: submission.submittedAt,
      responses: JSON.stringify(submission.responses),
      topicBreakdown: JSON.stringify(submission.topicBreakdown)
    });

    // Sync to Cloud SQL PostgreSQL
    try {
      fetch('/api/sql/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      }).catch(() => {});
    } catch {
      // Non-blocking
    }

    return true;
  } catch (err) {
    console.error("Error saving test submission to Firestore:", err);
    return false;
  }
}

// Fetch all past submissions for a student (for Recharts trend line graph)
export async function fetchSubmissionsForStudent(studentUid: string): Promise<ExamSubmission[]> {
  try {
    const q = query(
      collection(db, 'submissions'),
      where('studentUid', '==', studentUid),
      orderBy('submittedAt', 'asc')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => {
        const data = d.data();
        return {
          ...data,
          responses: typeof data.responses === 'string' ? JSON.parse(data.responses) : (data.responses || {}),
          topicBreakdown: typeof data.topicBreakdown === 'string' ? JSON.parse(data.topicBreakdown) : (data.topicBreakdown || {})
        } as ExamSubmission;
      });
    }
  } catch (err) {
    console.warn("Falling back to local submissions:", err);
  }

  const localRaw = localStorage.getItem('cbt_all_submissions');
  if (localRaw) {
    try {
      const parsed: ExamSubmission[] = JSON.parse(localRaw);
      const studentSubmissions = parsed.filter(s => s.studentUid === studentUid);
      return studentSubmissions.reverse();
    } catch {
      return [];
    }
  }
  return [];
}

// Save a newly generated or updated Test Definition in Firestore & LocalStorage
export async function saveTestDefinition(test: TestDefinition): Promise<boolean> {
  try {
    const testRef = doc(db, 'tests', test.id);
    await setDoc(testRef, {
      ...test,
      questions: JSON.stringify(test.questions)
    });
  } catch (err) {
    console.warn("Could not save test to Firestore, caching locally:", err);
  }

  // Sync to Cloud SQL PostgreSQL
  try {
    fetch('/api/sql/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test)
    }).catch(() => {});
  } catch {
    // Non-blocking
  }

  // Also save in local storage
  const existingRaw = localStorage.getItem('cbt_custom_tests');
  const existingTests: TestDefinition[] = existingRaw ? JSON.parse(existingRaw) : [];
  const updated = [test, ...existingTests.filter(t => t.id !== test.id)];
  localStorage.setItem('cbt_custom_tests', JSON.stringify(updated));

  // Dispatch real-time update event across portal
  try {
    window.dispatchEvent(new CustomEvent('cbt_tests_updated', { detail: test }));
  } catch {
    // Ignore in non-browser context
  }

  return true;
}

// Real-Time subscription for Available Tests across Candidate Portal & Admin
export function subscribeToAvailableTests(callback: (tests: TestDefinition[]) => void): () => void {
  let isSubscribed = true;

  // Initial load
  fetchAvailableTests().then((initial) => {
    if (isSubscribed) callback(initial);
  });

  // 1. Real-time Firestore onSnapshot listener
  let unsubscribeFirestore = () => {};
  try {
    const testsColl = collection(db, 'tests');
    unsubscribeFirestore = onSnapshot(testsColl, (snapshot) => {
      if (!isSubscribed) return;
      const combined: TestDefinition[] = [...DEFAULT_AVAILABLE_TESTS];

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const parsedQuestions = typeof data.questions === 'string' ? JSON.parse(data.questions) : data.questions;
        const testItem: TestDefinition = {
          ...data,
          id: docSnap.id,
          questions: parsedQuestions
        } as TestDefinition;
        if (!combined.some(t => t.id === testItem.id)) {
          combined.push(testItem);
        }
      });

      // Overlay local custom tests if not present
      const localRaw = localStorage.getItem('cbt_custom_tests');
      if (localRaw) {
        try {
          const localTests: TestDefinition[] = JSON.parse(localRaw);
          localTests.forEach(lt => {
            if (!combined.some(t => t.id === lt.id)) {
              combined.push(lt);
            }
          });
        } catch {
          // ignore
        }
      }

      callback(combined);
    }, (err) => {
      console.warn("Firestore onSnapshot tests listener notice:", err);
    });
  } catch (err) {
    console.warn("Could not attach Firestore onSnapshot:", err);
  }

  // 2. Window event listeners for immediate local real-time sync across tabs & components
  const handleUpdateEvent = () => {
    if (!isSubscribed) return;
    fetchAvailableTests().then((updated) => {
      if (isSubscribed) callback(updated);
    });
  };

  window.addEventListener('cbt_tests_updated', handleUpdateEvent);
  window.addEventListener('storage', handleUpdateEvent);

  return () => {
    isSubscribed = false;
    unsubscribeFirestore();
    window.removeEventListener('cbt_tests_updated', handleUpdateEvent);
    window.removeEventListener('storage', handleUpdateEvent);
  };
}

// Fetch all available tests (combines default syllabus tests with custom/AI generated tests)
export async function fetchAvailableTests(): Promise<TestDefinition[]> {
  const allTests: TestDefinition[] = [...DEFAULT_AVAILABLE_TESTS];

  try {
    const testsColl = collection(db, 'tests');
    const snap = await getDocs(testsColl);
    if (!snap.empty) {
      snap.docs.forEach(docSnap => {
        const data = docSnap.data();
        const parsedQuestions = typeof data.questions === 'string' ? JSON.parse(data.questions) : data.questions;
        const testItem: TestDefinition = {
          ...data,
          id: docSnap.id,
          questions: parsedQuestions
        } as TestDefinition;
        if (!allTests.some(t => t.id === testItem.id)) {
          allTests.push(testItem);
        }
      });
    }
  } catch (err) {
    console.warn("Could not load tests from Firestore, using local tests:", err);
  }

  // Check local custom tests
  const localRaw = localStorage.getItem('cbt_custom_tests');
  if (localRaw) {
    try {
      const localTests: TestDefinition[] = JSON.parse(localRaw);
      localTests.forEach(lt => {
        if (!allTests.some(t => t.id === lt.id)) {
          allTests.push(lt);
        }
      });
    } catch {
      // ignore
    }
  }

  return allTests;
}

// Fetch all submissions for Admin Portal
export async function fetchAllSubmissions(): Promise<ExamSubmission[]> {
  try {
    const q = query(
      collection(db, 'submissions'),
      orderBy('submittedAt', 'desc'),
      limit(100)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => {
        const data = d.data();
        return {
          ...data,
          responses: typeof data.responses === 'string' ? JSON.parse(data.responses) : (data.responses || {}),
          topicBreakdown: typeof data.topicBreakdown === 'string' ? JSON.parse(data.topicBreakdown) : (data.topicBreakdown || {})
        } as ExamSubmission;
      });
    }
  } catch (err) {
    console.warn("Falling back to local submissions for admin:", err);
  }

  const localRaw = localStorage.getItem('cbt_all_submissions');
  if (localRaw) {
    try {
      return JSON.parse(localRaw);
    } catch {
      return [];
    }
  }
  return [];
}

// Sign out candidate
export async function signOutCandidate(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch {
    // continue
  }
  localStorage.removeItem('cbt_active_student');
}

// Fetch leaderboard for past results drawer
export async function fetchLeaderboard(): Promise<ExamSubmission[]> {
  try {
    const q = query(
      collection(db, 'submissions'),
      orderBy('score', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => {
        const data = d.data();
        return {
          ...data,
          responses: typeof data.responses === 'string' ? JSON.parse(data.responses) : (data.responses || {}),
          topicBreakdown: typeof data.topicBreakdown === 'string' ? JSON.parse(data.topicBreakdown) : (data.topicBreakdown || {})
        } as ExamSubmission;
      });
    }
  } catch (err) {
    console.warn("Could not fetch Firestore leaderboard, falling back to local storage:", err);
  }

  const localRaw = localStorage.getItem('cbt_all_submissions');
  if (localRaw) {
    try {
      const parsed: ExamSubmission[] = JSON.parse(localRaw);
      return parsed.sort((a, b) => b.score - a.score).slice(0, 20);
    } catch {
      return [];
    }
  }
  return [];
}
