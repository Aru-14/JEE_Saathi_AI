const mongoose = require("mongoose");
const Document = require("../Models/Document"); // your schema file



// Function to fetch by fileId
async function getDocumentByID(fileID) {
  try {
  
    // const fileObjectId=new ObjectId(fileId);
    const doc = await Document.findOne({ fileId:fileID });

    if (!doc) {
      console.log("No document found for this fileId");
      return null;
    }

    return doc; // contains extractedText, summary, etc.
  } catch (err) {
    console.error("Error retrieving document:", err);
    throw err;
  }
}

module.exports = { getDocumentByID };
