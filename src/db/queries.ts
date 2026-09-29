import { db } from './index.ts';
import { students, tests, submissions, correctionRequests } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

// Students
export async function upsertStudent(studentData: {
  uid: string;
  name: string;
  email: string;
  category?: string;
  applicationNumber: string;
  rollNumber: string;
  gender?: string;
  role?: string;
}) {
  try {
    const result = await db.insert(students)
      .values({
        uid: studentData.uid,
        name: studentData.name,
        email: studentData.email,
        category: studentData.category || 'General / Unreserved (UR)',
        applicationNumber: studentData.applicationNumber,
        rollNumber: studentData.rollNumber,
        gender: studentData.gender || 'Unspecified',
        role: studentData.role || 'student',
      })
      .onConflictDoUpdate({
        target: students.uid,
        set: {
          name: studentData.name,
          email: studentData.email,
          category: studentData.category || 'General / Unreserved (UR)',
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed (upsertStudent):", error);
    throw new Error("Failed to save student to database.", { cause: error });
  }
}

export async function getStudentByUid(uid: string) {
  try {
    const rows = await db.select().from(students).where(eq(students.uid, uid));
    return rows[0] || null;
  } catch (error) {
    console.error("Database query failed (getStudentByUid):", error);
    throw new Error("Failed to query student from database.", { cause: error });
  }
}

// Tests
export async function saveTestToDb(testData: {
  id: string;
  title: string;
  chapter: string;
  subject: string;
  durationMinutes: number;
  questionCount: number;
  markingScheme: any;
  description?: string;
  questions: any[];
  createdBy?: string;
}) {
  try {
    const result = await db.insert(tests)
      .values({
        id: testData.id,
        title: testData.title,
        chapter: testData.chapter,
        subject: testData.subject,
        durationMinutes: testData.durationMinutes,
        questionCount: testData.questionCount,
        markingScheme: JSON.stringify(testData.markingScheme),
        description: testData.description || '',
        questions: JSON.stringify(testData.questions),
        createdBy: testData.createdBy || 'OneCrack Academic Board',
      })
      .onConflictDoNothing()
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed (saveTestToDb):", error);
    throw new Error("Failed to save test to database.", { cause: error });
  }
}

export async function getAllTestsFromDb() {
  try {
    const rows = await db.select().from(tests).orderBy(desc(tests.createdAt));
    return rows.map(r => ({
      ...r,
      markingScheme: typeof r.markingScheme === 'string' ? JSON.parse(r.markingScheme) : r.markingScheme,
      questions: typeof r.questions === 'string' ? JSON.parse(r.questions) : r.questions,
    }));
  } catch (error) {
    console.error("Database query failed (getAllTestsFromDb):", error);
    throw new Error("Failed to fetch tests from database.", { cause: error });
  }
}

// Submissions
export async function saveSubmissionToDb(sub: any) {
  try {
    const result = await db.insert(submissions)
      .values({
        id: sub.id,
        testId: sub.testId || 'test-biotech-50q',
        testTitle: sub.testTitle || 'Biotechnology: Principles & Applications',
        studentUid: sub.studentUid,
        studentName: sub.studentName,
        studentEmail: sub.studentEmail,
        applicationNumber: sub.applicationNumber || '',
        rollNumber: sub.rollNumber,
        score: sub.score,
        maxScore: sub.maxScore,
        totalQuestions: sub.totalQuestions,
        correctCount: sub.correctCount,
        incorrectCount: sub.incorrectCount,
        unattemptedCount: sub.unattemptedCount,
        accuracy: String(sub.accuracy),
        percentage: String(sub.percentage),
        timeTakenSeconds: sub.timeTakenSeconds,
        tabSwitches: sub.tabSwitches || 0,
        responses: JSON.stringify(sub.responses || {}),
        questionStatuses: JSON.stringify(sub.questionStatuses || {}),
        topicBreakdown: JSON.stringify(sub.topicBreakdown || {}),
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed (saveSubmissionToDb):", error);
    throw new Error("Failed to save submission to database.", { cause: error });
  }
}

export async function getSubmissionsByStudentUid(studentUid: string) {
  try {
    const rows = await db.select().from(submissions).where(eq(submissions.studentUid, studentUid)).orderBy(desc(submissions.submittedAt));
    return rows.map(r => ({
      ...r,
      accuracy: parseFloat(r.accuracy) || 0,
      percentage: parseFloat(r.percentage) || 0,
      responses: typeof r.responses === 'string' ? JSON.parse(r.responses) : r.responses,
      questionStatuses: r.questionStatuses ? JSON.parse(r.questionStatuses) : {},
      topicBreakdown: r.topicBreakdown ? JSON.parse(r.topicBreakdown) : {},
    }));
  } catch (error) {
    console.error("Database query failed (getSubmissionsByStudentUid):", error);
    throw new Error("Failed to query submissions from database.", { cause: error });
  }
}

export async function getAllSubmissionsFromDb() {
  try {
    const rows = await db.select().from(submissions).orderBy(desc(submissions.submittedAt));
    return rows.map(r => ({
      ...r,
      accuracy: parseFloat(r.accuracy) || 0,
      percentage: parseFloat(r.percentage) || 0,
      responses: typeof r.responses === 'string' ? JSON.parse(r.responses) : r.responses,
      questionStatuses: r.questionStatuses ? JSON.parse(r.questionStatuses) : {},
      topicBreakdown: r.topicBreakdown ? JSON.parse(r.topicBreakdown) : {},
    }));
  } catch (error) {
    console.error("Database query failed (getAllSubmissionsFromDb):", error);
    throw new Error("Failed to fetch all submissions from database.", { cause: error });
  }
}

// Correction Requests
export async function saveCorrectionRequestToDb(ticket: any) {
  try {
    const result = await db.insert(correctionRequests)
      .values({
        id: ticket.id,
        studentUid: ticket.studentUid,
        studentName: ticket.studentName,
        rollNumber: ticket.rollNumber,
        requestedField: ticket.requestedField,
        currentValue: ticket.currentValue,
        requestedValue: ticket.requestedValue,
        reason: ticket.reason,
        status: ticket.status || 'Pending Verification',
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database query failed (saveCorrectionRequestToDb):", error);
    throw new Error("Failed to save correction request to database.", { cause: error });
  }
}
