# 🧠 JEE Saathi AI: A Cognitive Mentor for JEE Aspirants

## Full Detailed Demo Video Link : [https://youtu.be/TATIbj_ePuo]

**JEE Saathi AI** is a specialized AI powered ecosystem designed to bridge the gap between high-stakes competitive preparation and student well-being. Built for the 2026 JEE cycle, it focuses on **subject equilibrium**, **factual rigor**, and **burnout prevention**.

---

## 🚀 The Mission
IIT-JEE preparation is often a luxury. **JEE Saathi AI** moves beyond "PDF reading" to create an automated tutor that enforces discipline and factual accuracy through:
* **Factual Rigor:** Hallucination-free retrieval grounded in verified textbooks and 2025 exam papers.
* **Enforced Balance:** Mathematical algorithms that prevent students from neglecting weak subjects.
* **Mental Wellness:** Sentiment-aware monitoring to prevent student burnout and stress.

---

## 🏗️ Technical Architecture
The system uses a **Decoupled Dual-Service Architecture** to ensure high performance and scalability.

### 1. AI Orchestration (FastAPI)
* **Hierarchical RAG:** Uses a multi-tiered indexing system. Queries hit "Parent Chunks" for conceptual context before drilling into "Child Chunks" for specific formulas and Previous Year Questions (PYQs).
* **Markdown Structuring:** Raw textbook PDFs are parsed into Markdown via Llama 4 Scout to preserve LaTeX formulas and complex tables.
* **Synthetic Diagram Generation:** To reduce storage overhead by 90%, the system extracts text descriptions and renders 2D schematics on-demand using Flux.

### 2. App Orchestration (Node.js)
* **Real-time Engagement:** Handles Global Study Rooms and peer-to-peer interactions via WebSockets and Socket.io.
* **State Management:** Manages user authentication, "Flame" streaks, and daily activity tracking.

---

## 🎮 Behavioral Engineering
### The Balanced Score (Geometric Mean)
To ensure students maintain equilibrium across Physics, Chemistry, and Maths, we implement a scoring system that penalizes subject bias.
$$Score = \sqrt[3]{P \cdot C \cdot M}$$
*This is implemented via MongoDB Aggregation Pipelines to mathematically force subject balance in rankings.*

### The "One-Shot" Rule
To train for the actual exam’s negative marking:
* Questions are only marked **"Solved"** if correct on the first attempt.
* Subsequent attempts are marked as **"Learned"** for revision but do not inflate competitive rankings.

---

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS, KaTeX (for pixel-perfect math rendering).
* **Backend:** Node.js, Express, FastAPI (Python).
* **Database:** MongoDB Atlas (User Profiles), ChromaDB (Vector Intelligence).
* **Models:** Llama 3.3 70B, Gemini 1.5 Flash, Flux.

---
© 2026 Arunima Paunikar | JEE Saathi AI
