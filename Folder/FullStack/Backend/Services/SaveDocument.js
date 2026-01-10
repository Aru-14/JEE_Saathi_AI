const Document = require("../Models/Document");

async function SaveDocument(fileId, extractedText, topic) {
  const doc = new Document({
    fileId,
    extractedText,
    topic
  });

  
  await doc.save();
  return doc._id; // this is the MongoDB document ID
}

module.exports = { SaveDocument };