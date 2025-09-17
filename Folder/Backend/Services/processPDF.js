// Services/Summarizer.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { extractTextFromPDF } = require("./extractTextFromPDF");
const { getGridFSBucket } = require("../Models/Upload");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEN_AI_API_KEY);

async function summarizeText(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(`Summarize this in easy and simple English:\n\n${text}`);
  return result.response.text();
}

async function processPDF(text) {
  try {
   
    const summary = await summarizeText(text);
    console.log("Summary:", summary);
    return summary;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

module.exports = { processPDF };
