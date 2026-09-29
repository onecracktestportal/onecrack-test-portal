import nodemailer from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER || 'onecracktestportal@gmail.com';
const GMAIL_APP_PASSWORD = (process.env.GMAIL_APP_PASSWORD || 'vhhkrayvzgrulroi').replace(/\s+/g, '');

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

export const FROM = `"One Crack Test Portal" <${GMAIL_USER}>`;
export const PORTAL_EMAIL = GMAIL_USER;

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** In-memory OTP store (works within a warm function instance; fine for OTP UX) */
const globalStore = globalThis as unknown as {
  __onecrackOtp?: Map<string, { code: string; expiresAt: number; purpose: string }>;
};

export function getOtpStore() {
  if (!globalStore.__onecrackOtp) {
    globalStore.__onecrackOtp = new Map();
  }
  return globalStore.__onecrackOtp;
}
