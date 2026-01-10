
const { GoogleGenerativeAI } = require("@google/generative-ai");
// const { json } = require("express");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEN_AI_API_KEY);

function waitForNextPrompt(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}



const ClauseByClauseExplanation = async (fileID) => {
  try {
    const { getDocumentByID } = require("./getDocumentByID");

    console.log("Gemini thinking");
    
    const extractedText = (await getDocumentByID(fileID)).extractedText;
    if (!extractedText) {
      throw new Error("Document not found");
    }

    const clauseRegex = /(?=\n\s*(?:ARTICLE|ART\.?|CLAUSE|SECTION|PART)\s*[IVXLCDM0-9]+[.:]|\n\s*[0-9]+\.\s*[A-Z][^\n]+)/gi;
    const clauses = extractedText.split(clauseRegex)
      .map(clause => clause.trim())
      .filter(clause => clause.length > 0);

    console.log(`Found ${clauses.length} clauses to process`);
    
    const results=await getClauseExplanationByChunks(clauses, extractedText);
    console.log(results);
    return results;

  } catch (err) {
    console.error("Error:", err);
    throw new Error("Failed to retrieve document");
  }
}


// const getClauseExplanationByChunks = async (clauses,extractedText)=>{

// let results=[];

// for(let i=0;i<4;i++){

// const model = genAI.getGenerativeModel({  model: "gemini-2.0-flash-lite" });

// const prompt = `
//     Analyze this legal clause briefly in easy human english. Return **exactly one JSON object** for this clause with:
//     - "clause_text": Original (make concise if long)
//     - "risk_level": "High", "Medium", "Low" based on severity, how serious the clause is, how important the issue is
//     - "explanation": Short summary with easy human english
//     - "suggested_action": Brief suggestion if risky 

//     High risk: indefinite terms, penalties, ambiguous language
//     Medium: vague or one-sided terms
//     Low: standard text, no big issue for common man

//     Clause:
//     ${clauses[i]}
    
//     Take the help of whole legal document for generating the summarized explanation of clause

//     ${extractedText}

//     Return Format:
//     {
//   "clause_text": "...",
//   "risk_level": "...",
//   "explanation": "...",
//   "suggested_action": "..."
//     }
    
//   `;

//   console.log(prompt.length);
// const response = await model.generateContent(prompt)
// console.log("Prompt done");
//  let cleanedText = response.response.text().replace(/```json|```/g, '').trim();
//     try {
//       const jsonObj = JSON.parse(cleanedText);
//       // results.push(jsonObj);
//       results.push(...jsonObj)
//       console.log(jsonObj);
//     } catch (err) {
//       console.error("JSON Parse failed for clause:", clauses[i], "Raw response:", cleanedText);
//     }



// await waitForNextPrompt(2000);



// }
const getClauseExplanationByChunks = async (clauses, extractedText) => {
  let results = [];

  for (let i = 0; i < 4; i++) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `
      Analyze this legal clause briefly in easy human english. Return **exactly one JSON object** for this clause with:
      - "clause_text"
      - "risk_level"
      - "explanation"
      - "suggested_action"

      Clause:
      ${clauses[i]}

      Use the whole legal document for reference:
      ${extractedText}

      Return Format:
      {
        "clause_text": "...",
        "risk_level": "...",
        "explanation": "...",
        "suggested_action": "..."
      }
    `;

    const response = await model.generateContent(prompt);
    const cleanedText = response.response.text().replace(/```json|```/g, '').trim();

    try {
      const jsonObj = JSON.parse(cleanedText);
      results.push(jsonObj); // <-- push single object only
      console.log(jsonObj);
    } catch (err) {
      console.error("JSON Parse failed for clause:", clauses[i], "Raw response:", cleanedText);
    }

    await waitForNextPrompt(2000);
  }

  return results;
}





  
  
module.exports = ClauseByClauseExplanation;















































// const { Groq } = require("groq-sdk");
// // const { GoogleGenerativeAI } = require("@google/generative-ai");

// require("dotenv").config();
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY
// });
// // const genAI = new GoogleGenerativeAI(process.env.GEN_AI_API_KEY);


// const { getDocumentByID } = require("./getDocumentByID");

// const ClauseByClauseExplanation = async (fileID) => {
//   try {
//     console.log("Groq thinking");
    
//     const extractedText = (await getDocumentByID(fileID)).extractedText;
//     if (!extractedText) {
//       throw new Error("Document not found");
//     }

//     const clauseRegex = /(?=\n\s*(?:ARTICLE|ART\.?|CLAUSE|SECTION|PART)\s*[IVXLCDM0-9]+[.:]|\n\s*[0-9]+\.\s*[A-Z][^\n]+)/gi;
//     const clauses = extractedText.split(clauseRegex)
//       .map(clause => clause.trim())
//       .filter(clause => clause.length > 0);

//     console.log(`Found ${clauses.length} clauses to process`);
    
//     const results = await processClausesWithRateLimiting(clauses, extractedText);
    
//     return results;

//   } catch (err) {
//     console.error("Error:", err);
//     throw new Error("Failed to retrieve document");
//   }
// }

// // Enhanced rate limiting with exponential backoff
// async function processClausesWithRateLimiting(clauses, fullText, chunkSize = 2) {
//   const allResults = [];
//   let retryCount = 0;
//   const maxRetries = 3;
  
//   for (let i = 0; i < clauses.length; i += chunkSize) {
//     const chunk = clauses.slice(i, i + chunkSize);
//     const chunkNumber = Math.floor(i / chunkSize) + 1;
    
//     console.log(`Processing chunk ${chunkNumber}/${Math.ceil(clauses.length / chunkSize)}`);
    
//     try {
//       const result = await analyzeClauseWithRetry(chunk, fullText, maxRetries);
//       allResults.push(...result);
      
//       // Dynamic delay based on rate limits (longer delay as we progress)
//       const delay = Math.min(30000, 1000 + (chunkNumber * 500)); // Max 30s delay
//       console.log(`Waiting ${delay}ms before next request...`);
//       await new Promise(resolve => setTimeout(resolve, delay));
      
//       retryCount = 0; // Reset retry count after successful request
      
//     } catch (error) {
//       console.error(`Failed to process chunk ${chunkNumber} after ${maxRetries} retries:`, error.message);
//       // Add placeholder for failed chunks
//       allResults.push(...createPlaceholderResults(chunk));
//     }
//   }
  
//   return allResults;
// }

// async function analyzeClauseWithRetry(clauseChunk, fullText, maxRetries) {
//   let lastError;
  
//   for (let attempt = 1; attempt <= maxRetries; attempt++) {
//     try {
//       return await analyzeClauseChunk(clauseChunk, fullText);
//     } catch (error) {
//       lastError = error;
      
//       if (error.status === 429) {
//         // Extract wait time from error message if available
//         let waitTime = 20000; // Default 20 seconds
//         const waitMatch = error.message.match(/try again in (\d+\.?\d*)s/);
//         if (waitMatch) {
//           waitTime = Math.ceil(parseFloat(waitMatch[1]) * 1000);
//         }
        
//         console.log(`Rate limited. Waiting ${waitTime}ms before retry (attempt ${attempt}/${maxRetries})...`);
//         await new Promise(resolve => setTimeout(resolve, waitTime));
//       } else {
//         // For other errors, shorter delay
//         const delay = Math.min(10000, attempt * 2000);
//         console.log(`Error occurred. Waiting ${delay}ms before retry (attempt ${attempt}/${maxRetries})...`);
//         await new Promise(resolve => setTimeout(resolve, delay));
//       }
//     }
//   }
  
//   throw lastError;
// }

// async function analyzeClauseChunk(clauseChunk, fullText) {
//   // Create a very concise prompt to minimize tokens
//   const prompt = `
//     Analyze these legal clauses briefly. Return JSON with:
//     - "clause_id": "CLAUSE_X"
//     - "clause_text": Original (truncate if long)
//     - "risk_level": "High", "Medium", "Low"
//     - "explanation": Short summary
//     - "suggested_action": Brief suggestion if risky

//     High risk: indefinite terms, penalties, ambiguous language
//     Medium: vague or one-sided terms
//     Low: standard text

//     Clauses:
//     ${clauseChunk.map((c, i) => `${i+1}. ${c.substring(0, 200)}${c.length > 200 ? '...' : ''}`).join('\n')}

//     Return format: { "clauses": [{...}] }
//   `;

//   const response = await groq.chat.completions.create({
//     model: "llama-3.1-8b-instant",
//     messages: [
//       {
//         role: "system",
//         content: "Legal expert. Return ONLY valid JSON. Be concise."
//       },
//       {
//         role: "user",
//         content: prompt
//       }
//     ],
//     temperature: 0.1,
//     max_tokens: 500, // Further reduced
//     response_format: { type: "json_object" }
//   });
// //  const model = genAI.getGenerativeModel({  model: "gemini-1.5-pro-latest" });

// //     const prompt = `
// //     Analyze these legal clauses and Return only valid JSON array, without markdown or code fences, the response must be parsable by JSON.parse() directly and take reference to the original legal text and where each item in the JSON array contains:
// //     - "clause_id": Auto-generated (e.g., "CLAUSE_1", "SECTION_2_1").
// //     - "clause_text": Original text.
// //     - "risk_level": "High", "Medium", or "Low".
// //     - "explanation": Plain-English summary.
// //     - "suggested_action": Optional fix if risky.

// //     Rules:
// //     1. Flag as "High" risk if: indefinite terms, unilateral penalties, ambiguous language.
// //     2. For "Medium", highlight vague or one-sided terms.
// //     3. Use "Low" for standard boilerplate.

// //     Clauses:
// //    ${clauseChunk.map((c, i) => `${i+1}. ${c.substring(0, 200)}${c.length > 200 ? '...' : ''}`).join('\n')}
    
// //     Original full legal text:
// //     ${fullText}

// //     Format output like this: 
// //     { clauses: [{ "clause_id": "...", ... }] }
// //   `;
//     // const result = await model.generateContent(prompt);
// console.log("Prompt done")
// // const response = await result.response;
// //     const content = response.text();
    
// //     console.log("Raw Gemini response:", content);
//   const content = response.choices[0].message.content;
//   const withoutMarkdown = content.replace(/```json|```/g, '').trim();
  
//   try {
//     const parsed = JSON.parse(withoutMarkdown);
//     console.log(parsed)
//     return parsed.clauses || [];
//   } catch (parseError) {
//     console.error("JSON parse error, creating fallback results");
//     return createFallbackResults(clauseChunk);
//   }
// }

// function createPlaceholderResults(clauseChunk) {
//   return clauseChunk.map((clause, index) => ({
//     clause_id: `CLAUSE_${index + 1}_FAILED`,
//     clause_text: clause.substring(0, 100) + (clause.length > 100 ? '...' : ''),
//     risk_level: "Unknown",
//     explanation: "Analysis failed due to rate limiting",
//     suggested_action: "Please try again later or upgrade your API plan"
//   }));
// }

// function createFallbackResults(clauseChunk) {
//   return clauseChunk.map((clause, index) => ({
//     clause_id: `CLAUSE_${index + 1}`,
//     clause_text: clause.substring(0, 150) + (clause.length > 150 ? '...' : ''),
//     risk_level: "Medium", // Default assumption
//     explanation: "Automatic analysis unavailable",
//     suggested_action: "Review this clause manually"
//   }));
// }

// module.exports = ClauseByClauseExplanation;











// const { Groq } = require("groq-sdk");
// require("dotenv").config();
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY
// });

// const { getDocumentByID } = require("./getDocumentByID");

// const ClauseByClauseExplanation = async (fileID) => {
//   try {
//     console.log("Groq thinking");
    
//     // Get document text from MongoDB
//     const extractedText = (await getDocumentByID(fileID)).extractedText;
//     if (!extractedText) {
//       throw new Error("Document not found");
//     }

//     // Extract clauses
//     const clauseRegex = /(?=\n\s*(?:ARTICLE|ART\.?|CLAUSE|SECTION|PART)\s*[IVXLCDM0-9]+[.:]|\n\s*[0-9]+\.\s*[A-Z][^\n]+)/gi;
//     const clauses = extractedText.split(clauseRegex)
//       .map(clause => clause.trim())
//       .filter(clause => clause.length > 0);

//     // Process in chunks to avoid token limits
//     const results = await processClausesInChunks(clauses, extractedText);
    
//     return results;

//   } catch (err) {
//     console.error("Error retrieving document:", err);
//     throw new Error("Failed to retrieve document");
//   }
// }

// // Process clauses in smaller chunks
// async function processClausesInChunks(clauses, fullText, chunkSize = 3) {
//   const allResults = [];
  
//   for (let i = 0; i < clauses.length; i += chunkSize) {
//     const chunk = clauses.slice(i, i + chunkSize);
    
//     try {
//       const result = await analyzeClauseChunk(chunk, fullText);
//       allResults.push(...result);
      
//       // Add delay to respect rate limits
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//     } catch (error) {
//       console.warn(`Failed to process chunk ${i/chunkSize + 1}:`, error.message);
//       // Continue with next chunks
//     }
//   }
  
//   return allResults;
// }

// // Analyze a single chunk of clauses
// async function analyzeClauseChunk(clauseChunk, fullText) {
//   const prompt = `
//     Analyze these legal clauses and Return only valid JSON array. Each item in the JSON array contains:
//     - "clause_id": Auto-generated (e.g., "CLAUSE_1", "SECTION_2_1").
//     - "clause_text": Original text.
//     - "risk_level": "High", "Medium", or "Low".
//     - "explanation": Plain-English summary.
//     - "suggested_action": Optional fix if risky.

//     Rules:
//     1. Flag as "High" risk if: indefinite terms, unilateral penalties, ambiguous language.
//     2. For "Medium", highlight vague or one-sided terms.
//     3. Use "Low" for standard boilerplate.

//     Clauses to analyze:
//     ${JSON.stringify(clauseChunk)}

//     Reference full legal text (for context only):
//     ${fullText.substring(0, 1000)}... [truncated]

//     Return format: { "clauses": [{ "clause_id": "...", ... }] }
//   `;

//   const response = await groq.chat.completions.create({
//     model: "llama-3.1-8b-instant",
//     messages: [
//       {
//         role: "system",
//         content: "You are a legal expert. Return ONLY valid JSON without any additional text or markdown."
//       },
//       {
//         role: "user",
//         content: prompt
//       }
//     ],
//     temperature: 0.1,
//     max_tokens: 800, // Reduced from 1000
//     response_format: { type: "json_object" }
//   });

//   const content = response.choices[0].message.content;
//   const withoutMarkdown = content.replace(/```json|```/g, '').trim();
  
//   try {
//     const parsed = JSON.parse(withoutMarkdown);
//     return parsed.clauses || [];
//   } catch (parseError) {
//     console.error("JSON parse error:", parseError);
//     console.log("Raw response:", content);
//     return [];
//   }
// }

// module.exports = ClauseByClauseExplanation;












































// // const { GoogleGenerativeAI } = require("@google/generative-ai");
// require("dotenv").config();
// const { Groq } = require("groq-sdk");
// // const OpenAI = require("openai");

// // const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY // Free at groq.com
// });

// // const openai = new OpenAI({
// //   apiKey: process.env.OPENAI_API_KEY,
// // });

// const {getDocumentByID} = require("./getDocumentByID");


// // const genAI = new GoogleGenerativeAI(process.env.GEN_AI_API_KEY);

// const ClauseByClauseExplanation = async (fileID) => {
// try{
//   console.log("Gemini thinking")
    
//     // Get document text from MongoDB

//     const extractedText = (await getDocumentByID(fileID)).extractedText;
//     if (!extractedText) {
//       throw new Error("Document not found");
//     }
//     console.log("Type of extractedText:", typeof extractedText);

//     const clauseRegex = /(?=\n\s*(?:ARTICLE|ART\.?|CLAUSE|SECTION|PART)\s*[IVXLCDM0-9]+[.:]|\n\s*[0-9]+\.\s*[A-Z][^\n]+)/gi;

//     const clauses= extractedText.split(clauseRegex)
//              .map(clause => clause.trim())
//              .filter(clause => clause.length > 0);


//  const prompt = `
//     Analyze these legal clauses and Return only valid JSON array, without markdown or code fences, the response must be parsable by JSON.parse() directly and take reference to the original legal text and where each item in the JSON array contains:
//     - "clause_id": Auto-generated (e.g., "CLAUSE_1", "SECTION_2_1").
//     - "clause_text": Original text.
//     - "risk_level": "High", "Medium", or "Low".
//     - "explanation": Plain-English summary.
//     - "suggested_action": Optional fix if risky.

//     Rules:
//     1. Flag as "High" risk if: indefinite terms, unilateral penalties, ambiguous language.
//     2. For "Medium", highlight vague or one-sided terms.
//     3. Use "Low" for standard boilerplate.

//     Clauses:
//     ${JSON.stringify(clauses)}
    
//     Original full legal text:
//     ${extractedText}

//     Format output like this: 
//     { clauses: [{ "clause_id": "...", ... }] }
//   `;


// console.log("Prompted")
//   const response = await groq.chat.completions.create({
//     model: "llama-3.1-8b-instant", // Free model
//     messages: [
//       {
//         role: "system",
//         content: "You are a legal expert. Return ONLY valid JSON without any additional text or markdown."
//       },
//       {
//         role: "user",
//         content: prompt
//       }
//     ],
//     temperature: 0.1,
//     max_tokens: 1000,
//     response_format: { type: "json_object" }
//   });

// // const response = await fetch("https://api-inference.huggingface.co/models/google/gemma-2b", {
// //     method: "POST",
// //     headers: {
// //       Authorization: `Bearer ${HUGGING_FACE_TOKEN}`,
// //       "Content-Type": "application/json"
// //     },
// //     body: JSON.stringify({
// //       inputs: prompt,
// //       parameters: { max_new_tokens: 800 }
// //     })
// //   });

//   // always get raw first
// console.log("Raw response:", response.choices[0].message.content);

// // console.log(data[0])
// //  console.log("Raw API response:", data);
// //   let rawText;
// //  if (Array.isArray(data) && data[0].generated_text) {
// //   rawText=  data[0].generated_text;
// //   } else {
// //     console.error("Unexpected response:", data);
// //     return null;
// //   }
// //    const response = await openai.chat.completions.create({
// //   model: "gpt-3.5-turbo",
// //   messages: [
// //     {
// //       role: "system",
// //       content: "You are a legal expert. Return ONLY valid JSON. Do not include markdown, code fences, or any extra text. The response must be directly parsable by JSON.parse()."
// //     },
// //     {
// //       role: "user",
// //       content: `
// //         Analyze these legal clauses and return only valid JSON object. 
// //         The response must be parsable by JSON.parse() directly.

// //         Each item in the JSON array must contain:
// //         - "clause_id": Auto-generated (e.g., "CLAUSE_1", "SECTION_2_1")
// //         - "clause_text": Original text
// //         - "risk_level": "High", "Medium", or "Low"
// //         - "explanation": Plain-English summary
// //         - "suggested_action": Optional fix if risky

// //         Rules:
// //         1. Flag as "High" risk if: indefinite terms, unilateral penalties, ambiguous language
// //         2. For "Medium", highlight vague or one-sided terms
// //         3. Use "Low" for standard boilerplate

// //         Clauses:
// //         ${JSON.stringify(clauses)}

// //         Original full legal text:
// //         ${extractedText.substring(0, 3000)}

// //         Return format: { "clauses": [{ "clause_id": "...", ... }] }
// //       `
// //     }
// //   ],
// //   response_format: { type: "json_object" }, // Ensures JSON response
// //   max_tokens: 1500,
// //   temperature: 0.1
// // });




//     // const model = genAI.getGenerativeModel({  model: "gemini-1.5-pro-latest" });

//   //   const prompt = `
//   //   Analyze these legal clauses and Return only valid JSON array, without markdown or code fences, the response must be parsable by JSON.parse() directly and take reference to the original legal text and where each item in the JSON array contains:
//   //   - "clause_id": Auto-generated (e.g., "CLAUSE_1", "SECTION_2_1").
//   //   - "clause_text": Original text.
//   //   - "risk_level": "High", "Medium", or "Low".
//   //   - "explanation": Plain-English summary.
//   //   - "suggested_action": Optional fix if risky.

//   //   Rules:
//   //   1. Flag as "High" risk if: indefinite terms, unilateral penalties, ambiguous language.
//   //   2. For "Medium", highlight vague or one-sided terms.
//   //   3. Use "Low" for standard boilerplate.

//   //   Clauses:
//   //   ${JSON.stringify(clauses)}
    
//   //   Original full legal text:
//   //   ${extractedText}

//   //   Format output like this: 
//   //   { clauses: [{ "clause_id": "...", ... }] }
//   // `;
//     // const result = await model.generateContent(prompt);
// console.log("Prompt done")

//     // console.log(response.choices[0].message.content);
//     const withoutMarkdown = response.choices[0].message.content.replace(/```json|```/g, '').trim();

//      return JSON.parse(withoutMarkdown).clauses || []; // Fallback to empty array
  



// }
// catch (err) {
//     console.error("Error retrieving document:", err);
//     throw new Error("Failed to retrieve document");
//   }

// }



// module.exports = ClauseByClauseExplanation;