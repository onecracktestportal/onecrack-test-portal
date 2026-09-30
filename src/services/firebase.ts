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
  onSnapshot,
  deleteDoc
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
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { StudentProfile, ExamSubmission, CorrectionRequest, TestDefinition } from '../types/exam';
import { DEFAULT_AVAILABLE_TESTS } from '../data/defaultTests';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
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

/** Map Firebase Auth / OAuth error codes to candidate-friendly messages. Never invent guest profiles. */
export function mapAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  const message = (err as { message?: string })?.message || '';

  const map: Record<string, string> = {
    'auth/popup-closed-by-user': 'Google sign-in was cancelled. Close any blocker and try again, or use email registration.',
    'auth/cancelled-popup-request': 'Another sign-in popup is already open. Finish or close it, then retry.',
    'auth/popup-blocked': 'Your browser blocked the Google sign-in popup. Allow popups for this site and try again.',
    'auth/unauthorized-domain': 'This website domain is not authorized for Google sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains.',
    'auth/operation-not-allowed': 'Google sign-in is not enabled. Enable the Google provider in Firebase Console → Authentication → Sign-in method.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method. Use email/password login or reset password.',
    'auth/network-request-failed': 'Network error during Google sign-in. Check your connection and retry.',
    'auth/internal-error': 'Google sign-in failed due to a temporary service error. Please try again in a moment.',
    'auth/invalid-api-key': 'Authentication configuration error (invalid API key). Contact the portal administrator.',
    'auth/app-not-authorized': 'This app is not authorized for Google sign-in. Check Firebase / OAuth client settings.',
    'auth/user-disabled': 'This Google account has been disabled for the portal.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes and try again.',
    'auth/invalid-credential': 'Invalid credentials. Please try again or register with email OTP.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/user-not-found': 'No account found for these credentials. Please register first.',
    'auth/email-already-in-use': 'This email is already registered. Sign in instead, or use password reset.',
    'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
  };

  if (code && map[code]) return map[code];
  if (message.toLowerCase().includes('popup')) {
    return 'Google sign-in popup could not complete. Allow popups or use Register with email OTP.';
  }
  if (code) return `Sign-in failed (${code}). Use email registration if the problem continues.`;
  return message || 'Sign-in failed. Please try again or register with email OTP.';
}

// Google Sign-In with Firebase Auth — throws mapped errors; never creates fake guest profiles
export async function signInWithGoogle(): Promise<{ user: FirebaseUser; profile: StudentProfile }> {
  try {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (!user?.uid) {
      throw new Error('Google sign-in did not return a valid user. Please try again.');
    }

    if (!user.email) {
      throw new Error('Your Google account has no email. Use Register with a valid email and OTP instead.');
    }

    const studentRef = doc(db, 'students', user.uid);
    let snap;
    try {
      snap = await getDoc(studentRef);
    } catch (fsErr) {
      console.warn('Firestore profile lookup after Google auth:', fsErr);
      snap = null;
    }

    if (snap && snap.exists()) {
      const data = snap.data() as StudentProfile;
      localStorage.setItem('cbt_active_student', JSON.stringify(data));
      return { user, profile: data };
    }

    const ocRoll = generateOCRollNumber();
    const newProfile: StudentProfile = {
      uid: user.uid,
      name: user.displayName || user.email.split('@')[0] || 'Candidate',
      email: user.email,
      category: 'General / Unreserved (UR)',
      applicationNumber: `NEET2026-G-${Math.floor(100000 + Math.random() * 900000)}`,
      rollNumber: ocRoll,
      photoUrl: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      systemId: `LAB-02 / NODE-${Math.floor(10 + Math.random() * 89)}`,
      examCenter: 'OneCrack Central Assessment Center - Center Code: OC-DL01',
      role: 'student',
      isRegistered: true,
      registeredAt: new Date().toISOString()
    };

    try {
      await setDoc(studentRef, newProfile);
    } catch (saveErr) {
      console.warn('Could not persist Google profile to Firestore; using session profile only:', saveErr);
    }

    // Also index in local registered users for password-less Google sessions
    try {
      const usersRaw = localStorage.getItem('cbt_registered_users');
      const userMap: Record<string, { profile: StudentProfile; passwordHash?: string }> = usersRaw ? JSON.parse(usersRaw) : {};
      userMap[user.uid] = { profile: newProfile, passwordHash: 'google-oauth' };
      userMap[user.email.toLowerCase()] = { profile: newProfile, passwordHash: 'google-oauth' };
      userMap[ocRoll] = { profile: newProfile, passwordHash: 'google-oauth' };
      localStorage.setItem('cbt_registered_users', JSON.stringify(userMap));
    } catch {
      // ignore
    }

    localStorage.setItem('cbt_active_student', JSON.stringify(newProfile));
    return { user, profile: newProfile };
  } catch (err) {
    const friendly = mapAuthError(err);
    console.error('[OneCrack OAuth]', (err as { code?: string })?.code || err, friendly);
    throw new Error(friendly);
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
      if (password && found.passwordHash && found.passwordHash !== password && found.passwordHash !== 'default') {
        throw new Error('Incorrect password. Use Reset PW tab if you forgot it.');
      }
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
export async function deleteTestDefinition(testId: string): Promise<boolean> {
  try {
    // Remove from local cache of tests
    const localRaw = localStorage.getItem('cbt_custom_tests');
    if (localRaw) {
      const list = JSON.parse(localRaw) as TestDefinition[];
      const filtered = list.filter(t => t.id !== testId);
      localStorage.setItem('cbt_custom_tests', JSON.stringify(filtered));
    }
    try {
      window.dispatchEvent(new CustomEvent('cbt_tests_updated', { detail: { deletedId: testId } }));
    } catch { /* ignore */ }
    // Attempt Firestore delete
    try {
      await deleteDoc(doc(db, 'tests', testId));
    } catch (e) {
      console.warn('Firestore delete non-fatal:', e);
    }
    try {
      await fetch(`/api/sql/tests/${encodeURIComponent(testId)}`, { method: 'DELETE' });
    } catch {
      // optional SQL
    }
    return true;
  } catch (err) {
    console.error('deleteTestDefinition failed', err);
    return false;
  }
}

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


/** Archive exam result PDFs under result-pdfs/{roll}/{submissionId}/ in Firebase Storage (project cloud, not personal Drive). */
export async function archiveResultPdfs(
  submissionId: string,
  rollNumber: string,
  files: { filename: string; blob: Blob }[]
): Promise<{ ok: boolean; urls: string[]; error?: string }> {
  const urls: string[] = [];
  try {
    const roll = (rollNumber || 'UNKNOWN').replace(/[^a-zA-Z0-9._-]/g, '_');
    const sid = (submissionId || `SUB-${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_');
    for (const f of files) {
      const safeName = f.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `result-pdfs/${roll}/${sid}/${safeName}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, f.blob, {
        contentType: 'application/pdf',
        customMetadata: {
          rollNumber: roll,
          submissionId: sid,
          archivedAt: new Date().toISOString(),
        },
      });
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    // Persist download links on the submission document when possible
    try {
      const subRef = doc(db, 'submissions', submissionId);
      await setDoc(subRef, { archivedPdfUrls: urls, pdfArchivedAt: new Date().toISOString() }, { merge: true });
    } catch {
      // non-blocking
    }
    return { ok: true, urls };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[OneCrack] PDF cloud archive failed:', msg);
    return { ok: false, urls, error: msg };
  }
}
