import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  Info,
  BookOpen,
  Award
} from 'lucide-react';
import { StudentProfile, CorrectionRequest } from '../types/exam';
import { submitProfileCorrectionRequest } from '../services/firebase';

interface ProtocolsAndCorrectionModalProps {
  student?: StudentProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onCorrectionSubmitted?: (note: string) => void;
}

export const ProtocolsAndCorrectionModal: React.FC<ProtocolsAndCorrectionModalProps> = ({
  student,
  isOpen,
  onClose,
  onCorrectionSubmitted
}) => {
  const [activeTab, setActiveTab] = useState<'protocols' | 'request'>('protocols');
  const [targetField, setTargetField] = useState<'Candidate Name' | 'Category' | 'Date of Birth'>('Candidate Name');
  const [requestedValue, setRequestedValue] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const candidateName = student?.name || 'Registered Candidate';
  const candidateCategory = student?.category || 'General / Unreserved (UR)';
  const candidateAppNo = student?.applicationNumber || 'NEET2026-NTA-10492';
  const candidateRoll = student?.rollNumber || 'OC-849201';
  const candidateUid = student?.uid || 'GUEST-ASPIRANT';

  if (!isOpen) return null;

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedValue.trim() || !reason.trim()) {
      alert("Please enter the requested value and legitimate justification.");
      return;
    }

    setSubmitting(true);
    const newTicket: CorrectionRequest = {
      id: `CR-${Date.now().toString().slice(-6)}`,
      studentUid: student?.uid || 'GUEST-ASPIRANT',
      studentName: student?.name || 'Dr. Aryan Sharma (NEET Aspirant)',
      rollNumber: student?.rollNumber || 'OC-849201',
      requestedField: targetField,
      currentValue: targetField === 'Candidate Name' ? (student?.name || 'Dr. Aryan Sharma') : (student?.category || 'General / Unreserved (UR)'),
      requestedValue: requestedValue.trim(),
      reason: reason.trim(),
      status: 'Pending Verification',
      createdAt: new Date().toISOString()
    };

    await submitProfileCorrectionRequest(newTicket);
    setSubmitting(false);
    setSubmittedSuccess(true);
    onCorrectionSubmitted?.(`${targetField} correction requested (Ticket: ${newTicket.id})`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                NEET (UG) Profile Lock & Examination Protocols
                <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-500/30">
                  Rule 4.2 Enforced
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                National Testing Agency • Strict Security & Discrepancy Correction Protocol
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Locked Details Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-semibold text-amber-950">
              Candidate Registered Identity is Fixed & Verified:
            </p>
            <p className="mt-0.5">
              Candidate Name (<span className="font-bold underline">{candidateName}</span>) and Category (<span className="font-bold underline">{candidateCategory}</span>) cannot be directly modified through the test client. To rectify clerical discrepancies, review the protocols below or submit a formal correction request.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            onClick={() => setActiveTab('protocols')}
            className={`py-3 px-4 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
              activeTab === 'protocols' 
                ? 'border-indigo-600 text-indigo-700 bg-white' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Official NEET (UG) / NTA Examination Protocols
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`py-3 px-4 font-semibold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition ${
              activeTab === 'request' 
                ? 'border-indigo-600 text-indigo-700 bg-white' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            Submit Formal Correction Request
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-700">
          {activeTab === 'protocols' ? (
            <div className="space-y-6">
              
              {/* Protocol 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-200 transition">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">1</div>
                  Candidate Identity & Anti-Impersonation Protocol
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every candidate is linked to a permanent Application Number (<span className="font-mono font-medium text-slate-900">{candidateAppNo}</span>). As per NTA Anti-Impersonation Guidelines 2026, biometric records, candidate names, and caste categories are frozen once registered to ensure zero unauthorized substitution.
                </p>
              </div>

              {/* Protocol 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-200 transition">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">2</div>
                  NEET Scoring & Negative Marking Scheme (+4 / -1 / 0)
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
                  <li><strong>Correct Response:</strong> +4 marks are awarded.</li>
                  <li><strong>Incorrect Response:</strong> -1 mark is deducted from the total score.</li>
                  <li><strong>Unattempted Question:</strong> 0 marks awarded (no penalty).</li>
                  <li><strong>Answered & Marked for Review:</strong> Purple badge with green dot indicates the answer is saved and <em>will be evaluated</em> for the final merit score.</li>
                </ul>
              </div>

              {/* Protocol 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-200 transition">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">3</div>
                  NEET CBT Timing & Auto-Submission
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Each mock follows <strong>NEET (UG)</strong> CBT conventions. The timer matches the duration published on the test card (chapter or full-length). When the countdown reaches <strong>00:00:00</strong>, responses are auto-submitted to the evaluation database. No extra time is granted. Plan section-wise pace as in the official NTA NEET exam.
                </p>
              </div>

              {/* Protocol 4 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-indigo-200 transition">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">4</div>
                  Window Blur & Screen Switching Violation Detection
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Navigating to other browser tabs, minimizing the screen, or opening unauthorized windows is strictly forbidden. The system automatically logs screen switches and issues alerts. Total violations are permanently tagged onto your final scorecard.
                </p>
              </div>

              {/* Protocol 5 */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                <div className="flex items-center gap-2 font-bold text-indigo-950 mb-1">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Syllabus Coverage: Full NEET (UG) — Physics, Chemistry & Biology (NTA / NCERT)
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  Syllabus is aligned with the <strong>official NTA NEET (UG)</strong> curriculum based on NCERT Class 11 & 12 for <strong>Physics, Chemistry, and Biology (Botany & Zoology)</strong>. Individual chapter tests may focus on a single subject or unit; full-syllabus mocks cover the complete NEET blueprint. Refer to the NEET Syllabus tab on your dashboard for the unit-wise list.
                </p>
              </div>

            </div>
          ) : (
            <div>
              {submittedSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg">Correction Ticket Registered</h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                    Your request for rectifying <strong>{targetField}</strong> has been logged in the examination database. The NTA Center Board will review your application before issuing the final official result certificate.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow transition"
                    >
                      Return to Examination Portal
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-2">
                      <Info className="w-4 h-4 text-indigo-600" />
                      Current Registered Credentials
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Candidate Name:</span>
                        <span className="font-bold text-slate-900">{candidateName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Candidate Category:</span>
                        <span className="font-bold text-slate-900">{candidateCategory}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Application Roll No:</span>
                        <span className="font-mono text-slate-900">{candidateAppNo}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">System UID:</span>
                        <span className="font-mono text-slate-900">{candidateUid}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Field Requiring Correction *
                    </label>
                    <select
                      value={targetField}
                      onChange={(e) => setTargetField(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="Candidate Name">Candidate Full Name</option>
                      <option value="Category">Reserved / Unreserved Category</option>
                      <option value="Date of Birth">Date of Birth / Government ID</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Proposed / Correct Value *
                    </label>
                    <input
                      type="text"
                      value={requestedValue}
                      onChange={(e) => setRequestedValue(e.target.value)}
                      placeholder={targetField === 'Candidate Name' ? "Enter full legal name as per Class 10 certificate" : "Enter correct category (e.g. OBC-NCL, EWS)"}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Reason & Official Supporting Document Citation *
                    </label>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Specify reason for clerical error and cite supporting ID (e.g., Aadhaar No / Class 10 Roll No / State Caste Certificate Ref)..."
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow flex items-center gap-2 transition disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          Submitting Ticket...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Submit to NTA Discrepancy Board
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Official NTA NEET (UG) Testing Gateway</span>
          <button
            onClick={onClose}
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  );
};
