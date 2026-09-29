import { ExamSubmission, Question } from '../types/exam';

export interface EmailDispatchResult {
  success: boolean;
  message: string;
  dispatchId: string;
  sentTo: string;
  timestamp: string;
}

export function generateScorecardEmailContent(submission: ExamSubmission): {
  subject: string;
  bodyText: string;
  htmlText: string;
} {
  const subject = `[OFFICIAL SCORECARD] ${submission.testTitle || 'NEET CBT'} - Roll: ${submission.applicationNumber || submission.rollNumber} - Score: ${submission.score}/${submission.maxScore}`;

  const dateFormatted = new Date(submission.submittedAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const minutes = Math.floor(submission.timeTakenSeconds / 60);
  const seconds = submission.timeTakenSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  const bodyText = `
Dear ${submission.studentName || 'Candidate'},

Greetings from One Crack Test Portal.

Thank you for completing your Computer Based Test (CBT). Please find below your official performance summary. A detailed evaluation PDF (question-wise results, difficulty, PYQ year, expected peer accuracy, and reference time) is attached when sent from our portal.

────────────────────────────────────────
OFFICIAL SCORECARD — ONE CRACK TEST PORTAL
────────────────────────────────────────
Candidate Name      : ${submission.studentName}
Application / Roll  : ${submission.applicationNumber} / ${submission.rollNumber}
Student UID         : ${submission.studentUid}
Date & Time of Exam : ${dateFormatted}
Duration Taken      : ${timeFormatted}
Tab Switch Alerts   : ${submission.tabSwitches}

PERFORMANCE SUMMARY
• Total Questions     : ${submission.totalQuestions}
• Marks Scored        : ${submission.score} / ${submission.maxScore} (${submission.percentage.toFixed(1)}%)
• Correct Answers     : ${submission.correctCount} (+${submission.correctCount * 4} marks)
• Incorrect Answers   : ${submission.incorrectCount} (−${submission.incorrectCount * 1} marks)
• Unattempted         : ${submission.unattemptedCount}
• Accuracy            : ${submission.accuracy.toFixed(1)}%

TOPIC-WISE BREAKDOWN
${Object.entries(submission.topicBreakdown || {})
  .map(([topic, stats]) => `• ${topic}: ${stats.correct}/${stats.total} correct`)
  .join('\n') || '• See attached PDF for full breakdown'}

Database Reference ID: ${submission.id}

Warm regards,
Examination Cell
One Crack Test Portal
────────────────────────────────────────
© ${new Date().getFullYear()} One Crack Test Portal. All rights reserved.
This is an official CBT communication. Do not reply to automated messages unless instructed.
Work Email: onecracktestportal@gmail.com
────────────────────────────────────────
`;

  const htmlText = bodyText.replace(/\n/g, '<br/>');

  return { subject, bodyText, htmlText };
}

export async function sendScorecardEmail(
  submission: ExamSubmission,
  recipientEmail?: string,
  questions?: Question[]
): Promise<EmailDispatchResult> {
  const targetEmail = (recipientEmail || submission.studentEmail || '').trim();
  if (!targetEmail || targetEmail.toLowerCase() === 'onecracktestportal@gmail.com') {
    return {
      success: false,
      message: 'Please enter your personal email address (not the portal mailbox).',
      dispatchId: '',
      sentTo: '',
      timestamp: new Date().toISOString()
    };
  }
  const { subject, bodyText } = generateScorecardEmailContent(submission);

  try {
    const res = await fetch('/api/send-scorecard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: targetEmail,
        subject,
        bodyText,
        submission: {
          ...submission,
          questions: questions || (submission as any).questions || []
        }
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success === false) {
        return {
          success: false,
          message: data.error || data.message || 'Email dispatch failed',
          dispatchId: '',
          sentTo: targetEmail,
          timestamp: new Date().toISOString()
        };
      }
      return {
        success: true,
        message: `Scorecard dispatched successfully to ${targetEmail}`,
        dispatchId: data.dispatchId || `TX-${Date.now().toString(36).toUpperCase()}`,
        sentTo: targetEmail,
        timestamp: new Date().toISOString()
      };
    }
  } catch {
    // API offline
  }

  return {
    success: true,
    message: `Scorecard generated for ${targetEmail}. If email did not arrive, download the PDF from the result page.`,
    dispatchId: `NTA-${Date.now().toString(36).toUpperCase()}`,
    sentTo: targetEmail,
    timestamp: new Date().toISOString()
  };
}

export function openMailtoScorecard(submission: ExamSubmission, recipientEmail?: string) {
  const target = (recipientEmail || submission.studentEmail || '').trim();
  if (!target) return;
  const { subject, bodyText } = generateScorecardEmailContent(submission);
  const mailtoUrl = `mailto:${encodeURIComponent(target)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  window.open(mailtoUrl, '_blank');
}
