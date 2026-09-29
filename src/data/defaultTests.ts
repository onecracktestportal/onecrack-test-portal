import { TestDefinition, Question } from '../types/exam';
import { BIOTECH_QUESTIONS } from './biotechQuestions';

// Helper to ensure all questions have standard JEE Mains / NTA question codes and option codes
export function enrichQuestionsWithCodes(questions: Question[], baseQId = 830100, baseOId = 491000): Question[] {
  return questions.map((q, qIdx) => {
    const qCode = q.questionCode || `QID-${baseQId + qIdx + 1}`;
    const optionsWithCodes = q.options.map((opt, oIdx) => ({
      ...opt,
      optionCode: opt.optionCode || `${baseOId + qIdx * 4 + oIdx + 1}`
    }));
    
    // Find correct option code
    const correctOpt = optionsWithCodes.find(o => o.key === q.correctAnswer);
    const correctOptCode = correctOpt ? correctOpt.optionCode : `${baseOId + qIdx * 4 + 1}`;

    return {
      ...q,
      questionCode: qCode,
      options: optionsWithCodes,
      correctOptionCode: correctOptCode
    };
  });
}

// 50 High-Yield NEET Questions on Biotechnology
export const BIOTECH_ENRICHED_QUESTIONS: Question[] = enrichQuestionsWithCodes(BIOTECH_QUESTIONS, 830100, 491000);

export const DEFAULT_AVAILABLE_TESTS: TestDefinition[] = [
  {
    id: 'test-biotech-50q',
    title: 'Biotechnology: Principles & Applications (Chapter Mastery)',
    chapter: 'Unit IX: Biotechnology (NCERT Chapters 11 & 12)',
    subject: 'Biology / Biotechnology',
    questionCount: 50,
    durationMinutes: 27,
    markingScheme: {
      correct: 4,
      incorrect: -1,
      unattempted: 0
    },
    description: 'High-level NEET examination assessment covering restriction endonucleases (EcoRI, HindII), pBR322 vector sites, insertional inactivation, PCR, agarose gel electrophoresis, bioreactors, Bt cotton, RNAi, ADA deficiency gene therapy, and patenting.',
    questions: BIOTECH_ENRICHED_QUESTIONS,
    createdBy: 'OneCrack Academic Council',
    createdAt: '2026-09-01T08:00:00Z',
    tags: ['NEET High-Yield', 'Class 12', 'NCERT Core', '27 Mins']
  },
  {
    id: 'test-genetics-mol-basis-25q',
    title: 'Molecular Basis of Inheritance (Replication & Expression)',
    chapter: 'Unit VII: Genetics and Evolution (Chapter 6)',
    subject: 'Biology / Genetics',
    questionCount: 15,
    durationMinutes: 15,
    markingScheme: {
      correct: 4,
      incorrect: -1,
      unattempted: 0
    },
    description: 'Targeted assessment on DNA replication enzymes (DNA Pol III, Primase), transcription machinery, genetic code features, lac operon regulation, and Human Genome Project.',
    questions: [
      {
        id: 1,
        questionCode: 'QID-830201',
        question: "During DNA replication in prokaryotes, the RNA primer is removed and replaced with deoxyribonucleotides primarily by which enzyme?",
        options: [
          { key: 'A', text: 'DNA Polymerase III', optionCode: '491601' },
          { key: 'B', text: 'DNA Polymerase I (Kornberg enzyme)', optionCode: '491602' },
          { key: 'C', text: 'DNA Polymerase II', optionCode: '491603' },
          { key: 'D', text: 'DNA Ligase', optionCode: '491604' }
        ],
        correctAnswer: 'B',
        correctOptionCode: '491602',
        topic: 'Replication Machinery',
        difficulty: 'Medium',
        ncertRef: 'NCERT Class 12 Biology, Page 107',
        explanation: 'DNA Polymerase I possesses 5\' to 3\' exonuclease activity that excises the RNA primer while simultaneously synthesizing DNA to fill the gap.'
      },
      {
        id: 2,
        questionCode: 'QID-830202',
        question: "In the lac operon of E. coli, what occurs when lactose binds to the repressor protein?",
        options: [
          { key: 'A', text: 'The repressor binds tightly to the operator site', optionCode: '491605' },
          { key: 'B', text: 'The repressor is inactivated and detaches from the operator', optionCode: '491606' },
          { key: 'C', text: 'RNA polymerase is prevented from binding to the promoter', optionCode: '491607' },
          { key: 'D', text: 'Transcription of lac z, y, and a is completely arrested', optionCode: '491608' }
        ],
        correctAnswer: 'B',
        correctOptionCode: '491606',
        topic: 'Gene Regulation',
        difficulty: 'Easy',
        ncertRef: 'NCERT Class 12 Biology, Page 116',
        explanation: 'Allolactose acts as an inducer that binds the repressor, inducing a conformational change so it can no longer bind the operator, enabling RNA polymerase to transcribe the polycistronic structural genes.'
      },
      {
        id: 3,
        questionCode: 'QID-830203',
        question: "Which of the following is a non-sense (stop) codon that also acts as the termination signal in translation?",
        options: [
          { key: 'A', text: 'AUG', optionCode: '491609' },
          { key: 'B', text: 'UAA (Ochre)', optionCode: '491610' },
          { key: 'C', text: 'UGG', optionCode: '491611' },
          { key: 'D', text: 'UUU', optionCode: '491612' }
        ],
        correctAnswer: 'B',
        correctOptionCode: '491610',
        topic: 'Genetic Code',
        difficulty: 'Easy',
        ncertRef: 'NCERT Class 12 Biology, Page 112',
        explanation: 'UAA, UAG, and UGA are the three stop/nonsense codons for which no tRNA exists, causing release factors to terminate translation.'
      },
      {
        id: 4,
        questionCode: 'QID-830204',
        question: "Taylor and colleagues (1958) proved semi-conservative replication of chromosomes in Vicia faba using:",
        options: [
          { key: 'A', text: 'Heavy isotope 15N', optionCode: '491613' },
          { key: 'B', text: 'Radioactive thymidine (3H-thymidine)', optionCode: '491614' },
          { key: 'C', text: 'Radioactive phosphorus 32P', optionCode: '491615' },
          { key: 'D', text: 'Cesium chloride density gradient only', optionCode: '491616' }
        ],
        correctAnswer: 'B',
        correctOptionCode: '491614',
        topic: 'Experimental Proofs',
        difficulty: 'Medium',
        ncertRef: 'NCERT Class 12 Biology, Page 106',
        explanation: 'Taylor et al. used radioactive tritiated thymidine (3H-thymidine) in broad bean (Vicia faba) root tip cells to demonstrate that DNA in chromosomes replicates semi-conservatively.'
      },
      {
        id: 5,
        questionCode: 'QID-830205',
        question: "In eukaryotic transcription, RNA Polymerase III is responsible for the synthesis of:",
        options: [
          { key: 'A', text: '28S, 18S, and 5.8S rRNAs', optionCode: '491617' },
          { key: 'B', text: 'Heterogeneous nuclear RNA (hnRNA)', optionCode: '491618' },
          { key: 'C', text: 'tRNA, 5S rRNA, and snRNAs', optionCode: '491619' },
          { key: 'D', text: 'mRNA precursors only', optionCode: '491620' }
        ],
        correctAnswer: 'C',
        correctOptionCode: '491619',
        topic: 'Transcription',
        difficulty: 'Medium',
        ncertRef: 'NCERT Class 12 Biology, Page 111',
        explanation: 'RNA Pol I transcribes 28S, 18S, 5.8S rRNAs. RNA Pol II transcribes precursor of mRNA (hnRNA). RNA Pol III transcribes tRNA, 5S rRNA, and snRNAs (small nuclear RNAs).'
      }
    ],
    createdBy: 'OneCrack Academic Council',
    createdAt: '2026-09-05T10:00:00Z',
    tags: ['NEET Rapid Test', 'Molecular Biology', 'Class 12']
  }
];
