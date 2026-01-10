const fs = require('fs');
const axios = require('axios');

// ================= CONFIGURATION =================
const API_ENDPOINT = 'http://localhost:5000/api/addQuestions'; // Your actual API URL
const JSON_FILE_PATH = 'questionsForStorage.json';
// =================================================

async function uploadQuestions() {
  console.log(`🚀 Starting upload to ${API_ENDPOINT}...`);

  // 1. Read the JSON file
  if (!fs.existsSync(JSON_FILE_PATH)) {
    console.error(`❌ Error: File '${JSON_FILE_PATH}' not found.`);
    return;
  }

  try {
    const rawData = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
    const questions = JSON.parse(rawData);

    if (!Array.isArray(questions)) {
      console.error("❌ Error: JSON file must contain an array of questions.");
      return;
    }

    console.log(`📂 Read ${questions.length} questions from file.`);

    // 2. Send Request
    // Note: We send the whole array. Ensure your backend handles an array!
    // If your backend only takes one question at a time, we'll need to loop.
    const response = await axios.post(API_ENDPOINT, questions, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Success! Server responded:`, response.data);

  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error(`❌ Server Error (${error.response.status}):`);
      console.error(error.response.data);
    } else if (error.request) {
      // Request was made but no response
      console.error("❌ No response from server. Is the API running?");
    } else {
      // Error setting up request
      console.error("❌ Error:", error.message);
    }
  }
}

uploadQuestions();