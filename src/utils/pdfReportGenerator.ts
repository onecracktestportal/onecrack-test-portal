import { jsPDF } from 'jspdf';
import { TestDefinition, ExamSubmission, Question } from '../types/exam';

export interface PDFReportOptions {
  submission?: ExamSubmission | null;
  test: TestDefinition;
  candidateName?: string;
  candidateRoll?: string;
  candidateAppNo?: string;
  candidateEmail?: string;
}

export function generateOneCrackPDFReport({
  submission,
  test,
  candidateName = 'NEET Aspirant',
  candidateRoll = 'OC-ASPIRANT',
  candidateAppNo = 'NEET2026-NTA-DEMO',
  candidateEmail = 'onecracktestportal@gmail.com'
}: PDFReportOptions): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const questions: Question[] = test.questions || [];
  const responses = submission?.responses || {};

  const score = submission ? submission.score : 0;
  const maxScore = submission ? submission.maxScore : questions.length * 4;
  const correctCount = submission ? submission.correctCount : 0;
  const incorrectCount = submission ? submission.incorrectCount : 0;
  const unattemptedCount = submission ? submission.unattemptedCount : questions.length;
  const accuracy = submission ? submission.accuracy : 0;

  // Helper: Draw repeating diagonal watermark on current page
  const drawPageWatermark = (pageLabel = '') => {
    doc.setTextColor(241, 245, 249); // slate-100 / very faint gray
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('ONE CRACK TEST PORTAL', pageWidth / 2, 90, { align: 'center', angle: 35 });
    doc.text('NEET CBT • CONFIDENTIAL EVALUATION', pageWidth / 2, 170, { align: 'center', angle: 35 });
    if (pageLabel) {
      doc.setFontSize(20);
      doc.text(pageLabel, pageWidth / 2, 240, { align: 'center', angle: 35 });
    }
  };

  // Helper: Draw standard OneCrack header on current page
  const drawHeader = (subtitle = 'Official Examination Assessment Report & Detailed Answer Key') => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 24, 'F');
    doc.setFillColor(6, 182, 212); // cyan-500
    doc.rect(0, 24, pageWidth, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ONE CRACK TEST PORTAL (NEET CBT)', 14, 10);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(subtitle, 14, 16);
    doc.text('Work Email: onecracktestportal@gmail.com | National Standard CBT Evaluation Engine', 14, 21);
  };

  // Helper: Draw standard OneCrack footer
  const drawFooter = (pageNum: number, totalPages?: number) => {
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('© 2026 One Crack Test Portal. All rights reserved. Registered under National Assessment Standards.', 14, pageHeight - 6);
    doc.text(`Page ${pageNum}${totalPages ? ` of ${totalPages}` : ''}`, pageWidth - 35, pageHeight - 6);
  };

  // ==========================================
  // PAGE 1: CANDIDATE SUMMARY & MATRIX KEY
  // ==========================================
  drawPageWatermark();
  drawHeader();

  // Candidate Details Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 29, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`Candidate Name: ${candidateName}`, 18, 36);
  doc.text(`Roll Number: ${candidateRoll}`, 18, 42);
  doc.text(`Application ID: ${candidateAppNo}`, 18, 48);

  doc.text(`Exam Title: ${(test.title || 'NEET Assessment').substring(0, 42)}`, 108, 36);
  doc.text(`Subject: ${test.subject || 'Biology / NEET-UG'}`, 108, 42);
  doc.text(`Exam Date: ${new Date(submission?.submittedAt || Date.now()).toLocaleDateString('en-IN')}`, 108, 48);

  // Score Highlight Boxes
  // Box 1: Marks
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, 56, 56, 17, 2, 2, 'FD');
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL MARKS SCORED', 18, 61);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${score} / ${maxScore}`, 18, 69);

  // Box 2: Accuracy
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(74, 56, 56, 17, 2, 2, 'FD');
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('ACCURACY RATE', 78, 61);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${accuracy.toFixed(1)}%`, 78, 69);

  // Box 3: Evaluation Breakdown
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(134, 56, 62, 17, 2, 2, 'FD');
  doc.setTextColor(153, 27, 27);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('EVALUATION BREAKDOWN', 138, 61);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`+${correctCount} Correct | -${incorrectCount} Wrong`, 138, 68);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${unattemptedCount} Unattempted Questions`, 138, 71.5);

  // Matrix Table Header
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL ANSWER KEY & CANDIDATE RESPONSE MATRIX', 14, 79);

  doc.setFillColor(15, 23, 42);
  doc.rect(14, 82, pageWidth - 28, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6.8);
  doc.text('Q#', 16, 86.2);
  doc.text('Question Code', 26, 86.2);
  doc.text('Correct Code (Key)', 62, 86.2);
  doc.text('Candidate Choice', 104, 86.2);
  doc.text('PYQ Year', 145, 86.2);
  doc.text('Marks', 178, 86.2);

  let curY = 92;
  const matrixSlice = questions.slice(0, 36);

  matrixSlice.forEach((q, idx) => {
    const studentResp = responses[q.id];
    const isCorrect = studentResp === q.correctAnswer;
    const isAttempted = studentResp !== null && studentResp !== undefined;
    const marks = !isAttempted ? '0.00' : isCorrect ? '+4.00' : '-1.00';
    const chosenOpt = q.options.find(o => o.key === studentResp);
    const correctOpt = q.options.find(o => o.key === q.correctAnswer);
    const pyq = q.pyqYear || 'NEET Standard';

    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(14, curY - 3.8, pageWidth - 28, 5, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text(`${idx + 1}`, 16, curY);
    doc.text(`${q.questionCode || `QID-${830100 + q.id}`}`, 26, curY);

    doc.setTextColor(5, 150, 105);
    doc.setFont('helvetica', 'bold');
    doc.text(`${correctOpt?.optionCode || q.correctAnswer} (${q.correctAnswer})`, 62, curY);

    doc.setTextColor(!isAttempted ? 100 : isCorrect ? 5 : 220, !isAttempted ? 116 : isCorrect ? 150 : 38, !isAttempted ? 139 : isCorrect ? 105 : 38);
    doc.text(isAttempted ? `${chosenOpt?.optionCode || studentResp} (${studentResp})` : 'Unattempted', 104, curY);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(pyq, 145, curY);

    doc.setFont('helvetica', 'bold');
    doc.text(marks, 178, curY);

    curY += 5.1;
  });

  drawFooter(1);

  // ==============================================================
  // PAGES 2+: DETAILED QUESTION PAPER WITH OPTION CODES,
  // DIFFICULTY, PEER STATS GRAPHS, NCERT CITATIONS & EXPLANATIONS
  // ==============================================================
  let pageNumber = 2;
  doc.addPage();
  drawPageWatermark();
  drawHeader('Detailed Question Paper, Option IDs, Peer Distribution & NCERT Solutions');

  let qY = 32;

  questions.forEach((q, idx) => {
    // Check if we need a new page
    if (qY > pageHeight - 55) {
      drawFooter(pageNumber);
      pageNumber++;
      doc.addPage();
      drawPageWatermark();
      drawHeader('Detailed Question Paper, Option IDs, Peer Distribution & NCERT Solutions');
      qY = 32;
    }

    const studentResp = responses[q.id];
    const isCorrect = studentResp === q.correctAnswer;
    const isAttempted = studentResp !== null && studentResp !== undefined;
    const correctOpt = q.options.find(o => o.key === q.correctAnswer);
    const chosenOpt = q.options.find(o => o.key === studentResp);

    // Question Box Header
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, qY, pageWidth - 28, 7, 1.5, 1.5, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`QUESTION ${idx + 1} • ${q.questionCode || `QID-${830100 + q.id}`}`, 18, qY + 4.8);

    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(2, 132, 199);
    doc.text(`Topic: ${q.topic || 'NEET Syllabus'}`, 90, qY + 4.8);

    // Difficulty & PYQ Tag
    doc.setTextColor(146, 64, 14); // amber-800
    doc.setFont('helvetica', 'bold');
    doc.text(`[${q.difficulty || 'Medium'}] ${q.pyqYear ? `• ${q.pyqYear}` : ''}`, 150, qY + 4.8);

    qY += 10;

    // Question Stem Text
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const splitQuestion = doc.splitTextToSize(q.question, pageWidth - 36);
    doc.text(splitQuestion, 18, qY);
    qY += splitQuestion.length * 4.2 + 2;

    // Options with 6-digit Option Codes
    q.options.forEach((opt) => {
      const isThisCorrect = opt.key === q.correctAnswer;
      const isThisChosen = studentResp === opt.key;

      if (isThisCorrect) {
        doc.setTextColor(5, 150, 105);
        doc.setFont('helvetica', 'bold');
      } else if (isThisChosen && !isThisCorrect) {
        doc.setTextColor(220, 38, 38);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(71, 85, 105);
        doc.setFont('helvetica', 'normal');
      }

      doc.setFontSize(7);
      const optLabel = `(${opt.key}) [ID: ${opt.optionCode}] ${opt.text}`;
      const splitOpt = doc.splitTextToSize(optLabel, pageWidth - 40);
      doc.text(splitOpt, 20, qY);
      qY += splitOpt.length * 3.8 + 1;
    });

    // Evaluation Pill & Peer Stats (difficulty, PYQ year, expected time, peer %)
    const peerAccuracy = q.peerStats?.correctPercent || (q.difficulty === 'Easy' ? 78 : q.difficulty === 'Medium' ? 58 : 38);
    const avgTime = q.peerStats?.avgTimeSpentSeconds || 42;
    const difficulty = q.difficulty || 'Medium';
    const pyqYear = q.pyqYear || 'NEET Trend';

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(18, qY, pageWidth - 36, 16, 1.5, 1.5, 'FD');

    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(
      `Correct: Option ${q.correctAnswer} [${correctOpt?.optionCode || q.correctAnswer}]  |  Your Choice: ${isAttempted ? `Option ${studentResp}` : '—'}  |  Marks: ${!isAttempted ? '0.00' : isCorrect ? '+4.00' : '-1.00'}`,
      22,
      qY + 4
    );

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Difficulty: ${difficulty}  ·  PYQ / Year: ${pyqYear}  ·  Expected time: ${avgTime}s  ·  Students correct (avg): ${peerAccuracy}%`,
      22,
      qY + 8.5
    );

    doc.setTextColor(2, 132, 199);
    doc.text(`Peer accuracy`, 22, qY + 13);
    const barWidth = 50;
    const filledWidth = (peerAccuracy / 100) * barWidth;
    doc.setFillColor(226, 232, 240);
    doc.rect(42, qY + 11.2, barWidth, 2.2, 'F');
    doc.setFillColor(2, 132, 199);
    doc.rect(42, qY + 11.2, filledWidth, 2.2, 'F');
    doc.setTextColor(100, 116, 139);
    doc.text(`${peerAccuracy}%`, 95, qY + 13);

    qY += 19;

    // NCERT Citation & Explanation Box
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    const ncertNote = `NCERT Reference: ${q.ncertRef || 'NCERT Core Syllabus'}`;
    doc.text(ncertNote, 18, qY);
    qY += 3.5;

    const expText = `Explanation: ${q.explanation || 'Verified as per NCERT textbook core principles.'}`;
    const splitExp = doc.splitTextToSize(expText, pageWidth - 36);
    doc.text(splitExp, 18, qY);
    qY += splitExp.length * 3.4 + 6;
  });

  drawFooter(pageNumber);

  return doc;
}

/** Official one-page (or multi) REPORT CARD — professional table layout */
export function generateReportCardPDF({
  submission,
  test,
  candidateName = 'NEET Aspirant',
  candidateRoll = 'OC-ASPIRANT',
  candidateAppNo = 'NEET2026-NTA',
  candidateEmail = '',
  candidateCategory = 'General / Unreserved (UR)',
}: PDFReportOptions & { candidateCategory?: string }): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const questions = test.questions || [];
  const responses = submission?.responses || {};

  const score = submission?.score ?? 0;
  const maxScore = submission?.maxScore ?? questions.length * 4;
  const correct = submission?.correctCount ?? 0;
  const incorrect = submission?.incorrectCount ?? 0;
  const unattempted = submission?.unattemptedCount ?? questions.length;
  const accuracy = submission?.accuracy ?? 0;
  const percentage = submission?.percentage ?? (maxScore ? (score / maxScore) * 100 : 0);
  const timeSec = submission?.timeTakenSeconds ?? 0;
  const tabSwitches = submission?.tabSwitches ?? 0;
  const qCount = questions.length || submission?.totalQuestions || 1;
  const avgQTime = qCount > 0 ? Math.round(timeSec / qCount) : 0;
  const subject = test.subject || 'Biology';
  const isSingleSubject = true; // chapter / subject tests focus on one subject

  const drawWm = () => {
    doc.setTextColor(230, 236, 242);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('ONE CRACK TEST PORTAL', pageWidth / 2, pageHeight / 2 - 10, { align: 'center', angle: 32 });
    doc.setFontSize(14);
    doc.text('CONFIDENTIAL · NEET CBT', pageWidth / 2, pageHeight / 2 + 15, { align: 'center', angle: 32 });
  };

  // Header bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setFillColor(6, 182, 212);
  doc.rect(0, 32, pageWidth, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ONE CRACK TEST PORTAL', 14, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Official NEET (UG) CBT Report Card · Examination Cell', 14, 22);
  doc.setFontSize(8);
  doc.text('Generated by Test Portal', pageWidth - 14, 14, { align: 'right' });

  drawWm();

  let y = 42;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('CANDIDATE REPORT CARD', pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(test.title || 'NEET Chapter Assessment', pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Candidate details table
  const rows: [string, string][] = [
    ['Candidate Name', candidateName],
    ['Roll Number', candidateRoll],
    ['Application Number', candidateAppNo],
    ['Email', candidateEmail || '—'],
    ['Category', candidateCategory],
    ['Subject Focus', subject],
    ['Chapter / Topic', test.chapter || '—'],
    ['Exam Date & Time', submission?.submittedAt ? new Date(submission.submittedAt).toLocaleString('en-IN') : '—'],
  ];

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 8 + rows.length * 7, 2, 2, 'F');
  y += 6;
  rows.forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(k, 18, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(String(v).slice(0, 55), 70, y);
    y += 7;
  });
  y += 6;

  // Performance summary table header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(8, 145, 178);
  doc.text(isSingleSubject ? `SUBJECT PERFORMANCE — ${subject.toUpperCase()}` : 'OVERALL PERFORMANCE', 14, y);
  y += 5;

  const perf: [string, string][] = [
    ['Total Questions', String(qCount)],
    ['Correct (+4)', String(correct)],
    ['Incorrect (−1)', String(incorrect)],
    ['Unattempted (0)', String(unattempted)],
    ['Marks Obtained', `${score} / ${maxScore}`],
    ['Percentage', `${percentage.toFixed(1)}%`],
    ['Accuracy (attempted)', `${accuracy.toFixed(1)}%`],
    ['Total Time Taken', `${Math.floor(timeSec / 60)}m ${timeSec % 60}s`],
    ['Avg. Time / Question', `${avgQTime}s`],
    ['Tab Switch Violations', String(tabSwitches)],
  ];

  // Table
  doc.setDrawColor(203, 213, 225);
  perf.forEach(([k, v], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 4, pageWidth - 28, 7, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(k, 18, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(v, pageWidth - 18, y, { align: 'right' });
    y += 7;
  });
  y += 6;

  // Remarks
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(8, 145, 178);
  doc.text('EXAMINER REMARKS (AUTO-EVALUATED)', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const speedRemark =
    avgQTime <= 35
      ? 'Time speed: Excellent pace — efficient question navigation.'
      : avgQTime <= 55
        ? 'Time speed: Balanced — maintain steady rhythm under exam conditions.'
        : 'Time speed: Slow — practice timed drills to improve throughput.';
  const accRemark =
    accuracy >= 80
      ? 'Accuracy: Outstanding conceptual clarity on attempted items.'
      : accuracy >= 60
        ? 'Accuracy: Good foundation; revise error-prone NCERT lines.'
        : 'Accuracy: Needs focused revision; prioritise high-yield NEET topics.';
  const tabRemark =
    tabSwitches === 0
      ? 'Proctoring: No tab-switch infractions recorded.'
      : tabSwitches <= 2
        ? `Proctoring: ${tabSwitches} tab-switch alert(s) — stay within the secure exam window.`
        : `Proctoring: ${tabSwitches} tab-switch alerts — high risk under strict CBT rules.`;
  const scoreRemark =
    percentage >= 85
      ? 'Overall: Outstanding performance relative to NEET chapter benchmarks.'
      : percentage >= 60
        ? 'Overall: Competitive range — consolidate weak subtopics before full mocks.'
        : 'Overall: Below target — structured NCERT revision recommended.';

  [speedRemark, accRemark, tabRemark, scoreRemark].forEach((line) => {
    const split = doc.splitTextToSize('• ' + line, pageWidth - 32);
    doc.text(split, 16, y);
    y += split.length * 4 + 2;
  });

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Warm regards,', 14, y);
  y += 5;
  doc.text('Examination Cell', 14, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('One Crack Test Portal · NEET (UG) CBT Assessment System', 14, y);

  // Footer
  doc.setDrawColor(6, 182, 212);
  doc.setLineWidth(0.4);
  doc.line(14, pageHeight - 18, pageWidth - 14, pageHeight - 18);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `© ${new Date().getFullYear()} One Crack Test Portal. All rights reserved. Generated by Test Portal · Examination Cell`,
    pageWidth / 2,
    pageHeight - 12,
    { align: 'center' }
  );
  doc.text('This document is confidential and intended solely for the named candidate.', pageWidth / 2, pageHeight - 8, {
    align: 'center',
  });

  return doc;
}

/** Build multiple report blobs for download / zip packaging */
export function buildAllReportBlobs(opts: PDFReportOptions & { candidateCategory?: string }): {
  detailed: { filename: string; blob: Blob };
  reportCard: { filename: string; blob: Blob };
} {
  const roll = opts.candidateRoll || 'OC-ASPIRANT';
  const detailed = generateOneCrackPDFReport(opts);
  const card = generateReportCardPDF(opts);
  return {
    detailed: {
      filename: `OneCrack_Detailed_Report_${roll}.pdf`,
      blob: detailed.output('blob'),
    },
    reportCard: {
      filename: `OneCrack_Report_Card_${roll}.pdf`,
      blob: card.output('blob'),
    },
  };
}
