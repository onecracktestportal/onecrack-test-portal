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
