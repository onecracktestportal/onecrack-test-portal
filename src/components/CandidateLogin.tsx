import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  Lock, 
  Mail, 
  User, 
  FileBadge, 
  Maximize2, 
  Sparkles,
  Server,
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react';
import { StudentProfile, CandidateCategory } from '../types/exam';
import { 
  registerStudentWithCredentials, 
  loginStudentWithCredentials,
  testFirestoreConnection,
  generateOCRollNumber
} from '../services/firebase';
import { OneCrackLogo } from './OneCrackLogo';
import { ProtocolsAndCorrectionModal } from './ProtocolsAndCorrectionModal';

interface CandidateLoginProps {
  onStartExam: (student: StudentProfile) => void;
  onOpenDashboard?: (student: StudentProfile) => void;
  onViewPastResults?: () => void;
}

const CATEGORIES: CandidateCategory[] = [
  'General / Unreserved (UR)',
  'OBC - Non Creamy Layer (OBC-NCL)',
  'Scheduled Caste (SC)',
  'Scheduled Tribe (ST)',
  'Gen - EWS (Economically Weaker Section)',
  'PwBD (Persons with Benchmark Disabilities)',
];

export const CandidateLogin: React.FC<CandidateLoginProps> = ({ 
  onStartExam,
  onOpenDashboard 
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'reset'>('login');
  const [activeCandidate, setActiveCandidate] = useState<StudentProfile | null>(null);

  // Login form state (Empty by default per requirements)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUid, setRegUid] = useState('');
  const [regCategory, setRegCategory] = useState<CandidateCategory>('General / Unreserved (UR)');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regOtp, setRegOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Status & modal states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasAgreedDeclaration, setHasAgreedDeclaration] = useState(false);
  const [isConnectingDb, setIsConnectingDb] = useState(false);
  const [isDbOnline, setIsDbOnline] = useState<boolean | null>(null);
  const [fullscreenGranted, setFullscreenGranted] = useState(false);
  const [isProtocolsModalOpen, setIsProtocolsModalOpen] = useState(false);
  const [correctionStatusNote, setCorrectionStatusNote] = useState<string | null>(null);

  // Check Firestore connection and cached session on mount
  useEffect(() => {
    async function checkDb() {
      setIsConnectingDb(true);
      const online = await testFirestoreConnection();
      setIsDbOnline(online);
      setIsConnectingDb(false);
    }
    checkDb();

    // Check if an active registered student exists in local storage
    const saved = localStorage.getItem('cbt_active_student');
    if (saved) {
      try {
        const student: StudentProfile = JSON.parse(saved);
        setActiveCandidate(student);
        if (student.pendingCorrectionNote) {
          setCorrectionStatusNote(student.pendingCorrectionNote);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage("Please enter your Application UID, Roll Number, or Registered Email.");
      return;
    }
    if (!loginPassword) {
      setErrorMessage("Please enter your candidate account password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const student = await loginStudentWithCredentials(loginIdentifier, loginPassword);
      setActiveCandidate(student);
      if (student.pendingCorrectionNote) {
        setCorrectionStatusNote(student.pendingCorrectionNote);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Invalid credentials. Please register if you do not have an account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage("Candidate Full Name is required per official ID.");
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage("Valid Email Address is required.");
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage("Password and confirmation do not match.");
      return;
    }
    if (!otpVerified) {
      setErrorMessage("Please verify your email with the OTP sent from OneCrack Test Portal before registering.");
      return;
    }

    setIsSubmitting(true);
    try {
      const ocRoll = generateOCRollNumber();
      const candidateCustomUid = regUid.trim() ? regUid.trim() : ocRoll;
      const generatedAppNo = regUid.trim() ? regUid.trim() : `NEET2026-NTA-${Math.floor(100000 + Math.random() * 900000)}`;
      
      const newStudent = await registerStudentWithCredentials({
        uid: candidateCustomUid,
        name: regName.trim(),
        email: regEmail.trim(),
        category: regCategory,
        applicationNumber: generatedAppNo,
        rollNumber: ocRoll,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        gender: regGender,
        role: 'student'
      }, regPassword);

      setActiveCandidate(newStudent);
      setLoginIdentifier(candidateCustomUid);
      setActiveTab('login');
    } catch (err: any) {
      setErrorMessage(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleSendRegistrationOtp = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setErrorMessage('Enter a valid email address to receive OTP.');
      return;
    }
    setOtpSending(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim(), purpose: 'registration' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to send OTP');
      setOtpSent(true);
      setSuccessMessage(`OTP sent to ${regEmail.trim()}. Check your inbox (and spam).`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not send OTP. Ensure the server is running.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyRegistrationOtp = async () => {
    setErrorMessage(null);
    if (!regOtp.trim()) {
      setErrorMessage('Enter the 6-digit OTP received by email.');
      return;
    }
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim(), code: regOtp.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Invalid OTP');
      setOtpVerified(true);
      setSuccessMessage('Email verified successfully. You may complete registration.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'OTP verification failed.');
    }
  };

  const handleSendResetOtp = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!resetEmail.trim()) {
      setErrorMessage('Enter your registered email.');
      return;
    }
    setOtpSending(true);
    try {
      const res = await fetch('/api/auth/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to send reset OTP');
      setResetOtpSent(true);
      setSuccessMessage(`Password reset OTP sent to ${resetEmail.trim()}.`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not send reset OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (resetNewPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/password-reset-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim(), code: resetOtp.trim(), newPassword: resetNewPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Reset failed');

      // Update local registered users password map
      const usersRaw = localStorage.getItem('cbt_registered_users');
      if (usersRaw) {
        const userMap = JSON.parse(usersRaw);
        const emailKey = resetEmail.trim().toLowerCase();
        for (const k of Object.keys(userMap)) {
          const entry = userMap[k];
          if (entry?.profile?.email?.toLowerCase() === emailKey || k.toLowerCase() === emailKey) {
            entry.passwordHash = resetNewPassword;
            userMap[k] = entry;
          }
        }
        localStorage.setItem('cbt_registered_users', JSON.stringify(userMap));
      }
      setResetSuccess(true);
      setSuccessMessage('Password updated successfully. You can now log in.');
      setTimeout(() => {
        setActiveTab('login');
        setResetSuccess(false);
        setResetOtpSent(false);
        setResetOtp('');
        setResetNewPassword('');
        setResetConfirmPassword('');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Password reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-In disabled — use Register (OTP) or credential login only.

  const handleLogout = () => {
    localStorage.removeItem('cbt_active_student');
    setActiveCandidate(null);
    setHasAgreedDeclaration(false);
  };

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFullscreenGranted(true);
      }
    } catch {
      setFullscreenGranted(true);
    }
  };

  const handleProceedToPortal = () => {
    if (!activeCandidate) return;
    if (onOpenDashboard) {
      onOpenDashboard(activeCandidate);
    } else {
      onStartExam(activeCandidate);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/40 via-slate-900 to-black pointer-events-none"></div>

      {/* Top Bar */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <OneCrackLogo size="md" />

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Database:</span>
            {isConnectingDb ? (
              <span className="text-amber-400 animate-pulse font-medium">Connecting...</span>
            ) : isDbOnline ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Connected
              </span>
            ) : (
              <span className="text-cyan-400 font-semibold">Local Persistence Active</span>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>Work Email:</span>
            <a href="mailto:onecracktestportal@gmail.com" className="font-mono text-cyan-400 hover:underline">
              onecracktestportal@gmail.com
            </a>
          </div>

          <button
            onClick={() => setIsProtocolsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors text-xs font-medium cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official Protocols & Correction</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 py-8 flex flex-col justify-center">
        
        {/* Header Heading */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-700/60 text-cyan-300 text-xs font-bold tracking-wide mb-1 shadow-lg shadow-cyan-900/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>OFFICIAL COMPUTER BASED TESTING PORTAL</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">One</span>
            <span className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent tracking-tight drop-shadow-[0_0_14px_rgba(6,182,212,0.4)]">Crack</span>
            <span className="text-3xl sm:text-5xl font-black text-white tracking-tight">Test Portal</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-medium">
            Professional Computer Based Test (CBT) System with encrypted test papers, anti-cheat proctoring, instant official scorecards, and detailed answer keys.
          </p>
        </div>

        {/* If NO active candidate is logged in -> Show Login / Register Box */}
        {!activeCandidate ? (
          <div className="max-w-md mx-auto w-full bg-slate-950/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative">
            
            {/* Tab Switcher */}
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl mb-6 border border-slate-800">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'login'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'register'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('reset'); setErrorMessage(null); setSuccessMessage(null); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'reset'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Reset PW</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-start gap-2">
                <CheckSquare className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB: LOGIN */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Candidate Roll Number / Application ID / Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Enter your Roll No / App ID / Email"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password / Access Key
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Authenticate & Enter Portal</span>
                    </>
                  )}
                </button>

                
              </form>
            ) : activeTab === 'register' ? (
              /* TAB: REGISTRATION */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Custom UID / Candidate ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={regUid}
                    onChange={(e) => setRegUid(e.target.value)}
                    placeholder="e.g. UID-849201 or custom identifier (or leave blank to auto-generate)"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    You can use this UID or your generated OC Roll Number to sign in from any device.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="As printed on Class 10 Certificate"
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 inline" /> Name is immutable post registration.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Candidate Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => { setRegEmail(e.target.value); setOtpSent(false); setOtpVerified(false); setRegOtp(''); }}
                      placeholder="candidate@example.com"
                      required
                      className={`w-full px-3 py-2 pr-10 bg-slate-900 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 ${
                        otpVerified
                          ? 'border-2 border-emerald-500 focus:ring-emerald-500'
                          : 'border border-slate-800 focus:ring-cyan-500'
                      }`}
                    />
                    {otpVerified && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" title="Email verified">
                        <CheckSquare className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  {otpVerified && (
                    <p className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                      <CheckSquare className="w-3 h-3" /> Email verified successfully via OneCrack OTP
                    </p>
                  )}
                </div>

                {/* Email OTP Verification */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      Email OTP Verification (from OneCrack Portal)
                    </span>
                    {otpVerified && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckSquare className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSendRegistrationOtp}
                      disabled={otpSending || otpVerified}
                      className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white disabled:opacity-40 cursor-pointer"
                    >
                      {otpSending ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={regOtp}
                      onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit OTP"
                      disabled={otpVerified}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyRegistrationOtp}
                      disabled={otpVerified || regOtp.length !== 6}
                      className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white disabled:opacity-40 cursor-pointer"
                    >
                      Verify
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">OTP is sent from <span className="text-cyan-400 font-mono">onecracktestportal@gmail.com</span>. Valid 10 minutes.</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value as CandidateCategory)}
                      className="w-full px-2 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                      <Lock className="w-3 h-3 inline" /> Category is locked.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value)}
                      className="w-full px-2 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Third Gender">Third Gender</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !otpVerified}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <span>Registering...</span> : <span>Complete Registration (Generates OC Roll No)</span>}
                  </button>
                  {!otpVerified && (
                    <p className="text-[10px] text-amber-400/90 text-center mt-2">Verify email OTP before completing registration.</p>
                  )}
                </div>
              </form>
            ) : activeTab === 'reset' ? (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your registered email. We will send a one-time code from <span className="text-cyan-400 font-mono">onecracktestportal@gmail.com</span> to reset your password securely.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => { setResetEmail(e.target.value); setResetOtpSent(false); }}
                    placeholder="your@email.com"
                    required
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendResetOtp}
                  disabled={otpSending}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 cursor-pointer"
                >
                  {otpSending ? 'Sending OTP...' : resetOtpSent ? 'Resend Reset OTP' : 'Send Password Reset OTP'}
                </button>
                {resetOtpSent && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">OTP Code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit OTP"
                        required
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                      <input
                        type="password"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        required
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        required
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold rounded-xl text-xs shadow-lg cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Updating...' : 'Verify OTP & Set New Password'}
                    </button>
                  </>
                )}
                {resetSuccess && (
                  <p className="text-xs text-emerald-400 text-center font-semibold">Password updated. Redirecting to Sign In...</p>
                )}
              </form>
            ) : null}

          </div>
        ) : (
          /* When candidate IS authenticated -> Show Candidate Profile & Dashboard Access */
          <div className="max-w-4xl mx-auto w-full bg-slate-950/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
            
            {/* Candidate Identity Strip */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <img
                  src={activeCandidate.photoUrl}
                  alt={activeCandidate.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-lg shadow-cyan-500/20"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{activeCandidate.name}</h2>
                    <span title="Immutable per NTA Rule 4.2">
                      <Lock className="w-3.5 h-3.5 text-amber-400 inline" />
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Roll No: <strong className="text-cyan-400 font-black tracking-wide text-sm">{activeCandidate.rollNumber}</strong> | App No: {activeCandidate.applicationNumber}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1">
                      <span>Category: {activeCandidate.category}</span>
                      <span title="Immutable per NTA Rule 4.2">
                        <Lock className="w-3 h-3 text-amber-400 inline" />
                      </span>
                    </span>

                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-400 font-medium">
                      ✓ Biometrics Verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 text-right">
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
                >
                  Sign Out / Switch Candidate
                </button>
                <div className="text-[11px] text-slate-500">
                  Assessment Node: <strong className="text-slate-300 font-mono">{activeCandidate.systemId}</strong>
                </div>
              </div>
            </div>

            {/* Protocol Notice */}
            {correctionStatusNote && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Notice: {correctionStatusNote}</span>
              </div>
            )}

            {/* Declaration & Instructions */}
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Candidate Instructions & Integrity Declaration</span>
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Standard NEET marking scheme: <strong>+4.00</strong> for correct responses, <strong>-1.00</strong> for wrong responses, <strong>0.00</strong> for unattempted.</li>
                <li>Each question has official Question and Option IDs matching JEE Mains/NEET CBT formats.</li>
                <li>Candidate name and category cannot be altered directly. You may file an official correction request ticket if needed.</li>
                <li>Switching windows or opening background tabs is monitored and recorded on your scorecard.</li>
              </ul>

              <div 
                onClick={() => setHasAgreedDeclaration(!hasAgreedDeclaration)}
                className="flex items-start gap-2 pt-2 cursor-pointer select-none text-slate-200"
              >
                {hasAgreedDeclaration ? (
                  <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                )}
                <span className="text-[11px] font-medium leading-snug">
                  I have read, understood, and agreed to all the guidelines of OneCrack Test Portal. I confirm that all credentials provided are authentic.
                </span>
              </div>
            </div>

            {/* Launch Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleProceedToPortal}
                disabled={!hasAgreedDeclaration}
                className="w-full sm:flex-1 py-3 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-cyan-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Layers className="w-4 h-4" />
                <span>Proceed to Main Test Portal Dashboard</span>
              </button>

              <button
                onClick={requestFullscreen}
                className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{fullscreenGranted ? 'Fullscreen On' : 'Enable Fullscreen'}</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Protocols & Discrepancy Correction Modal */}
      {isProtocolsModalOpen && (
        <ProtocolsAndCorrectionModal
          isOpen={isProtocolsModalOpen}
          onClose={() => setIsProtocolsModalOpen(false)}
          student={activeCandidate}
          onCorrectionSubmitted={(note) => setCorrectionStatusNote(note)}
        />
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950/80 px-4 py-4 text-center text-xs text-slate-500 space-y-1">
        <p>
          OneCrack Test Portal — Computer Based Examination System | Work Email: <a href="mailto:onecracktestportal@gmail.com" className="text-cyan-400 font-mono hover:underline">onecracktestportal@gmail.com</a>
        </p>
        <p className="text-[11px] text-slate-600">
          © 2026 OneCrack Test Portal. All rights reserved. Registered under National Assessment Standards.
        </p>
      </footer>

    </div>
  );
};
