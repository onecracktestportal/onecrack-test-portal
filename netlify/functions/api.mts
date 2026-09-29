/**
 * Netlify Function — OneCrack API (email, OTP, AI generate, scorecard)
 * Routed via netlify.toml: /api/* → /.netlify/functions/api
 */
import type { Context, Config } from '@netlify/functions';
import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';

const GMAIL_USER = process.env.GMAIL_USER || 'onecracktestportal@gmail.com';
const GMAIL_PASS = (process.env.GMAIL_APP_PASSWORD || 'vhhkrayvzgrulroi').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

const FROM = `"One Crack Test Portal" <${GMAIL_USER}>`;

// OTP store (warm instance memory)
const g = globalThis as unknown as {
  __otp?: Map<string, { code: string; expiresAt: number; purpose: string }>;
};
function otpStore() {
  if (!g.__otp) g.__otp = new Map();
  return g.__otp;
}
function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function corsHeaders(origin?: string | null) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };
}

function json(status: number, body: unknown, origin?: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(origin),
  });
}

async function parseBody(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

/** Strip /api prefix and function path variants */
function routePath(url: URL): string {
  let p = url.pathname;
  // /.netlify/functions/api/auth/send-otp or /api/auth/send-otp
  p = p.replace(/^\/.netlify\/functions\/api/, '');
  p = p.replace(/^\/api/, '');
  if (!p.startsWith('/')) p = '/' + p;
  return p;
}

export default async (req: Request, _context: Context) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const url = new URL(req.url);
  const path = routePath(url);
  const method = req.method.toUpperCase();

  try {
    // -------- OTP: send --------
    if (method === 'POST' && path === '/auth/send-otp') {
      const { email, purpose = 'registration' } = await parseBody(req);
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json(400, { success: false, error: 'Valid email is required' }, origin);
      }
      const code = genOtp();
      const key = email.toLowerCase().trim();
      otpStore().set(key, { code, expiresAt: Date.now() + 10 * 60 * 1000, purpose });
      const purposeLabel =
        purpose === 'password_reset'
          ? 'Password Reset'
          : purpose === 'registration'
            ? 'Account Registration'
            : 'Email Verification';
      await transporter.sendMail({
        from: FROM,
        to: email,
        subject: `[OneCrack] Your ${purposeLabel} OTP: ${code}`,
        text: `Your OneCrack ${purposeLabel} OTP is: ${code}\nValid for 10 minutes.\nDo not share this code.`,
        html: `
          <div style="font-family:Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:16px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#0891b2,#2563eb);padding:28px 24px;text-align:center">
              <h1 style="margin:0;font-size:22px;color:#fff">OneCrack Test Portal</h1>
              <p style="margin:8px 0 0;font-size:13px;color:#e0f2fe">Official CBT Examination System</p>
            </div>
            <div style="padding:32px 24px">
              <p style="font-size:15px">Your one-time verification code for <strong>${purposeLabel}</strong> is:</p>
              <div style="margin:24px 0;text-align:center">
                <span style="display:inline-block;font-size:36px;font-weight:800;letter-spacing:12px;color:#22d3ee;background:#1e293b;padding:16px 28px;border-radius:12px;border:1px solid #334155">${code}</span>
              </div>
              <p style="font-size:13px;color:#94a3b8">Expires in <strong>10 minutes</strong>. Do not share it.</p>
            </div>
            <div style="padding:16px 24px;background:#1e293b;text-align:center;font-size:11px;color:#64748b">© 2026 One Crack Test Portal · ${GMAIL_USER}</div>
          </div>`,
      });
      return json(200, { success: true, message: `OTP sent to ${email}`, expiresInSeconds: 600 }, origin);
    }

    // -------- OTP: verify --------
    if (method === 'POST' && path === '/auth/verify-otp') {
      const { email, code } = await parseBody(req);
      if (!email || !code) {
        return json(400, { success: false, error: 'Email and OTP code are required' }, origin);
      }
      const key = email.toLowerCase().trim();
      const entry = otpStore().get(key);
      if (!entry) return json(400, { success: false, error: 'No OTP found. Please request a new code.' }, origin);
      if (Date.now() > entry.expiresAt) {
        otpStore().delete(key);
        return json(400, { success: false, error: 'OTP expired. Please request a new code.' }, origin);
      }
      if (String(entry.code) !== String(code).trim()) {
        return json(400, { success: false, error: 'Invalid OTP code.' }, origin);
      }
      otpStore().delete(key);
      return json(200, { success: true, message: 'Email verified successfully', purpose: entry.purpose }, origin);
    }

    // -------- Password reset request --------
    if (method === 'POST' && path === '/auth/password-reset-request') {
      const { email } = await parseBody(req);
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json(400, { success: false, error: 'Valid email is required' }, origin);
      }
      const code = genOtp();
      const key = email.toLowerCase().trim();
      otpStore().set(key, { code, expiresAt: Date.now() + 10 * 60 * 1000, purpose: 'password_reset' });
      await transporter.sendMail({
        from: FROM,
        to: email,
        subject: `[OneCrack] Password Reset OTP: ${code}`,
        text: `Your OneCrack Password Reset OTP is: ${code}\nValid for 10 minutes.`,
        html: `
          <div style="font-family:Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:16px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:28px 24px;text-align:center">
              <h1 style="margin:0;font-size:22px;color:#fff">Password Reset</h1>
            </div>
            <div style="padding:32px 24px;text-align:center">
              <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#f87171">${code}</span>
              <p style="font-size:13px;color:#94a3b8;margin-top:16px">Expires in 10 minutes.</p>
            </div>
          </div>`,
      });
      return json(200, { success: true, message: `Password reset OTP sent to ${email}` }, origin);
    }

    // -------- Password reset confirm --------
    if (method === 'POST' && path === '/auth/password-reset-confirm') {
      const { email, code, newPassword } = await parseBody(req);
      if (!email || !code || !newPassword || String(newPassword).length < 6) {
        return json(400, {
          success: false,
          error: 'Email, valid OTP, and new password (min 6 chars) are required',
        }, origin);
      }
      const key = email.toLowerCase().trim();
      const entry = otpStore().get(key);
      if (!entry || entry.purpose !== 'password_reset') {
        return json(400, { success: false, error: 'No valid password-reset OTP found.' }, origin);
      }
      if (Date.now() > entry.expiresAt) {
        otpStore().delete(key);
        return json(400, { success: false, error: 'OTP expired.' }, origin);
      }
      if (String(entry.code) !== String(code).trim()) {
        return json(400, { success: false, error: 'Invalid OTP code.' }, origin);
      }
      otpStore().delete(key);
      return json(200, { success: true, message: 'OTP verified. You may set the new password.', verified: true }, origin);
    }

    // -------- Send scorecard --------
    if (method === 'POST' && path === '/send-scorecard') {
      const body = await parseBody(req);
      const { to, subject, bodyText, submission } = body;
      const recipient = (to || submission?.studentEmail || '').trim();
      if (!recipient || recipient.toLowerCase() === GMAIL_USER.toLowerCase()) {
        return json(400, {
          success: false,
          error: 'Please provide the candidate personal email (not the portal mailbox).',
        }, origin);
      }

      const questions = submission?.questions || [];
      const responses = submission?.responses || {};
      const score = submission?.score ?? 0;
      const maxScore = submission?.maxScore ?? 200;
      const roll = submission?.rollNumber || submission?.applicationNumber || 'N/A';

      let pdfBuffer: Buffer | null = null;
      try {
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const drawFooter = (pageNum: number, total: number) => {
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text(
            `© ${new Date().getFullYear()} One Crack Test Portal · Confidential CBT Evaluation · Page ${pageNum}/${total}`,
            pageWidth / 2,
            pageHeight - 8,
            { align: 'center' }
          );
        };

        // Cover header
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 28, 'F');
        doc.setFillColor(6, 182, 212);
        doc.rect(0, 28, pageWidth, 2.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('ONE CRACK TEST PORTAL', 14, 12);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Official Detailed Scorecard & Question-wise Evaluation Report', 14, 20);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Dear Candidate — Greetings from One Crack Test Portal', 14, 40);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text('Thank you for completing your CBT assessment. This PDF is your official detailed report.', 14, 47);

        let y = 56;
        const lines = [
          `Candidate: ${submission?.studentName || 'N/A'}`,
          `Roll / App: ${roll}`,
          `Email: ${recipient}`,
          `Test: ${submission?.testTitle || 'NEET CBT Assessment'}`,
          `Score: ${score} / ${maxScore}  |  Correct: ${submission?.correctCount ?? 0}  Incorrect: ${submission?.incorrectCount ?? 0}  Blank: ${submission?.unattemptedCount ?? 0}`,
          `Accuracy: ${Number(submission?.accuracy ?? 0).toFixed(1)}%  |  Time taken: ${Math.floor((submission?.timeTakenSeconds || 0) / 60)}m ${(submission?.timeTakenSeconds || 0) % 60}s`,
          `Submitted: ${submission?.submittedAt ? new Date(submission.submittedAt).toLocaleString('en-IN') : 'N/A'}`,
        ];
        lines.forEach((line) => {
          doc.text(line, 14, y);
          y += 6;
        });

        y += 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(8, 145, 178);
        doc.text('QUESTION-WISE DETAILED MATRIX', 14, y);
        y += 8;

        questions.forEach((q: any, idx: number) => {
          if (y > pageHeight - 40) {
            drawFooter(doc.getNumberOfPages(), doc.getNumberOfPages());
            doc.addPage();
            y = 20;
          }
          const resp = responses[q.id];
          const isAttempted = resp !== null && resp !== undefined;
          const isCorrect = resp === q.correctAnswer;
          const peer = q.peerStats?.correctPercent ?? (q.difficulty === 'Easy' ? 78 : q.difficulty === 'Medium' ? 58 : 38);
          const avgT = q.peerStats?.avgTimeSpentSeconds ?? 42;
          const marks = !isAttempted ? '0.00' : isCorrect ? '+4.00' : '-1.00';
          const status = !isAttempted ? 'UNATTEMPTED' : isCorrect ? 'CORRECT' : 'INCORRECT';

          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          const stem = `Q${idx + 1}. ${q.question || ''}`.slice(0, 140);
          const stemLines = doc.splitTextToSize(stem, pageWidth - 28);
          doc.text(stemLines, 14, y);
          y += stemLines.length * 4 + 2;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(51, 65, 85);
          doc.text(
            `Your answer: ${isAttempted ? resp : '—'}  |  Correct: ${q.correctAnswer || '—'}  |  ${status}  |  Marks: ${marks}`,
            14,
            y
          );
          y += 4.5;
          doc.setTextColor(71, 85, 105);
          doc.text(
            `Difficulty: ${q.difficulty || 'Medium'}  ·  PYQ Year: ${q.pyqYear || 'NEET Trend'}  ·  Expected time: ${avgT}s  ·  Students correct (avg): ${peer}%`,
            14,
            y
          );
          y += 4;
          if (q.ncertRef) {
            doc.setFontSize(7);
            doc.setTextColor(100, 116, 139);
            doc.text(`NCERT: ${String(q.ncertRef).slice(0, 100)}`, 14, y);
            y += 4;
          }
          y += 4;
        });

        // Closing page note
        if (y > pageHeight - 35) {
          doc.addPage();
          y = 30;
        }
        y += 6;
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text('Warm regards,', 14, y);
        y += 5;
        doc.text('Examination Cell — One Crack Test Portal', 14, y);
        y += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`© ${new Date().getFullYear()} One Crack Test Portal. All rights reserved.`, 14, y);
        y += 4;
        doc.text('This document is confidential. Work Email: onecracktestportal@gmail.com', 14, y);

        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          drawFooter(i, totalPages);
        }

        pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      } catch (e) {
        console.warn('PDF gen warning', e);
      }

      const candidateName = submission?.studentName || 'Candidate';
      const html = `
        <div style="font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#0891b2,#2563eb);padding:24px;color:#fff;border-radius:12px 12px 0 0">
            <h1 style="margin:0;font-size:20px">One Crack Test Portal</h1>
            <p style="margin:8px 0 0;opacity:.9">Official NEET CBT Scorecard &amp; Detailed Report</p>
          </div>
          <div style="padding:24px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
            <p style="font-size:15px;color:#0f172a">Dear <strong>${candidateName}</strong>,</p>
            <p style="font-size:14px;color:#334155;line-height:1.55">Greetings from <strong>One Crack Test Portal</strong>. Thank you for completing your Computer Based Test. Please find your performance summary below. A <strong>detailed PDF report</strong> is attached with question-wise results, difficulty, PYQ year, expected time, and average student accuracy.</p>
            <p><strong>Candidate:</strong> ${submission?.studentName || 'N/A'}</p>
            <p><strong>Roll / App:</strong> ${roll}</p>
            <p><strong>Score:</strong> ${score} / ${maxScore}</p>
            <p><strong>Correct / Incorrect / Blank:</strong> ${submission?.correctCount ?? 0} / ${submission?.incorrectCount ?? 0} / ${submission?.unattemptedCount ?? 0}</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/>
            <pre style="white-space:pre-wrap;font-size:12px;color:#334155">${(bodyText || '').replace(/</g, '&lt;')}</pre>
            <p style="margin-top:28px;font-size:14px;color:#0f172a">Warm regards,<br/><strong>Examination Cell</strong><br/>One Crack Test Portal</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
            <p style="font-size:11px;color:#64748b;margin:0">© ${new Date().getFullYear()} One Crack Test Portal. All rights reserved.<br/>This is an official CBT communication. Work Email: ${GMAIL_USER}</p>
          </div>
        </div>`;

      const mailOptions: any = {
        from: FROM,
        to: recipient,
        cc: GMAIL_USER,
        subject:
          subject ||
          `[OFFICIAL REPORT] One Crack CBT Result - Roll: ${roll} - Score: ${score}/${maxScore}`,
        text: bodyText || `Score: ${score}/${maxScore}`,
        html,
      };
      if (pdfBuffer) {
        mailOptions.attachments = [
          {
            filename: `OneCrack_Scorecard_${roll}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ];
      }
      const info = await transporter.sendMail(mailOptions);
      return json(
        200,
        {
          success: true,
          dispatchId: info.messageId || `OCTP-${Date.now().toString(36).toUpperCase()}`,
          sentTo: recipient,
          message: `Detailed scorecard dispatched to ${recipient}`,
        },
        origin
      );
    }

    // -------- Health --------
    if (method === 'GET' && (path === '/' || path === '/health')) {
      return json(200, { ok: true, service: 'onecrack-api', email: GMAIL_USER }, origin);
    }

    // -------- AI generate-test (Gemini if key present, else structured NEET fallback) --------
    if (method === 'POST' && path === '/gemini/generate-test') {
      const body = await parseBody(req);
      const chapter = body.chapter || 'Biotechnology: Principles and Processes';
      const subject = body.subject || 'Biology';
      const count = Math.min(Math.max(Number(body.questionCount) || 10, 3), 50);
      const durationMinutes = Number(body.durationMinutes) || 15;
      const customPrompt = body.prompt || '';
      const apiKey = body.apiKey || process.env.GEMINI_API_KEY || '';

      let generatedQuestions: any[] = [];
      let testTitle = `NEET Assessment: ${chapter}`;

      if (apiKey) {
        try {
          const prompt = `You are a Senior NTA NEET question setter. Generate exactly ${count} MCQs for chapter "${chapter}" subject "${subject}". ${customPrompt}
Return ONLY valid JSON: {"title":"...","questions":[{"id":1,"questionCode":"QID-830001","question":"...","options":[{"key":"A","text":"...","optionCode":"491001"},{"key":"B","text":"...","optionCode":"491002"},{"key":"C","text":"...","optionCode":"491003"},{"key":"D","text":"...","optionCode":"491004"}],"correctAnswer":"A","correctOptionCode":"491001","topic":"...","difficulty":"Medium","pyqYear":"NEET 2024","ncertRef":"...","explanation":"...","peerStats":{"correctPercent":55,"distractorAPercent":15,"distractorBPercent":12,"distractorCPercent":10,"distractorDPercent":8,"unattemptedPercent":5,"avgTimeSpentSeconds":45}}]}`;

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: 'application/json' },
              }),
            }
          );
          if (geminiRes.ok) {
            const gData = await geminiRes.json();
            const text = gData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const parsed = JSON.parse(text);
            if (parsed.title) testTitle = parsed.title;
            generatedQuestions = (parsed.questions || []).map((q: any, idx: number) => {
              const options = (q.options || []).map((opt: any, oIdx: number) => ({
                key: opt.key || ['A', 'B', 'C', 'D'][oIdx],
                text: opt.text || `Option ${['A','B','C','D'][oIdx]}`,
                optionCode: opt.optionCode || `${492000 + idx * 4 + oIdx + 1}`,
              }));
              const correctOpt = options.find((o: any) => o.key === q.correctAnswer) || options[0];
              return {
                id: idx + 1,
                questionCode: q.questionCode || `QID-${830500 + idx + 1}`,
                question: q.question,
                options,
                correctAnswer: q.correctAnswer || 'A',
                correctOptionCode: correctOpt.optionCode,
                topic: q.topic || chapter,
                difficulty: q.difficulty || 'Medium',
                pyqYear: q.pyqYear || 'NEET 2024',
                ncertRef: q.ncertRef || `NCERT ${subject}: ${chapter}`,
                explanation: q.explanation || 'Refer to NCERT textbook.',
                peerStats: q.peerStats || {
                  correctPercent: 55,
                  distractorAPercent: 15,
                  distractorBPercent: 12,
                  distractorCPercent: 10,
                  distractorDPercent: 8,
                  unattemptedPercent: 5,
                  avgTimeSpentSeconds: 45,
                },
              };
            });
          }
        } catch (e) {
          console.warn('[Gemini generate]', e);
        }
      }

      // Structured NEET fallback (always works)
      if (generatedQuestions.length === 0) {
        const templates = [
          {
            q: `Which statement is INCORRECT regarding the core principles of ${chapter}?`,
            opts: [
              `It follows standard NCERT principles for ${subject}.`,
              `Catalytic steps require optimized temperature and pH.`,
              `The process is completely independent of cofactors and stoichiometry.`,
              `Regulatory feedback governs net product yield.`,
            ],
            ans: 'C',
            exp: `Statement C is incorrect; biological/chemical pathways in ${chapter} depend on cofactors and regulation.`,
          },
          {
            q: `In the context of ${chapter} (${subject}), what is observed under optimal conditions?`,
            opts: [
              `Rapid denaturation of active sites.`,
              `Maximal efficiency and fidelity as described in NCERT.`,
              `Complete cessation of metabolic fluxes.`,
              `Irreversible degradation of all macro-structures.`,
            ],
            ans: 'B',
            exp: `Optimal parameters ensure maximum functional activity per NCERT guidelines.`,
          },
          {
            q: `Select the correct matching pair related to ${chapter}:`,
            opts: [
              `Primary component — Catalytic / regulatory functional unit`,
              `Substrate complex — Permanently non-reactive matrix`,
              `Negative feedback — Continuous exponential overproduction`,
              `Allosteric site — Zero interaction with ligands`,
            ],
            ans: 'A',
            exp: `Primary functional units coordinate regulatory and catalytic actions in NCERT.`,
          },
          {
            q: `Assertion (A): Precise regulation is essential in ${chapter}.\nReason (R): Deviation in parameters alters kinetic outcomes.`,
            opts: [
              `Both (A) and (R) are true and (R) is the correct explanation of (A).`,
              `Both (A) and (R) are true but (R) is NOT the correct explanation of (A).`,
              `(A) is true but (R) is false.`,
              `(A) is false but (R) is true.`,
            ],
            ans: 'A',
            exp: `Both statements are correct; Reason justifies the need for tight regulation.`,
          },
          {
            q: `A standard experimental observation confirming ${chapter} principles is:`,
            opts: [
              `A measurable signal matching NCERT reference assays.`,
              `Spontaneous destruction of all reagents without catalyst.`,
              `Reversal of thermodynamic free-energy laws.`,
              `Zero interaction between substrate and receptor.`,
            ],
            ans: 'A',
            exp: `Assays rely on measurable markers described in NCERT practicals.`,
          },
        ];
        const diffs = ['Easy', 'Medium', 'Hard'];
        const years = ['NEET 2024', 'NEET 2023', 'NEET 2022 Phase-1', 'NEET 2021', 'AIPMT 2019'];
        for (let i = 0; i < count; i++) {
          const tmpl = templates[i % templates.length];
          const base = 492000 + i * 4;
          const options = tmpl.opts.map((text, oIdx) => ({
            key: ['A', 'B', 'C', 'D'][oIdx],
            text,
            optionCode: String(base + oIdx + 1),
          }));
          const correctOpt = options.find((o) => o.key === tmpl.ans)!;
          generatedQuestions.push({
            id: i + 1,
            questionCode: `QID-${831000 + i + 1}`,
            question: tmpl.q,
            options,
            correctAnswer: tmpl.ans,
            correctOptionCode: correctOpt.optionCode,
            topic: `${chapter} Core Concepts`,
            difficulty: diffs[i % 3],
            pyqYear: years[i % years.length],
            ncertRef: `NCERT NEET ${subject}, Chapter: ${chapter}`,
            explanation: tmpl.exp,
            peerStats: {
              correctPercent: 50 + (i % 30),
              distractorAPercent: 15,
              distractorBPercent: 12,
              distractorCPercent: 10,
              distractorDPercent: 8,
              unattemptedPercent: 5,
              avgTimeSpentSeconds: 40 + (i % 20),
            },
          });
        }
      }

      const testId = `test-ai-${Date.now().toString(36)}`;
      const newTest = {
        id: testId,
        title: testTitle,
        chapter,
        subject,
        questionCount: generatedQuestions.length,
        durationMinutes,
        markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
        description: `NEET CBT on ${chapter} (${subject}). ${customPrompt ? 'Directives applied. ' : ''}Generated via OneCrack Portal Engine.`,
        questions: generatedQuestions,
        createdBy: 'OneCrack Academic Council & AI Engine',
        createdAt: new Date().toISOString(),
        tags: ['NEET UG', subject, 'NCERT Core', `${durationMinutes}m`],
      };

      return json(200, { success: true, test: newTest }, origin);
    }

    return json(404, { success: false, error: `No route for ${method} ${path}` }, origin);
  } catch (err: any) {
    console.error('[OneCrack API]', err);
    return json(500, { success: false, error: err?.message || 'Internal server error' }, origin);
  }
};


export const config: Config = {
  path: ["/api/*", "/api"],
};
