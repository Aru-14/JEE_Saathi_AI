import React, { useState, useEffect, useRef } from 'react';

import ReactMarkdown from 'react-markdown';

import remarkMath from 'remark-math';

import rehypeKatex from 'rehype-katex';

import 'katex/dist/katex.min.css';



function AskAI() {

  const [question, setQuestion] = useState(() => localStorage.getItem('savedQuestion') || "");

  const [answer, setAnswer] = useState(() => localStorage.getItem('savedAnswer') || "");

  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);



  // Auto-scroll to latest answer

  useEffect(() => {

    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });

    localStorage.setItem('savedQuestion', question);

    localStorage.setItem('savedAnswer', answer);

  }, [question, answer]);



  const handleQuestion = async () => {

    if (!question.trim()) return;

    setLoading(true);

    const token = localStorage.getItem("token");



    try {

      const response = await fetch("http://localhost:8000/ask", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          "Authorization": `Bearer ${token}`

        },

        body: JSON.stringify({ prompt: question })

      });

      const data = await response.json();

      setAnswer(data.answer);

    } catch (error) {

      console.error("Error fetching AI response:", error);

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 flex flex-col items-center font-sans">

      {/* Header Section */}

      <header className="w-full max-w-4xl flex items-center justify-between mb-8 border-b border-slate-700 pb-4">

        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">

          JEE Saathi <span className="text-white">AI</span>

        </h1>

        <div className="flex items-center gap-2 text-sm text-slate-400">

          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>

          AI Tutor Online

        </div>

      </header>



      {/* Answer Display Area */}

      <main className="w-full max-w-4xl flex-grow overflow-y-auto space-y-6 custom-scrollbar pr-2 mb-24">

        {answer ? (

          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-xl">

            <h2 className="text-indigo-400 text-xs uppercase tracking-widest mb-4 font-semibold">Tutor Response</h2>

            <div className="prose prose-invert prose-blue max-w-none text-slate-300 leading-relaxed">

              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>

                {answer}

              </ReactMarkdown>

            </div>

            <div ref={scrollRef} />

          </div>

        ) : (

          <div className="h-64 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">

            <p className="text-lg italic">"The expert in anything was once a beginner."</p>

            <p className="text-sm mt-2">Ask your first question to start learning.</p>

          </div>

        )}

      </main>



      {/* Input Box - Sticky Footer */}

      <footer className="fixed bottom-8 w-full max-w-3xl px-4">

        <div className="relative group">

          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

          <div className="relative flex bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">

            <input 

              type="text" 

              className="flex-grow bg-transparent px-6 py-4 text-white outline-none placeholder:text-slate-500"

              placeholder="Ask a question about Physics, Chemistry, or Maths..."

              onChange={(e) => setQuestion(e.target.value)} 

              value={question}

              onKeyDown={(e) => e.key === 'Enter' && handleQuestion()}

            />

            <button 

              onClick={handleQuestion}

              disabled={loading}

              className={`px-8 py-4 font-bold transition-all ${loading ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}

            >

              {loading ? (

                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>

              ) : "Solve"}

            </button>

          </div>

        </div>

      </footer>

    </div>

  );

}



export default AskAI;