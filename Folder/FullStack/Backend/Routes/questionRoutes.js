const express = require('express');
const router = express.Router();
const Question = require('../Models/Question'); // Adjust path to where you saved the Schema
const UserProgress = require('../Models/UserProgress');
const User = require('../Models/User');
const DailyLeaderBoard=require('../Models/DailyLeaderBoard');
const authMiddleware = require('../MiddleWares/auth');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const auth = require('../MiddleWares/auth');
const multer = require('multer');
const axios = require('axios');
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const upload = multer({ storage: multer.memoryStorage() }); // Keep in RAM temporarily
dotenv.config();



const POLLINATIONS_API_KEY = process.env.POLLINATION_API_KEY; 

const SYLLABUS_MAP = {
  "Mathematics": [
    "Sets, Relations and Functions", "Complex Numbers and Quadratic Equations", 
    "Matrices and Determinants", "Permutations and Combinations", "Binomial Theorem", 
    "Sequence and Series", "Limit, Continuity and Differentiability", "Integral Calculus", 
    "Differential Equations", "Co-ordinate Geometry", "Three Dimensional Geometry", 
    "Vector Algebra", "Statistics and Probability", "Trigonometry"
  ],
  "Physics": [
    "Units and Measurements", "Kinematics", "Laws of Motion", "Work, Energy and Power", 
    "Rotational Motion", "Gravitation", "Properties of Solids and Liquids", 
    "Thermodynamics", "Kinetic Theory of Gases", "Oscillations and Waves", 
    "Electrostatics", "Current Electricity", "Magnetic Effects of Current", 
    "EMI and AC", "Electromagnetic Waves", "Optics", "Dual Nature of Matter", 
    "Atoms and Nuclei", "Electronic Devices"
  ],
  "Chemistry": [
    "Some Basic Concepts", "Atomic Structure", "Chemical Bonding", "Thermodynamics", 
    "Solutions", "Equilibrium", "Redox & Electrochemistry", "Chemical Kinetics", 
    "Periodic Properties", "p-Block Elements", "d and f-Block Elements", 
    "Coordination Compounds", "Hydrocarbons", "Organic Compounds Containing Halogens", 
    "Organic Compounds Containing Oxygen", "Organic Compounds Containing Nitrogen", 
    "Biomolecules", "Practical Chemistry"
  ]
};

// POST /api/addQuestions
router.post('/addQuestions', async (req, res) => {
  try {
    const payload = req.body;

    // 1. Validation: Ensure we have data
    if (!payload || (Array.isArray(payload) && payload.length === 0)) {
      return res.status(400).json({ 
        success: false, 
        message: "No data provided" 
      });
    }

    // 2. Normalization: Convert single object to array if needed
    // This makes the endpoint robust enough to handle both 1 question OR 100 questions
    const questionsToInsert = Array.isArray(payload) ? payload : [payload];

    // 3. Optional: Deduplication Logic (Prevent duplicate questions)
    // We check if a question with the exact same content already exists
    // (This step is optional but recommended)
    /* const contents = questionsToInsert.map(q => q.content);
    const existingQuestions = await Question.find({ content: { $in: contents } });
    const existingContents = new Set(existingQuestions.map(q => q.content));
    
    const newQuestions = questionsToInsert.filter(q => !existingContents.has(q.content));
    
    if (newQuestions.length === 0) {
       return res.status(200).json({ success: true, message: "All questions already exist." });
    }
    */
    
    // For now, let's insert everything (assuming you handle duplicates elsewhere or don't care)
    const newQuestions = questionsToInsert;

    // 4. Bulk Insert into MongoDB
    // ordered: false continues inserting others even if one fails (e.g. validation error)
    const result = await Question.insertMany(newQuestions, { ordered: false });

    // 5. Success Response
    res.status(201).json({
      success: true,
      count: result.length,
      message: `Successfully added ${result.length} questions to the database.`,
      data: result // Returns the saved objects with their new _ids
    });

  } catch (error) {
    // 6. Error Handling
    console.error("❌ Error adding questions:", error);

    // Differentiate between Validation Errors and Server Errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        error: "Validation Error", 
        details: error.message 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: "Server Error", 
      details: error.message 
    });
  }
});

router.get('/topic/:topicName', authMiddleware, async (req, res) => {
  const { topicName } = req.params;
  const userId = req.user.id;
  console.log(`Fetching questions for topic: ${topicName} for user: ${userId}`);
  try {
    // 1. Fetch ALL questions for this topic
    const questions = await Question.find({ unit: topicName }).lean(); 
    // .lean() converts Mongoose docs to plain JS objects so we can add properties later

    // 2. Fetch the User's Progress for ONLY these questions
    // We get an array of question IDs to optimize the search
    const questionIds = questions.map(q => q._id);
    console.log(`Question IDs for topic "${topicName}":`, questionIds);
    const progressRecords = await UserProgress.find({
      userId: userId,
      questionId: { $in: questionIds } // Only look for these IDs
    });

    // 3. Create a "Map" for fast lookup
    // Result: { "id_123": { status: "correct" }, "id_456": { status: "learned" } }
    const progressMap = {};
    progressRecords.forEach(p => {
        progressMap[p.questionId.toString()] = p;
    });
   console.log(`User progress records found: ${progressRecords.length}`);
    // 4. Merge them!
    const finalQuestions = questions.map(question => {
      // Check if we have progress for this question
      const userProgress = progressMap[question._id.toString()];
      
      return {
        ...question, // Spread all question details (title, text, options)
        // Attach the status (or default to 'unattempted')
        userStatus: userProgress ? userProgress.status : 'unattempted',
      
      };
    });

    res.json(finalQuestions);

  } catch (err) {
    console.log(err)
    res.status(500).send("Server Error",err);
  }
});



router.post('/seeSolution', authMiddleware, async (req, res) => {

  const { questionId } = req.body;
  const userId = req.user.id;

  try {
    // 1. Fetch the question to send back the explanation
    const question = await Question.findById(questionId);
    
    // 2. Update Progress: Mark as 'revealed' ONLY if not already 'correct'
    // We use findOneAndUpdate to ensure we don't overwrite a 'correct' status
    await UserProgress.findOneAndUpdate(
      { userId, questionId },
      [
        {
          $set: { 
            // If it was already correct, keep it correct. Otherwise, mark revealed.
            status: { 
                $cond: { if: { $eq: ["$status", "correct"] }, then: "correct", else: "revealed" } 
            },
            
            lastAttemptedAt: new Date()
          }
        }
      ],
      { upsert: true, new: true }
    );

    // 3. Send the solution
    res.json({ 
      explanation: question.explanation, 
      correctAnswer: question.correctAnswer 
    });

  } catch (err) {
    res.status(500).send("Server Error");
  }
});

const updateStatsMap = (user, type, key, isCorrect) => {
  // 'type' is 'subjectStats' or 'topicStats'
  // 'key' is the Subject Name (Physics) or Topic Name (Rotational Dynamics)
  
  // 1. Get current stats or create default
  const currentStats = user[type].get(key) || { attempted: 0, correct: 0, accuracy: 0 };

  // 2. Calculate New Values
  const newAttempted = currentStats.attempted + 1;
  const newCorrect = isCorrect ? currentStats.correct + 1 : currentStats.correct;
  const newAccuracy = (newCorrect / newAttempted) * 100;

  // 3. Set the NEW object (Forces Mongoose to detect the change)
  user[type].set(key, {
    attempted: newAttempted,
    correct: newCorrect,
    accuracy: newAccuracy
  });
}

router.post('/submit', authMiddleware, async (req, res) => {

  const { questionId, selectedOption } = req.body;
  const userId = req.user.id;

  try {
    // 1. Check if the answer is actually correct
    const question = await Question.findById(questionId);
    const sub=question.subject;
    const topic=question.unit;




const user = await User.findById(userId); 


let totalAttempts = user.stats.attempts || 0;
let totalCorrect = user.stats.correctAttempts || 0;
let totalXp = user.stats.xp || 0;
let questionsSolved = user.stats.questionsSolved || 0;

totalAttempts += 1;


    if (!question) return res.status(404).json({ msg: 'Question not found' });

    let co=parseInt(question.correct_options[0]);
    let so=parseInt(selectedOption);


    const isRightAnswer = co === so;
    console.log(selectedOption, question.correct_options[0], isRightAnswer);

    // 2. Find existing progress to check "Lock" status
    let progress = await UserProgress.findOne({ userId, questionId });

    const currentStatus = progress?.status; // could be undefined, 'incorrect', 'revealed', etc.
    let prevcorrectCount=progress?.correctAttempts || 0;
    
    if(isRightAnswer){
      prevcorrectCount+=1;
    }

    // 3. Determine the NEW status
    let newStatus = currentStatus; // Start by keeping it same

    if (currentStatus === 'revealed' || currentStatus === 'incorrect') {
       // CASE A: Cheated/Revealed
       // Do NOTHING to the status. It stays 'revealed' forever.
       // We only update the attempt count/timestamp.
     totalCorrect += isRightAnswer ? 1 : 0;

       newStatus = 'revealed'; 
    } 
    else if (isRightAnswer) {
       // CASE B: Correct Answer (and wasn't revealed)
       //update the stats to increase correct solved for subject and topic

    if(currentStatus !== 'correct')   
      {

        questionsSolved += 1;
       newStatus = 'correct';}

    } 
    else {
      
       // CASE C: Wrong Answer
       // Only change to 'incorrect' if they haven't solved it yet
       if (currentStatus !== 'correct') {
       //update the stats to increase attempted solved for subject and topic

          newStatus = 'incorrect';
       }
    }
    
    updateStatsMap(user, 'subjectStats', question.subject, isRightAnswer);
    updateStatsMap(user, 'topicStats', question.unit, isRightAnswer);
    await user.save();
    console.log("Updated Stats Maps:", user.subjectStats, user.topicStats);


    // 4. Perform the Update
    await UserProgress.findOneAndUpdate(
      { userId, questionId },
      { 
        $set: { 
            status: newStatus,
            lastAttemptedAt: new Date(),
            correctAttempts: prevcorrectCount,
            subject: sub,
            topic: topic
        },

        $inc: { attempts: 1 } 
      },
      { upsert: true }
    );
   // FIX 1: Add 'await' here


let accuracy = (totalCorrect / totalAttempts) * 100;

await User.findByIdAndUpdate(userId, {
  $set: {
    "stats.attempts": totalAttempts,
    "stats.correctAttempts": totalCorrect,
    "stats.accuracy": accuracy,
    "stats.questionsSolved": questionsSolved,
 
    "stats.lastActiveDate": new Date()
  }
});
console.log("Updated User Stats:", 
      user.stats.attempts,
      user.stats.correctAttempts,
      user.stats.accuracy
     
    );
    // 5. Send result back
    // (We still tell the frontend "isCorrect: true" so they see the green text feedback,
    // but the database status remains 'revealed')
    res.json({ 
      success: true, 
      isCorrect: isRightAnswer 
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/user-progress-summary', authMiddleware, async (req, res) => {


  const userId = req.user.id; // From auth token
  const user=await User.findById(userId);
 try {
    const progressStats = await UserProgress.aggregate([
      // 1. Get all CORRECT submissions for this user
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId), 
          status: 'correct' 
        } 
      },

      // 2. Link with the Questions collection to get the "topic" name
      {
        $lookup: {
          from: 'questions',         // Must match your collection name in MongoDB (usually lowercase plural)
          localField: 'questionId', 
          foreignField: '_id',
          as: 'questionDetails'
        }
      },

      // 3. Unwind (Flatten the array created by lookup)
      { $unwind: '$questionDetails' },

      // 4. Group by Topic and Count
      {
        $group: {
          _id: '$questionDetails.unit', // Group by Topic Name
          solvedCount: { $sum: 1 }       // Count how many docs are in this group
        }
      }
    ]);

    // Result looks like: 
    // [ { _id: "Rotational Motion", solvedCount: 5 }, { _id: "Optics", solvedCount: 2 } ]
    
    // Optional: Convert array to a cleaner object for Frontend
    // { "Rotational Motion": 5, "Optics": 2 }
    const statsMap = {};
    progressStats.forEach(stat => {
      statsMap[stat._id] = stat.solvedCount;});
    
     console.log( user.topicStats, statsMap );
     
    res.json({userTopicStats:user.topicStats, statsMap });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


// @route   GET /api/question/:id
// @desc    Fetch a single question details by ID
// @access  Private (or Public, depending on your auth)
router.get('/question/:id',authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const userProgress = await UserProgress.findOne({ userId: userId, questionId: id });
    let correctCount=userProgress?.correctAttempts || 0;
    let attemptCount=userProgress?.attempts || 0;
    const accuracy = attemptCount === 0 ? 0 : ((correctCount / attemptCount) * 100).toFixed(2);

    // 1. Check if ID is valid MongoDB Object ID format
    // (Optional but prevents server crashes on bad IDs)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid Question ID format' });
    }

    // 2. Fetch from Database
    const question = await Question.findById(id);

    // 3. Handle "Not Found"
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // 4. Return the data
    // Note: We send correct_options because your frontend logic
    // needs it for the "View Solution" feature.
    res.status(200).json({question,accuracy});

  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({ message: 'Server Error fetching question data' });
  }
});

router.get('/toppers',authMiddleware, async (req, res) => {

 try{
 const TopperList=await DailyLeaderBoard.findOne({})
 console.log(TopperList.Rankings)
  res.json(TopperList.Rankings)
 }
 catch(err){
  res.json("error",err)
 }
});

router.get('/getUserMaxStreak', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(
     user.stats.maxStreak
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get('/getHomeData', authMiddleware, async (req,res) => { 
  const userId=req.user.id;

  try{
    const user=await User.findById(userId);
    const dailyLeaderBoard=await DailyLeaderBoard.findOne({});
    // console.log(dailyLeaderBoard);
    const Ranking=dailyLeaderBoard.Rankings;
    // console.log(Ranking);
    const userRankObj=Ranking.find(r=>r.userId.toString()===userId);
    let rank=userRankObj ? userRankObj.rank : null;
// console.log("User Rank: ",rank);
    res.json({subjectStats:user.subjectStats, topicStats:user.topicStats,rank:rank,currentStreak:user.stats.currentStreak,maxStreak:user.stats.maxStreak,overallAccuracy:user.stats.accuracy});
  }
  catch(err){
    console.error(err);
    res.status(500).send("Server Error");
  }
 });


const SYSTEM_PROMPT = `You are an advanced Academic Data Extraction AI. Your goal is to extract questions in physics, mathematics, and chemistry and convert them into structured database records.

Output Rules:
1. Return ONLY valid JSON. No markdown formatting, no conversational text, no \`\`\`json wrappers.
2. Use standard LaTeX for all mathematical expressions (enclose in $...$).
3. Map data exactly to the keys provided below.

Analyze the provided image and extract the data into the following structure:

Instructions:
1. "content": Extract the full question text verbatim (no diagram descriptions here).
2. "subject": Identify if the question is "Physics", "Chemistry", or "Mathematics".
3. "unit": Infer the JEE Unit name based on the topic.(Get the unit name from the provided ${JSON.stringify(SYLLABUS_MAP)} syllabus map)
4. "type": Must be exactly one of: "SCQ", "MCQ", or "INTEGER".
5. "options": Array of strings for choices. If "INTEGER" type, leave this array empty [].
6. "diagram": An object containing:
   - "exists": boolean (true if image has a figure/graph/circuit).
   - "description": A list-based mathematical description if exists=true, else null.
7. "answer_key": Extract the correct value verbatim (e.g., "B", "2.5"). If not visible, return null.
8. "topic": Infer the specific academic topic (e.g., "Logic Gates").
9. "difficulty": Based on complexity of question.
Required JSON Output Format:
{
  "content": "string",
  "subject": "string",
  "unit": "string",
  "type": "SCQ" | "MCQ" | "INTEGER",
  "options": ["string"],
  "diagram": {
    "exists": boolean,
    "description": "string" | null
  },
  "answer_key": "string",
  "topic": "string",
  "difficulty": "Easy" | "Medium" | "Hard"
}
`;


router.post("/uploadQueImage", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No image detected.");

    // 1. Convert Multer buffer to Base64
    const base64Image = req.file.buffer.toString('base64');
    
    // 2. Prepare the prompt for Llama 3.2 Vision
    const { source, correctAnswer } = req.body;

    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": SYSTEM_PROMPT
            },
            {
              "type": "image_url",
              "image_url": {
                "url": `data:${req.file.mimetype};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      "model": "meta-llama/llama-4-scout-17b-16e-instruct", // or 11b-vision-preview for speed
      "temperature": 0.2, // Keep it low for structural accuracy
      "response_format": { "type": "json_object" } // Forces Groq to return clean JSON
    });

   const aiResponse = JSON.parse(chatCompletion.choices[0].message.content);

const newQuestion = new Question({
  content: aiResponse.content,
  subject: aiResponse.subject,
  unit: aiResponse.unit,
  type: aiResponse.type,
  options: aiResponse.options,
  diagram: {
    exists: aiResponse.diagram.exists,
    description: aiResponse.diagram.description
  },
  correct_options: req.body.correctAnswer,
  // Mapping AI 'answer_key' to your metadata or manual check
  source: req.body.source || "User Uploaded",
  difficulty: aiResponse.difficulty // AI can also infer this if you add it to prompt
});

await newQuestion.save();

    res.status(200).json({success: true, question: newQuestion});
  } catch (error) {
    console.error("Groq Extraction Error:", error);
    res.status(500).json({ error: "Neural Link failed to parse image." });
  }
});


router.get('/diagram', authMiddleware, async (req, res) => {
  try {
console.log("Pollinations API Key Loaded:", POLLINATIONS_API_KEY);

    const { prompt } = req.query;
    console.log("Received diagram prompt:", prompt);
    const apiUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=flux`;

    const response = await axios({
      url: apiUrl,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${POLLINATIONS_API_KEY}` },
      responseType: 'arraybuffer' // REQUIRED for binary data
    });

    console.log(response.data)
    // Explicitly set the header so frontend knows it's an image
    res.set('Content-Type', 'image/jpeg');
    res.send(response.data);

  } catch (error) {
    console.error("Backend Error:", error.response?.data?.toString() || error.message);
    // If it fails, send a JSON error instead of an HTML page
    res.status(500).json({ error: "Failed to generate image",err: error.message  });
  }
});
module.exports = router;