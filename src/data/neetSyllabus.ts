/** Official NEET (UG) syllabus structure aligned with NTA / NCERT Class 11 & 12 */

export interface SyllabusUnit {
  unit: string;
  chapters: string[];
}

export interface SubjectSyllabus {
  subject: string;
  code: string;
  units: SyllabusUnit[];
}

export const NEET_SYLLABUS: SubjectSyllabus[] = [
  {
    subject: 'Physics',
    code: 'PHY',
    units: [
      { unit: 'Unit 1 – Physics and Measurement', chapters: ['Units of measurement', 'SI units', 'Significant figures', 'Dimensions of physical quantities', 'Dimensional analysis'] },
      { unit: 'Unit 2 – Kinematics', chapters: ['Frame of reference', 'Motion in a straight line', 'Uniform and non-uniform motion', 'Average speed and instantaneous velocity', 'Motion in a plane', 'Projectile motion', 'Uniform circular motion'] },
      { unit: 'Unit 3 – Laws of Motion', chapters: ["Newton's laws", 'Momentum and impulse', 'Conservation of linear momentum', 'Equilibrium of concurrent forces', 'Static and kinetic friction', 'Dynamics of uniform circular motion'] },
      { unit: 'Unit 4 – Work, Energy and Power', chapters: ['Work done by constant and variable force', 'Kinetic and potential energy', 'Work-energy theorem', 'Power', 'Collisions', 'Elastic and inelastic collisions'] },
      { unit: 'Unit 5 – Rotational Motion', chapters: ['Centre of mass', 'Torque', 'Angular momentum', 'Moment of inertia', 'Parallel and perpendicular axes theorems', 'Rolling motion'] },
      { unit: 'Unit 6 – Gravitation', chapters: ["Kepler's laws", 'Universal law of gravitation', 'Acceleration due to gravity', 'Gravitational potential energy', 'Escape velocity', 'Orbital velocity of satellite', 'Geostationary satellites'] },
      { unit: 'Unit 7 – Properties of Solids and Liquids', chapters: ["Elastic behaviour", "Stress-strain", "Hooke's law", "Young's modulus", "Bulk modulus", "Pressure due to fluid column", "Pascal's law", "Viscosity", "Stokes' law", "Bernoulli's principle", "Surface energy and surface tension"] },
      { unit: 'Unit 8 – Thermodynamics', chapters: ['Thermal equilibrium', 'Zeroth law', 'Heat, work and internal energy', 'First law of thermodynamics', 'Second law', 'Reversible and irreversible processes', 'Carnot engine'] },
      { unit: 'Unit 9 – Kinetic Theory of Gases', chapters: ['Equation of state of perfect gas', 'Work done on compressing a gas', 'Kinetic theory assumptions', 'Concept of pressure', 'Kinetic interpretation of temperature', 'RMS speed', 'Degrees of freedom', 'Law of equipartition', 'Mean free path'] },
      { unit: 'Unit 10 – Oscillations and Waves', chapters: ['Periodic motion', 'SHM', 'Oscillations of spring', 'Energy in SHM', 'Simple pendulum', 'Wave motion', 'Longitudinal and transverse waves', 'Speed of wave', 'Displacement relation for progressive wave', 'Principle of superposition', 'Reflection of waves', 'Standing waves', 'Beats', 'Doppler effect'] },
      { unit: 'Unit 11 – Electrostatics', chapters: ["Electric charges", "Coulomb's law", "Electric field", "Electric flux", "Gauss's law", "Electric potential", "Capacitance", "Dielectrics", "Energy stored in capacitor"] },
      { unit: 'Unit 12 – Current Electricity', chapters: ["Electric current", "Drift velocity", "Ohm's law", "Electrical resistance", "Series and parallel", "Temperature dependence", "Internal resistance", "Kirchhoff's laws", "Wheatstone bridge", "Meter bridge"] },
      { unit: 'Unit 13 – Magnetic Effects of Current and Magnetism', chapters: ["Biot-Savart law", "Ampere's law", "Force on moving charge", "Force on current-carrying conductor", "Torque on current loop", "Moving coil galvanometer", "Current loop as magnetic dipole", "Bar magnet", "Earth's magnetic field", "Para, dia and ferromagnetic substances"] },
      { unit: 'Unit 14 – Electromagnetic Induction and Alternating Currents', chapters: ["Faraday's laws", "Lenz's law", "Eddy currents", "Self and mutual inductance", "Alternating currents", "Peak and RMS values", "Reactance and impedance", "LC oscillations", "LCR series circuit", "Resonance", "Power in AC", "AC generator", "Transformer"] },
      { unit: 'Unit 15 – Electromagnetic Waves', chapters: ['Displacement current', 'EM waves characteristics', 'Transverse nature', 'EM spectrum'] },
      { unit: 'Unit 16 – Optics', chapters: ['Reflection of light', 'Spherical mirrors', 'Refraction', 'Total internal reflection', 'Optical fibres', 'Refraction at spherical surfaces', 'Lenses', 'Thin lens formula', 'Lens maker formula', 'Magnification', 'Power of lens', 'Combination of thin lenses', 'Refraction of light through prism', 'Microscope and telescope', 'Wave optics', "Young's double slit", 'Diffraction', 'Polarisation'] },
      { unit: 'Unit 17 – Dual Nature of Matter and Radiation', chapters: ['Dual nature of radiation', 'Photoelectric effect', "Hertz and Lenard's observations", "Einstein's photoelectric equation", 'Particle nature of light', 'Matter waves', 'de Broglie relation'] },
      { unit: 'Unit 18 – Atoms and Nuclei', chapters: ["Alpha-particle scattering", "Rutherford's model", "Bohr model", 'Hydrogen spectrum', 'Composition and size of nucleus', 'Atomic masses', 'Mass-energy relation', 'Mass defect', 'Binding energy', 'Nuclear fission and fusion'] },
      { unit: 'Unit 19 – Electronic Devices', chapters: ['Semiconductors', 'Semiconductor diode', 'I-V characteristics', 'Zener diode', 'LED', 'Photodiode', 'Solar cell', 'Junction transistor', 'Transistor as amplifier and switch', 'Logic gates'] },
    ],
  },
  {
    subject: 'Chemistry',
    code: 'CHEM',
    units: [
      { unit: 'Unit 1 – Some Basic Concepts of Chemistry', chapters: ['Matter and its nature', 'Dalton\'s atomic theory', 'Laws of chemical combination', 'Atomic and molecular masses', 'Mole concept', 'Percentage composition', 'Empirical and molecular formulae', 'Chemical equations and stoichiometry'] },
      { unit: 'Unit 2 – Atomic Structure', chapters: ['Bohr model', 'Quantum mechanical model', 'Dual nature', 'de Broglie', 'Heisenberg uncertainty', 'Quantum numbers', 'Atomic orbitals', 'Rules for filling electrons', 'Electronic configuration'] },
      { unit: 'Unit 3 – Chemical Bonding and Molecular Structure', chapters: ['Kossel-Lewis approach', 'Ionic bond', 'Covalent bond', 'Bond parameters', 'VSEPR theory', 'Valence bond theory', 'Hybridization', 'Resonance', 'Molecular orbital theory', 'Hydrogen bond'] },
      { unit: 'Unit 4 – Chemical Thermodynamics', chapters: ['System and surroundings', 'First law', 'Enthalpy', 'Hess\'s law', 'Enthalpies of reactions', 'Second and third law', 'Gibbs energy'] },
      { unit: 'Unit 5 – Solutions', chapters: ['Concentration terms', 'Solubility of gases', 'Raoult\'s law', 'Colligative properties', 'Abnormal molar mass', 'van\'t Hoff factor'] },
      { unit: 'Unit 6 – Equilibrium', chapters: ['Chemical equilibrium', 'Law of chemical equilibrium', 'Equilibrium constant', 'Le Chatelier\'s principle', 'Ionic equilibrium', 'pH', 'Buffer solutions', 'Solubility product'] },
      { unit: 'Unit 7 – Redox Reactions and Electrochemistry', chapters: ['Oxidation and reduction', 'Oxidation number', 'Balancing redox', 'Electrolytic and galvanic cells', 'EMF', 'Nernst equation', 'Conductance', 'Kohlrausch\'s law'] },
      { unit: 'Unit 8 – Chemical Kinetics', chapters: ['Rate of reaction', 'Factors affecting rate', 'Order and molecularity', 'Rate law', 'Integrated rate equations', 'Half-life', 'Collision theory', 'Activation energy'] },
      { unit: 'Unit 9 – Classification of Elements and Periodicity', chapters: ['Modern periodic law', 'Periodic table', 'Periodic trends in properties'] },
      { unit: 'Unit 10 – p-Block Elements', chapters: ['Group 13 to 18 elements', 'General trends', 'Important compounds'] },
      { unit: 'Unit 11 – d- and f-Block Elements', chapters: ['Transition elements', 'Lanthanoids', 'Actinoids', 'KMnO4 and K2Cr2O7'] },
      { unit: 'Unit 12 – Coordination Compounds', chapters: ['Werner\'s theory', 'Ligands', 'Coordination number', 'IUPAC nomenclature', 'Isomerism', 'Valence bond and crystal field theory', 'Importance'] },
      { unit: 'Unit 13 – Purification and Characterisation of Organic Compounds', chapters: ['Purification methods', 'Qualitative analysis', 'Quantitative analysis', 'Empirical and molecular formulae'] },
      { unit: 'Unit 14 – Some Basic Principles of Organic Chemistry', chapters: ['Tetravalency of carbon', 'Hybridization', 'Functional groups', 'Homologous series', 'Isomerism', 'Nomenclature', 'Electronic displacement', 'Types of organic reactions'] },
      { unit: 'Unit 15 – Hydrocarbons', chapters: ['Alkanes', 'Alkenes', 'Alkynes', 'Aromatic hydrocarbons', 'Benzene'] },
      { unit: 'Unit 16 – Organic Compounds Containing Halogens', chapters: ['Nature of C-X bond', 'Preparation', 'Properties', 'Environmental effects'] },
      { unit: 'Unit 17 – Organic Compounds Containing Oxygen', chapters: ['Alcohols', 'Phenols', 'Ethers', 'Aldehydes', 'Ketones', 'Carboxylic acids'] },
      { unit: 'Unit 18 – Organic Compounds Containing Nitrogen', chapters: ['Amines', 'Diazonium salts', 'Cyanides and isocyanides'] },
      { unit: 'Unit 19 – Biomolecules', chapters: ['Carbohydrates', 'Proteins', 'Vitamins', 'Nucleic acids', 'Hormones'] },
      { unit: 'Unit 20 – Principles Related to Practical Chemistry', chapters: ['Detection of elements and functional groups', 'Preparation of inorganic and organic compounds', 'Titrimetric analysis', 'Chemical principles in experiments'] },
    ],
  },
  {
    subject: 'Biology',
    code: 'BIO',
    units: [
      { unit: 'Unit 1 – Diversity of Living Organisms', chapters: ['The Living World', 'Biological Classification', 'Plant Kingdom', 'Animal Kingdom'] },
      { unit: 'Unit 2 – Structural Organisation in Plants and Animals', chapters: ['Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 'Structural Organisation in Animals'] },
      { unit: 'Unit 3 – Cell Structure and Function', chapters: ['Cell: The Unit of Life', 'Biomolecules', 'Cell Cycle and Cell Division'] },
      { unit: 'Unit 4 – Plant Physiology', chapters: ['Photosynthesis in Higher Plants', 'Respiration in Plants', 'Plant Growth and Development'] },
      { unit: 'Unit 5 – Human Physiology', chapters: ['Breathing and Exchange of Gases', 'Body Fluids and Circulation', 'Excretory Products and their Elimination', 'Locomotion and Movement', 'Neural Control and Coordination', 'Chemical Coordination and Integration'] },
      { unit: 'Unit 6 – Reproduction', chapters: ['Sexual Reproduction in Flowering Plants', 'Human Reproduction', 'Reproductive Health'] },
      { unit: 'Unit 7 – Genetics and Evolution', chapters: ['Principles of Inheritance and Variation', 'Molecular Basis of Inheritance', 'Evolution'] },
      { unit: 'Unit 8 – Biology and Human Welfare', chapters: ['Human Health and Disease', 'Microbes in Human Welfare'] },
      { unit: 'Unit 9 – Biotechnology and its Applications', chapters: ['Biotechnology: Principles and Processes', 'Biotechnology and its Applications'] },
      { unit: 'Unit 10 – Ecology and Environment', chapters: ['Organisms and Populations', 'Ecosystem', 'Biodiversity and Conservation'] },
    ],
  },
];

export const NEET_SUBJECT_LIST = ['Physics', 'Chemistry', 'Biology', 'Biotechnology'] as const;

export function getChaptersForSubject(subject: string): string[] {
  const found = NEET_SYLLABUS.find(s => s.subject.toLowerCase() === subject.toLowerCase() || (subject === 'Biotechnology' && s.subject === 'Biology'));
  if (!found) return [];
  return found.units.flatMap(u => u.chapters);
}
