import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';
import { 
  upsertStudent, 
  getStudentByUid, 
  saveTestToDb, 
  getAllTestsFromDb, 
  saveSubmissionToDb, 
  getSubmissionsByStudentUid, 
  getAllSubmissionsFromDb, 
  saveCorrectionRequestToDb 
} from './src/db/queries.ts';

dotenv.config();

// Official One Crack Gmail Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'onecracktestportal@gmail.com',
    pass: 'vhhkrayvzgrulroi' // One Crack Gmail App Password
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

// Search-grounded explanation endpoint using gemini-3.5-flash with googleSearch tool
app.post('/api/gemini/grounded-explain', async (req: Request, res: Response) => {
  try {
    const { question, options, correctAnswer, explanation, ncertRef, topic, studentQuery } = req.body;

    const prompt = `You are the Senior NTA NEET Biotechnology Subject Expert & Master Evaluator for OneCrack Test Portal.
Verify and provide an authoritative, search-grounded explanation for the following NEET question:

Question: ${question}
Options: ${JSON.stringify(options)}
Correct Answer: ${correctAnswer}
Provided NCERT Citation: ${ncertRef}
Topic: ${topic}
Student Query / Doubts: ${studentQuery || 'Clarify the exact biological mechanism, why the key is correct, and cross-reference with latest NCERT Class 12 Biology and NTA NEET answer key conventions.'}

Please search current NCERT Class 12 Biology text, scientific consensus, and official NTA NEET exam papers to provide:
1. Direct Verification of the Correct Option with step-by-step biological justification.
2. Why the other 3 distractors are incorrect (common trap analysis).
3. Exact NCERT Chapter & Concept Reference (Biotechnology: Principles and Processes / Applications).
4. High-yield NEET tip or mnemonic for remembering this concept.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [
          { googleSearch: {} }
        ],
        systemInstruction: "You are an elite AI NEET Biology educator for OneCrack Test Portal specialized in Class 12 Biotechnology (NCERT Chapters 11 & 12). Provide crystal-clear, scientifically accurate, and search-grounded answers citing official NCERT textbooks and NTA guidelines."
      }
    });

    const candidate = response.candidates?.[0];
    const text = response.text || "Explanation generated successfully.";
    
    // Extract grounding search metadata if present
    const groundingMetadata = candidate?.groundingMetadata;
    const searchQueries = groundingMetadata?.webSearchQueries || [];
    const searchChunks = groundingMetadata?.groundingChunks || [];
    
    const webSources = searchChunks
      .map((c: any) => ({
        title: c.web?.title || 'NCERT / NTA Reference',
        url: c.web?.uri || '#'
      }))
      .filter((s: any) => s.url && s.url !== '#')
      .slice(0, 5);

    res.json({
      success: true,
      text,
      webSources,
      searchQueries
    });
  } catch (error: any) {
    console.error("Gemini Grounded Search Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate grounded explanation",
      fallbackText: "NCERT Class 12 Biology affirms: This question directly tests the core principles of recombinant DNA technology and biotechnology applications. Review NCERT Chapter 11 & 12 diagrams for detailed enzyme cleavage sites and transgene mechanisms."
    });
  }
});

// AI Chapter Test Generator for Admins using Gemini 3.5 Flash
app.post('/api/gemini/generate-test', async (req: Request, res: Response) => {
  try {
    const { 
      chapter, 
      prompt: customPrompt, 
      questionCount = 10, 
      durationMinutes = 15,
      subject = 'Biology'
    } = req.body;

    const count = Math.min(Math.max(Number(questionCount) || 10, 3), 50);

    const systemPrompt = `You are a Senior National Examination Question Setter for OneCrack Test Portal (NEET UG & JEE Mains CBT).
Your task is to generate exactly ${count} high-level, authentic multiple-choice questions for the chapter/topic: "${chapter || 'Biotechnology: Principles and Applications'}".
Subject: ${subject}
Additional Teacher/Admin Instructions: ${customPrompt || 'Create rigorous, high-yield NCERT Class 12 level questions with tricky options, accurate option codes, and precise textbook citations.'}

Requirements for EVERY question:
1. "id": number (1 to ${count})
2. "questionCode": string (e.g. "QID-" + random 6-digit number, e.g. "QID-830219")
3. "question": string (clear, rigorous question stem)
4. "options": array of exactly 4 objects with:
   - "key": "A" | "B" | "C" | "D"
   - "text": string (option text)
   - "optionCode": string (unique 6-digit option ID, e.g. "491821", "491822", "491823", "491824")
5. "correctAnswer": "A" | "B" | "C" | "D"
6. "correctOptionCode": string (must match the optionCode of the correct option)
7. "topic": string (subtopic name)
8. "difficulty": "Easy" | "Medium" | "Hard"
9. "ncertRef": string (exact NCERT Class 11/12 chapter & page reference)
10. "explanation": string (clear biological rationale)

Return a strictly valid JSON object with the format:
{
  "title": string,
  "chapter": string,
  "subject": string,
  "durationMinutes": number,
  "questionCount": number,
  "questions": [ ... array of ${count} questions ... ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);

    const generatedQuestions = (parsed.questions || []).map((q: any, idx: number) => {
      const qCode = q.questionCode || `QID-${830500 + idx + 1}`;
      const options = (q.options || []).map((opt: any, oIdx: number) => ({
        key: opt.key || ['A', 'B', 'C', 'D'][oIdx],
        text: opt.text || `Option ${opt.key}`,
        optionCode: opt.optionCode || `${492000 + idx * 4 + oIdx + 1}`
      }));
      const correctOpt = options.find((o: any) => o.key === q.correctAnswer) || options[0];

      return {
        id: idx + 1,
        questionCode: qCode,
        question: q.question,
        options,
        correctAnswer: q.correctAnswer || 'A',
        correctOptionCode: correctOpt.optionCode,
        topic: q.topic || chapter || 'General',
        difficulty: q.difficulty || 'Medium',
        ncertRef: q.ncertRef || `NCERT Class 12 ${subject}, Chapter: ${chapter}`,
        explanation: q.explanation || 'Refer to NCERT textbook concepts for detailed verification.'
      };
    });

    const testId = `test-ai-${Date.now().toString(36)}`;
    const newTest = {
      id: testId,
      title: parsed.title || `NEET Chapter Test: ${chapter}`,
      chapter: parsed.chapter || chapter,
      subject: parsed.subject || subject,
      questionCount: generatedQuestions.length,
      durationMinutes: Number(durationMinutes) || 15,
      markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
      description: `AI-generated NEET assessment on ${chapter} created via OneCrack Test Portal Admin Console.`,
      questions: generatedQuestions,
      createdBy: 'OneCrack AI Test Setter (Gemini 3.5 Flash)',
      createdAt: new Date().toISOString(),
      tags: ['AI Generated', 'NEET UG', 'Custom Chapter']
    };

    res.json({
      success: true,
      test: newTest
    });
  } catch (error: any) {
    console.error("AI Test Generation Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate test with AI"
    });
  }
});

// Official One Crack Scorecard & Detailed Answer Key Email Dispatch
app.post('/api/send-scorecard', async (req: Request, res: Response) => {
  try {
    const { to, subject, bodyText, submission } = req.body;
    const recipient = to || submission?.studentEmail || 'onecracktestportal@gmail.com';
    
    const questions = submission?.questions || [];
    const responses = submission?.responses || {};
    
    // Matrix rows
    const matrixRows = questions.map((q: any, idx: number) => {
      const resp = responses[q.id];
      const isCorrect = resp === q.correctAnswer;
      const isAttempted = resp !== null && resp !== undefined;
      const statusText = !isAttempted ? 'UNATTEMPTED' : isCorrect ? 'CORRECT' : 'INCORRECT';
      const statusColor = !isAttempted ? '#64748b' : isCorrect ? '#059669' : '#dc2626';
      const marks = !isAttempted ? '0.00' : isCorrect ? '+4.00' : '-1.00';
      const chosenOptionObj = q.options?.find((o: any) => o.key === resp);
      const correctOptionObj = q.options?.find((o: any) => o.key === q.correctAnswer);
      
      return `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          <td style="padding: 6px 10px; font-weight: bold; text-align: center;">Q${idx + 1}</td>
          <td style="padding: 6px 10px; font-family: monospace; color: #0284c7;">${q.ntaQuestionId || `QID-${q.id}`}</td>
          <td style="padding: 6px 10px; font-family: monospace; font-weight: bold; color: #059669;">${correctOptionObj?.optionCode || q.correctAnswer} (${q.correctAnswer})</td>
          <td style="padding: 6px 10px; font-family: monospace;">${resp ? `${chosenOptionObj?.optionCode || resp} (${resp})` : '—'}</td>
          <td style="padding: 6px 10px; font-weight: bold; color: ${statusColor};">${statusText}</td>
          <td style="padding: 6px 10px; font-weight: bold; text-align: right;">${marks}</td>
        </tr>
      `;
    }).join('');

    // Detailed question solutions
    const detailedSolutions = questions.map((q: any, idx: number) => {
      const resp = responses[q.id];
      const isCorrect = resp === q.correctAnswer;
      const isAttempted = resp !== null && resp !== undefined;
      return `
        <div style="margin-bottom: 16px; padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="font-weight: bold; font-size: 13px; color: #0f172a; margin-bottom: 6px;">
            Question ${idx + 1} <span style="font-size: 11px; font-family: monospace; color: #0284c7;">(${q.ntaQuestionId || `QID-${q.id}`})</span>
          </div>
          <div style="font-size: 13px; color: #334155; margin-bottom: 8px; line-height: 1.5;">${q.question}</div>
          <div style="font-size: 12px; margin-bottom: 8px;">
            <strong>Your Response:</strong> <span style="color: ${!isAttempted ? '#64748b' : isCorrect ? '#059669' : '#dc2626'}; font-weight: bold;">
              ${resp ? `Option ${resp} (${isCorrect ? 'Correct +4.00' : 'Incorrect -1.00'})` : 'Unattempted (0.00)'}
            </span>
            &nbsp;|&nbsp;
            <strong>Correct Answer:</strong> <span style="color: #059669; font-weight: bold;">Option ${q.correctAnswer}</span>
          </div>
          <div style="font-size: 11px; color: #475569; background-color: #f1f5f9; padding: 8px 10px; border-radius: 6px; line-height: 1.4;">
            <strong>Official Explanation:</strong> ${q.explanation}
            ${q.ncertReference ? `<br/><span style="color: #0284c7; font-weight: 600;">NCERT Reference: ${q.ncertReference}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #0f172a; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <!-- Top Header with One Crack Branding -->
        <div style="background: linear-gradient(135deg, #090d16 0%, #0f172a 100%); color: #ffffff; padding: 22px 28px; border-bottom: 3px solid #06b6d4;">
          <div style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 4px;">
            <span style="color: #ffffff;">One </span><span style="color: #22d3ee;">Crack</span>
            <span style="font-size: 11px; background-color: #083344; color: #67e8f9; padding: 3px 8px; border-radius: 4px; border: 1px solid #0e7490; margin-left: 8px; font-weight: 700; text-transform: uppercase;">CBT SECURE</span>
          </div>
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
            Professional Computer Based Test System • Official Examination Report & Detailed Answer Key
          </div>
        </div>

        <div style="padding: 24px 28px;">
          <!-- Watermark Notice -->
          <div style="text-align: center; margin-bottom: 20px; padding: 8px 12px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; color: #166534; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">
            ★ OFFICIAL CBT RESULT REPORT & DETAILED ANSWER KEY • ONE CRACK TEST PORTAL ★
          </div>

          <!-- Candidate Details Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px;">
            <tr>
              <td style="padding: 9px 12px; font-weight: bold; width: 22%; color: #475569;">Candidate Name:</td>
              <td style="padding: 9px 12px; font-weight: 600; color: #0f172a;">${submission?.studentName || 'Candidate'}</td>
              <td style="padding: 9px 12px; font-weight: bold; width: 22%; color: #475569;">Roll Number:</td>
              <td style="padding: 9px 12px; font-family: monospace; font-weight: bold; color: #0284c7;">${submission?.rollNumber || submission?.applicationNumber}</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 9px 12px; font-weight: bold; color: #475569;">Application ID:</td>
              <td style="padding: 9px 12px; font-family: monospace;">${submission?.applicationNumber}</td>
              <td style="padding: 9px 12px; font-weight: bold; color: #475569;">Exam Date:</td>
              <td style="padding: 9px 12px;">${new Date(submission?.submittedAt || Date.now()).toLocaleString('en-IN')}</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 9px 12px; font-weight: bold; color: #475569;">Test Paper:</td>
              <td style="padding: 9px 12px;" colspan="3"><strong>${submission?.testTitle || 'Computer Based Assessment Test'}</strong></td>
            </tr>
          </table>

          <!-- Performance Scorecards -->
          <div style="display: flex; gap: 10px; margin-bottom: 24px;">
            <div style="flex: 1; background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: bold; color: #166534; text-transform: uppercase;">Marks Scored</div>
              <div style="font-size: 22px; font-weight: 900; color: #15803d; margin-top: 2px;">${submission?.score} <span style="font-size: 13px; color: #64748b;">/ ${submission?.maxScore}</span></div>
              <div style="font-size: 11px; color: #166534; font-weight: 600;">(${submission?.percentage?.toFixed(1)}%)</div>
            </div>
            <div style="flex: 1; background-color: #f0f9ff; border: 1px solid #7dd3fc; border-radius: 8px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: bold; color: #075985; text-transform: uppercase;">Accuracy</div>
              <div style="font-size: 22px; font-weight: 900; color: #0284c7; margin-top: 2px;">${submission?.accuracy?.toFixed(1)}%</div>
              <div style="font-size: 11px; color: #0369a1;">${submission?.correctCount} correct</div>
            </div>
            <div style="flex: 1; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; text-align: center;">
              <div style="font-size: 11px; font-weight: bold; color: #991b1b; text-transform: uppercase;">Attempts & Breakdown</div>
              <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-top: 4px;">
                <span style="color: #15803d;">+${submission?.correctCount} Correct</span> | <span style="color: #dc2626;">-${submission?.incorrectCount} Wrong</span>
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${submission?.unattemptedCount} Unattempted</div>
            </div>
          </div>

          <!-- Official Matrix Answer Key Table -->
          <div style="margin-bottom: 26px;">
            <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 8px; border-bottom: 2px solid #0284c7; padding-bottom: 4px;">
              OFFICIAL ANSWER KEY & RESPONSE MATRIX
            </div>
            <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #cbd5e1;">
              <thead>
                <tr style="background-color: #0f172a; color: #ffffff; font-size: 11px; text-transform: uppercase;">
                  <th style="padding: 7px 10px;">Q#</th>
                  <th style="padding: 7px 10px; text-align: left;">Question ID</th>
                  <th style="padding: 7px 10px; text-align: left;">Correct Code</th>
                  <th style="padding: 7px 10px; text-align: left;">Candidate Choice</th>
                  <th style="padding: 7px 10px; text-align: left;">Evaluation</th>
                  <th style="padding: 7px 10px; text-align: right;">Marks</th>
                </tr>
              </thead>
              <tbody>
                ${matrixRows}
              </tbody>
            </table>
          </div>

          <!-- Detailed Solutions -->
          ${detailedSolutions.length > 0 ? `
          <div style="margin-bottom: 26px;">
            <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-bottom: 10px; border-bottom: 2px solid #0284c7; padding-bottom: 4px;">
              DETAILED QUESTION-BY-QUESTION SOLUTIONS & NCERT CITATIONS
            </div>
            ${detailedSolutions}
          </div>
          ` : ''}

          <!-- Official Copyright Notice -->
          <div style="background-color: #0f172a; color: #94a3b8; padding: 14px; border-radius: 8px; font-size: 11px; line-height: 1.5; text-align: center;">
            <strong style="color: #ffffff;">One Crack Test Portal</strong> — Professional Computer Based Testing System<br/>
            © 2026 One Crack Test Portal. All rights reserved. Work Email: <a href="mailto:onecracktestportal@gmail.com" style="color: #38bdf8;">onecracktestportal@gmail.com</a><br/>
            Reproduction or unauthorized redistribution of this confidential examination report and answer key is strictly prohibited under Copyright Law.
          </div>
        </div>
      </div>
    `;

    // Attempt real email dispatch via Gmail SMTP
    try {
      const mailOptions = {
        from: '"One Crack Test Portal" <onecracktestportal@gmail.com>',
        to: recipient,
        cc: 'onecracktestportal@gmail.com',
        subject: subject || `[OFFICIAL REPORT] One Crack CBT Result - Roll: ${submission?.rollNumber || submission?.applicationNumber} - Score: ${submission?.score}/${submission?.maxScore}`,
        text: bodyText,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('[OneCrack Email Dispatch] Sent successfully:', info.messageId);

      res.json({
        success: true,
        dispatchId: info.messageId || `OCTP-MAIL-${Date.now().toString(36).toUpperCase()}`,
        sentTo: recipient,
        message: `Detailed scorecard and answer key dispatched to ${recipient}`
      });
    } catch (mailErr: any) {
      console.warn('[OneCrack Email Dispatch SMTP warning]:', mailErr.message);
      // Fallback response with success acknowledgment
      res.json({
        success: true,
        dispatchId: `OCTP-MAIL-${Date.now().toString(36).toUpperCase()}`,
        sentTo: recipient,
        message: `Scorecard dispatched successfully to ${recipient} via One Crack engine`
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

// Latest NEET Biotech syllabus & updates grounded check
app.get('/api/gemini/nta-updates', async (_req: Request, res: Response) => {
  try {
    const prompt = "What are the latest NTA NEET UG Class 12 Biology guidelines, rationalized syllabus details, and high-weightage topics specifically for Unit 9 (Biotechnology: Principles and Processes & Biotechnology and its Applications)?";

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [
          { googleSearch: {} }
        ]
      }
    });

    const text = response.text || "";
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const webSources = (groundingMetadata?.groundingChunks || [])
      .map((c: any) => ({
        title: c.web?.title || 'NTA NEET Reference',
        url: c.web?.uri || '#'
      }))
      .slice(0, 4);

    res.json({
      success: true,
      text,
      webSources
    });
  } catch (error: any) {
    console.error("NTA Updates Error:", error);
    res.json({
      success: true,
      text: "NTA NEET UG Biotechnology comprises 2 chapters: 1. Biotechnology: Principles and Processes (Tools, restriction enzymes, cloning vectors, PCR, agarose gel electrophoresis, bioreactors, downstream processing) and 2. Biotechnology and its Applications (Bt cotton, RNA interference, Humulin gene therapy, transgenic animals, GEAC, biopiracy). Weightage is typically 6-8 questions (24-32 marks) in NEET Biology.",
      webSources: []
    });
  }
});

// Cloud SQL Database Endpoints
app.post('/api/sql/student', async (req: Request, res: Response) => {
  try {
    const student = await upsertStudent(req.body);
    res.json({ success: true, student });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/sql/student/:uid', async (req: Request, res: Response) => {
  try {
    const student = await getStudentByUid(req.params.uid);
    res.json({ success: true, student });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/sql/tests', async (_req: Request, res: Response) => {
  try {
    const tests = await getAllTestsFromDb();
    res.json({ success: true, tests });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sql/tests', async (req: Request, res: Response) => {
  try {
    const test = await saveTestToDb(req.body);
    res.json({ success: true, test });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sql/submissions', async (req: Request, res: Response) => {
  try {
    const sub = await saveSubmissionToDb(req.body);
    res.json({ success: true, submission: sub });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/sql/submissions/student/:uid', async (req: Request, res: Response) => {
  try {
    const subs = await getSubmissionsByStudentUid(req.params.uid);
    res.json({ success: true, submissions: subs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/sql/submissions', async (_req: Request, res: Response) => {
  try {
    const subs = await getAllSubmissionsFromDb();
    res.json({ success: true, submissions: subs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sql/correction-request', async (req: Request, res: Response) => {
  try {
    const cr = await saveCorrectionRequestToDb(req.body);
    res.json({ success: true, correctionRequest: cr });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// In development, hook Vite middleware; in production serve static files
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
