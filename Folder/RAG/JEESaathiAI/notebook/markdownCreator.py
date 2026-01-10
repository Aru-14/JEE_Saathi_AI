import os
import time
import base64
import gc
from pdf2image import convert_from_path, pdfinfo_from_path
from groq import Groq

# --- CONFIGURATION ---
# 1. Paste your GROQ Key here
os.environ["GROQ_API_KEY"] = "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" 

# 2. Folder Paths
PDF_FOLDER = "./books_pdf"
OUTPUT_FOLDER = "./books_markdown"
POPPLER_PATH = None  # Add path if needed (Windows)

# 3. Initialize Groq
client = Groq(api_key=os.environ["GROQ_API_KEY"])

SYSTEM_PROMPT = """
You are an advanced Academic Data Extraction AI. Your goal is to extract each question of physics, mathematics and chemistry and convert it into structured database records. You must accurately separate the question text from the diagram descriptions.

Output Rules:
1. Return ONLY valid JSON. No markdown formatting, no conversational text, no ```json wrappers.
2. Use standard LaTeX for all mathematical expressions (enclose in $...$).
3. If a diagram exists, describe it using a precise, list-based mathematical format where each value is clearly defined and labeled.

Analyze the provided image and extract the data into the following JSON structure.

Instructions:
1. "content": Extract the full question text verbatim. Do NOT include the diagram description here. If there are multiple choice options (A, B, C, D), extract them into the "options" array.
2. "has_diagram": Set to true if the image contains any graph, circuit, shape, or figure.
3. "diagram_description": If has_diagram is true, provide a description in this specific format:
   "The image contains several diagrams. A description of the diagrams is as follows:
   - [Description of component 1, using LaTeX for coordinates/labels]
   - [Description of component 2]"
4. "topic": Infer the academic topic (e.g., "Rotational Motion", "Logic Gates", "Calculus").
5. "type": "SCQ" (Single Correct), "MCQ" (Multiple Correct), or "INTEGER" (Numerical).
6. "options": An array of strings for the choices (e.g., ["45J", "90J", "0J", "10J"]). Leave empty if subjective/integer type.
7. "answer_key": extract integer value from text like "Ans: (1)"

Required JSON Output Format:
{
  "content": "string",
  "has_diagram": boolean,
  "diagram_description": "string",
  "topic": "string",
  "type": "SCQ",
  "options": ["string"],
  "answer_key": "string" | null
}
"""

def encode_image(image):
    import io
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

def process_book_groq(pdf_filename):
    pdf_path = os.path.join(PDF_FOLDER, pdf_filename)
    book_name = os.path.splitext(pdf_filename)[0]
    output_file = os.path.join(OUTPUT_FOLDER, f"{book_name}.md")
    
    print(f"📘 Starting Book: {book_name}")
    
    # Get Page Count
    try:
        info = pdfinfo_from_path(pdf_path, poppler_path=POPPLER_PATH)
        total_pages = info["Pages"]
        print(f"   📄 Total Pages: {total_pages}")
    except:
        return

    BATCH_SIZE = 5 # Keep batch small to save RAM
    
    # Create file
    if not os.path.exists(output_file):
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(f"# {book_name}\n\n")

    # Loop through book
    for start_page in range(1, total_pages + 1, BATCH_SIZE):
        end_page = min(start_page + BATCH_SIZE - 1, total_pages)
        print(f"   🔄 Processing {start_page}-{end_page}...", end="", flush=True)

        try:
            # Convert PDF -> Images
            pages = convert_from_path(pdf_path, dpi=300, first_page=start_page, last_page=end_page, poppler_path=POPPLER_PATH)
            print(" Done.")

            with open(output_file, "a", encoding="utf-8") as f:
                for i, page_image in enumerate(pages):
                    curr = start_page + i
                    print(f"      👁️ Page {curr}...", end="", flush=True)
                    
                    try:
                        base64_image = encode_image(page_image)
                        
                        # CALL GROQ API
                        completion = client.chat.completions.create(
                            messages=[{
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": SYSTEM_PROMPT},
                                    {
                                        "type": "image_url",
                                        "image_url": {
                                            "url": f"data:image/jpeg;base64,{base64_image}"
                                        },
                                    },
                                ],
                            }],
                            model="meta-llama/llama-4-scout-17b-16e-instruct", # <--- YOUR MODEL
                            temperature=0.1,
                        )
                        
                        # Save content
                        content = completion.choices[0].message.content
                        f.write(f"\n\n--- Page {curr} ---\n\n{content}")
                        print(" ✅")
                        
                        # Groq is fast, but 2s sleep prevents TPM (Token) limits
                        time.sleep(2) 

                    except Exception as e:
                        print(f" ❌ {e}")
                        f.write(f"\n\n--- Page {curr} ---\n\n[ERROR: {e}]\n")
                        # If Groq gets busy, wait a bit
                        time.sleep(5)

            # Cleanup RAM
            del pages
            gc.collect()

        except Exception as e:
            print(f"   ❌ Batch Error: {e}")

    print(f"✅ Finished: {book_name}")

if __name__ == "__main__":
    if not os.path.exists(OUTPUT_FOLDER): os.makedirs(OUTPUT_FOLDER)
    for pdf in [f for f in os.listdir(PDF_FOLDER) if f.endswith(".pdf")]:
        process_book_groq(pdf)