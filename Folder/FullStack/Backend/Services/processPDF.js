// Services/Summarizer.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { extractTextFromPDF } = require("./extractTextFromPDF");
const { getGridFSBucket } = require("../Models/Upload");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEN_AI_API_KEY);
console.log("processing");
async function summarizeText(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
  const result =
    await model.generateContent(`You are an AI mentor for JEE preparation (Physics, Chemistry, Math). 
The student will ask you questions related to concepts, problems, revision, and strategy. 
Your task is to:
- Understand the query.
- Answer in a step-by-step, easy-to-understand way.
- Provide alternative methods (if possible).
- Add visual/diagram-like explanations (if text only, describe clearly).
- Highlight whether it’s a Conceptual, Numerical, or Application type problem.
- Suggest related practice problems or NCERT/PYQ references.
- Keep the tone motivational and personalized for JEE aspirants.
:\n${text}`);
  return result.response.candidates[0].content.parts[0].text;
}

async function processPDF(text) {
  console.log("Processing");
  try {
    const summary = await summarizeText(text);
    console.log("Summary:", summary);
    return summary;
  } catch (err) {
    console.error("Error in processPDF:", err.message || err);
    return { error: true, message: err.message || "Processing failed" };
  }
}

module.exports = { processPDF };
