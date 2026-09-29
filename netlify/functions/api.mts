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
        doc.setFontSize(16);
        doc.setTextColor(8, 145, 178);
        doc.text('ONE CRACK TEST PORTAL — OFFICIAL SCORECARD', pageWidth / 2, 18, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(`Candidate: ${submission?.studentName || 'N/A'}`, 14, 30);
        doc.text(`Roll: ${roll}`, 14, 36);
        doc.text(`Email: ${recipient}`, 14, 42);
        doc.text(`Score: ${score} / ${maxScore}`, 14, 48);
        doc.text(`Correct: ${submission?.correctCount ?? 0} | Incorrect: ${submission?.incorrectCount ?? 0} | Unattempted: ${submission?.unattemptedCount ?? 0}`, 14, 54);
        doc.text(`Accuracy: ${(submission?.accuracy ?? 0).toFixed?.(1) ?? submission?.accuracy}%`, 14, 60);
        doc.setFontSize(8);
        let y = 70;
        questions.slice(0, 40).forEach((q: any, idx: number) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const resp = responses[q.id];
          const status = resp == null ? '—' : resp === q.correctAnswer ? '✓' : '✗';
          doc.text(`Q${idx + 1} [${status}] Ans: ${q.correctAnswer} Yours: ${resp ?? '—'}`, 14, y);
          y += 5;
        });
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Generated by OneCrack CBT · ${GMAIL_USER}`, 14, 285);
        pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      } catch (e) {
        console.warn('PDF gen warning', e);
      }

      const html = `
        <div style="font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#0891b2,#2563eb);padding:24px;color:#fff;border-radius:12px 12px 0 0">
            <h1 style="margin:0;font-size:20px">OneCrack Official Scorecard</h1>
            <p style="margin:8px 0 0;opacity:.9">NEET CBT Assessment Report</p>
          </div>
          <div style="padding:24px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
            <p><strong>Candidate:</strong> ${submission?.studentName || 'N/A'}</p>
            <p><strong>Roll / App:</strong> ${roll}</p>
            <p><strong>Score:</strong> ${score} / ${maxScore}</p>
            <p><strong>Correct / Incorrect / Blank:</strong> ${submission?.correctCount ?? 0} / ${submission?.incorrectCount ?? 0} / ${submission?.unattemptedCount ?? 0}</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/>
            <pre style="white-space:pre-wrap;font-size:12px;color:#334155">${(bodyText || '').replace(/</g, '&lt;')}</pre>
            <p style="font-size:11px;color:#64748b;margin-top:24px">© 2026 One Crack Test Portal · ${GMAIL_USER}</p>
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

    // -------- AI generate-test (lightweight proxy / fallback) --------
    if (method === 'POST' && path === '/gemini/generate-test') {
      // Prefer server.ts in local dev; on Netlify return guidance + empty so client uses synthesizer fallback
      return json(
        200,
        {
          success: false,
          error: 'AI generation uses client-side synthesizer on Netlify. Configure GEMINI_API_KEY for full AI.',
          useClientFallback: true,
        },
        origin
      );
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
