const Document = require("../Models/Document");

async function SaveDocument(fileId, fileName, extractedText, summary,document_type,parties_involved,authenticity) {
  const doc = new Document({
    fileId,
    fileName,
    extractedText,
    summary,
    document_type,
    parties_involved,
    authenticity

  });
  await doc.save();
  return doc._id; // this is the MongoDB document ID
}

module.exports = { SaveDocument };