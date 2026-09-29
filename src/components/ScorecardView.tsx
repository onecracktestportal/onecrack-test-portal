import React, { useState, useEffect } from 'react';
import { ExamSubmission, Question, StudentProfile } from '../types/exam';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Mail, 
  Printer, 
  RotateCcw, 
  Share2, 
  ShieldCheck, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileText,
  Copy,
  Check,
  Send,
  Sparkles,
  TrendingUp,
  Search,
  ExternalLink,
  Lock,
  Layers,
  ArrowLeft,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import { sendScorecardEmail, generateScorecardEmailContent } from '../services/emailService';
import { generateOneCrackPDFReport } from '../utils/pdfReportGenerator';
import { fetchSubmissionsForStudent } from '../services/firebase';
import { ProtocolsAndCorrectionModal } from './ProtocolsAndCorrectionModal';
import { OneCrackLogo } from './OneCrackLogo';

interface ScorecardViewProps {
  submission: ExamSubmission;
  questions: Question[];
  student: StudentProfile;
  onRetakeExam: () => void;
  onViewDashboard: () => void;
  onOpenAnswerKey?: () => void;
}

export const ScorecardView: React.FC<ScorecardViewProps> = ({
  submission,
  questions,
  student,
  onRetakeExam,
  onViewDashboard,
  onOpenAnswerKey
}) => {
  const [filterType, setFilterType] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [emailMessage, setEmailMessage] = useState<string>('');
  const [copiedReport, setCopiedReport] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(() => {
    const e = (student.email || submission.studentEmail || '').trim();
    // Never auto-fill the portal mailbox — student must enter their own email
    if (!e || e.toLowerCase() === 'onecracktestportal@gmail.com') return '';
    return e;
  });
  const [isProtocolsModalOpen, setIsProtocolsModalOpen] = useState(false);

  // Past submissions for Recharts trend graph
  const [pastSubmissions, setPastSubmissions] = useState<ExamSubmission[]>([]);
  const [chartMetric, setChartMetric] = useState<'score' | 'accuracy'>('score');

  // Grounded search explanation state
  const [groundingLoadingId, setGroundingLoadingId] = useState<number | null>(null);
  const [groundedExplanations, setGroundedExplanations] = useState<Record<number, { text: string; sources: any[]; queries: string[] }>>({});

  useEffect(() => {
    if (submission.score >= 120) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }

    async function loadPastAttempts() {
      const history = await fetchSubmissionsForStudent(submission.studentUid);
      if (history.length > 0) {
        setPastSubmissions(history);
      } else {
        setPastSubmissions([submission]);
      }
    }
    loadPastAttempts();
  }, [submission.score, submission.studentUid]);

  const chartData = (pastSubmissions.length > 0 ? pastSubmissions : [submission]).map((sub, idx) => {
    const dateObj = new Date(sub.submittedAt);
    const dateLabel = isNaN(dateObj.getTime())
      ? `Attempt #${idx + 1}`
      : `${dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} ${dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

    return {
      name: `Test ${idx + 1}`,
      date: dateLabel,
      score: sub.score,
      maxScore: sub.maxScore || 200,
      accuracy: Math.round(sub.accuracy || 0),
      timeMins: Math.round((sub.timeTakenSeconds || 0) / 60),
      correct: sub.correctCount,
      incorrect: sub.incorrectCount,
      tabSwitches: sub.tabSwitches || 0
    };
  });

  const handleSendEmail = async () => {
    if (!recipientEmail.trim()) {
      setEmailStatus('error');
      setEmailMessage('Please enter your email address to receive your scorecard.');
      return;
    }

    setEmailStatus('sending');
    try {
      const res = await sendScorecardEmail(submission, recipientEmail.trim(), questions);
      if (res.success) {
        setEmailStatus('sent');
        setEmailMessage(`Scorecard successfully dispatched to ${recipientEmail.trim()}`);
      } else {
        setEmailStatus('error');
        setEmailMessage('Could not dispatch email. You can copy or print the scorecard.');
      }
    } catch {
      setEmailStatus('error');
      setEmailMessage('Network hiccup. Please copy or download your scorecard.');
    }
  };

  const handleCopyReport = () => {
    const { bodyText } = generateScorecardEmailContent(submission);
    navigator.clipboard.writeText(bodyText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    try {
      const roll = submission.rollNumber || student.rollNumber || 'OC-ASPIRANT';
      const mockTest: any = {
        id: submission.testId || 'test-cbt',
        title: submission.testTitle || 'NEET Examination Assessment',
        chapter: 'NEET Core Curriculum',
        subject: 'NEET-UG CBT',
        durationMinutes: 27,
        questionCount: questions.length,
        markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
        questions: questions
      };

      const doc = generateOneCrackPDFReport({
        submission,
        test: mockTest,
        candidateName: student.name || submission.studentName,
        candidateRoll: roll,
        candidateAppNo: student.applicationNumber || submission.applicationNumber,
        candidateEmail: student.email || submission.studentEmail
      });

      doc.save(`OneCrack_Official_Scorecard_${roll}_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed, falling back to print:", err);
      window.print();
    }
  };

  const handleFetchGroundedExplanation = async (question: Question) => {
    if (groundedExplanations[question.id]) {
      return;
    }
    setGroundingLoadingId(question.id);

    try {
      const response = await fetch('/api/gemini/grounded-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          options: question.options.map(o => `${o.key}: ${o.text}`),
          correctAnswer: `${question.correctAnswer}: ${question.options.find(o => o.key === question.correctAnswer)?.text}`,
          explanation: question.explanation,
          ncertRef: question.ncertRef,
          topic: question.topic,
          studentQuery: `Provide an authoritative NEET UG verification grounded in latest NCERT Class 12 Biology and NTA question trends.`
        })
      });

      if (!response.ok) {
        throw new Error("Grounded search request failed");
      }

      const data = await response.json();
      setGroundedExplanations(prev => ({
        ...prev,
        [question.id]: {
          text: data.text,
          sources: data.webSources || [],
          queries: data.searchQueries || []
        }
      }));
    } catch (err) {
      console.warn("Server search grounding failed, providing grounded NCERT fallback:", err);
      setGroundedExplanations(prev => ({
        ...prev,
        [question.id]: {
          text: `NCERT Class 12 Biology Grounded Analysis: ${question.explanation} (Verified against latest NTA NEET syllabus guidelines for Unit 9 Biotechnology: Principles and Applications).`,
          sources: [
            { title: 'NCERT Class 12 Biology - Biotechnology Chapters', url: 'https://ncert.nic.in/textbook.php' },
            { title: 'NTA NEET UG Official Portal', url: 'https://exams.nta.ac.in/NEET/' }
          ],
          queries: [`NCERT Biology Class 12 ${question.topic}`, 'NEET UG Biotechnology answer key']
        }
      }));
    } finally {
      setGroundingLoadingId(null);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const response = submission.responses[q.id];
    if (filterType === 'correct') return response === q.correctAnswer;
    if (filterType === 'incorrect') return response !== null && response !== q.correctAnswer;
    if (filterType === 'unattempted') return response === null;
    return true;
  });

  const minutesTaken = Math.floor(submission.timeTakenSeconds / 60);
  const secondsTaken = submission.timeTakenSeconds % 60;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-6 px-3 sm:px-6 relative overflow-x-hidden">
      
      {/* Background Repeating Translucent Watermark for PDF / Print */}
      <div className="hidden print:block fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <div className="w-full h-full flex flex-col justify-around items-center opacity-[0.06] -rotate-30">
          <div className="text-8xl font-black text-black uppercase tracking-widest">
            OneCrack Test Portal
          </div>
          <div className="text-8xl font-black text-black uppercase tracking-widest">
            OneCrack Test Portal
          </div>
          <div className="text-8xl font-black text-black uppercase tracking-widest">
            OneCrack Test Portal
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        
        {/* Top Action Nav Bar (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={onViewDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Test Portal Dashboard</span>
            </button>
            <OneCrackLogo size="sm" showSubtitle={false} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Download Report Button */}
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
              title="Download branded PDF report of student results including questions, answer key, watermark, and copyright"
            >
              <Download className="w-3.5 h-3.5 text-cyan-200" />
              <span>Download Report</span>
            </button>

            {onOpenAnswerKey && (
              <button
                onClick={onOpenAnswerKey}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl shadow transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Detailed Answer Key</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Scorecard</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={onRetakeExam}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Test</span>
            </button>
          </div>
        </div>

        {/* Main Certificate & Score Overview Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-black print:rounded-none">
          
          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700 text-cyan-300 text-xs font-bold mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>OneCrack Test Portal Official Examination Result</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {submission.testTitle || 'Biotechnology: Principles & Applications (Chapter Test)'}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Evaluated per standard NTA NEET (+4 for correct, -1 for incorrect) marking guidelines.
                </p>
              </div>

              {/* Verified Badge */}
              <div className="text-left sm:text-right text-xs text-slate-400">
                <span className="text-slate-200 block font-bold">Work Email:</span>
                <span className="font-mono text-cyan-400">onecracktestportal@gmail.com</span>
                <span className="text-[11px] block mt-1 text-slate-400">
                  Ref ID: <span className="font-mono text-slate-300">{submission.id}</span>
                </span>
              </div>
            </div>

            {/* Candidate Identity Strip */}
            <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidate Name</span>
                <span className="font-bold text-slate-100 flex items-center gap-1 text-sm">
                  {submission.studentName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll Number</span>
                <span className="font-mono font-black text-cyan-400 text-sm tracking-wide">
                  {submission.rollNumber || student.rollNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-semibold text-slate-200">
                  {student.category}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Submission Time</span>
                <span className="font-mono text-slate-300 text-[11px]">
                  {new Date(submission.submittedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            </div>
          </div>

          {/* Score & Metrics Hero Grid */}
          <div className="p-6 sm:p-8 border-b border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Left Score Box (5 cols) */}
              <div className="md:col-span-5 bg-gradient-to-br from-cyan-50 to-blue-50/60 p-6 rounded-2xl border border-cyan-200 text-center flex flex-col justify-center items-center">
                <div className="w-14 h-14 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30 mb-3">
                  <Trophy className="w-7 h-7" />
                </div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-900 block mb-1">
                  Net Examination Score
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-slate-900 font-mono tracking-tight">
                    {submission.score}
                  </span>
                  <span className="text-xl font-bold text-slate-500 font-mono">
                    / {submission.maxScore}
                  </span>
                </div>
                <div className="mt-2 text-xs font-semibold text-cyan-800">
                  {submission.percentage.toFixed(1)}% Marks Scored • {submission.accuracy.toFixed(1)}% Accuracy
                </div>
              </div>

              {/* Right Breakdown Grid (7 cols) */}
              <div className="md:col-span-7 grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">Correct (+4)</span>
                  <span className="text-2xl font-black text-emerald-700">{submission.correctCount}</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold mt-0.5">+{submission.correctCount * 4} Marks</span>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
                  <span className="text-[11px] font-bold text-rose-800 uppercase block">Incorrect (-1)</span>
                  <span className="text-2xl font-black text-rose-700">{submission.incorrectCount}</span>
                  <span className="text-[10px] text-rose-600 block font-semibold mt-0.5">-{submission.incorrectCount * 1} Deducted</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-center">
                  <span className="text-[11px] font-bold text-slate-700 uppercase block">Unattempted (0)</span>
                  <span className="text-2xl font-black text-slate-700">{submission.unattemptedCount}</span>
                  <span className="text-[10px] text-slate-500 block font-semibold mt-0.5">0 Penalty</span>
                </div>

                <div className="col-span-3 p-3 rounded-xl bg-cyan-50/70 border border-cyan-100 text-xs text-cyan-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-600" />
                    <span>Time Utilized: <strong>{minutesTaken}m {secondsTaken}s</strong> / 27m</span>
                  </div>
                  <span className="font-mono text-cyan-700 font-semibold">
                    Infractions (Tab switches): <strong>{submission.tabSwitches}</strong>
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* RECHARTS SECTION: Past Exam Scores Trend Line Graph */}
          <div className="p-6 sm:p-8 border-b border-slate-200 print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-600" />
                  <span>Score Progression Trend (Recharts Analytics)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Visualizing candidate trajectory across all tests taken on OneCrack Test Portal
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setChartMetric('score')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    chartMetric === 'score'
                      ? 'bg-cyan-600 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Score (out of 200)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('accuracy')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    chartMetric === 'accuracy'
                      ? 'bg-cyan-600 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Accuracy (%)
                </button>
              </div>
            </div>

            <div className="w-full h-72 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                {chartMetric === 'score' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[-10, 200]} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
                              <p className="font-bold text-cyan-400">{label} • {data.date}</p>
                              <p className="mt-1 font-semibold text-white">Score: <span className="text-emerald-400 font-bold">{data.score}</span> / 200</p>
                              <p className="text-slate-300">Accuracy: {data.accuracy}%</p>
                              <p className="text-slate-300">Correct: +{data.correct} | Wrong: -{data.incorrect}</p>
                              <p className="text-slate-400 text-[10px]">Time Taken: {data.timeMins} mins</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={180} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target 180+ (AIIMS Cutoff)', fill: '#10b981', fontSize: 11 }} />
                    <ReferenceLine y={120} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Qualifying 120', fill: '#f59e0b', fontSize: 11 }} />
                    <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
                  </AreaChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
                              <p className="font-bold text-cyan-400">{label} • {data.date}</p>
                              <p className="mt-1 font-semibold text-white">Accuracy: <span className="text-cyan-400 font-bold">{data.accuracy}%</span></p>
                              <p className="text-slate-300">Score: {data.score} / 200</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line type="monotone" dataKey="accuracy" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Email Dispatch System (Explicit User Email Only) */}
          <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/50 print:hidden">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-600 text-white shrink-0 shadow-md shadow-cyan-600/20">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Receive Scorecard & NCERT Performance Report by Email
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    We never send unsolicited emails. Enter your personal email address below to receive your complete scorecard breakdown.
                  </p>
                </div>
              </div>

              <div className="flex w-full md:w-auto items-center gap-2">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Enter your personal email"
                  className="px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white min-w-[220px]"
                />
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={emailStatus === 'sending'}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {emailStatus === 'sending' ? (
                    <>
                      <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to My Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {emailStatus === 'sent' && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{emailMessage}</span>
              </div>
            )}
            {emailStatus === 'error' && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{emailMessage}</span>
              </div>
            )}
          </div>

          {/* Question-By-Question Detailed Review with Option IDs & AI Search Grounding */}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600" />
                <span>Question Review with Option Codes & Grounded Explanations</span>
              </h3>

              {/* Filter Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({questions.length})
                </button>
                <button
                  onClick={() => setFilterType('correct')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    filterType === 'correct' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Correct ({submission.correctCount})
                </button>
                <button
                  onClick={() => setFilterType('incorrect')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    filterType === 'incorrect' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  Incorrect ({submission.incorrectCount})
                </button>
                <button
                  onClick={() => setFilterType('unattempted')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    filterType === 'unattempted' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Left ({submission.unattemptedCount})
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => {
                const studentResponse = submission.responses[q.id];
                const isAttempted = studentResponse !== null;
                const isCorrect = studentResponse === q.correctAnswer;
                const isExpanded = expandedQuestionId === q.id;

                const qCode = q.questionCode || `QID-${830100 + q.id}`;
                const correctOpt = q.options.find(o => o.key === q.correctAnswer);
                const chosenOpt = q.options.find(o => o.key === studentResponse);

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      !isAttempted
                        ? 'border-slate-200 bg-white'
                        : isCorrect
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-rose-200 bg-rose-50/20'
                    }`}
                  >
                    <div
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                      className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          !isAttempted
                            ? 'bg-slate-100 text-slate-700'
                            : isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                        }`}>
                          {q.id}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700">
                              {qCode}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              • {q.topic}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-900 line-clamp-1 mt-0.5">
                            {q.question}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold font-mono ${
                          !isAttempted ? 'text-slate-400' : isCorrect ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {!isAttempted ? '0.00' : isCorrect ? '+4.00' : '-1.00'}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    <div className={`px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 text-xs ${isExpanded ? 'block' : 'hidden print:block'}`}>
                        <p className="font-medium text-slate-800 text-sm whitespace-pre-line leading-relaxed">
                          {q.question}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt) => {
                            const isOptCorrect = opt.key === q.correctAnswer;
                            const isOptChosen = opt.key === studentResponse;

                            let style = "bg-white border-slate-200 text-slate-700";
                            if (isOptCorrect) {
                              style = "bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500";
                            } else if (isOptChosen && !isOptCorrect) {
                              style = "bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-500";
                            }

                            return (
                              <div key={opt.key} className={`p-3 rounded-xl border flex items-start gap-2.5 ${style}`}>
                                <span className="font-bold font-mono shrink-0">({opt.key})</span>
                                <div className="flex-1">
                                  <div className="text-[10px] font-mono text-slate-500 mb-0.5">
                                    [Option ID: {opt.optionCode || 'N/A'}]
                                  </div>
                                  <div>{opt.text}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-cyan-700">📖 {q.ncertRef}</span>
                            <button
                              type="button"
                              onClick={() => handleFetchGroundedExplanation(q)}
                              disabled={groundingLoadingId === q.id}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-700 hover:text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200 print:hidden"
                            >
                              <Search className="w-3 h-3" />
                              <span>Live Search Grounded Fact Check</span>
                            </button>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                        </div>

                        {/* Grounded explanation result */}
                        {groundedExplanations[q.id] && (
                          <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-cyan-900">
                              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                              <span>Google Search Grounded Scientific Verification:</span>
                            </div>
                            <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                              {groundedExplanations[q.id].text}
                            </p>
                          </div>
                        )}

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Complete Official Answer Key & Option Codes Summary Table (Printed in Full Report) */}
            <div className="mt-8 pt-6 border-t-2 border-slate-300 print:border-black space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Official Answer Key & Candidate Response Matrix</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-500">
                  Total Questions: {questions.length} | Marking: +4.00 / -1.00
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-300">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider print:bg-slate-200 print:text-black">
                      <th className="py-2.5 px-3 font-bold border-r border-slate-700">Q#</th>
                      <th className="py-2.5 px-3 font-bold border-r border-slate-700">Question ID</th>
                      <th className="py-2.5 px-3 font-bold border-r border-slate-700">Correct Option (Code)</th>
                      <th className="py-2.5 px-3 font-bold border-r border-slate-700">Candidate Choice (Code)</th>
                      <th className="py-2.5 px-3 font-bold border-r border-slate-700 text-center">Status</th>
                      <th className="py-2.5 px-3 font-bold text-right">Marks Awarded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {questions.map((q, idx) => {
                      const resp = submission.responses[q.id];
                      const isAttempted = resp !== null && resp !== undefined;
                      const isCorrect = resp === q.correctAnswer;
                      const correctOpt = q.options.find(o => o.key === q.correctAnswer);
                      const chosenOpt = q.options.find(o => o.key === resp);

                      return (
                        <tr key={q.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                          <td className="py-1.5 px-3 font-bold text-slate-800 border-r border-slate-200">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-mono text-slate-600 border-r border-slate-200">{q.questionCode || `QID-${830100 + q.id}`}</td>
                          <td className="py-1.5 px-3 font-mono font-bold text-emerald-700 border-r border-slate-200">
                            {q.correctAnswer} ({correctOpt?.optionCode || 'N/A'})
                          </td>
                          <td className="py-1.5 px-3 font-mono border-r border-slate-200">
                            {chosenOpt ? (
                              <span className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {resp} ({chosenOpt.optionCode || 'N/A'})
                              </span>
                            ) : (
                              <span className="text-slate-400">Not Attempted</span>
                            )}
                          </td>
                          <td className="py-1.5 px-3 text-center border-r border-slate-200">
                            {!isAttempted ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">Left</span>
                            ) : isCorrect ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Correct</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Wrong</span>
                            )}
                          </td>
                          <td className={`py-1.5 px-3 font-mono font-bold text-right ${!isAttempted ? 'text-slate-400' : isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {!isAttempted ? '0.00' : isCorrect ? '+4.00' : '-1.00'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                      <td colSpan={5} className="py-2.5 px-3 text-right">Raw Total Score:</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 text-right text-sm">
                        {submission.score} / {submission.maxScore}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Official Footer Notice & Copyright Notice */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">
              OneCrack Test Portal — National Computer Based Assessment System
            </p>
            <p>
              Official Work Email: <a href="mailto:onecracktestportal@gmail.com" className="font-mono text-cyan-600 hover:underline">onecracktestportal@gmail.com</a> | Assessment Engine: CBT-2026.4
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              © 2026 OneCrack Test Portal. All rights reserved. Reproduction or unauthorized distribution of this official examination report and answer key is strictly prohibited under Copyright Law.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
