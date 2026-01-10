import os
from fastapi import FastAPI
from pydantic import BaseModel
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# 1. Load the .env file
load_dotenv()

# 2. Access the variables using os.getenv
api_key = os.getenv("GROQ_API_KEY")

app = FastAPI()
origins = [
    "http://localhost:3000",    # React default port
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allows specific origins
    allow_credentials=True,
    allow_methods=["*"],              # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],              # Allows all headers
)
# --- 1. INITIALIZE MODELS & DB (LOAD ONCE) ---
print("⏳ Loading JEE Brain...")

# Set your Groq API Key
os.environ["GROQ_API_KEY"] = api_key

# Load Embedding Model
embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en-v1.5")

# Connect to ChromaDB
db = Chroma(
    persist_directory="./chroma_db", 
    embedding_function=embeddings, 
    collection_name="jee_knowledge_base"
)

# Initialize Llama 3.3 70B via Groq
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.2  # Lower temperature = more factual for Science
)

print("✅ JEE Saathi AI is Warm!")

# --- 2. DEFINE DATA STRUCTURE ---
class QueryRequest(BaseModel):
    prompt: str

# --- 3. DEFINE THE TEACHER'S ROLE (PROMPT) ---
TEACHER_PROMPT = ChatPromptTemplate.from_messages([
   ("system", """You are 'JEE Saathi AI', the definitive expert tutor for IIT-JEE Physics, Chemistry, and Mathematics.
Your goal is to provide rigorous, textbook-style explanations based on the provided context.

### FORMATTING PROTOCOL:
1. **Alignment**: Start all text immediately from the left margin.
2. **Structure**: 
   - Use '###' for major Topic Headings.
   - Use **Bold text** for laws, named reactions, theorems, and core constants.
   - Use '---' (Horizontal Rules) to separate conceptual blocks (e.g., Theory vs. Numerical Application).
3. **Mathematical & Chemical Notation**:
   - Use '$...$' for inline variables, symbols, and chemical formulas (e.g., $H_2SO_4$, $f(x)$).
   - Use '$$...$$' for core equations, balanced chemical reactions, or derivations on new lines.
4. **Subject-Specific Guidance**:
   - **Physics**: Focus on vector notation and free-body diagram descriptions.
   - **Chemistry**: Clearly state reaction conditions (Temperature, Catalyst) over the arrow if possible.
   - **Math**: Ensure clear step-by-step logical flow for proofs or limit evaluations.

If the context is insufficient, state: "I'm sorry, but I don't have enough specific information in my knowledge base to answer that."
"""),
    ("human", "Context: {context}\n\nQuestion: {question}")
])

# --- 4. THE API ROUTE ---
@app.post("/ask")
async def ask_jee(request: QueryRequest):
    # Step A: Retrieve relevant textbook chunks
    docs = db.similarity_search(request.prompt, k=3)
    context_text = "\n\n".join([d.page_content for d in docs])
    
    # Step B: Create the final prompt with context
    chain = TEACHER_PROMPT | llm
    
    # Step C: Generate the expert response
    response = chain.invoke({
        "context": context_text,
        "question": request.prompt
    })
    
    return {"answer": response.content}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)