const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: "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" });

// --- YOUR OFFICIAL SYLLABUS MAP (The "Headings List") ---
const SYLLABUS_MAP = {
  "Mathematics": [
    "Sets, Relations and Functions", "Complex Numbers and Quadratic Equations", 
    "Matrices and Determinants", "Permutations and Combinations", "Binomial Theorem", 
    "Sequence and Series", "Limit, Continuity and Differentiability", "Integral Calculus", 
    "Differential Equations", "Co-ordinate Geometry", "Three Dimensional Geometry", 
    "Vector Algebra", "Statistics and Probability", "Trigonometry"
  ],
  "Physics": [
    "Units and Measurements", "Kinematics", "Laws of Motion", "Work, Energy and Power", 
    "Rotational Motion", "Gravitation", "Properties of Solids and Liquids", 
    "Thermodynamics", "Kinetic Theory of Gases", "Oscillations and Waves", 
    "Electrostatics", "Current Electricity", "Magnetic Effects of Current", 
    "EMI and AC", "Electromagnetic Waves", "Optics", "Dual Nature of Matter", 
    "Atoms and Nuclei", "Electronic Devices"
  ],
  "Chemistry": [
    "Some Basic Concepts", "Atomic Structure", "Chemical Bonding", "Thermodynamics", 
    "Solutions", "Equilibrium", "Redox & Electrochemistry", "Chemical Kinetics", 
    "Periodic Properties", "p-Block Elements", "d and f-Block Elements", 
    "Coordination Compounds", "Hydrocarbons", "Organic Compounds Containing Halogens", 
    "Organic Compounds Containing Oxygen", "Organic Compounds Containing Nitrogen", 
    "Biomolecules", "Practical Chemistry"
  ]
};

const getStandardizedTopic = async (rawTopic) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a strict Syllabus Classifier for JEE Mains.
          
          Here is the OFFICIAL LIST of Valid Units:
          ${JSON.stringify(SYLLABUS_MAP)}

          TASK:
          1. Analyze the Input Topic.
          2. Map it to the most relevant "Subject" and "Unit" from the official list above.
          3. Return Strict JSON: { "subject": "Maths/Physics/Chemistry", "unit": "Exact Unit Name" }`
        },
        {
          role: "user",
          content: `Input Topic: "${rawTopic}"`
        }
      ],
      model: "llama-3.1-8b-instant", 
      temperature: 0, 
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("AI Error:", error.message);
    return null;
  }
};

module.exports = { getStandardizedTopic };