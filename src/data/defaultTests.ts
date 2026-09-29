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
        pyqYear: 'NEET 2023',
        ncertRef: 'NCERT Class 12 Biology, Page 111',
        explanation: 'RNA Pol I transcribes 28S, 18S, 5.8S rRNAs. RNA Pol II transcribes precursor of mRNA (hnRNA). RNA Pol III transcribes tRNA, 5S rRNA, and snRNAs (small nuclear RNAs).',
        peerStats: { correctPercent: 68, distractorAPercent: 14, distractorBPercent: 12, distractorCPercent: 68, distractorDPercent: 6, unattemptedPercent: 4, avgTimeSpentSeconds: 42 }
      }
    ],
    createdBy: 'OneCrack Academic Council',
    createdAt: '2026-09-05T10:00:00Z',
    tags: ['NEET Rapid Test', 'Molecular Biology', 'Class 12']
  },
  {
    id: 'test-physics-neet-mechanics-optics',
    title: 'NEET Physics: Mechanics, Current Electricity & Ray Optics',
    chapter: 'High-Weightage NEET Physics (Class 11 & 12 Core)',
    subject: 'Physics (NEET-UG)',
    questionCount: 10,
    durationMinutes: 15,
    markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
    description: 'High-yield numerical and conceptual problems covering projectile motion, work-energy theorem, potentiometer/Kirchhoff laws, and Snell law with lens maker equation.',
    questions: [
      {
        id: 1,
        questionCode: 'QID-830301',
        question: "A ball is projected with a kinetic energy E at an angle of 60° to the horizontal. At the highest point of its flight, its kinetic energy will be:",
        options: [
          { key: 'A', text: 'E', optionCode: '491701' },
          { key: 'B', text: 'E / 2', optionCode: '491702' },
          { key: 'C', text: 'E / 4', optionCode: '491703' },
          { key: 'D', text: 'Zero', optionCode: '491704' }
        ],
        correctAnswer: 'C',
        correctOptionCode: '491703',
        topic: 'Projectile Motion',
        difficulty: 'Easy',
        pyqYear: 'NEET 2022 Phase-1',
        ncertRef: 'NCERT Class 11 Physics, Chapter 4 (Motion in a Plane), Page 78',
        explanation: 'At the highest point, vertical velocity is zero; only horizontal velocity vx = v*cos(60°) = v/2 remains. Therefore KE = (1/2)*m*(v/2)^2 = E/4.',
        peerStats: { correctPercent: 82, distractorAPercent: 4, distractorBPercent: 10, distractorCPercent: 82, distractorDPercent: 4, unattemptedPercent: 2, avgTimeSpentSeconds: 38 }
      },
      {
        id: 2,
        questionCode: 'QID-830302',
        question: "A wire of resistance R is stretched uniformly such that its radius is halved. The new resistance of the wire becomes:",
        options: [
          { key: 'A', text: '2 R', optionCode: '491705' },
          { key: 'B', text: '4 R', optionCode: '491706' },
          { key: 'C', text: '8 R', optionCode: '491707' },
          { key: 'D', text: '16 R', optionCode: '491708' }
        ],
        correctAnswer: 'D',
        correctOptionCode: '491708',
        topic: 'Current Electricity',
        difficulty: 'Medium',
        pyqYear: 'NEET 2024',
        ncertRef: 'NCERT Class 12 Physics, Chapter 3 (Current Electricity), Page 102',
        explanation: 'Volume remains constant. When radius r becomes r/2, cross-sectional area A becomes A/4, and length L becomes 4L. Since R = rho * L / A, new resistance R\' = rho * (4L) / (A/4) = 16 R.',
        peerStats: { correctPercent: 71, distractorAPercent: 6, distractorBPercent: 15, distractorCPercent: 8, distractorDPercent: 71, unattemptedPercent: 5, avgTimeSpentSeconds: 52 }
      },
      {
        id: 3,
        questionCode: 'QID-830303',
        question: "A convex lens of focal length 20 cm in air is immersed in water (refractive index 4/3). If refractive index of glass is 3/2, the focal length of the lens in water will be:",
        options: [
          { key: 'A', text: '20 cm', optionCode: '491709' },
          { key: 'B', text: '40 cm', optionCode: '491710' },
          { key: 'C', text: '80 cm', optionCode: '491711' },
          { key: 'D', text: '10 cm', optionCode: '491712' }
        ],
        correctAnswer: 'C',
        correctOptionCode: '491711',
        topic: 'Ray Optics',
        difficulty: 'Hard',
        pyqYear: 'NEET 2023 (Manipur)',
        ncertRef: 'NCERT Class 12 Physics, Chapter 9 (Ray Optics), Page 326',
        explanation: 'Using Lens Maker Formula: 1/f_air = (mu_g - 1) * K = (1.5 - 1) * K = 0.5 * K. In water: 1/f_water = (mu_g / mu_w - 1) * K = (1.5 / 1.333 - 1) * K = (9/8 - 1) * K = 1/8 * K. Thus f_water = 4 * f_air = 4 * 20 = 80 cm.',
        peerStats: { correctPercent: 44, distractorAPercent: 18, distractorBPercent: 26, distractorCPercent: 44, distractorDPercent: 12, unattemptedPercent: 10, avgTimeSpentSeconds: 74 }
      }
    ],
    createdBy: 'OneCrack Academic Council',
    createdAt: '2026-09-10T10:00:00Z',
    tags: ['NEET Physics', 'Core Formulae', 'Class 11 & 12']
  },
  {
    id: 'test-chemistry-organic-thermo',
    title: 'NEET Chemistry: Organic Reaction Mechanisms & Bonding',
    chapter: 'High-Weightage NEET Chemistry (Organic & Physical)',
    subject: 'Chemistry (NEET-UG)',
    questionCount: 10,
    durationMinutes: 15,
    markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
    description: 'Authentic NCERT chemistry questions covering SN1/SN2 kinetics, Aldol/Cannizzaro reactions, hybridisation, and enthalpy/entropy spontaneity criteria.',
    questions: [
      {
        id: 1,
        questionCode: 'QID-830401',
        question: "Which of the following alkyl halides undergoes nucleophilic substitution via SN1 mechanism at the fastest rate?",
        options: [
          { key: 'A', text: 'CH3-CH2-Cl', optionCode: '491801' },
          { key: 'B', text: '(CH3)2CH-Cl', optionCode: '491802' },
          { key: 'C', text: '(CH3)3C-Cl (tert-butyl chloride)', optionCode: '491803' },
          { key: 'D', text: 'CH3-Cl', optionCode: '491804' }
        ],
        correctAnswer: 'C',
        correctOptionCode: '491803',
        topic: 'Haloalkanes and Haloarenes',
        difficulty: 'Easy',
        pyqYear: 'NEET 2024',
        ncertRef: 'NCERT Class 12 Chemistry, Chapter 10, Page 301',
        explanation: 'SN1 reaction rate depends on carbocation stability (3° > 2° > 1° > methyl). Tert-butyl carbocation is stabilized by 9 hyperconjugative alpha-hydrogens.',
        peerStats: { correctPercent: 88, distractorAPercent: 3, distractorBPercent: 7, distractorCPercent: 88, distractorDPercent: 2, unattemptedPercent: 1, avgTimeSpentSeconds: 28 }
      },
      {
        id: 2,
        questionCode: 'QID-830402',
        question: "Which of the following molecules has zero dipole moment due to symmetric cancellation of bond dipoles?",
        options: [
          { key: 'A', text: 'NH3', optionCode: '491805' },
          { key: 'B', text: 'NF3', optionCode: '491806' },
          { key: 'C', text: 'BF3 (Boron Trifluoride)', optionCode: '491807' },
          { key: 'D', text: 'H2O', optionCode: '491808' }
        ],
        correctAnswer: 'C',
        correctOptionCode: '491807',
        topic: 'Chemical Bonding',
        difficulty: 'Easy',
        pyqYear: 'NEET 2021',
        ncertRef: 'NCERT Class 11 Chemistry, Chapter 4, Page 114',
        explanation: 'BF3 has trigonal planar geometry (120° bond angle) with sp2 hybridisation. The resultant of two B-F bond dipoles is equal and opposite to the third, canceling to net zero.',
        peerStats: { correctPercent: 84, distractorAPercent: 5, distractorBPercent: 7, distractorCPercent: 84, distractorDPercent: 4, unattemptedPercent: 2, avgTimeSpentSeconds: 30 }
      },
      {
        id: 3,
        questionCode: 'QID-830403',
        question: "For a spontaneous reaction at all temperatures, the thermodynamic criteria must satisfy:",
        options: [
          { key: 'A', text: 'Delta H < 0 and Delta S > 0', optionCode: '491809' },
          { key: 'B', text: 'Delta H > 0 and Delta S < 0', optionCode: '491810' },
          { key: 'C', text: 'Delta H > 0 and Delta S = 0', optionCode: '491811' },
          { key: 'D', text: 'Delta H = 0 and Delta S < 0', optionCode: '491812' }
        ],
        correctAnswer: 'A',
        correctOptionCode: '491809',
        topic: 'Thermodynamics',
        difficulty: 'Medium',
        pyqYear: 'NEET 2023',
        ncertRef: 'NCERT Class 11 Chemistry, Chapter 6 (Thermodynamics), Page 185',
        explanation: 'According to Gibbs-Helmholtz equation: Delta G = Delta H - T * Delta S. When Delta H is negative and Delta S is positive, Delta G is always negative regardless of temperature.',
        peerStats: { correctPercent: 76, distractorAPercent: 76, distractorBPercent: 12, distractorCPercent: 6, distractorDPercent: 6, unattemptedPercent: 3, avgTimeSpentSeconds: 36 }
      }
    ],
    createdBy: 'OneCrack Academic Council',
    createdAt: '2026-09-12T10:00:00Z',
    tags: ['NEET Chemistry', 'Class 11 & 12', 'NCERT High-Yield']
  },
  {
    id: 'test-neet-human-physiology-endocrine',
    title: 'NEET Biology: Human Physiology (Endocrine, Neural & Excretion)',
    chapter: 'Unit V: Human Physiology (NCERT Chapters 19, 21 & 22)',
    subject: 'Biology / Zoology',
    questionCount: 10,
    durationMinutes: 15,
    markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
    description: 'Mastery mock on hormonal feedback loops (ADH, Aldosterone, ANF), nephron counter-current multiplier, and action potential propagation.',
    questions: [
      {
        id: 1,
        questionCode: 'QID-830501',
        question: "An increase in blood volume and blood pressure stimulates the release of which hormone that counteracts the RAAS pathway?",
        options: [
          { key: 'A', text: 'Angiotensin II', optionCode: '491901' },
          { key: 'B', text: 'Aldosterone', optionCode: '491902' },
          { key: 'C', text: 'Atrial Natriuretic Factor (ANF)', optionCode: '491903' },
          { key: 'D', text: 'Antidiuretic Hormone (ADH)', optionCode: '491904' }
        ],
        correctAnswer: 'C',
        correctOptionCode: '491903',
        topic: 'Excretory Products & Elimination',
        difficulty: 'Medium',
        pyqYear: 'NEET 2024',
        ncertRef: 'NCERT Class 11 Biology, Chapter 19, Page 297',
        explanation: 'Atrial Natriuretic Factor (ANF) is secreted by the atria of the heart in response to increased blood pressure. It acts as a vasodilator and promotes excretion of Na+, checking the RAAS mechanism.',
        peerStats: { correctPercent: 79, distractorAPercent: 7, distractorBPercent: 8, distractorCPercent: 79, distractorDPercent: 6, unattemptedPercent: 3, avgTimeSpentSeconds: 34 }
      },
      {
        id: 2,
        questionCode: 'QID-830502',
        question: "Which of the following hormones interacts with intracellular nuclear receptors rather than cell-surface membrane receptors?",
        options: [
          { key: 'A', text: 'Insulin', optionCode: '491905' },
          { key: 'B', text: 'Epinephrine', optionCode: '491906' },
          { key: 'C', text: 'Estrogen / Progesterone', optionCode: '491907' },
          { key: 'D', text: 'Follicle Stimulating Hormone (FSH)', optionCode: '491908' }
        ],
        correctAnswer: 'C',
        correctOptionCode: '491907',
        topic: 'Chemical Coordination & Integration',
        difficulty: 'Medium',
        pyqYear: 'NEET 2022 Phase-1',
        ncertRef: 'NCERT Class 11 Biology, Chapter 22, Page 340',
        explanation: 'Steroid hormones (estrogen, progesterone, cortisol) and iodothyronines are lipid-soluble and diffuse through the cell membrane to bind intracellular nuclear receptors, directly regulating gene expression.',
        peerStats: { correctPercent: 81, distractorAPercent: 6, distractorBPercent: 5, distractorCPercent: 81, distractorDPercent: 8, unattemptedPercent: 2, avgTimeSpentSeconds: 36 }
      }
    ],
    createdBy: 'OneCrack Academic Council',
    createdAt: '2026-09-15T10:00:00Z',
    tags: ['NEET Zoology', 'Human Physiology', 'Class 11']
  }
];
