require("dotenv").config();
const runNightlyUpdate=require("./cron/nightBatch"); // Ensure cron jobs are initialized
const WeakTopic = require("./Models/WeakTopic");
const History = require("./Models/History");

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { upload, getGridFSBucket } = require("./Models/Upload");
const { extractTextFromPDF } = require("./Services/extractTextFromPDF");
const { processPDF } = require("./Services/processPDF");
const { askDocumentQuestion } = require("./Services/askDocumentQuestion");
const { SaveDocument } = require("./Services/SaveDocument");
const connectDB = require("./Models/db");
const ClauseByClauseExplanation = require("./Services/ClauseByClauseExplanation");
const { getDocumentInfo } = require("./Services/getDocumentInfo");
const Question = require("./Models/Question");
const User = require("./Models/User");
const FollowUp = require("./Models/FollowUp");
const Room = require("./Models/Room");
const Message = require("./Models/Message");
const questionRoutes = require('./Routes/questionRoutes');


// const LeaderBoard = require("./Models/LeaderBoard");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Constants
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || "defaultsecret";

// Initialize Express
const app = express();
// app.use(express.json());
app.use(express.json({ limit: '50mb' })); 

// Also increase for URL-encoded data if needed
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// MongoDB Connection
connectDB();
// runNightlyUpdate(); // Run once at startup

// Initialize HTTP server + Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: {
    origin: "https://jee-saathi-ai-repo.vercel.app/", // NO trailing slash
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket"] });

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEN_AI_API_KEY);

// ------------------ SOCKET.IO ------------------
io.on("connection", (socket) => {
  let currentUserId = null;

  socket.on("registerUser", async (userId) => {
    currentUserId = userId;
    const rooms = await Room.find({ members: userId });
    socket.emit("userRooms", rooms);
  });

  socket.on("joinRoom", async ({ userId, roomName, type }) => {
    currentUserId = userId;

    let room = await Room.findOne({ name: roomName });
    if (!room) {
      room = new Room({ name: roomName, type, members: [userId] });
      await room.save();
    } else if (!room.members.includes(userId)) {
      room.members.push(userId);
      await room.save();
    }

    socket.join(roomName);

    const messages = await Message.find({ room: roomName }).sort("createdAt");
    socket.emit("roomMessages", { room: roomName, messages });
  });

  socket.on("chatMessage", async ({ room, msg }) => {
    if (!currentUserId) return;
    const newMsg = await Message.create({
      room,
      sender: currentUserId,
      text: msg,
    });
    const messages = await Message.find({ room }).sort("createdAt");
    io.to(room).emit("roomMessages", { room, messages });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// ------------------ ROUTES ------------------

// Upload file
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

// Process file (extract + summarize)
app.get("/process/:fileId", async (req, res) => {
  const { fileId } = req.params;

  try {
    const gfs = await getGridFSBucket();
    const fileObjectId = new mongoose.Types.ObjectId(fileId);
    const text = await extractTextFromPDF(fileObjectId, gfs);
    const summary = await processPDF(text);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const prompt = `You are an educational assistant. Based on the following text, identify the main topic or subject being discussed as per JEE Mains or Advanced syllabus. Provide a concise answer few words. Text: ${text} ONLY RETURN THE TOPIC NAME, DO NOT RETURN ANY OTHER TEXT.`;
    const result = await model.generateContent(prompt);
    const aiOutput =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "Unknown";
    const topic = aiOutput.trim().split("\n")[0];
    console.log(topic);
    await SaveDocument(fileId, text, topic);
    res.json({ fileId, summary });
  } catch (err) {
    console.log("Processing error:", err);
    res.status(500).send("Failed to process file");
  }
});

// QnA
app.post("/qna", async (req, res) => {
  const { fileId, question } = req.body;
  if (!fileId || !question)
    return res.status(400).send("File ID and question are required");
  const answer = await askDocumentQuestion(fileId, question);
  res.json({ answer });
});


// Register
app.post("/register", async (req, res) => {
  const { 
    name, username, email, password, avatar, // Auth Basics
    currentClass, targetYear, targetExams, schoolName // Academic Info
  } = req.body;

  try {
    // 1. Check for duplicates
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ msg: "User/Email already exists" });

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User with FULL details
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      avatar,
      // Academic Details
      currentClass: currentClass || '12th',
      targetYear: targetYear || (new Date().getFullYear() + 1),
      targetExams: targetExams || ['JEE Mains'],
      schoolName: schoolName || '',
      // Default Stats
      stats: { xp: 0, questionsSolved: 0, currentStreak: 0 }
    });

    await newUser.save();

    res.status(201).json({ msg: "Registration successful!" });

  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ email, token, userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Verify token
app.get("/verify", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ msg: "Invalid or expired token" });
    res.json({ msg: "Token is valid", user: decoded });
  });
});

// Add follow-up
app.post("/addFollowUp", async (req, res) => {
  try {
    const { fileId, studentId, followUpText } = req.body;
    const followUp = new FollowUp({ fileId, followUpText });
    await followUp.save();
    res.json({ success: true, followUp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/getTopic", async (req, res) => {
  try {
    const { extractedText, fileId, topicStatus } = req.body; // <-- this is what you need

    // const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    // const prompt = `You are an educational assistant. Based on the following text, identify the main topic or subject being discussed as per JEE Mains or Advanced syllabus. Provide a concise answer few words. Text: ${extractedText} ONLY RETURN THE TOPIC NAME, DO NOT RETURN ANY OTHER TEXT.`;
    // const result = await model.generateContent(prompt);
    // const aiOutput = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "Unknown";
    // const topic = aiOutput.trim().split('\n')[0]; // Get the first line and trim whitespace
    const document = await Document.findOne({ fileId });

    const topic = document ? document.topic : "Unknown";
    console.log("Adding to weak topics 1");

    if (topicStatus === "weak") {
      console.log("Adding to weak topics");
      const weakTopic = new WeakTopic({ topicName: topic });
      await weakTopic.save();
    }

    await SaveDocument(fileId, extractedText, topic);

    console.log("Identified topic:", topic);
    res.json({ topic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Analyze follow-ups using Gemini
app.get("/analyze/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;
    const followUps = await FollowUp.find({ fileId });

    if (followUps.length === 0) {
      return res.json({
        topicStatus: "No Follow-ups",
        reasoning: "No student follow-ups found.",
      });
    }

    let prompt = `You are an educational assistant. Analyze the following student follow-up questions. Classify the OVERALL student learning status (not individual queries) into one of: Weak, Needs Practice, OK/Enrichment. Follow-ups:\n`;
    followUps.forEach((f, idx) => {
      prompt += `${idx + 1}) ${f.followUpText}\n`;
    });
    prompt += `ONLY RETURN STRICT JSON in this EXACT FORMAT: { "topicStatus": "Weak | Needs Practice | OK/Enrichment", "reasoning": "short explanation why" }`;

    const model = genAI.getGenerativeModel({ model: "gemini-flash" });
    const result = await model.generateContent(prompt);
    const aiOutput =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const jsonMatch = aiOutput.match(/\{[\s\S]*\}/);

    let parsed;
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (err) {
        parsed = {
          topicStatus: "Unknown",
          reasoning: "Failed to parse AI output",
        };
      }
    } else {
      parsed = {
        topicStatus: "Unknown",
        reasoning: "No JSON found in AI output",
      };
    }

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.get("/getProblems", async (req, res) => {
  try {
    const problems = await WeakTopic.find(); // or .find().lean() for plain objects
    let allQuestions = [];

    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];

      const prompt = `
      Generate 3-4 JEE Mains/Advanced level questions for the topic "${problem.topicName}".
      Each question should be clear and concise.
      Provide the output as a JSON array with each question as a string.
    `;
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite",
      });
      const result = await model.generateContent(prompt);

      const aiOutput =
        result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      const jsonMatch = aiOutput.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        let raw = jsonMatch[0];

        // Remove markdown fences like ```json ... ```
        raw = raw.replace(/```json|```/g, "").trim();

        try {
          const questions = JSON.parse(raw);
          console.log("Parsed questions:", questions);
          allQuestions.push(...questions);

          await History.create({
            topicName: problem.topicName,
            questions,
            userId: req.user?._id || null,
          });
        } catch (err) {
          console.error("Failed to parse cleaned AI JSON:", err, raw);
        }
      }
    }
    res.send({ questions: allQuestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// POST /rooms
app.post("/CreateRoom", async (req, res) => {
  try {
    const { name, type, userId } = req.body; // pass userId from frontend
    if (!name || !type || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const room = await Room.create({
      name,
      type,
      members: [userId], // add creator as member
      creator: userId, // set creator
    });

    res.status(201).json({ room, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/invite", async (req, res) => {
  try {
    const { roomName, friendId } = req.body; // ID of the friend to invite

    if (!friendId) return res.status(400).json({ error: "Missing friendId" });

    const room = await Room.findOne({ name: roomName });
    if (!room) return res.status(404).json({ error: "Room not found" });

    // Check if friend is already a member
    if (room.members.includes(friendId)) {
      return res.status(400).json({ error: "User already in room" });
    }

    room.members.push(friendId);
    await room.save();

    res.status(200).json({ success: true, room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Save completed question
app.post("/saveHistory", async (req, res) => {
  try {
    const { userId, question } = req.body;
    console.log("Saving history:", userId, question);
    if (!userId || !question) {
      return res.status(400).json({ error: "Missing userId or question" });
    }

    const newHistory = new History({ userId, question });
    await newHistory.save();
    res.status(201).json({ message: "Saved successfully", data: newHistory });
  } catch (err) {
    console.error("Error saving history:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/getLeaderBoardData/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    // Aggregate leaderboard data
    const leaders = await LeaderBoard.find({ userId: userId });
    const newLeaders=leaders.map(leader => leader.toObject());
    res.status(200).json({ success: true, data: newLeaders });
  } catch (err) {
    console.error("Error fetching leaderboard data:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/updateLeaderboard", async (req, res) => {
  const { userId, problem } = req.body;

  try {
    // Find the user's leaderboard entry or create if not exists
    let entry = await LeaderBoard.findOne({ userId });
    if (!entry) {
      entry = new LeaderBoard({ userId });
    }

    // Increment solved questions
    entry.questionsSolved += 1;

    // Update streak (simple example: 1 day streak)
    const today = new Date();
    const lastDate = entry.lastSolvedDate || new Date(0);

    // If last solved yesterday, increment streak, else reset
    const diffDays = Math.floor(
      (today - new Date(lastDate)) / (1000 * 60 * 60 * 24)
    );
    entry.monthlyStreak = diffDays === 1 ? entry.monthlyStreak + 1 : 1;

    // Update last solved date
    entry.lastSolvedDate = today;

    await entry.save();

    res.status(200).json({ success: true, entry });
  } catch (err) {
    console.error("Error updating leaderboard:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


//Add questions
app.use('/api', questionRoutes);

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
