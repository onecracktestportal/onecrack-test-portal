import React, { useState, useEffect } from 'react';
import { ExamSubmission } from '../types/exam';
import { 
  X, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ArrowRight,
  Database,
  Search,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { fetchLeaderboard } from '../services/firebase';

interface PastResultsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSubmission: (submission: ExamSubmission) => void;
  onStartNewTest: () => void;
}

export const PastResultsDrawer: React.FC<PastResultsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectSubmission,
  onStartNewTest,
}) => {
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchLeaderboard();
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filtered = submissions.filter(s => 
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Exam History & Cloud Database Records
              </h3>
              <p className="text-xs text-slate-400">
                Firestore Collection: <code className="text-emerald-400">/submissions</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate name, roll no, or email..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span>Loading saved test records from Firestore...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-700">No test submissions found</p>
              <p className="mt-1">Complete a 27-minute test to archive your first scorecard!</p>
              <button
                onClick={() => {
                  onClose();
                  onStartNewTest();
                }}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow"
              >
                Take Chapter Test Now
              </button>
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectSubmission(item);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        {item.studentName}
                      </span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                        {item.applicationNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{Math.floor(item.timeTakenSeconds / 60)}m {item.timeTakenSeconds % 60}s</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black font-mono text-emerald-700">
                      {item.score} <span className="text-xs text-slate-400 font-normal">/ {item.maxScore}</span>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      {item.accuracy.toFixed(0)}% Acc • {item.correctCount} Correct
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Proctoring: {item.tabSwitches === 0 ? 'Clean (0 blur)' : `${item.tabSwitches} alerts`}</span>
                  <span className="text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>View Scorecard</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            {submissions.length} Total Archived Attempt(s)
          </span>
          <button
            onClick={() => {
              onClose();
              onStartNewTest();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition"
          >
            Start New Test
          </button>
        </div>
      </div>
    </div>
  );
};
