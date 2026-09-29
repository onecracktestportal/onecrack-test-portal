export type QuestionStatus = 
  | 'not_visited'       // Grey
  | 'not_answered'      // Red / Orange
  | 'answered'          // Green
  | 'marked_review'     // Purple
  | 'answered_marked';  // Purple with green dot

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
  optionCode?: string; // e.g. "849101"
}

export interface Question {
  id: number;
  questionCode?: string; // e.g. "QID-902801"
  question: string;
  options: QuestionOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  correctOptionCode?: string; // e.g. "849102"
  topic: 
    | 'Tools of rDNA Technology' 
    | 'Processes of rDNA Technology' 
    | 'Biotech in Agriculture' 
    | 'Biotech in Medicine & Ethics'
    | string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ncertRef: string;
  explanation: string;
  pyqYear?: string; // e.g. "NEET 2024", "NEET 2022 Phase-1", "AIPMT 2018"
  peerStats?: {
    correctPercent: number;
    distractorAPercent?: number;
    distractorBPercent?: number;
    distractorCPercent?: number;
    distractorDPercent?: number;
    unattemptedPercent?: number;
    avgTimeSpentSeconds?: number;
  };
}

export interface TestDefinition {
  id: string;
  title: string;
  chapter: string;
  subject: string;
  questionCount: number;
  durationMinutes: number;
  markingScheme: {
    correct: number;
    incorrect: number;
    unattempted: number;
  };
  description: string;
  questions: Question[];
  createdBy: string;
  createdAt: string;
  tags?: string[];
}

export type CandidateCategory = 
  | 'General / Unreserved (UR)'
  | 'OBC - Non Creamy Layer (OBC-NCL)'
  | 'Scheduled Caste (SC)'
  | 'Scheduled Tribe (ST)'
  | 'Gen - EWS (Economically Weaker Section)'
  | 'PwBD (Persons with Benchmark Disabilities)';

export interface StudentProfile {
  uid: string;
  name: string;
  email: string;
  category: CandidateCategory;
  applicationNumber: string;
  rollNumber: string; // Strictly formatted as "OC" + random digits e.g. "OC-849201"
  photoUrl: string;
  systemId: string;
  examCenter: string;
  gender?: string;
  role?: 'student' | 'admin';
  isRegistered?: boolean;
  registeredAt?: string;
  correctionRequested?: boolean;
  pendingCorrectionNote?: string;
}

export interface CorrectionRequest {
  id: string;
  studentUid: string;
  studentName: string;
  rollNumber: string;
  requestedField: string;
  currentValue: string;
  requestedValue: string;
  reason: string;
  status: 'Pending Verification' | 'Under Review' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface ExamSubmission {
  id: string;
  testId?: string;
  testTitle?: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  applicationNumber: string;
  rollNumber: string;
  score: number;
  maxScore: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  accuracy: number;
  percentage: number;
  timeTakenSeconds: number;
  tabSwitches: number;
  submittedAt: string;
  responses: Record<number, 'A' | 'B' | 'C' | 'D' | null>;
  questionStatuses?: Record<number, QuestionStatus>;
  topicBreakdown: Record<string, { total: number; correct: number; incorrect: number; unattempted: number }>;
}

export interface GroundedExplanationResult {
  questionId: number;
  topic: string;
  groundedSummary: string;
  webSources: { title: string; url: string }[];
  searchQueries: string[];
}
