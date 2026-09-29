# OneCrack Test Portal

NEET CBT examination & assessment system with OTP email verification, scorecard PDF dispatch, AI test generation, and NTA syllabus.

## Stack

- React + Vite + TypeScript + Tailwind
- Firebase (auth / Firestore client)
- Express (`server.ts`) for **local development**
- **Netlify Functions** (`netlify/functions/api.mts`) for **production** email / OTP APIs

## Local development

```bash
npm install
npm run dev          # Express + Vite on http://localhost:3000
```

Email/OTP hit `/api/*` on the same origin via Express.

## Netlify publish

1. Connect this GitHub repo to Netlify (or `netlify deploy`).
2. Build settings (auto from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
3. **Site settings → Environment variables** (required for email):

| Key | Value |
|-----|--------|
| `GMAIL_USER` | `onecracktestportal@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail App Password (no spaces) |
| `GEMINI_API_KEY` | optional, for AI features |

4. Deploy. SPA + `/api/*` → function redirects are configured.

### Admin access

- UID: `ADMIN`
- Password: `6767`

### Student flow

1. Register → verify email OTP (sent from portal Gmail)
2. Dashboard → filter tests by subject → start CBT
3. After submit → enter **personal** email → receive scorecard + PDF

## API routes (local Express & Netlify Function)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/send-otp` | Send registration OTP |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/password-reset-request` | Password reset OTP |
| POST | `/api/auth/password-reset-confirm` | Confirm reset OTP |
| POST | `/api/send-scorecard` | Scorecard + PDF email |
| POST | `/api/gemini/generate-test` | AI test generation (full on Express) |

## License

Private — OneCrack Test Portal © 2026


## Brand assets

- Logo (Gmail / social profile): [`public/onecrack-logo.svg`](public/onecrack-logo.svg)
- To set as Gmail profile photo: open the SVG in a browser → screenshot or export as PNG 512×512 → Google Account → Personal info → Picture.

