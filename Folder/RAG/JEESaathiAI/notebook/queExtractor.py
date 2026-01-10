import os
import json
import re
import time
from groq import Groq  # Make sure to run: pip install groq

# ================= CONFIGURATION =================
# 1. API Key Setup
# You can paste it directly or use os.environ
os.environ["GROQ_API_KEY"] = "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" # PASTE YOUR KEY HERE

# 2. Model Selection
# Note: "Llama 4" is not public yet. Using Llama 3.3 (the latest state-of-the-art)
MODEL_NAME = "llama-3.3-70b-versatile" 

# 3. File Paths
INPUT_FOLDER = './markdown_files'
OUTPUT_FILE = 'questions_data.json'
# =================================================

# Initialize Client
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

SYSTEM_PROMPT = """
You are an expert data extraction AI. Extract exam questions from the raw text into a strict JSON Array.
RULES:
1. OUTPUT ONLY JSON. No markdown formatting.
2. Structure for each question:
   {
      "content": "Question text with LaTeX ($...$)",
      "topic": "Subject topic (e.g. Calculus)",
      "type": "SCQ",
      "options": ["Opt1", "Opt2", "Opt3", "Opt4"],
      "correct_options": [0], 
      "has_diagram": false,
      "diagram_description": "",
      "answer_key": "Raw key string"
   }
3. If an option is LaTeX, keep it raw (e.g. "$\\frac{1}{2}$").
4. Return a JSON ARRAY of these objects.
"""

def fix_json_formatting(text):
    """
    Cleans the LLM output to ensure valid JSON.
    """
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    
    # Find the start [ and end ] of the array
    start, end = text.find('['), text.rfind(']')
    if start != -1 and end != -1:
        text = text[start:end+1]
    
    return text.strip()

def call_groq_api(chunk_text):
    """
    Calls Groq using the official SDK.
    """
    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": f"Extract questions from this text:\n\n{chunk_text}"
                }
            ],
            temperature=0.1,
            max_tokens=4096,
            top_p=1,
            stream=False,
            # 'json_object' mode ensures valid JSON output
            response_format={"type": "json_object"} 
        )
        
        return completion.choices[0].message.content

    except Exception as e:
        print(f"   ❌ Groq API Error: {e}")
        return None

def transform_to_schema(raw_item, filename):
    correct_opts = []
    
    # Handle Correct Options / Answer Key
    if 'correct_options' in raw_item and isinstance(raw_item['correct_options'], list):
         correct_opts = raw_item['correct_options']
    elif 'answer_key' in raw_item:
        try:
            # Handle "2" or "2.0" -> 2
            val = float(raw_item['answer_key'])
            if val.is_integer(): 
                correct_opts.append(int(val))
        except: 
            pass

    return {
        "content": raw_item.get("content", "").strip(),
        "topic": raw_item.get("topic", "General"),
        "type": raw_item.get("type", "SCQ"),
        "options": raw_item.get("options", []),
        "diagram": {
            "exists": raw_item.get("has_diagram", False),
            "description": raw_item.get("diagram_description", "")
        },
        "correct_options": correct_opts,
        "source": filename
    }

def main():
    if not os.path.exists(INPUT_FOLDER):
        print(f"❌ Folder '{INPUT_FOLDER}' not found.")
        return

    all_questions = []
    files = [f for f in os.listdir(INPUT_FOLDER) if f.endswith('.md')]
    
    print(f"🚀 Starting Extraction using {MODEL_NAME}...")

    for filename in files:
        filepath = os.path.join(INPUT_FOLDER, filename)
        print(f"\n📄 Processing: {filename}")

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Split by Page markers to keep chunks manageable
        chunks = content.split('--- Page')
        if len(chunks) == 1: 
            chunks = [content]
        else: 
            chunks = [f"--- Page {c}" for c in chunks if c.strip()]

        for i, chunk in enumerate(chunks):
            if len(chunk.strip()) < 50: continue

            print(f"   👉 Processing Chunk {i+1}/{len(chunks)}")
            
            # 1. Call API
            json_text = call_groq_api(chunk)
            
            # 2. Process Response
            if json_text:
                try:
                    clean_json = fix_json_formatting(json_text)
                    data = json.loads(clean_json)
                    
                    # Handle wrapper objects (e.g. {"questions": [...]})
                    if isinstance(data, dict):
                        # Look for common keys if the model wrapped the array
                        for key in ['questions', 'items', 'data']:
                            if key in data and isinstance(data[key], list):
                                data = data[key]
                                break
                    
                    if isinstance(data, list):
                        count = 0
                        for item in data:
                            transformed = transform_to_schema(item, filename)
                            all_questions.append(transformed)
                            count += 1
                        print(f"      ✅ Extracted {count} items.")
                    else:
                        print("      ⚠️ API response was not a list.")

                except json.JSONDecodeError:
                    print(f"      ❌ Failed to parse JSON. Raw response: {json_text[:50]}...")

    # Save Final File
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, indent=2, ensure_ascii=False)
    
    print(f"\n🎉 DONE! Saved {len(all_questions)} questions to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()