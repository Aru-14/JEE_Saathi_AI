const mongoose = require('mongoose');
const Question = require('../Models/Question'); // Ensure this path is correct
const { getStandardizedTopic } = require('../Services/getStandardizedTopic');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI; 

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const startClassification = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ DB Connected.");

    // --- DEBUG CHECK: Does Mongoose see your new fields? ---
    const schemaPaths = Object.keys(Question.schema.paths);
    console.log("📊 Loaded Schema Fields:", schemaPaths.join(', '));
    
    if (!schemaPaths.includes('subject') || !schemaPaths.includes('unit')) {
        console.error("❌ CRITICAL ERROR: 'subject' or 'unit' is MISSING from the loaded Schema!");
        console.error("👉 Please check models/Question.js and ensure you saved the file.");
        process.exit(1);
    }
    // -------------------------------------------------------

    // 1. Find questions where unit is missing
    // Since it's in the schema now, standard .find() works perfectly
    const questions = await Question.find({ unit: { $exists: false } });
    
    console.log(`🔍 Found ${questions.length} unclassified questions.`);

    let success = 0;
    let failed = 0;

    for (const [i, q] of questions.entries()) {
      if (!q.topic) {
        console.log(`⚠️ Skipped QID ${q._id} (No topic text)`);
        continue;
      }

      process.stdout.write(`⏳ [${i+1}/${questions.length}] Classifying "${q.topic}"... `);

      const result = await getStandardizedTopic(q.topic);

      if (result && result.unit) {
        // 2. Standard Mongoose Update
        q.subject = result.subject;
        q.unit = result.unit;
        
        // 3. Save (This works now because Schema has the fields)
        await q.save();
        
        console.log(`✅ Saved: ${result.subject} | ${result.unit}`);
        success++;
      } else {
        console.log(`❌ Failed (AI returned null/empty).`);
        failed++;
      }

      await sleep(1500); 
    }

    console.log(`\n🎉 Done! Updated: ${success}, Failed: ${failed}`);

  } catch (err) {
    console.error("Fatal Error:", err);
  } finally {
    mongoose.connection.close();
  }
};

startClassification();