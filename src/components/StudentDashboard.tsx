import React, { useState, useEffect } from 'react';
import { 
  Play, 
  FileText, 
  Award, 
  Clock, 
  HelpCircle, 
  LogOut, 
  TrendingUp, 
  Shield, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  BookOpen,
  Mail,
  User,
  Sliders,
  History
} from 'lucide-react';
import { StudentProfile, TestDefinition, ExamSubmission } from '../types/exam';
import { OneCrackLogo } from './OneCrackLogo';
import { fetchAvailableTests, fetchSubmissionsForStudent } from '../services/firebase';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';

interface StudentDashboardProps {
  student: StudentProfile;
  onStartTest: (test: TestDefinition) => void;
  onOpenAnswerKey: (test: TestDefinition, submission?: ExamSubmission | null) => void;
  onOpenProtocols: () => void;
  onLogout: () => void;
  onSwitchToAdmin: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onStartTest,
  onOpenAnswerKey,
  onOpenProtocols,
  onLogout,
  onSwitchToAdmin
}) => {
  const [tests, setTests] = useState<TestDefinition[]>([]);
  const [pastSubmissions, setPastSubmissions] = useState<ExamSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tests' | 'analytics' | 'history'>('tests');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const available = await fetchAvailableTests();
      setTests(available);

      if (student.uid) {
        const subs = await fetchSubmissionsForStudent(student.uid);
        setPastSubmissions(subs);
      }
      setLoading(false);
    }
    loadData();
  }, [student.uid]);

  // Find latest submission for each test
  const getTestLatestSubmission = (testId: string) => {
    return pastSubmissions.find(s => s.testId === testId || (!s.testId && testId === 'test-biotech-50q'));
  };

  // Recharts trend data
  const chartData = pastSubmissions.map((sub, idx) => ({
    attempt: `Attempt ${idx + 1}`,
    score: sub.score,
    accuracy: Number(sub.accuracy.toFixed(1)),
    date: new Date(sub.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    title: sub.testTitle || 'Chapter Test'
  }));

  const bestScore = pastSubmissions.reduce((max, s) => Math.max(max, s.score), 0);
  const avgAccuracy = pastSubmissions.length 
    ? (pastSubmissions.reduce((acc, s) => acc + s.accuracy, 0) / pastSubmissions.length).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <OneCrackLogo size="md" />
          </div>

          {/* Right candidate info & action badges */}
          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchToAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
              title="Access Admin Console & AI Question Generator"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>

            <button
              onClick={onOpenProtocols}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-600" />
              <span>Protocols & Rules</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Candidate Profile Strip */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            
            {/* Candidate Identity */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-cyan-400/80 shadow-md shadow-cyan-500/20"
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full ring-2 ring-slate-900" title="Candidate Verified"></span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    {student.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 px-2 py-0.5 rounded">
                    Roll: {student.rollNumber}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>App No: <strong className="text-white font-mono">{student.applicationNumber}</strong></span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span className="text-slate-200">{student.category}</span>
                  </span>
                  <span>•</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-cyan-400" />
                    <span className="font-mono text-[11px]">{student.email}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Summary */}
            <div className="grid grid-cols-3 gap-3 bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="px-3 border-r border-white/10">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Tests Taken</span>
                <span className="text-lg font-black text-cyan-400 font-mono">{pastSubmissions.length}</span>
              </div>
              <div className="px-3 border-r border-white/10">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Best Score</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{bestScore}/200</span>
              </div>
              <div className="px-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Avg Accuracy</span>
                <span className="text-lg font-black text-amber-300 font-mono">{avgAccuracy}%</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'tests'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Available Chapter Tests ({tests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Performance Trend (Recharts)</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Past Scorecards & Answer Keys</span>
          </button>
        </div>

        {/* TAB 1: AVAILABLE TESTS */}
        {activeTab === 'tests' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Official NEET Chapter CBT Mock Assessments</span>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Live Portal
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select a test below to start your timed Computer Based Test (+4.00 correct, -1.00 negative marking).
                </p>
              </div>

              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>Support:</span>
                <a href="mailto:onecracktestportal@gmail.com" className="font-mono text-cyan-600 hover:underline">
                  onecracktestportal@gmail.com
                </a>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-sm font-medium">Loading test catalog from OneCrack Database...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {tests.map((test) => {
                  const latestSub = getTestLatestSubmission(test.id);
                  const isCompleted = !!latestSub;

                  return (
                    <div
                      key={test.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-3">
                        {/* Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 px-2.5 py-0.5 rounded-md">
                            {test.subject}
                          </span>

                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Attempted: {latestSub.score}/{test.questionCount * 4}
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              Not Attempted
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                            {test.title}
                          </h3>
                          <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-0.5">
                            {test.chapter}
                          </p>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                          {test.description}
                        </p>

                        {/* Parameters Pills */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg font-medium">
                            <Clock className="w-3.5 h-3.5 text-cyan-600" />
                            {test.durationMinutes} Minutes
                          </span>
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg font-medium">
                            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                            {test.questionCount} Questions
                          </span>
                          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg font-medium">
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            +4 / -1 Marking
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onStartTest(test)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>{isCompleted ? 'Retake Examination' : 'Start CBT Examination'}</span>
                        </button>

                        <button
                          onClick={() => onOpenAnswerKey(test, latestSub)}
                          className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-colors"
                          title="Preview or Download Detailed Evaluation Matrix & Option IDs"
                        >
                          <FileText className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Detailed Answer Key</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: PERFORMANCE TREND VISUALIZATION (RECHARTS) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-600" />
                    <span>Candidate Score Progression Over Time</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Visualizing marks scored across all previous chapter CBT mock attempts (Recharts Powered)
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-cyan-600"></div>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Raw Score</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-1 bg-emerald-500"></div>
                    <span className="text-slate-500">AIIMS 180+ Target</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-1 bg-amber-500"></div>
                    <span className="text-slate-500">Qualifying 120</span>
                  </div>
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <BookOpen className="w-10 h-10 mb-2 opacity-40 text-cyan-600" />
                  <p className="text-sm font-semibold">No test attempts recorded yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Complete your first chapter test to visualize your score progression curve.</p>
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                      <XAxis dataKey="attempt" stroke="#64748b" fontSize={11} />
                      <YAxis domain={[-10, 200]} stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #1e293b',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <ReferenceLine y={180} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target 180+', fill: '#10b981', fontSize: 10 }} />
                      <ReferenceLine y={120} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Qualifying 120', fill: '#f59e0b', fontSize: 10 }} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#06b6d4' }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PAST SCORECARDS TABLE */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Exam Attempt Records & Answer Key Archives
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspect or download official JEE Mains format response sheets with option IDs for each attempt
                </p>
              </div>
            </div>

            {pastSubmissions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30 text-cyan-600" />
                <p className="text-sm font-semibold">No submissions recorded for Roll No {student.rollNumber}.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4 font-bold">Date & Time</th>
                      <th className="py-3 px-4 font-bold">Test Name</th>
                      <th className="py-3 px-4 font-bold text-center">Score</th>
                      <th className="py-3 px-4 font-bold text-center">Correct / Wrong</th>
                      <th className="py-3 px-4 font-bold text-center">Accuracy</th>
                      <th className="py-3 px-4 font-bold text-center">Violations</th>
                      <th className="py-3 px-4 font-bold text-right">Official Response Sheet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pastSubmissions.map((sub) => {
                      const matchedTest = tests.find(t => t.id === sub.testId) || tests[0];
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                            {new Date(sub.submittedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                            {sub.testTitle || 'Biotechnology Chapter Test'}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 text-sm">
                            {sub.score} / {sub.maxScore}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-emerald-600 font-bold">{sub.correctCount}</span> / <span className="text-rose-600 font-bold">{sub.incorrectCount}</span>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {sub.accuracy.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            {sub.tabSwitches > 0 ? (
                              <span className="text-rose-600 font-bold">{sub.tabSwitches}</span>
                            ) : (
                              <span className="text-emerald-600">0</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => onOpenAnswerKey(matchedTest, sub)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 rounded-lg hover:bg-cyan-100 font-semibold text-xs transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Response Sheet</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer with Copyrights & Contact */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <OneCrackLogo size="sm" showSubtitle={false} />
            <span className="text-slate-400">|</span>
            <span>National Assessment Engine</span>
          </div>
          <div>
            Official Work Email: <a href="mailto:onecracktestportal@gmail.com" className="font-mono text-cyan-600 hover:underline">onecracktestportal@gmail.com</a>
          </div>
          <div>
            © 2026 OneCrack Test Portal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
