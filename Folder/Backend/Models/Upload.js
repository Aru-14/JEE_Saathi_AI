// Models/Upload.js
require("dotenv").config();
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const multer = require("multer");
const connectDB = require("./db");
// MongoDB Atlas URI





const conn = mongoose.connection;

// GridFS bucket variable
let gridfsBucket;

// Initialize GridFSBucket once the connection is open
conn.once("open", () => {
  console.log("MongoDB connection open");
  gridfsBucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
  console.log("GridFSBucket initialized");
});

// Multer in-memory storage (temporary RAM storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Async getter to ensure bucket is ready
async function getGridFSBucket() {
  if (!gridfsBucket) {
    await new Promise((resolve) => conn.once("open", resolve));
  }
  return gridfsBucket;
}

module.exports = { upload, getGridFSBucket };
