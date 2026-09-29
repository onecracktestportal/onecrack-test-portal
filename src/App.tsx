import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BIOTECH_QUESTIONS, EXAM_CONFIG } from './data/biotechQuestions';
import { Question, QuestionStatus, StudentProfile, ExamSubmission, TestDefinition } from './types/exam';
import { CandidateLogin } from './components/CandidateLogin';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { CBTHeader } from './components/CBTHeader';
import { QuestionPalette } from './components/QuestionPalette';
import { QuestionViewer } from './components/QuestionViewer';
import { ExamSummaryModal } from './components/ExamSummaryModal';
import { InstructionsModal } from './components/InstructionsModal';
import { QuestionPaperModal } from './components/QuestionPaperModal';
import { ProctorAlertModal } from './components/ProctorAlertModal';
import { ScorecardView } from './components/ScorecardView';
import { PastResultsDrawer } from './components/PastResultsDrawer';
import { JEEMainsAnswerKeyModal } from './components/JEEMainsAnswerKeyModal';
import { ProtocolsAndCorrectionModal } from './components/ProtocolsAndCorrectionModal';
import { TestStartAnimationModal } from './components/TestStartAnimationModal';
import { saveTestSubmission } from './services/firebase';

const defaultBiotechTest: TestDefinition = {
  id: 'test-biotech-50q',
  title: 'Biotechnology: Principles & Applications (High-Yield NEET 50Q Chapter Test)',
  chapter: 'Biotechnology: Principles & Processes & Applications',
  subject: 'Biology (NEET-UG)',
  questionCount: 50,
  durationMinutes: 27,
  markingScheme: {
    correct: 4,
    incorrect: -1,
    unattempted: 0
  },
  description: 'Authentic NCERT line-by-line NEET-UG chapter test with 50 high-yield questions, palindromes, pBR322, PCR, agarose gel, Bt toxin, RNAi, gene therapy, and patenting.',
  questions: BIOTECH_QUESTIONS,
  createdBy: 'OneCrack Academic Board',
  createdAt: '2026-09-28',
  tags: ['NEET', 'Biology', 'Biotechnology', 'NCERT Class 12']
};

export default function App() {
  // App Phase: 'login' | 'dashboard' | 'exam' | 'scorecard' | 'admin'
  const [appState, setAppState] = useState<'login' | 'dashboard' | 'exam' | 'scorecard' | 'admin'>('login');

  // Candidate Profile
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);

  // Active Test Definition & Questions
  const [currentActiveTest, setCurrentActiveTest] = useState<TestDefinition>(defaultBiotechTest);
  const [questions, setQuestions] = useState<Question[]>(BIOTECH_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [responses, setResponses] = useState<Record<number, 'A' | 'B' | 'C' | 'D' | null>>({});
  const [questionStatuses, setQuestionStatuses] = useState<Record<number, QuestionStatus>>({});
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');

  // Time control (Default 27 Minutes = 1620s or dynamic test duration)
  const [currentTestDurationSeconds, setCurrentTestDurationSeconds] = useState<number>(EXAM_CONFIG.totalSeconds);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(EXAM_CONFIG.totalSeconds);
  const examStartTimeRef = useRef<number | null>(null);

  // Proctoring & Security
  const [tabSwitches, setTabSwitches] = useState<number>(0);
  const [isProctorAlertOpen, setIsProctorAlertOpen] = useState<boolean>(false);

  // Modals
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);
  const [isQuestionPaperOpen, setIsQuestionPaperOpen] = useState<boolean>(false);
  const [isPastResultsOpen, setIsPastResultsOpen] = useState<boolean>(false);
  const [isProtocolsModalOpen, setIsProtocolsModalOpen] = useState<boolean>(false);
  const [isAnswerKeyModalOpen, setIsAnswerKeyModalOpen] = useState<boolean>(false);
  const [answerKeyTest, setAnswerKeyTest] = useState<TestDefinition | null>(null);
  const [answerKeySubmission, setAnswerKeySubmission] = useState<ExamSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Completed Submission for Scorecard View
  const [completedSubmission, setCompletedSubmission] = useState<ExamSubmission | null>(null);

  // Check saved student session on mount
  useEffect(() => {
    const saved = localStorage.getItem('cbt_active_student');
    if (saved) {
      try {
        const student: StudentProfile = JSON.parse(saved);
        setCurrentStudent(student);
      } catch {
        // ignore
      }
    }
  }, []);

  // Audio Beep generator using Web Audio API for proctor alert
  const playAlertTone = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // Audio non-critical
    }
  }, []);

  // Automated pre-test guidelines & Start Animation flow
  const [isGuidelinesModalOpen, setIsGuidelinesModalOpen] = useState<boolean>(false);
  const [isStartAnimationOpen, setIsStartAnimationOpen] = useState<boolean>(false);
  const [pendingTestToStart, setPendingTestToStart] = useState<TestDefinition | null>(null);
  const [pendingStudentToStart, setPendingStudentToStart] = useState<StudentProfile | null>(null);

  const initiateTestLaunch = (test: TestDefinition, studentOverride?: StudentProfile) => {
    const student = studentOverride || currentStudent;
    if (student) {
      setCurrentStudent(student);
      setPendingStudentToStart(student);
    }
    setPendingTestToStart(test);
    setIsGuidelinesModalOpen(true);
  };

  const handleGuidelinesAgreed = () => {
    setIsGuidelinesModalOpen(false);
    setIsStartAnimationOpen(true);
  };

  const handleAnimationComplete = () => {
    setIsStartAnimationOpen(false);
    if (pendingTestToStart) {
      startTestWithDefinition(pendingTestToStart, pendingStudentToStart || undefined);
    }
  };

  // Start test with a specific test definition
  const startTestWithDefinition = (test: TestDefinition, studentOverride?: StudentProfile) => {
    const student = studentOverride || currentStudent;
    if (student) {
      setCurrentStudent(student);
    }
    setCurrentActiveTest(test);
    setQuestions(test.questions && test.questions.length > 0 ? test.questions : BIOTECH_QUESTIONS);
    
    const durationMins = test.durationMinutes || 27;
    const totalSecs = durationMins * 60;
    setCurrentTestDurationSeconds(totalSecs);
    setTimeRemainingSeconds(totalSecs);
    examStartTimeRef.current = Date.now();
    setTabSwitches(0);
    setResponses({});

    // Initialize all to not_visited except question 1 which is not_answered
    const initialStatuses: Record<number, QuestionStatus> = {};
    const targetQuestions = test.questions && test.questions.length > 0 ? test.questions : BIOTECH_QUESTIONS;
    targetQuestions.forEach((q, idx) => {
      initialStatuses[q.id] = idx === 0 ? 'not_answered' : 'not_visited';
    });
    setQuestionStatuses(initialStatuses);
    setCurrentQuestionIndex(0);
    setAppState('exam');
  };

  // Timer Tick
  useEffect(() => {
    if (appState !== 'exam') return;

    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-submit exam when time runs out
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [appState, questions, currentStudent, currentActiveTest]);

  // Window Blur & Visibility Detection (Proctoring)
  useEffect(() => {
    if (appState !== 'exam') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
        setIsProctorAlertOpen(true);
        playAlertTone();
      }
    };

    const handleWindowBlur = () => {
      setTabSwitches((prev) => prev + 1);
      setIsProctorAlertOpen(true);
      playAlertTone();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [appState, playAlertTone]);

  // Calculation and submission
  const handleFinalSubmit = async (isAutoSubmit = false) => {
    if (!currentStudent) return;
    setIsSubmitting(true);

    const now = Date.now();
    const timeSpent = examStartTimeRef.current 
      ? Math.min(currentTestDurationSeconds, Math.round((now - examStartTimeRef.current) / 1000))
      : (currentTestDurationSeconds - timeRemainingSeconds);

    const marksCorrect = currentActiveTest?.markingScheme?.correct ?? 4;
    const marksIncorrect = currentActiveTest?.markingScheme?.incorrect ?? -1;

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const topicStats: Record<string, { total: number; correct: number; incorrect: number; unattempted: number }> = {
      'Tools of rDNA Technology': { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      'Processes of rDNA Technology': { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      'Biotech in Agriculture': { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
      'Biotech in Medicine & Ethics': { total: 0, correct: 0, incorrect: 0, unattempted: 0 },
    };

    questions.forEach((q) => {
      const resp = responses[q.id];
      const topic = q.topic || 'General';

      if (!topicStats[topic]) {
        topicStats[topic] = { total: 0, correct: 0, incorrect: 0, unattempted: 0 };
      }
      topicStats[topic].total++;

      if (resp !== undefined && resp !== null) {
        if (resp === q.correctAnswer) {
          correctCount++;
          topicStats[topic].correct++;
        } else {
          incorrectCount++;
          topicStats[topic].incorrect++;
        }
      } else {
        unattemptedCount++;
        topicStats[topic].unattempted++;
      }
    });

    const score = (correctCount * marksCorrect) + (incorrectCount * marksIncorrect);
    const maxScore = questions.length * marksCorrect;
    const accuracy = (correctCount + incorrectCount) > 0 ? (correctCount / (correctCount + incorrectCount)) * 100 : 0;
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

    const submission: ExamSubmission = {
      id: `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      testId: currentActiveTest?.id || 'test-biotech-50q',
      testTitle: currentActiveTest?.title || 'Biotechnology: Principles & Applications (Chapter Test)',
      studentUid: currentStudent.uid,
      studentName: currentStudent.name,
      studentEmail: currentStudent.email,
      applicationNumber: currentStudent.applicationNumber,
      rollNumber: currentStudent.rollNumber || 'OC-' + Math.floor(100000 + Math.random() * 900000),
      score,
      maxScore,
      totalQuestions: questions.length,
      correctCount,
      incorrectCount,
      unattemptedCount,
      accuracy,
      percentage,
      timeTakenSeconds: timeSpent,
      tabSwitches,
      submittedAt: new Date().toISOString(),
      responses,
      questionStatuses,
      topicBreakdown: topicStats
    };

    // Save to Firestore Database
    await saveTestSubmission(submission);

    setCompletedSubmission(submission);
    setIsSubmitting(false);
    setIsSummaryModalOpen(false);
    setAppState('scorecard');
  };

  // Navigations & Option selections
  const navigateToQuestion = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    // Update status of currently left question if unvisited
    const currentQ = questions[currentQuestionIndex];
    if (questionStatuses[currentQ.id] === 'not_visited') {
      setQuestionStatuses((prev) => ({
        ...prev,
        [currentQ.id]: 'not_answered'
      }));
    }

    // Set target question to not_answered if it was not_visited
    const targetQ = questions[targetIndex];
    if (questionStatuses[targetQ.id] === 'not_visited') {
      setQuestionStatuses((prev) => ({
        ...prev,
        [targetQ.id]: 'not_answered'
      }));
    }

    setCurrentQuestionIndex(targetIndex);
  };

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    const currentQ = questions[currentQuestionIndex];
    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: key
    }));
  };

  const handleClearResponse = () => {
    const currentQ = questions[currentQuestionIndex];
    setResponses((prev) => ({
      ...prev,
      [currentQ.id]: null
    }));
    setQuestionStatuses((prev) => ({
      ...prev,
      [currentQ.id]: 'not_answered'
    }));
  };

  const handleSaveAndNext = () => {
    const currentQ = questions[currentQuestionIndex];
    const hasAnswered = responses[currentQ.id] !== undefined && responses[currentQ.id] !== null;

    setQuestionStatuses((prev) => ({
      ...prev,
      [currentQ.id]: hasAnswered ? 'answered' : 'not_answered'
    }));

    if (currentQuestionIndex < questions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    }
  };

  const handleSaveAndMarkForReview = () => {
    const currentQ = questions[currentQuestionIndex];
    const hasAnswered = responses[currentQ.id] !== undefined && responses[currentQ.id] !== null;

    setQuestionStatuses((prev) => ({
      ...prev,
      [currentQ.id]: hasAnswered ? 'answered_marked' : 'marked_review'
    }));

    if (currentQuestionIndex < questions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    }
  };

  const handleMarkForReviewAndNext = () => {
    const currentQ = questions[currentQuestionIndex];
    setQuestionStatuses((prev) => ({
      ...prev,
      [currentQ.id]: 'marked_review'
    }));

    if (currentQuestionIndex < questions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none text-slate-900">
      {/* 1. Login Phase */}
      {appState === 'login' && (
        <CandidateLogin
          onStartExam={(student) => {
            setCurrentStudent(student);
            initiateTestLaunch(defaultBiotechTest, student);
          }}
          onOpenDashboard={(student) => {
            setCurrentStudent(student);
            if (student.role === 'admin') {
              setAppState('admin');
            } else {
              setAppState('dashboard');
            }
          }}
          onViewPastResults={() => setIsPastResultsOpen(true)}
        />
      )}

      {/* 2. Main Student Test Portal Dashboard */}
      {appState === 'dashboard' && currentStudent && (
        <StudentDashboard
          student={currentStudent}
          onStartTest={(test) => initiateTestLaunch(test)}
          onOpenAnswerKey={(test, sub) => {
            setAnswerKeyTest(test);
            setAnswerKeySubmission(sub || null);
            setIsAnswerKeyModalOpen(true);
          }}
          onOpenProtocols={() => setIsProtocolsModalOpen(true)}
          onLogout={() => {
            localStorage.removeItem('cbt_active_student');
            setCurrentStudent(null);
            setAppState('login');
          }}
          onSwitchToAdmin={() => setAppState('admin')}
        />
      )}

      {/* 3. Admin Control Room & AI Test Generator */}
      {appState === 'admin' && (
        <AdminDashboard
          onBackToPortal={() => setAppState(currentStudent ? 'dashboard' : 'login')}
          onOpenAnswerKey={(test, sub) => {
            setAnswerKeyTest(test);
            setAnswerKeySubmission(sub || null);
            setIsAnswerKeyModalOpen(true);
          }}
        />
      )}

      {/* 4. Active CBT Examination Phase */}
      {appState === 'exam' && currentStudent && (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <CBTHeader
            student={currentStudent}
            timeRemainingSeconds={timeRemainingSeconds}
            totalSeconds={currentTestDurationSeconds}
            onOpenInstructions={() => setIsInstructionsOpen(true)}
            onOpenQuestionPaper={() => setIsQuestionPaperOpen(true)}
            tabSwitches={tabSwitches}
            examTitle={currentActiveTest?.title}
            totalQuestions={questions.length}
            onExitToDashboard={() => setAppState('dashboard')}
          />

          {/* Main Question & Palette Area */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left: Question Viewer */}
            <QuestionViewer
              question={questions[currentQuestionIndex]}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              selectedOption={responses[questions[currentQuestionIndex].id] || null}
              currentStatus={questionStatuses[questions[currentQuestionIndex].id] || 'not_visited'}
              language={language}
              onSelectOption={handleSelectOption}
              onClearResponse={handleClearResponse}
              onSaveAndNext={handleSaveAndNext}
              onSaveAndMarkForReview={handleSaveAndMarkForReview}
              onMarkForReviewAndNext={handleMarkForReviewAndNext}
              onPrevious={() => navigateToQuestion(currentQuestionIndex - 1)}
              onNext={() => navigateToQuestion(currentQuestionIndex + 1)}
              onLanguageChange={setLanguage}
            />

            {/* Right: Question Palette */}
            <QuestionPalette
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              questionStatuses={questionStatuses}
              responses={responses}
              onSelectQuestion={navigateToQuestion}
              onSubmitExam={() => setIsSummaryModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* 5. Official Scorecard & Results Phase */}
      {appState === 'scorecard' && completedSubmission && currentStudent && (
        <ScorecardView
          submission={completedSubmission}
          questions={questions}
          student={currentStudent}
          onRetakeExam={() => initiateTestLaunch(currentActiveTest)}
          onViewDashboard={() => setAppState('dashboard')}
          onOpenAnswerKey={() => {
            setAnswerKeyTest(currentActiveTest);
            setAnswerKeySubmission(completedSubmission);
            setIsAnswerKeyModalOpen(true);
          }}
        />
      )}

      {/* Pre-Submit Summary Confirmation Modal */}
      <ExamSummaryModal
        isOpen={isSummaryModalOpen}
        questions={questions}
        questionStatuses={questionStatuses}
        responses={responses}
        timeRemainingSeconds={timeRemainingSeconds}
        onCancel={() => setIsSummaryModalOpen(false)}
        onConfirmSubmit={() => handleFinalSubmit(false)}
        isSubmitting={isSubmitting}
      />

      {/* Proctoring Window Switch Warning Modal */}
      <ProctorAlertModal
        isOpen={isProctorAlertOpen}
        violationCount={tabSwitches}
        onDismiss={() => setIsProctorAlertOpen(false)}
      />

      {/* Examination Guidelines Modal (Pre-Test Undertaking Agreement) */}
      <InstructionsModal
        isOpen={isGuidelinesModalOpen}
        onClose={() => setIsGuidelinesModalOpen(false)}
        onConfirmStart={handleGuidelinesAgreed}
        testTitle={pendingTestToStart?.title}
        durationMinutes={pendingTestToStart?.durationMinutes}
        questionCount={pendingTestToStart?.questionCount}
      />

      {/* High-Tech Test Start Animation & Countdown */}
      <TestStartAnimationModal
        isOpen={isStartAnimationOpen}
        testTitle={pendingTestToStart?.title || currentActiveTest.title}
        durationMinutes={pendingTestToStart?.durationMinutes || 27}
        questionCount={pendingTestToStart?.questionCount || 50}
        onAnimationComplete={handleAnimationComplete}
      />

      {/* Instructions Modal (During Exam) */}
      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
        testTitle={currentActiveTest.title}
        durationMinutes={currentActiveTest.durationMinutes}
        questionCount={questions.length}
      />

      {/* Question Paper Overview Modal */}
      <QuestionPaperModal
        isOpen={isQuestionPaperOpen}
        questions={questions}
        responses={responses}
        onClose={() => setIsQuestionPaperOpen(false)}
        onJumpToQuestion={navigateToQuestion}
      />

      {/* Past Results and Database Drawer */}
      <PastResultsDrawer
        isOpen={isPastResultsOpen}
        onClose={() => setIsPastResultsOpen(false)}
        onSelectSubmission={(sub) => {
          setCompletedSubmission(sub);
          setAppState('scorecard');
        }}
        onStartNewTest={() => setAppState('login')}
      />

      {/* JEE Mains Format Answer Key Modal with Watermark & Option Codes */}
      <JEEMainsAnswerKeyModal
        isOpen={isAnswerKeyModalOpen}
        onClose={() => setIsAnswerKeyModalOpen(false)}
        submission={answerKeySubmission}
        questions={answerKeyTest?.questions || questions}
        student={currentStudent}
        examTitle={answerKeyTest?.title || currentActiveTest.title}
      />

      {/* Protocols & Discrepancy Correction Modal */}
      <ProtocolsAndCorrectionModal
        isOpen={isProtocolsModalOpen}
        onClose={() => setIsProtocolsModalOpen(false)}
        student={currentStudent}
      />
    </div>
  );
}
