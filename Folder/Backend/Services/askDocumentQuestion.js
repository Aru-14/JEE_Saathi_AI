const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const {getDocumentByID} = require("./getDocumentByID");


const genAI = new GoogleGenerativeAI(process.env.GEN_AI_API_KEY);

async function askDocumentQuestion(fileId, userQuestion) {

  // Get document text from MongoDB
  
    
    const extractedText = (await getDocumentByID(fileId)).extractedText;

    if (!extractedText) {
      alert("Document not found");
    }

    

  

  // truncate or summarize if very large
  const maxChars = 5000; // example limit
  const contextText = extractedText.length > maxChars ? extractedText.slice(0, maxChars) + "..." : extractedText;


  // Prepare prompt for Gemini
  const prompt = `You are a legal assistant AI. Here is the text of a legal document:${extractedText} Answer the following question clearly and in simple English for a general user: Question: ${userQuestion}`;

  // Generate answer
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);

  // Return plain text
  return result.response.text();
}

module.exports = { askDocumentQuestion};
