import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  FileText, 
  Clock, 
  Award, 
  ArrowLeft, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Trash2,
  Send,
  Sliders,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { TestDefinition, ExamSubmission, StudentProfile } from '../types/exam';
import { OneCrackLogo } from './OneCrackLogo';
import { 
  fetchAvailableTests, 
  saveTestDefinition, 
  fetchAllSubmissions 
} from '../services/firebase';

interface AdminDashboardProps {
  onBackToPortal: () => void;
  onOpenAnswerKey: (test: TestDefinition, submission?: ExamSubmission | null) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToPortal,
  onOpenAnswerKey
}) => {
  const [tests, setTests] = useState<TestDefinition[]>([]);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'create_ai' | 'tests' | 'submissions'>('create_ai');

  // AI Generator Form States
  const [chapterName, setChapterName] = useState('Biotechnology: Principles and Processes & Applications');
  const [subject, setSubject] = useState('Biology');
  const [durationMinutes, setDurationMinutes] = useState(27);
  const [questionCount, setQuestionCount] = useState(10);
  const [customPrompt, setCustomPrompt] = useState(
    'Focus on high-yield NCERT Class 12 concepts: EcoRI, HindII, pBR322 selectable markers, PCR, agarose gel, Bt toxin, RNA interference, ADA gene therapy, and patenting. Make options tricky with authentic distractor codes.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [previewTest, setPreviewTest] = useState<TestDefinition | null>(null);

  useEffect(() => {
    async function loadAdminData() {
      const allTests = await fetchAvailableTests();
      setTests(allTests);

      const allSubs = await fetchAllSubmissions();
      setSubmissions(allSubs);
    }
    loadAdminData();
  }, []);

  const handleGenerateTestWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterName.trim()) {
      setGenerationError("Please enter a chapter or topic name.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationSuccess(null);
    setPreviewTest(null);

    try {
      const response = await fetch('/api/gemini/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter: chapterName.trim(),
          subject,
          durationMinutes: Number(durationMinutes),
          questionCount: Number(questionCount),
          prompt: customPrompt
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate test with Gemini AI");
      }

      const generatedTest: TestDefinition = data.test;
      setPreviewTest(generatedTest);

      // Save into database & state
      await saveTestDefinition(generatedTest);
      setTests(prev => [generatedTest, ...prev]);
      setGenerationSuccess(`Successfully generated and published test: "${generatedTest.title}" with ${generatedTest.questions.length} questions and JEE Option IDs!`);
    } catch (err: any) {
      setGenerationError(err?.message || "Failed to generate AI test. Check API connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPortal}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Return to Student Portal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <OneCrackLogo size="md" />
            <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
              Admin Console
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
              Work Email: <strong className="font-mono text-cyan-600">onecracktestportal@gmail.com</strong>
            </span>
            <button
              onClick={onBackToPortal}
              className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              <span>Back to Student Portal</span>
            </button>
          </div>

        </div>
      </header>

      {/* Admin Hero Bar */}
      <section className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-cyan-400" />
                <span>OneCrack Academic & AI Test Director</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Generate high-yield chapter tests using Gemini 3.5 Flash, manage assessment catalog, and audit candidate response sheets with Option IDs.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs">
              <div className="text-center px-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Tests</span>
                <span className="text-base font-black text-cyan-400 font-mono">{tests.length}</span>
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div className="text-center px-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Submissions</span>
                <span className="text-base font-black text-emerald-400 font-mono">{submissions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Admin Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('create_ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'create_ai'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Test Generator (Gemini)</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'tests'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Test Catalog ({tests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'submissions'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Candidate Submissions ({submissions.length})</span>
          </button>
        </div>

        {/* TAB 1: AI CHAPTER TEST GENERATOR */}
        {activeTab === 'create_ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Generator Form (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-600" />
                  <span>Command AI to Generate a Chapter Test</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Specify any chapter, time duration, question count, and custom prompt directives. The AI model will construct NCERT line-by-line questions with JEE Option IDs and answer keys.
                </p>
              </div>

              {generationSuccess && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{generationSuccess}</span>
                </div>
              )}

              {generationError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{generationError}</span>
                </div>
              )}

              <form onSubmit={handleGenerateTestWithAI} className="space-y-4 text-xs">
                
                {/* Chapter Name */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Chapter / Topic Name *
                  </label>
                  <input
                    type="text"
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)}
                    placeholder="e.g. Biotechnology: Principles and Applications"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Subject & Duration & Questions Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subject
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Biology">Biology (Botany/Zoology)</option>
                      <option value="Biotechnology">Biotechnology</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Time Limit (Minutes)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Number of Questions
                    </label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value={5}>5 Questions (Rapid Test)</option>
                      <option value={10}>10 Questions (Quick Review)</option>
                      <option value={15}>15 Questions (Standard Practice)</option>
                      <option value={25}>25 Questions (Chapter Test)</option>
                      <option value={50}>50 Questions (Full NEET Chapter Test)</option>
                    </select>
                  </div>
                </div>

                {/* Prompt Directives */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Custom Prompt Directives / Focus Concepts
                  </label>
                  <textarea
                    rows={4}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Describe what specific subtopics, difficulty, or question styles to focus on..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tip: Mention specific enzymes, vectors (pBR322), NCERT page ranges, or Assertion-Reason types to steer generation.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Generating Questions with Gemini 3.5 Flash...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate & Publish Test to Portal</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* Preview Box (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <FileText className="w-4 h-4 text-cyan-600" />
                  <span>Latest Generated Test Preview</span>
                </h3>

                {previewTest ? (
                  <div className="space-y-4 mt-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Test Title</span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{previewTest.title}</h4>
                      <p className="text-cyan-600 font-medium">{previewTest.chapter}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Questions:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{previewTest.questions.length} Questions</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Time Limit:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{previewTest.durationMinutes} Mins</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Sample Question 1</span>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="font-semibold text-slate-900 dark:text-white line-clamp-3">
                          {previewTest.questions[0]?.question}
                        </p>
                        <div className="mt-2 text-[11px] text-emerald-600 font-mono">
                          Correct Key: {previewTest.questions[0]?.correctAnswer} [Option ID: {previewTest.questions[0]?.correctOptionCode}]
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => onOpenAnswerKey(previewTest)}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Full JEE Format Question Paper & Option IDs</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400 space-y-2">
                    <Sparkles className="w-8 h-8 mx-auto text-cyan-600/40" />
                    <p className="text-xs">Fill in the prompt on the left and click Generate to see the generated questions here.</p>
                  </div>
                )}
              </div>

              {/* Watermark Notice */}
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl border border-cyan-200 dark:border-cyan-900 text-[11px] text-cyan-800 dark:text-cyan-300 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>OneCrack Test Portal Security & Watermarking</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[10px]">
                  All generated question papers feature the official diagonal watermark "OneCrack Test Portal", copyrights, and unique 6-digit option codes per JEE/NEET CBT specifications.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: TEST CATALOG */}
        {activeTab === 'tests' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  All Published Chapter Tests ({tests.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspect or download question papers with JEE Option IDs for any test in the portal
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tests.map((test) => (
                <div key={test.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 font-bold text-[10px] border border-cyan-200 dark:border-cyan-800">
                        {test.subject}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {test.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {test.chapter} • {test.questionCount} Questions • {test.durationMinutes} Minutes • Created by {test.createdBy}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenAnswerKey(test)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
                      title="Download JEE Mains Style Paper & Key"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Download Paper & Key</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CANDIDATE SUBMISSIONS AUDIT */}
        {activeTab === 'submissions' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Student Examination Records & Audit Log ({submissions.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspect student raw scores, accuracy, infractions, and download their official response sheets
                </p>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-cyan-600" />
                <p className="text-sm font-semibold">No student submissions recorded in database yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4 font-bold">Candidate Name</th>
                      <th className="py-3 px-4 font-bold font-mono">Roll Number</th>
                      <th className="py-3 px-4 font-bold">Test Name</th>
                      <th className="py-3 px-4 font-bold text-center">Score</th>
                      <th className="py-3 px-4 font-bold text-center">Correct / Wrong</th>
                      <th className="py-3 px-4 font-bold text-center">Accuracy</th>
                      <th className="py-3 px-4 font-bold text-center">Infractions</th>
                      <th className="py-3 px-4 font-bold text-right">Inspect Response Sheet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {submissions.map((sub) => {
                      const matchedTest = tests.find(t => t.id === sub.testId) || tests[0];
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {sub.studentName}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-cyan-700 dark:text-cyan-300">
                            {sub.rollNumber}
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                            {sub.testTitle || 'Biotechnology Chapter Test'}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-black text-emerald-600">
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

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <OneCrackLogo size="sm" showSubtitle={false} />
            <span className="text-slate-400">|</span>
            <span>Director Console</span>
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
