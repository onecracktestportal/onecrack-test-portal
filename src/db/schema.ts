import { pgTable, text, serial, integer, timestamp } from 'drizzle-orm/pg-core';

// 1. Students / Users Table
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase UID or Roll Number
  name: text('name').notNull(),
  email: text('email').notNull(),
  category: text('category').default('General / Unreserved (UR)'),
  applicationNumber: text('application_number').notNull(),
  rollNumber: text('roll_number').notNull(),
  gender: text('gender').default('Unspecified'),
  role: text('role').default('student'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Tests Table
export const tests = pgTable('tests', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  chapter: text('chapter').notNull(),
  subject: text('subject').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(27),
  questionCount: integer('question_count').notNull().default(50),
  markingScheme: text('marking_scheme').notNull(), // JSON string
  description: text('description'),
  questions: text('questions').notNull(), // JSON string of Question array with optionCodes
  createdBy: text('created_by').default('OneCrack Academic Board'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Submissions Table
export const submissions = pgTable('submissions', {
  id: text('id').primaryKey(),
  testId: text('test_id'),
  testTitle: text('test_title'),
  studentUid: text('student_uid').notNull(),
  studentName: text('student_name').notNull(),
  studentEmail: text('student_email').notNull(),
  applicationNumber: text('application_number'),
  rollNumber: text('roll_number').notNull(),
  score: integer('score').notNull(),
  maxScore: integer('max_score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  correctCount: integer('correct_count').notNull(),
  incorrectCount: integer('incorrect_count').notNull(),
  unattemptedCount: integer('unattempted_count').notNull(),
  accuracy: text('accuracy').notNull(),
  percentage: text('percentage').notNull(),
  timeTakenSeconds: integer('time_taken_seconds').notNull(),
  tabSwitches: integer('tab_switches').notNull().default(0),
  submittedAt: timestamp('submitted_at').defaultNow(),
  responses: text('responses').notNull(), // JSON string
  questionStatuses: text('question_statuses'), // JSON string
  topicBreakdown: text('topic_breakdown'), // JSON string
});

// 4. Correction Requests Table
export const correctionRequests = pgTable('correction_requests', {
  id: text('id').primaryKey(),
  studentUid: text('student_uid').notNull(),
  studentName: text('student_name').notNull(),
  rollNumber: text('roll_number').notNull(),
  requestedField: text('requested_field').notNull(),
  currentValue: text('current_value').notNull(),
  requestedValue: text('requested_value').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('Pending Verification'),
  createdAt: timestamp('created_at').defaultNow(),
});
