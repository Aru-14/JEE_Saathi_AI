import React, { useState } from "react";
import {useNavigate} from "react-router-dom";

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [fileId, setFileId] = useState(null);
const [question, setQuestion] = useState("");
const [answer, setAnswer] = useState("");
const [loadingAnswer, setLoadingAnswer] = useState(false);
const [documentType, setDocumentType] = useState("");
const [partiesInvolved, setPartiesInvolved] = useState([]);
const [authenticity, setAuthenticity] = useState("NA");
  const [uploaded,setUploaded]=useState(true);
  const [summaryLoading,setSummaryLoading]=useState(true);
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

const handleClauseByClauseExplanation=()=>{
  console.log("navigating to clause by clause explanation");
navigate(`/ClauseByClauseExplanation/${fileId}`);
console.log("navigated to clause by clause explanation");
}

  const handleUpload = async () => {
    setUploaded(false);
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); 
    
    try {
      const res = await fetch("https://easyjuris.onrender.com/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Upload successful:", data);
        setFileId(data.fileId);
        setUploaded(true);
        alert("File uploaded successfully!");
      } else {
        console.error("Upload failed");
        alert("Upload failed");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };




  const handleProcess = async () => {
    setSummaryLoading(false);
    if (!fileId) {
      alert("No file uploaded yet!");
      return;
    }

    try {
      const res = await fetch(`https://easyjuris.onrender.com/process/${fileId}`);
      if (res.ok) {
        const data = await res.json();
        console.log("Processing successful:", data);
        setSummary(data.summary);
         setDocumentType(data.document_type);
setPartiesInvolved(data.parties_involved || []);
setAuthenticity(data.authenticity);
        setSummaryLoading(true);
      } else {
        console.error("Processing failed");
        alert("Processing failed");
      }
    } catch (err) {
      console.error("Error processing file:", err);
    }
  };





const handleAskQuestion = async () => {
  if (!question.trim()) {
    alert("Please type a question!");
    return;
  }

  if (!fileId) {
    alert("Upload a file first!");
    return;
  }

  try {
    setLoadingAnswer(true);

    const res = await fetch("https://easyjuris.onrender.com/qna", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileId,      // pass the uploaded file ID
        question,    // user question
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setAnswer(data.answer);
    } else {
      alert("Failed to get answer");
    }
  } catch (err) {
    console.error("Error asking question:", err);
    alert("Error occurred while asking question");
  } finally {
    setLoadingAnswer(false);
  }
};





  return (
 
<div className="min-h-screen w-full ">

  {/* --- Header --- */}
  <header className="w-full  py-6 ">
    <h1 className="text-3xl font-bold text-purple-900">Welcome to EasyJuris</h1>
  </header>

  {/* --- Main Content --- */}
  <main className="w-full max-w-6xl mx-auto px-6 py-10 flex flex-col gap-12">

    {/* --- Upload Section --- */}
    <section className="bg-white border-0 rounded-xl shadow-2xl p-8">
      <h2 className="text-2xl font-semibold mb-4">Upload Your Document</h2>
      <p className="text-gray-400"> Only PDFs or images (for prototype) </p>
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-6 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0 file:text-sm file:font-semibold
                   file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
      />
      {!uploaded && <p className="mt-2 text-purple-400">Please wait...</p>}
      <div className="flex gap-4">
        <button
          onClick={handleUpload}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Upload
        </button>
        <button
          onClick={handleProcess}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Process & Summarize
        </button>
      </div>
    </section>
    {!summaryLoading && (<p className="text-gray-500">EasyJuris is analyzing...</p>)}
    {summary && (
      <section className="flex flex-col gap-10">

        {/* --- Summary --- */}
        <div className="bg-white border-0 rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold mb-6 text-purple-800"> Document Summary</h2>
          <p className="text-gray-800 leading-relaxed">{summary}</p>

          <div className="flex flex-wrap gap-6 mt-6 text-sm">
            <span className="px-3 py-1 bg-purple-50 text-purple-800 rounded-md">
              <b>Type:</b> {documentType}
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-md">
              <b>Parties:</b> {partiesInvolved.join(", ")}
            </span>
            <span
              className={`px-3 py-1 rounded-md flex justify-center items-center gap-2 font-medium
                ${
                  authenticity === "Real"
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : authenticity === "Fake"
                    ? "bg-red-100 text-red-800 border border-red-300"
                    : "bg-yellow-100 text-yellow-800 border border-yellow-300"
                }`}
            >
              {authenticity === "Real" && "✅"}
              {authenticity === "Fake" && "❌"}
              {authenticity === "Unclear" && "⚠️"}
              <b>Authenticity:</b> {authenticity}
            </span>
          </div>
        </div>

        {/* --- Q&A --- */}
        <div className="bg-white border-0 rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold mb-4 text-purple-800"> Ask About Your Document</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-grow p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <button
              onClick={handleAskQuestion}
              className="px-6 py-3 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition"
            >
              Ask
            </button>
          </div>

          {loadingAnswer && (
            <p className="mt-4 text-gray-500 italic">EasyJuris is analyzing your document...</p>
          )}

          {answer && (
            <div className="mt-6 p-5 bg-gray-50 border rounded-md">
              <strong className="text-purple-800">Answer:</strong>
              <p className="mt-2 text-gray-700 leading-relaxed">{answer}</p>
            </div>
          )}
        </div>

        {/* --- Clause-by-Clause --- */}
        <div className="flex justify-end">
          <button
            onClick={handleClauseByClauseExplanation}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md hover:opacity-90 transition"
          >
             Get Clause-by-Clause Explanation
          </button>
        </div>
      </section>
    )}
  </main>
</div>


//    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 w-full h-full">
//       <h1 className="text-2xl font-bold mb-4">Upload Your Document</h1>
//       <input type="file" onChange={handleFileChange} className="mb-4 bg-amber-200" />
//       <div className="flex gap-2">
//         <button
//           onClick={handleUpload}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Upload
//         </button>
//         <button
//           onClick={handleProcess}
//           className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//         >
//           Process & Summarize
//         </button>
//       </div>

//       {/* {summary && (
//         <div className="flex flex-row items-center gap-10 justify-between mt-6 w-full p-10">

//         <div className="mt-6 p-10 bg-white border rounded shadow text-justify w-3/4 ">
//           <h2 className="text-xl font-semibold mb-2">Summary:</h2>
//           <p>{summary}</p>
//           <p><b>Type:</b> {documentType}</p>
// <p><b>Parties:</b> {partiesInvolved.join(", ")}</p>
// <p><b>Authenticity:</b> {authenticity}</p>
//         </div>



//       <div className="mt-6 p-4 bg-white border rounded shadow w-3/4">
//     <h2 className="text-xl font-semibold mb-2">Ask About Your Document:</h2>
//     <input
//       type="text"
//       placeholder="Type your question here..."
//       value={question}
//       onChange={(e) => setQuestion(e.target.value)}
//       className="w-full p-2 border rounded mb-2"
//     />
//     <button
//       onClick={handleAskQuestion}
//       className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
//     >
//       Ask
//     </button>

//     {loadingAnswer && <p className="mt-2 text-gray-600">AI is typing...</p>}

//     {answer && (
//       <div className="mt-4 p-10 bg-gray-100 text-justify border rounded">
//         <strong>Answer:</strong> {answer}
//       </div>
//     )}
//   </div>

// <div>
//   <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600" onClick={handleClauseByClauseExplanation}>Get Clause by Clause explanation</button>
// </div>

//   </div>

//       )}

//        */}
//   {summary && (
//   <div className="flex flex-col gap-10 mt-8 w-full">

//     {/* --- Document Summary --- */}
//     <div className="p-6 bg-gray-50 rounded-xl">
//       <h2 className="text-2xl font-semibold mb-4 text-purple-800">📄 Document Summary</h2>
//       <p className="text-gray-800 leading-relaxed">{summary}</p>

//       {/* Key Info */}
//       <div className="flex flex-wrap gap-6 mt-6 text-sm">
//         <span className="px-3 py-1 bg-purple-50 text-purple-800 rounded-md">
//           <b>Type:</b> {documentType}
//         </span>
//         <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-md">
//           <b>Parties:</b> {partiesInvolved.join(", ")}
//         </span>

//         {/* --- Authenticity Badge --- */}
//         <span
//           className={`px-3 py-1 rounded-md flex items-center gap-2
//             ${
//               authenticity === "Real"
//                 ? "bg-green-100 text-green-800 border border-green-300"
//                 : authenticity === "Fake"
//                 ? "bg-red-100 text-red-800 border border-red-300"
//                 : "bg-yellow-100 text-yellow-800 border border-yellow-300"
//             }`}
//         >
         
//           <b>Authenticity:</b> {authenticity.charAt(0).toUpperCase() + authenticity.slice(1)}
//         </span>
//       </div>
//     </div>

//     {/* --- Q&A Section --- */}
//     <div className="p-6 bg-gray-50 rounded-xl">
//       <h2 className="text-2xl font-semibold mb-4 text-purple-800">❓ Ask About Your Document</h2>
//       <div className="flex gap-2">
//         <input
//           type="text"
//           placeholder="Type your question here..."
//           value={question}
//           onChange={(e) => setQuestion(e.target.value)}
//           className="flex-grow p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
//         />
//         <button
//           onClick={handleAskQuestion}
//           className="px-6 py-3 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition"
//         >
//           Ask
//         </button>
//       </div>

//       {loadingAnswer && (
//         <p className="mt-3 text-gray-500 italic">AI is analyzing your document...</p>
//       )}

//       {answer && (
//         <div className="mt-5 p-5 bg-white rounded-md">
//           <strong className="text-purple-800">Answer:</strong>
//           <p className="mt-2 text-gray-700 leading-relaxed">{answer}</p>
//         </div>
//       )}
//     </div>

//     {/* --- Clause by Clause --- */}
//     <div className="flex justify-end">
//       <button
//         onClick={handleClauseByClauseExplanation}
//         className="px-6 py-3 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition"
//       >
//         📑 Get Clause-by-Clause Explanation
//       </button>
//     </div>
//   </div>
// )}

  
//     </div>
  );
};

export default Upload;
