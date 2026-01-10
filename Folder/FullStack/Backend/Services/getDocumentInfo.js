
const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEN_AI_API_KEY);

const getDocumentInfo= async (text)=>{
  
    try{
let prompt=  `You are a legal document classifier for EasyJuris.

The user has uploaded a document. 
Classify it into ONE of these broad categories:

- Contracts & Agreements
- Business & Corporate Documents
- Property Documents
- Family & Personal Documents
- Government & Regulatory Documents

Return only JSON in this format:
{
  "category": "..."
}

Document text:
${text}
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  let result = await model.generateContent(prompt);
let output = result.response.candidates[0].content.parts[0].text;
 console.log(">> Raw model output:", output);
 output = output.replace(/```json|```/g, "").trim();

let parsed = JSON.parse(output);
let category=parsed.category;

let subTypes;

  switch (category) {
    case "Contracts & Agreements":
      subTypes = [
        "Employment Contract",
        "Service Agreement",
        "Lease / Rent Agreement",
        "Partnership Deed",
        "Non-Disclosure Agreement (NDA)",
        "Consultancy Agreement",
        "Franchise Agreement",
        "Sales Contract / Purchase Agreement",
        "Other"
      ];
      break;

    case "Business & Corporate Documents":
      subTypes = [
        "Memorandum of Association (MoA)",
        "Articles of Association (AoA)",
        "Non-Disclosure Agreement (NDA)",
        "Privacy Policy / Terms & Conditions",
        "Board Resolution",
        "Shareholders Agreement",
        "Other"
      ];
      break;

    case "Property Documents":
      subTypes = [
        "Sale Deed",
        "Title Deed",
        "Lease Papers",
        "Mortgage Agreement",
        "Gift Deed",
        "Other"
      ];
      break;

    case "Family & Personal Documents":
      subTypes = [
        "Marriage Certificate",
        "Divorce Decree",
        "Will",
        "Power of Attorney",
        "Adoption Papers",
        "Birth Certificate",
        "Other"
      ];
      break;

    case "Government & Regulatory Documents":
      subTypes = [
        "Court Order / Judgment",
        "Affidavit",
        "Caste Certificate",
        "Tax Filing / Return",
        "License / Permit",
        "Gazette Notification",
        "Other"
      ];
      break;

    default:
      subTypes = ["Other"];
  }

prompt=`The document has already been classified as: ${category}.

Now, refine further. Identify the most likely document type from this list:
${subTypes}

Also detect issuing parties (e.g., Employer, Landlord, Company, Client) if possible.  
Provide a simple explanation of the purpose of the document.  

Finally, check whether the document appears REAL or FAKE.  
When judging authenticity, consider:
- Presence or absence of proper stamps, seals, official letterheads
- Valid looking signatures, initials, or witness details
- Government/Institution identifiers like barcodes, QR codes, registration numbers
- Logical/consistent terms (no contradictory or illogical clauses)
- Standard legal language vs. unusual/awkward wording
- Formatting consistency and professional layout

If you cannot determine, mark as "Unclear".

Return JSON in this format:
{
  "document_type": "...",
  "parties_involved": ["...","..."],
  "authenticity": "Real" | "Fake" | "Unclear"
}

Document text:
${text}
`;
console.log(category)
 console.log(">> getDocumentInfo called");

result = await model.generateContent(prompt);
output = result.response.candidates[0].content.parts[0].text;
    console.log(">> Raw model output:", output);
 output = output.replace(/```json|```/g, "").trim();
 const data = JSON.parse(output);

    return {
      document_type: data.document_type || null,
      parties_involved: data.parties_involved || [],
      authenticity: data.authenticity || "Unclear"
    };
    }

catch (err) {
    console.error("Error:", err);
    // res.status(500).json({ error: "Something went wrong" });
  }
}

module.exports={getDocumentInfo}