import { Question } from '../types/exam';

export const BIOTECH_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Which of the following palindromic base sequences in DNA can be easily cut at about the middle by some particular restriction enzyme (EcoRI)?",
    options: [
      { key: 'A', text: "5' - CGTTCG - 3' \n3' - ATCGTA - 5'" },
      { key: 'B', text: "5' - GATATG - 3' \n3' - CTACTA - 5'" },
      { key: 'C', text: "5' - GAATTC - 3' \n3' - CTTAAG - 5'" },
      { key: 'D', text: "5' - CACGTA - 3' \n3' - CTCAGT - 5'" },
    ],
    correctAnswer: 'C',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 11 (Principles and Processes), Page 196",
    explanation: "EcoRI recognizes the 6-base pair palindromic sequence 5'-GAATTC-3' (and 3'-CTTAAG-5') and cuts between G and A on both strands, leaving sticky single-stranded overhangs."
  },
  {
    id: 2,
    question: "In pBR322, the 'rop' gene codes for the:",
    options: [
      { key: 'A', text: "Proteins involved in the replication of the plasmid" },
      { key: 'B', text: "Restriction enzyme site for PvuII" },
      { key: 'C', text: "Resistance to tetracycline antibiotic" },
      { key: 'D', text: "Origin of replication site (ori)" },
    ],
    correctAnswer: 'A',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 11, Page 199 (Figure 11.4)",
    explanation: "In pBR322, 'rop' stands for Repressor of Primer and codes for proteins involved in the replication of the plasmid. Notice PvuII is a restriction site situated inside rop."
  },
  {
    id: 3,
    question: "A foreign DNA is ligated at the BamHI site of tetracycline resistance gene in vector pBR322. The recombinant plasmids will confer resistance to:",
    options: [
      { key: 'A', text: "Both ampicillin and tetracycline" },
      { key: 'B', text: "Tetracycline only" },
      { key: 'C', text: "Ampicillin only" },
      { key: 'D', text: "Neither ampicillin nor tetracycline" },
    ],
    correctAnswer: 'C',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 11, Page 200",
    explanation: "Insertion of foreign DNA at the BamHI site disrupts the tet^R gene due to insertional inactivation. Therefore, recombinants lose tetracycline resistance but retain intact ampicillin resistance (amp^R)."
  },
  {
    id: 4,
    question: "During gel electrophoresis, DNA fragments move towards the anode because DNA molecules are:",
    options: [
      { key: 'A', text: "Positively charged due to histone proteins" },
      { key: 'B', text: "Negatively charged due to phosphate groups" },
      { key: 'C', text: "Neutral and carried by electric current" },
      { key: 'D', text: "Positively charged due to deoxyribose sugar" },
    ],
    correctAnswer: 'B',
    topic: 'Processes of rDNA Technology',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 11, Page 198",
    explanation: "DNA fragments are negatively charged because of the phosphate (PO4^3-) backbone. Under an electric field, they migrate through agarose gel towards the positive electrode (anode)."
  },
  {
    id: 5,
    question: "What is the correct sequence of steps involved in a single cycle of Polymerase Chain Reaction (PCR)?",
    options: [
      { key: 'A', text: "Extension → Annealing → Denaturation" },
      { key: 'B', text: "Annealing → Denaturation → Extension" },
      { key: 'C', text: "Denaturation → Annealing → Extension" },
      { key: 'D', text: "Denaturation → Extension → Annealing" },
    ],
    correctAnswer: 'C',
    topic: 'Processes of rDNA Technology',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 11, Page 202 (Figure 11.6)",
    explanation: "PCR proceeds through 3 sequential steps: (1) Denaturation at ~94°C (breaks H-bonds to separate dsDNA into ssDNA), (2) Annealing at ~50-60°C (primers bind to complementary sequences), (3) Extension at 72°C (Taq polymerase synthesizes new strands)."
  },
  {
    id: 6,
    question: "The DNA polymerase used in PCR is isolated from Thermus aquaticus because:",
    options: [
      { key: 'A', text: "It is active only at cold freezing temperatures" },
      { key: 'B', text: "It remains thermostable during the high temperature denaturation step" },
      { key: 'C', text: "It can replicate RNA directly without reverse transcription" },
      { key: 'D', text: "It requires no primers or dNTPs for amplification" },
    ],
    correctAnswer: 'B',
    topic: 'Processes of rDNA Technology',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 11, Page 202",
    explanation: "Thermus aquaticus is a thermophilic bacterium living in hot springs. Its DNA polymerase (Taq polymerase) remains active and stable at temperatures up to 95°C."
  },
  {
    id: 7,
    question: "The process of separation and extraction of DNA bands cut from agarose gel is known as:",
    options: [
      { key: 'A', text: "Elution" },
      { key: 'B', text: "Spooling" },
      { key: 'C', text: "Downstream processing" },
      { key: 'D', text: "Electroporation" },
    ],
    correctAnswer: 'A',
    topic: 'Processes of rDNA Technology',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 11, Page 198",
    explanation: "The separated bands of DNA are cut out from the agarose gel and extracted from the gel piece. This specific step is called Elution."
  },
  {
    id: 8,
    question: "Which of the following is used to visualize DNA fragments under UV light after gel electrophoresis?",
    options: [
      { key: 'A', text: "Bromophenol blue" },
      { key: 'B', text: "Ethidium bromide" },
      { key: 'C', text: "Methylene blue" },
      { key: 'D', text: "Acetocarmine" },
    ],
    correctAnswer: 'B',
    topic: 'Processes of rDNA Technology',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 11, Page 198",
    explanation: "Ethidium bromide (EtBr) intercalates between DNA base pairs and emits bright orange luminescence when exposed to ultraviolet (UV) radiation."
  },
  {
    id: 9,
    question: "Which vector is naturally known as the 'natural genetic engineer' of dicot plants?",
    options: [
      { key: 'A', text: "Escherichia coli" },
      { key: 'B', text: "Agrobacterium tumefaciens" },
      { key: 'C', text: "Bacillus thuringiensis" },
      { key: 'D', text: "Thermus aquaticus" },
    ],
    correctAnswer: 'B',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 11, Page 200",
    explanation: "Agrobacterium tumefaciens delivers a piece of DNA (T-DNA) to transform normal plant cells into a tumor (crown gall) and direct these tumor cells to produce the chemicals required by the pathogen."
  },
  {
    id: 10,
    question: "Match Column I with Column II and select the correct option:\nColumn I:\n(p) Biolistics\n(q) Microinjection\n(r) Lysozyme\n(s) Chitinase\n\nColumn II:\n(i) Fungal cell wall digestion\n(ii) Animal cell gene transfer\n(iii) High velocity micro-projectiles of gold/tungsten for plant cells\n(iv) Bacterial cell wall digestion",
    options: [
      { key: 'A', text: "p-(iii), q-(ii), r-(iv), s-(i)" },
      { key: 'B', text: "p-(ii), q-(iii), r-(i), s-(iv)" },
      { key: 'C', text: "p-(iii), q-(iv), r-(ii), s-(i)" },
      { key: 'D', text: "p-(i), q-(ii), r-(iii), s-(iv)" },
    ],
    correctAnswer: 'A',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 11, Pages 200-201",
    explanation: "Biolistics/gene gun uses gold/tungsten particles coated with DNA for plants. Microinjection injects rDNA directly into animal nucleus. Lysozyme digests bacterial cell walls, and chitinase breaks fungal cell walls."
  },
  {
    id: 11,
    question: "During isolation of genetic material, purified DNA ultimately precipitates out after the addition of:",
    options: [
      { key: 'A', text: "Room-temperature ethanol" },
      { key: 'B', text: "Chilled chloroform" },
      { key: 'C', text: "Chilled ethanol" },
      { key: 'D', text: "Warm phenol" },
    ],
    correctAnswer: 'C',
    topic: 'Processes of rDNA Technology',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 11, Page 201",
    explanation: "Purified DNA precipitates out after the addition of chilled ethanol. This can be seen as collection of fine threads and is removed by spooling."
  },
  {
    id: 12,
    question: "Statement I: A stirred-tank bioreactor provides better oxygen transfer capacity than a simple shaken flask.\nStatement II: The stirrer facilitates even mixing and oxygen availability throughout the bioreactor.",
    options: [
      { key: 'A', text: "Both Statement I and Statement II are correct" },
      { key: 'B', text: "Both Statement I and Statement II are incorrect" },
      { key: 'C', text: "Statement I is correct but Statement II is incorrect" },
      { key: 'D', text: "Statement I is incorrect but Statement II is correct" },
    ],
    correctAnswer: 'A',
    topic: 'Processes of rDNA Technology',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 11, Page 204",
    explanation: "Both statements are completely factual from NCERT: A stirred-tank reactor is usually cylindrical or with a curved base to facilitate the mixing of the reactor contents. The stirrer facilitates even mixing and oxygen availability throughout."
  },
  {
    id: 13,
    question: "Downstream processing does NOT include which of the following steps?",
    options: [
      { key: 'A', text: "Purification of the biosynthesized product" },
      { key: 'B', text: "Separation of the product from biomass" },
      { key: 'C', text: "Gene cloning and expression of foreign gene in host" },
      { key: 'D', text: "Formulation with suitable preservatives and clinical trials" },
    ],
    correctAnswer: 'C',
    topic: 'Processes of rDNA Technology',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 11, Page 204",
    explanation: "Downstream processing refers to the stages after biosynthesis: separation, purification, preservatives, and quality control. Gene cloning and expression are upstream processes."
  },
  {
    id: 14,
    question: "The first restriction endonuclease discovered and characterized whose functioning depended on a specific DNA nucleotide sequence was:",
    options: [
      { key: 'A', text: "EcoRI" },
      { key: 'B', text: "HindII" },
      { key: 'C', text: "BamHI" },
      { key: 'D', text: "SalI" },
    ],
    correctAnswer: 'B',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 11, Page 195",
    explanation: "The first restriction endonuclease discovered was HindII (isolated from Haemophilus influenzae). It always cut DNA molecules at a particular point by recognizing a specific sequence of 6 base pairs."
  },
  {
    id: 15,
    question: "In insertional inactivation involving the lacZ gene coding for beta-galactosidase, non-recombinant bacterial colonies appear:",
    options: [
      { key: 'A', text: "White in colour due to inactive enzyme" },
      { key: 'B', text: "Blue in colour due to active enzyme hydrolyzing X-gal" },
      { key: 'C', text: "Red in colour due to beta-galactosidase" },
      { key: 'D', text: "Yellow in colour due to insertional disruption" },
    ],
    correctAnswer: 'B',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 11, Page 200",
    explanation: "In non-recombinants, the lacZ gene is intact and functional, producing active beta-galactosidase which cleaves chromogenic substrate (X-gal) to form blue-colored colonies. Recombinants with insertional inactivation form white colonies."
  },
  {
    id: 16,
    question: "Bt toxin protein produced by Bacillus thuringiensis does NOT kill the bacterium itself because:",
    options: [
      { key: 'A', text: "The bacterium contains antitoxin antibodies" },
      { key: 'B', text: "The toxin exists as an inactive protoxin in bacteria" },
      { key: 'C', text: "The bacterium lacks epithelial cells with receptor sites" },
      { key: 'D', text: "The bacterial cell wall is completely impermeable to the toxin" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Agriculture',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12 (Biotechnology and its Applications), Page 208",
    explanation: "Bt toxin protein exists as inactive protoxin inside the bacterium. Once an insect ingests it, the alkaline pH of the insect midgut solubilizes the crystals and converts protoxin into the active toxin form."
  },
  {
    id: 17,
    question: "The proteins encoded by the genes CryIAc and CryIIAb control:",
    options: [
      { key: 'A', text: "Corn borer" },
      { key: 'B', text: "Cotton bollworms" },
      { key: 'C', text: "Root-knot nematode (Meloidogyne incognita)" },
      { key: 'D', text: "Armyworm and beetles" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Agriculture',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 12, Page 208",
    explanation: "CryIAc and CryIIAb control cotton bollworms, while CryIAb controls corn borer. This is a very frequently asked NEET distinction."
  },
  {
    id: 18,
    question: "The gene CryIAb is specifically targeted to control which insect pest?",
    options: [
      { key: 'A', text: "Cotton bollworm" },
      { key: 'B', text: "Corn borer" },
      { key: 'C', text: "Tobacco budworm" },
      { key: 'D', text: "Colorado potato beetle" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Agriculture',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12, Page 208",
    explanation: "As stated in NCERT: 'The proteins encoded by the genes cryIAc and cryIIAb control the cotton bollworms, that of cryIAb controls corn borer.'"
  },
  {
    id: 19,
    question: "RNA interference (RNAi) takes place in:",
    options: [
      { key: 'A', text: "All prokaryotic organisms as immune response" },
      { key: 'B', text: "All eukaryotic organisms as a method of cellular defense" },
      { key: 'C', text: "Viruses only to replicate their genomes" },
      { key: 'D', text: "Only in transgenic plants like tobacco" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Agriculture',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12, Page 209",
    explanation: "RNA interference (RNAi) takes place in all eukaryotic organisms as a method of cellular defense. It involves silencing of a specific mRNA due to a complementary double-stranded RNA (dsRNA) molecule."
  },
  {
    id: 20,
    question: "A nematode Meloidogyne incognita infects the roots of tobacco plants and causes a great reduction in yield. Using Agrobacterium vectors, nematode-specific genes were introduced into the host plant such that it produced:",
    options: [
      { key: 'A', text: "Both sense and anti-sense RNA" },
      { key: 'B', text: "Sense RNA only" },
      { key: 'C', text: "Anti-sense RNA only" },
      { key: 'D', text: "A toxic polypeptide directly fatal to the nematode" },
    ],
    correctAnswer: 'A',
    topic: 'Biotech in Agriculture',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 12, Page 209",
    explanation: "The introduction of DNA was such that it produced both sense and anti-sense RNA in the host cells. These two RNAs being complementary to each other formed a double-stranded (dsRNA) that initiated RNAi."
  },
  {
    id: 21,
    question: "Human insulin consists of two short polypeptide chains, chain A and chain B, that are linked together by:",
    options: [
      { key: 'A', text: "Hydrogen bonds" },
      { key: 'B', text: "Phosphodiester bonds" },
      { key: 'C', text: "Disulfide bridges" },
      { key: 'D', text: "Glycosidic linkages" },
    ],
    correctAnswer: 'C',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12, Page 211",
    explanation: "Human insulin consists of two short polypeptide chains: chain A (21 amino acids) and chain B (30 amino acids) linked together by disulfide bridges."
  },
  {
    id: 22,
    question: "What is the main difference between proinsulin and mature functional human insulin?",
    options: [
      { key: 'A', text: "Proinsulin lacks the A peptide chain" },
      { key: 'B', text: "Proinsulin contains an extra stretch called the C peptide" },
      { key: 'C', text: "Proinsulin lacks disulfide bonds" },
      { key: 'D', text: "Mature insulin contains the C peptide while proinsulin does not" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12, Page 211",
    explanation: "In mammals, insulin is synthesized as a pro-hormone (proinsulin) which contains an extra stretch called the C-peptide. This C-peptide is removed during maturation into functional insulin."
  },
  {
    id: 23,
    question: "In 1983, which American company prepared two DNA sequences corresponding to A and B chains of human insulin and introduced them into plasmids of E. coli?",
    options: [
      { key: 'A', text: "Biocon" },
      { key: 'B', text: "Eli Lilly" },
      { key: 'C', text: "Genentech" },
      { key: 'D', text: "Pfizer" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12, Page 211",
    explanation: "In 1983, Eli Lilly, an American company, prepared two DNA sequences corresponding to A and B chains of human insulin and introduced them into plasmids of E. coli to produce insulin chains separately."
  },
  {
    id: 24,
    question: "The first clinical gene therapy was given in 1990 to a 4-year-old girl with which enzyme deficiency?",
    options: [
      { key: 'A', text: "Tyrosinase" },
      { key: 'B', text: "Adenosine deaminase (ADA)" },
      { key: 'C', text: "Phenylalanine hydroxylase" },
      { key: 'D', text: "Alkaline phosphatase" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12, Page 211",
    explanation: "The first clinical gene therapy was given in 1990 to a 4-year-old girl with adenosine deaminase (ADA) deficiency, which leads to Severe Combined Immunodeficiency (SCID)."
  },
  {
    id: 25,
    question: "Why does gene therapy using genetically engineered lymphocytes for ADA deficiency require periodic infusion of cells in the patient?",
    options: [
      { key: 'A', text: "The retroviral vector loses its cDNA after one week" },
      { key: 'B', text: "Genetically engineered lymphocytes are not immortal" },
      { key: 'C', text: "The ADA enzyme is degraded by liver macrophages" },
      { key: 'D', text: "The patient's immune system rejects the engineered lymphocytes" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 12, Page 212",
    explanation: "As these lymphocytes are not immortal, the patient requires periodic infusion of such genetically engineered lymphocytes. However, if the functional gene is introduced into bone marrow cells at early embryonic stages, it could be a permanent cure."
  },
  {
    id: 26,
    question: "The first transgenic cow produced human protein-enriched milk containing 2.4 grams of protein per litre. What was her name and what protein did she produce?",
    options: [
      { key: 'A', text: "Dolly; alpha-1-antitrypsin" },
      { key: 'B', text: "Rosie; human alpha-lactalbumin" },
      { key: 'C', text: "Polly; human serum albumin" },
      { key: 'D', text: "Tracy; factor VIII" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12, Page 213",
    explanation: "In 1997, the first transgenic cow, Rosie, produced human protein-enriched milk (2.4 grams per litre). The milk contained the human alpha-lactalbumin and was nutritionally more balanced for human babies than natural cow milk."
  },
  {
    id: 27,
    question: "Transgenic animals are designed to serve all of the following purposes EXCEPT:",
    options: [
      { key: 'A', text: "To study normal physiology and development (e.g., insulin-like growth factor)" },
      { key: 'B', text: "Testing the safety of vaccines (e.g., polio vaccine on transgenic mice)" },
      { key: 'C', text: "Production of biological products like alpha-1-antitrypsin for emphysema" },
      { key: 'D', text: "Directly converting animal species into plant species for biomass" },
    ],
    correctAnswer: 'D',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12, Page 212-213",
    explanation: "Transgenic animals are used for normal physiology, study of disease, biological products, vaccine safety testing, and chemical safety testing. They cannot convert animal taxa into plants."
  },
  {
    id: 28,
    question: "The Indian Government organization responsible for making decisions regarding the validity of GM research and the safety of introducing GM-organisms for public services is:",
    options: [
      { key: 'A', text: "ICMR (Indian Council of Medical Research)" },
      { key: 'B', text: "GEAC (Genetic Engineering Appraisal Committee)" },
      { key: 'C', text: "CSIR (Council of Scientific and Industrial Research)" },
      { key: 'D', text: "DBT (Department of Biotechnology)" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12, Page 214",
    explanation: "The Indian Government set up GEAC (Genetic Engineering Appraisal Committee) to make decisions regarding the validity of GM research and the safety of introducing GM-organisms for public services."
  },
  {
    id: 29,
    question: "In 1997, an American company got patent rights on Basmati rice through the US Patent and Trademark Office. This patent was obtained by:",
    options: [
      { key: 'A', text: "Synthesizing Basmati DNA from scratch in the laboratory" },
      { key: 'B', text: "Crossing Indian Basmati with semi-dwarf varieties and claiming it as an invention" },
      { key: 'C', text: "Discovering a wild rice species in the Amazon rainforest" },
      { key: 'D', text: "Modifying Basmati with Bt toxin genes" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 12, Page 214",
    explanation: "This 'new' variety of Basmati had actually been derived from Indian farmer's varieties. Indian Basmati was crossed with semi-dwarf varieties and claimed as an invention or a novelty."
  },
  {
    id: 30,
    question: "Assertion (A): Insertion of recombinant DNA into the coding sequence of beta-galactosidase enzyme leads to chromogenic colony differentiation.\nReason (R): Bacteria with non-recombinant plasmids produce beta-galactosidase and form blue colonies.",
    options: [
      { key: 'A', text: "Both (A) and (R) are true and (R) is the correct explanation of (A)" },
      { key: 'B', text: "Both (A) and (R) are true but (R) is NOT the correct explanation of (A)" },
      { key: 'C', text: "(A) is true but (R) is false" },
      { key: 'D', text: "(A) is false but (R) is true" },
    ],
    correctAnswer: 'A',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Hard',
    ncertRef: "NCERT Class XII, Chapter 11, Page 200",
    explanation: "Recombinant colonies do not produce beta-galactosidase due to insertional inactivation and remain white, while non-recombinants synthesize active enzyme yielding blue color with chromogenic substrate (X-gal). Thus Reason explains the differential colony colors."
  },
  {
    id: 31,
    question: "Which of the following cuts the DNA strand a little away from the centre of the palindrome sites, between the same two bases on the opposite strands?",
    options: [
      { key: 'A', text: "Exonucleases" },
      { key: 'B', text: "Restriction endonucleases" },
      { key: 'C', text: "DNA ligase" },
      { key: 'D', text: "Alkaline phosphatase" },
    ],
    correctAnswer: 'B',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 11, Page 196",
    explanation: "Restriction endonucleases cut the strand of DNA a little away from the centre of the palindrome sites, but between the same two bases on the opposite strands. This leaves single stranded portions at the ends called sticky ends."
  },
  {
    id: 32,
    question: "In pBR322 vector, the restriction recognition sites PstI and PvuI are located within the gene for resistance against:",
    options: [
      { key: 'A', text: "Tetracycline (tetR)" },
      { key: 'B', text: "Ampicillin (ampR)" },
      { key: 'C', text: "Chloramphenicol" },
      { key: 'D', text: "Kanamycin" },
    ],
    correctAnswer: 'B',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 11, Page 199 (Figure 11.4)",
    explanation: "In pBR322, PstI and PvuI are located in the amp^R (ampicillin resistance) gene. BamHI and SalI are in the tet^R gene. PvuII is in the rop region."
  },
  {
    id: 33,
    question: "Golden Rice is a genetically modified crop developed to address deficiency of:",
    options: [
      { key: 'A', text: "Vitamin C (Ascorbic acid)" },
      { key: 'B', text: "Vitamin A (beta-carotene enriched)" },
      { key: 'C', text: "Vitamin D (Calciferol)" },
      { key: 'D', text: "Iron and Essential fatty acids" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Agriculture',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12, Page 208",
    explanation: "Golden Rice is enriched with Provitamin A (beta-carotene), designed to prevent childhood blindness caused by Vitamin A deficiency in rice-dependent developing populations."
  },
  {
    id: 34,
    question: "Which of the following is NOT a feature of a good cloning vector?",
    options: [
      { key: 'A', text: "Presence of an origin of replication (ori)" },
      { key: 'B', text: "Presence of a selectable marker" },
      { key: 'C', text: "Presence of multiple recognition sites for the same restriction enzyme" },
      { key: 'D', text: "Small size and high copy number" },
    ],
    correctAnswer: 'C',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 11, Page 199",
    explanation: "If a vector has more than one recognition site for a single restriction enzyme, it will generate several fragments, which will complicate gene cloning. Hence, vectors should have preferably single recognition sites."
  },
  {
    id: 35,
    question: "Competent cells for bacterial transformation with recombinant DNA are treated with a specific concentration of a divalent cation such as:",
    options: [
      { key: 'A', text: "Sodium (Na+)" },
      { key: 'B', text: "Calcium (Ca2+)" },
      { key: 'C', text: "Potassium (K+)" },
      { key: 'D', text: "Chloride (Cl-)" },
    ],
    correctAnswer: 'B',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 11, Page 200",
    explanation: "The bacterial cells are treated with a specific concentration of a divalent cation, such as calcium (Ca2+), which increases the efficiency with which DNA enters the bacterium through pores in its cell wall."
  },
  {
    id: 36,
    question: "Statement I: Recombinant DNA can be forced into bacterial cells by incubating them on ice, followed by a brief heat shock at 42°C, and then putting them back on ice.\nStatement II: Micro-injection is a technique where recombinant DNA is directly injected into the nucleus of an animal cell.",
    options: [
      { key: 'A', text: "Both Statement I and Statement II are correct" },
      { key: 'B', text: "Both Statement I and Statement II are incorrect" },
      { key: 'C', text: "Statement I is correct but Statement II is incorrect" },
      { key: 'D', text: "Statement I is incorrect but Statement II is correct" },
    ],
    correctAnswer: 'A',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 11, Page 201",
    explanation: "Both statements are direct quotes from NCERT Class 12, Page 201. Heat shock is carried out at 42°C, and micro-injection directly introduces rDNA into animal cell nuclei."
  },
  {
    id: 37,
    question: "Match the following enzymes with their specific functions in biotechnology:\n(p) Restriction Endonuclease\n(q) Exonuclease\n(r) DNA Ligase\n(s) Taq Polymerase\n\n(i) Removes nucleotides from the ends of DNA\n(ii) Polymerizes nucleotides at elevated temperatures\n(iii) Cuts DNA at specific palindromic recognition sequences internally\n(iv) Joins DNA fragments by forming phosphodiester bonds",
    options: [
      { key: 'A', text: "p-(iii), q-(i), r-(iv), s-(ii)" },
      { key: 'B', text: "p-(i), q-(iii), r-(iv), s-(ii)" },
      { key: 'C', text: "p-(iii), q-(iv), r-(i), s-(ii)" },
      { key: 'D', text: "p-(iv), q-(i), r-(iii), s-(ii)" },
    ],
    correctAnswer: 'A',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 11, Page 195-202",
    explanation: "Endonucleases cut internally at specific recognition sequences; exonucleases remove nucleotides from the terminal ends; DNA ligase seals nicks (phosphodiester bonds); Taq polymerase amplifies DNA at 72°C."
  },
  {
    id: 38,
    question: "The diagnostic technique based on the principle of antigen-antibody interaction is:",
    options: [
      { key: 'A', text: "Polymerase Chain Reaction (PCR)" },
      { key: 'B', text: "ELISA (Enzyme Linked Immunosorbent Assay)" },
      { key: 'C', text: "Agarose gel electrophoresis" },
      { key: 'D', text: "Autoradiography" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12, Page 212",
    explanation: "ELISA is based on the principle of antigen-antibody interaction. Infection by a pathogen can be detected by the presence of antigens (proteins, glycoproteins, etc.) or by detecting the antibodies synthesized against the pathogen."
  },
  {
    id: 39,
    question: "In RNA interference (RNAi), what is the trigger molecule that initiates the gene silencing mechanism?",
    options: [
      { key: 'A', text: "Single-stranded DNA" },
      { key: 'B', text: "Double-stranded RNA (dsRNA)" },
      { key: 'C', text: "Transfer RNA (tRNA)" },
      { key: 'D', text: "Ribosomal RNA (rRNA)" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Agriculture',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 12, Page 209",
    explanation: "The silencing of a specific mRNA occurs due to a complementary double-stranded RNA (dsRNA) molecule that binds to and prevents translation of the mRNA (silencing)."
  },
  {
    id: 40,
    question: "Biopiracy is termed as:",
    options: [
      { key: 'A', text: "The legal sharing of biological patents between sovereign nations" },
      { key: 'B', text: "The use of bio-resources by multinational companies without proper authorization and compensatory payment" },
      { key: 'C', text: "The eradication of harmful transgenic pests from agriculture" },
      { key: 'D', text: "The commercialization of biofertilizers through government subsidies" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12, Page 214",
    explanation: "Biopiracy is the term used to refer to the use of bio-resources by multinational companies and other organizations without proper authorization from the countries and people concerned without compensatory payment."
  },
  {
    id: 41,
    question: "Which of the following statement regarding pBR322 is INCORRECT?",
    options: [
      { key: 'A', text: "It was constructed using bacterial plasmids by Bolivar and Rodriguez" },
      { key: 'B', text: "It has two antibiotic resistance genes: ampR and tetR" },
      { key: 'C', text: "HindIII, EcoRI, and ClaI recognition sites are located within the ampR gene" },
      { key: 'D', text: "It contains an ori site that regulates the copy number of the cloned DNA" },
    ],
    correctAnswer: 'C',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Hard',
    ncertRef: "NCERT Class XII, Chapter 11, Page 199 (Figure 11.4)",
    explanation: "HindIII, EcoRI, and ClaI recognition sites are outside both antibiotic resistance genes! PstI and PvuI are in ampR; BamHI and SalI are in tetR."
  },
  {
    id: 42,
    question: "In agarose gel electrophoresis, which property primarily determines the rate of migration of DNA fragments?",
    options: [
      { key: 'A', text: "The proportion of adenine and thymine bases" },
      { key: 'B', text: "The size of the fragment due to the sieving effect of the agarose gel" },
      { key: 'C', text: "The presence of 5' methyl caps" },
      { key: 'D', text: "The degree of supercoiling only" },
    ],
    correctAnswer: 'B',
    topic: 'Processes of rDNA Technology',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 11, Page 198",
    explanation: "The DNA fragments resolve (separate) according to their size through sieving effect provided by the agarose gel. Hence, the smaller the fragment size, the farther it moves toward the anode."
  },
  {
    id: 43,
    question: "A doctor suspects early HIV infection in a patient before antibodies have reached detectable levels. Which molecular test is most appropriate for early diagnosis?",
    options: [
      { key: 'A', text: "Serum total protein electrophoresis" },
      { key: 'B', text: "PCR (Polymerase Chain Reaction)" },
      { key: 'C', text: "Widal test" },
      { key: 'D', text: "Gram staining" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 12, Page 212",
    explanation: "Very low concentration of a pathogen (like HIV) can be detected by amplification of their nucleic acid by PCR. PCR is routinely used to detect HIV in suspected AIDS patients."
  },
  {
    id: 44,
    question: "Assertion (A): The sparged stirred-tank bioreactor has sterile air bubbles sparged through the culture.\nReason (R): Sparging dramatically increases the surface area for oxygen transfer.",
    options: [
      { key: 'A', text: "Both (A) and (R) are true and (R) is the correct explanation of (A)" },
      { key: 'B', text: "Both (A) and (R) are true but (R) is NOT the correct explanation of (A)" },
      { key: 'C', text: "(A) is true but (R) is false" },
      { key: 'D', text: "(A) is false but (R) is true" },
    ],
    correctAnswer: 'A',
    topic: 'Processes of rDNA Technology',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 11, Page 204 (Figure 11.7b)",
    explanation: "In a sparged stirred-tank bioreactor, sterile air bubbles are sparged through the reactor which dramatically increases the surface area for oxygen transfer. Both A and R are true and R explains A."
  },
  {
    id: 45,
    question: "A person with emphysema can be treated using a biological product produced by transgenic animals. This product is:",
    options: [
      { key: 'A', text: "Alpha-lactalbumin" },
      { key: 'B', text: "Alpha-1-antitrypsin" },
      { key: 'C', text: "Tissue plasminogen activator (tPA)" },
      { key: 'D', text: "Erythropoietin" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12, Page 213",
    explanation: "Transgenic animals produce human protein alpha-1-antitrypsin, which is used to treat emphysema. Similar attempts are being made for treatment of phenylketonuria (PKU) and cystic fibrosis."
  },
  {
    id: 46,
    question: "Choose the correct combination of organism and its cell wall degrading enzyme used during DNA isolation:\n(1) Bacteria - Lysozyme\n(2) Plant cells - Cellulase\n(3) Fungi - Chitinase\n(4) Algae - Methylase",
    options: [
      { key: 'A', text: "(1), (2), and (3) only" },
      { key: 'B', text: "(2) and (3) only" },
      { key: 'C', text: "(1) and (4) only" },
      { key: 'D', text: "(1), (2), (3), and (4)" },
    ],
    correctAnswer: 'A',
    topic: 'Processes of rDNA Technology',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 11, Page 201",
    explanation: "Bacterial cells are treated with lysozyme, plant cells with cellulase, and fungus with chitinase. Methylase does not degrade cell walls; it protects bacterial DNA from cleavage."
  },
  {
    id: 47,
    question: "Why is a single stranded DNA or RNA tagged with a radioactive molecule (called a probe) used in molecular genetics?",
    options: [
      { key: 'A', text: "To identify mutated genes via autoradiography because the probe will not hybridize with mutated gene" },
      { key: 'B', text: "To hydrolyze the phosphodiester backbone of viral genomes" },
      { key: 'C', text: "To act as a primer for Taq polymerase in gel electrophoresis" },
      { key: 'D', text: "To prevent transcription of ribosomal RNA" },
    ],
    correctAnswer: 'A',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Hard',
    ncertRef: "NCERT Class XII, Chapter 12, Page 212",
    explanation: "A single stranded DNA or RNA, tagged with a radioactive molecule (probe) is allowed to hybridize to its complementary DNA in a clone of cells followed by detection using autoradiography. The clone having the mutated gene will hence not appear on the photographic film, because the probe does not have complementarity with the mutated gene."
  },
  {
    id: 48,
    question: "India has approximately how many documented varieties of Basmati rice?",
    options: [
      { key: 'A', text: "200,000" },
      { key: 'B', text: "50,000" },
      { key: 'C', text: "27" },
      { key: 'D', text: "14" },
    ],
    correctAnswer: 'C',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 12, Page 214",
    explanation: "NCERT states: 'In India alone, there are an estimated 200,000 varieties of rice. Basmati rice is distinct for its unique aroma and flavour and 27 documented varieties of Basmati are grown in India.'"
  },
  {
    id: 49,
    question: "What is the primary function of the 'ori' (origin of replication) sequence in a plasmid vector?",
    options: [
      { key: 'A', text: "It codes for beta-galactosidase enzyme" },
      { key: 'B', text: "It is the sequence where replication starts and controls the copy number of the linked DNA" },
      { key: 'C', text: "It provides antibiotic resistance against tetracycline" },
      { key: 'D', text: "It serves as the binding site for restriction endonucleases" },
    ],
    correctAnswer: 'B',
    topic: 'Tools of rDNA Technology',
    difficulty: 'Easy',
    ncertRef: "NCERT Class XII, Chapter 11, Page 198",
    explanation: "This is a sequence from where replication starts and any piece of DNA when linked to this sequence can be made to replicate within the host cells. This sequence is also responsible for controlling the copy number of the linked DNA."
  },
  {
    id: 50,
    question: "Which of the following modifications in the Indian Patent Bill addresses issues like biopiracy and unauthorized exploitation of bio-resources?",
    options: [
      { key: 'A', text: "First Amendment Bill" },
      { key: 'B', text: "Second Amendment of the Indian Patents Bill" },
      { key: 'C', text: "Wildlife Protection Act of 1972" },
      { key: 'D', text: "Environmental Protection Act of 1986" },
    ],
    correctAnswer: 'B',
    topic: 'Biotech in Medicine & Ethics',
    difficulty: 'Medium',
    ncertRef: "NCERT Class XII, Chapter 12, Page 215",
    explanation: "The Indian Parliament has cleared the second amendment of the Indian Patents Bill, which takes such issues into consideration, including patent terms emergency provisions and research and development initiative."
  }
];

export const EXAM_CONFIG = {
  title: "NEET Booster: Biotechnology - Principles & Applications",
  subject: "BIOLOGY (NEET-UG)",
  chapter: "Ch 11: Principles & Processes + Ch 12: Applications",
  totalQuestions: 50,
  durationMinutes: 27,
  totalSeconds: 27 * 60, // 1620 seconds
  marksCorrect: 4,
  marksIncorrect: -1,
  marksUnattempted: 0,
  maxMarks: 200,
};
