const express = require('express');
const cors = require('cors');
const { upload, getGridFSBucket } = require("./Models/Upload");
const { extractTextFromPDF } = require('./Services/extractTextFromPDF');
const { processPDF } = require('./Services/processPDF'); // Returns summary
const { ObjectId } = require('mongodb');
const { askDocumentQuestion } = require('./Services/askDocumentQuestion'); // For Q&A
const { SaveDocument } = require('./Services/SaveDocument'); // For saving documents
const connectDB = require('./Models/db'); // Ensure DB connection is established
const ClauseByClauseExplanation  = require('./Services/ClauseByClauseExplanation'); // For clause-by-clause analysis
const{ getDocumentInfo }=require('./Services/getDocumentInfo')
const app = express();
app.use(express.json());
app.use(cors({
  origin: "*",      
  methods: ["GET","POST","PUT","DELETE"]
}));

connectDB(); // Ensure DB connection is established


// Route 1: Upload file to GridFS
app.post("/upload", upload.single("file"), async (req, res) => {
  
  if (!req.file) return res.status(400).send("No file uploaded");

  try {
    const gfs = await getGridFSBucket();
    const uploadStream = gfs.openUploadStream(req.file.originalname);
    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      res.json({ fileId: uploadStream.id, filename: req.file.originalname });
    });

    uploadStream.on("error", (err) => {
      console.error("Upload error:", err);
      res.status(500).send("Upload failed");
    });
  } catch (err) {
    console.error("GridFS error:", err);
    res.status(500).send("GridFS not ready yet");
  }
});

// Route 2: Extract + summarize from GridFS
app.get("/process/:fileId", async (req, res) => {
  const { fileId } = req.params;

  try {
    const gfs = await getGridFSBucket();

    // Convert string to ObjectId
    const fileObjectId = new ObjectId(fileId);

    // Extract text (handles PDF + OCR internally)
    const text = await extractTextFromPDF(fileObjectId, gfs);
  
    // Summarize
    const summary = await processPDF(text);
    const documentInfo=await getDocumentInfo(text);
  const { 
  document_type, 
  parties_involved, 
  authenticity 
} = documentInfo;

    // Save document metadata to MongoDB
    const fileName = req.query.filename || "Untitled Document";
    await SaveDocument(fileId, fileName, text, summary,document_type,parties_involved,authenticity);

    // Return fileId and summary
    res.json({ fileId, summary,document_type,parties_involved,authenticity });

  } catch (err) {
    console.error("Processing error:", err);
    res.status(500).send("Failed to process file");
  }
});


//Interactive Question-Answering

app.post("/qna",async (req, res) => {
  const { fileId, question } = req.body;

  if (!fileId || !question) {
    return res.status(400).send("File ID and question are required");
  }

  const answer = await askDocumentQuestion(fileId, question);
  res.json({ answer });
}
);





app.get("/clausebyclause/:fileID", async (req,res) => {

   console.log("[1] Sending request to Gemini...");
   
  const { fileID } = req.params;
   const fileObjectID = new ObjectId(fileID);

  if (!fileObjectID) {
    return res.status(400).send("File ID is required");
  }
  try {

   
    const clauses = await ClauseByClauseExplanation(fileObjectID);
console.log("[0] Received ");
    if (!clauses || clauses.length === 0) {
      return res.status(404).send("No clauses found for this document");
    }
    res.json(clauses || []); // Return empty array if no clauses found
  }

    catch (err) {
    console.error("Error:", err);
    res.status(500).send("Failed to retrieve clauses");
  }

}
  )







app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
