// import React, { useState } from "react";
// // import {useNavigate} from "react-router-dom";
// import formatGeminiOutput from "./formatGeminiOutput"; 
// const Upload = () => {
//   // const navigate = useNavigate();
//   const [file, setFile] = useState(null);
//   const [summary, setSummary] = useState("");
//   const [fileId, setFileId] = useState(null);
// const [question, setQuestion] = useState("");
// const [answer, setAnswer] = useState("");
// const [loadingAnswer, setLoadingAnswer] = useState(false);
// const [followUps, setFollowUps] = useState([]); // Follow-up history

//   // const [followUps, setFollowUps] = useState([]); // Follow-up history
//   const [topicStatus, setTopicStatus] = useState(""); // Overall topic status
//   const [reasoning, setReasoning] = useState(""); // Reasoning text
//   const [uploaded,setUploaded]=useState(true);
//   const [summaryLoading,setSummaryLoading]=useState(true);
//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

// // const handleClauseByClauseExplanation=()=>{
// //   console.log("navigating to clause by clause explanation");
// // navigate(`/ClauseByClauseExplanation/${fileId}`);
// // console.log("navigated to clause by clause explanation");
// // }

//   const handleUpload = async () => {
//     setUploaded(false);
//     if (!file) {
//       alert("Please select a file first!");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", file); 
    
//     try {
//       const res = await fetch("http://localhost:5000/upload", {
//         method: "POST",
//         body: formData,
//       });

//       if (res.ok) {
//         const data = await res.json();
//         console.log("Upload successful:", data);
//         setFileId(data.fileId);
//         setUploaded(true);
//         alert("File uploaded successfully!");
//       } else {
//         console.error("Upload failed");
//         alert("Upload failed");
//       }
//     } catch (err) {
//       console.error("Error uploading file:", err);
//     }
//   };



//   // Analyze all follow-ups
//   const handleAnalyzeFollowUps = async () => {
//     if (!fileId) {
//       alert("Upload a file first!");
//       return;
//     }
//     try {
//       const res = await fetch(`http://localhost:5000/analyze/${fileId}`);
//       const data = await res.json();
//       setTopicStatus(data?.topicStatus || "");
//       setReasoning(data?.reasoning || "");
//     } catch (err) {
//       console.error(err);
//       alert("Error fetching analysis");
//     }
//   };

//   const handleProcess = async () => {
//     setSummaryLoading(false);
//     if (!fileId) {
//       alert("No file uploaded yet!");
//       return;
//     }

//     try {
//       const res = await fetch(`http://localhost:5000/process/${fileId}`);
//       if (res.ok) {
//         const data = await res.json();
//         console.log("Processing successful:", data);
//         setSummary(data.summary);
       
//         setSummaryLoading(true);
//       } else {
//         console.error("Processing failed");
//         alert("Processing failed");
//       }
//     } catch (err) {
//       console.error("Error processing file:", err);
//     }
//   };



//  // Add follow-up question
//   const handleAddFollowUp = async () => {
//     if (!question.trim()) {
//       alert("Please type a question!");
//       return;
//     }
//     if (!fileId) {
//       alert("Upload a file first!");
//       return;
//     }

//     try {
//       const res = await fetch(`http://localhost:5000/followups/${fileId}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ followUpText: question }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setFollowUps((prev) => [...prev, data.followUp]);
//         setQuestion("");
//       } else {
//         alert("Failed to save follow-up");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error saving follow-up");
//     }
//   };


// const handleAskQuestion = async () => {
//   if (!question.trim()) {
//     alert("Please type a question!");
//     return;
//   }

//   if (!fileId) {
//     alert("Upload a file first!");
//     return;
//   }

//   try {
//     setLoadingAnswer(true);
// console.log("Getting the answer")
//     const res = await fetch("http://localhost:5000/qna", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         fileId,      // pass the uploaded file ID
//         question,    // user question
//       }),
//     });
// console.log("Got the answer")
// console.log(res)
//     if (res.ok) {
//       const data = await res.json();
//       setAnswer(data.answer);
//       //call addFollowUp
// handleAddFollowUp();
//     } else {
//       alert("Failed to get answer");
//     }
//   } catch (err) {
//     console.error("Error asking question:", err);
//     alert("Error occurred while asking question");
//   } finally {
//     setLoadingAnswer(false);
//   }
// };

//   return (
 
// <div className="min-h-screen w-full ">

//   {/* --- Header --- */}
//   <header className="w-full  py-6 ">
//     <h1 className="text-3xl font-bold text-purple-900">Welcome to JEE Saathi AI</h1>
//   </header>

//   {/* --- Main Content --- */}
//   <main className="w-full max-w-6xl mx-auto px-6 py-10 flex flex-col gap-12">

//     {/* --- Upload Section --- */}
//     <section className="bg-white border-0 rounded-xl shadow-2xl p-8">
//       <h2 className="text-2xl font-semibold mb-4">Upload Your Document</h2>
//       <p className="text-gray-400"> Only PDFs or images (for prototype) </p>
//       <input
//         type="file"
//         onChange={handleFileChange}
//         className="mb-6 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
//                    file:rounded-md file:border-0 file:text-sm file:font-semibold
//                    file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
//       />
//       {!uploaded && <p className="mt-2 text-purple-400">Please wait...</p>}
//       <div className="flex gap-4">
//         <button
//           onClick={handleUpload}
//           className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
//         >
//           Upload
//         </button>
//         <button
//           onClick={handleProcess}
//           className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
//         >
//           Process & Summarize
//         </button>
//       </div>
//     </section>
//     {!summaryLoading && (<p className="text-gray-500">JEE Saathi AI is analyzing...</p>)}
//     {summary && (
//       <section className="flex flex-col gap-10">

//         {/* --- Summary --- */}
//         <div className="bg-white border-0 rounded-xl shadow-2xl p-8">
//           <h2 className="text-2xl font-semibold mb-6 text-purple-800"> Answer</h2>
//          <p className="text-gray-800 leading-relaxed">
//   {typeof summary === "object" ? JSON.stringify(summary) : summary}
// </p>

//     <div className="p-6 bg-gray-50 rounded-md">
//       {formatGeminiOutput(summary)}
//     </div>

//          </div>

//         {/* --- Q&A --- */}
//         <div className="bg-white border-0 rounded-xl shadow-2xl p-8">
//           <h2 className="text-2xl font-semibold mb-4 text-purple-800"> Ask your queries</h2>
//           <div className="flex gap-3">
//             <input
//               type="text"
//               placeholder="Type your question here..."
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//               className="flex-grow p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
//             />
//             <button
//               onClick={handleAskQuestion}
//               className="px-6 py-3 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition"
//             >
//               Ask
//             </button>
//           </div>

//           {loadingAnswer && (
//             <p className="mt-4 text-gray-500 italic">JEE Saathi AI is analyzing...</p>
//           )}

//           {answer && (
//             <div className="mt-6 p-5 bg-gray-50 border rounded-md">
//              <p className="mt-2 text-gray-700 leading-relaxed">
//   {typeof answer === "object" ? JSON.stringify(answer) : answer}
// </p>
//               <p className="mt-2 text-gray-700 leading-relaxed">{answer}</p>
//             </div>
//           )}
//         </div>

//         {/* --- Clause-by-Clause --- */}
//         <div className="flex justify-end">
//           {/* <button
//             onClick={handleClauseByClauseExplanation}
//             className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md hover:opacity-90 transition"
//           >
//              Get Clause-by-Clause Explanation
//           </button> */}
//         </div>
//         <div>
//           <button onClick={handleAnalyzeFollowUps}>Check Analysis of your weakness</button>
//         </div>
//       </section>
//     )}
//   </main>
// </div>


// //    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 w-full h-full">
// //       <h1 className="text-2xl font-bold mb-4">Upload Your Document</h1>
// //       <input type="file" onChange={handleFileChange} className="mb-4 bg-amber-200" />
// //       <div className="flex gap-2">
// //         <button
// //           onClick={handleUpload}
// //           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
// //         >
// //           Upload
// //         </button>
// //         <button
// //           onClick={handleProcess}
// //           className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
// //         >
// //           Process & Summarize
// //         </button>
// //       </div>

// //       {/* {summary && (
// //         <div className="flex flex-row items-center gap-10 justify-between mt-6 w-full p-10">

// //         <div className="mt-6 p-10 bg-white border rounded shadow text-justify w-3/4 ">
// //           <h2 className="text-xl font-semibold mb-2">Summary:</h2>
// //           <p>{summary}</p>
// //           <p><b>Type:</b> {documentType}</p>
// // <p><b>Parties:</b> {partiesInvolved.join(", ")}</p>
// // <p><b>Authenticity:</b> {authenticity}</p>
// //         </div>



// //       <div className="mt-6 p-4 bg-white border rounded shadow w-3/4">
// //     <h2 className="text-xl font-semibold mb-2">Ask About Your Document:</h2>
// //     <input
// //       type="text"
// //       placeholder="Type your question here..."
// //       value={question}
// //       onChange={(e) => setQuestion(e.target.value)}
// //       className="w-full p-2 border rounded mb-2"
// //     />
// //     <button
// //       onClick={handleAskQuestion}
// //       className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
// //     >
// //       Ask
// //     </button>

// //     {loadingAnswer && <p className="mt-2 text-gray-600">AI is typing...</p>}

// //     {answer && (
// //       <div className="mt-4 p-10 bg-gray-100 text-justify border rounded">
// //         <strong>Answer:</strong> {answer}
// //       </div>
// //     )}
// //   </div>

// // <div>
// //   <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600" onClick={handleClauseByClauseExplanation}>Get Clause by Clause explanation</button>
// // </div>

// //   </div>

// //       )}

// //        */}
// //   {summary && (
// //   <div className="flex flex-col gap-10 mt-8 w-full">

// //     {/* --- Document Summary --- */}
// //     <div className="p-6 bg-gray-50 rounded-xl">
// //       <h2 className="text-2xl font-semibold mb-4 text-purple-800">📄 Document Summary</h2>
// //       <p className="text-gray-800 leading-relaxed">{summary}</p>

// //       {/* Key Info */}
// //       <div className="flex flex-wrap gap-6 mt-6 text-sm">
// //         <span className="px-3 py-1 bg-purple-50 text-purple-800 rounded-md">
// //           <b>Type:</b> {documentType}
// //         </span>
// //         <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-md">
// //           <b>Parties:</b> {partiesInvolved.join(", ")}
// //         </span>

// //         {/* --- Authenticity Badge --- */}
// //         <span
// //           className={`px-3 py-1 rounded-md flex items-center gap-2
// //             ${
// //               authenticity === "Real"
// //                 ? "bg-green-100 text-green-800 border border-green-300"
// //                 : authenticity === "Fake"
// //                 ? "bg-red-100 text-red-800 border border-red-300"
// //                 : "bg-yellow-100 text-yellow-800 border border-yellow-300"
// //             }`}
// //         >
         
// //           <b>Authenticity:</b> {authenticity.charAt(0).toUpperCase() + authenticity.slice(1)}
// //         </span>
// //       </div>
// //     </div>

// //     {/* --- Q&A Section --- */}
// //     <div className="p-6 bg-gray-50 rounded-xl">
// //       <h2 className="text-2xl font-semibold mb-4 text-purple-800">❓ Ask About Your Document</h2>
// //       <div className="flex gap-2">
// //         <input
// //           type="text"
// //           placeholder="Type your question here..."
// //           value={question}
// //           onChange={(e) => setQuestion(e.target.value)}
// //           className="flex-grow p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
// //         />
// //         <button
// //           onClick={handleAskQuestion}
// //           className="px-6 py-3 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition"
// //         >
// //           Ask
// //         </button>
// //       </div>

// //       {loadingAnswer && (
// //         <p className="mt-3 text-gray-500 italic">AI is analyzing your document...</p>
// //       )}

// //       {answer && (
// //         <div className="mt-5 p-5 bg-white rounded-md">
// //           <strong className="text-purple-800">Answer:</strong>
// //           <p className="mt-2 text-gray-700 leading-relaxed">{answer}</p>
// //         </div>
// //       )}
// //     </div>

// //     {/* --- Clause by Clause --- */}
// //     <div className="flex justify-end">
// //       <button
// //         onClick={handleClauseByClauseExplanation}
// //         className="px-6 py-3 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition"
// //       >
// //         📑 Get Clause-by-Clause Explanation
// //       </button>
// //     </div>
// //   </div>
// // )}

  
// //     </div>
//   );
// };

// export default Upload;
import React, { useState } from "react";
// import formatGeminiOutput from "./formatGeminiOutput";
import ReactMarkdown from "react-markdown";
// import Document from "../../../../Backend/Models/Document";
const Upload = () => {
  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  const [followUps, setFollowUps] = useState([]); // Follow-up history
  const [topicStatus, setTopicStatus] = useState(""); // Overall topic status
  const [reasoning, setReasoning] = useState(""); // Reasoning text
  const [uploaded, setUploaded] = useState(true);

  // File selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const addToWeak=async(topicStatus)=>{
      console.log("Adding to weak topics", topicStatus)

  // if(topicStatus==="Weak"){
  //  const document = await Document.find({ fileId: fileId });
      console.log("Adding to weak topics 2")

   const response = await fetch("http://localhost:5000/getTopic", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ extractedText: document.extractedText ,fileId, topicStatus}),
   });
    const data = await response.json();
    if(data.success){
      alert("Added to weak topics for further practice");
    } else{
      alert("Failed to add to weak topics");
    // }
  }
};

// useEffect(() => {
//   console.log("topic found")
//   if (topicStatus) {
//     console.log(topicStatus)
//     addToWeak(topicStatus);
//   }
// }, [topicStatus]);


  // Upload file
  const handleUpload = async () => {
    setUploaded(false);
    if (!file) return alert("Please select a file first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFileId(data.fileId);
        setUploaded(true);
        alert("File uploaded successfully!");
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    }
  };

  // Process & summarize file
  const handleProcess = async () => {
    setSummaryLoading(false);
    if (!fileId) return alert("No file uploaded yet!");

    try {
      const res = await fetch(`http://localhost:5000/process/${fileId}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setSummaryLoading(true);
      } else {
        alert("Processing failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Ask individual question
  const handleAskQuestion = async () => {
    if (!question.trim()) return alert("Please type a question!");
    if (!fileId) return alert("Upload a file first!");

    try {
      setLoadingAnswer(true);
      const res = await fetch("http://localhost:5000/qna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, question }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnswer(data.answer);
      } else {
        alert("Failed to get answer");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while asking question");
    } finally {
      setLoadingAnswer(false);
    }
  };

  // Add follow-up question
  const handleAddFollowUp = async () => {
    handleAskQuestion()
    if (!question.trim()) return alert("Please type a question!");
    if (!fileId) return alert("Upload a file first!");

    try {
      const res = await fetch(`http://localhost:5000/addFollowUp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          studentId: "demo-student", // optional
          followUpText: question,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFollowUps((prev) => [...prev, data.followUp]);
        setQuestion("");
      } else {
        alert("Failed to save follow-up");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving follow-up");
    }
  };

  // Analyze all follow-ups
  const handleAnalyzeFollowUps = async () => {
    if (!fileId) return alert("Upload a file first!");
    try {
      const res = await fetch(`http://localhost:5000/analyze/${fileId}`);
      const data = await res.json();
      console.log(data)
      setTopicStatus(data.topicStatus || "");
      setReasoning(data.reasoning || "");
      console.log(topicStatus)
      console.log(reasoning)
      addToWeak(topicStatus);   // function is called

    } catch (err) {
      console.error(err);
      alert("Error fetching analysis");
    }
  };


  return (
    <div className="min-h-screen w-full">
      <header className="w-full py-6">
        <h1 className="text-3xl font-bold text-purple-900">
          Welcome to JEE Saathi AI
        </h1>
      </header>

      <main className="w-full max-w-6xl mx-auto px-6 py-10 flex flex-col gap-12">
        {/* Upload Section */}
        <section className="bg-white border-0 rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold mb-4">Upload Your Document</h2>
          <p className="text-gray-400">Only PDFs or images (for prototype)</p>
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

        {!summaryLoading && (
          <p className="text-gray-500">JEE Saathi AI is analyzing...</p>
        )}

        {summary && (
          <section className="flex flex-col gap-10">
            {/* Summary */}
            <div className="bg-white border-0 rounded-xl shadow-2xl p-8">
              <h2 className="text-2xl font-semibold mb-6 text-purple-800">Answer</h2>
              {/* <p className="text-gray-800 leading-relaxed">
                {typeof summary === "object" ? JSON.stringify(summary) : summary}
              </p> */}
                <div className="prose max-w-none p-4 bg-gray-50 rounded-lg shadow text-left">
  <ReactMarkdown>{summary}</ReactMarkdown>
</div>
              {/* <div className="p-6 bg-gray-50 rounded-md">
                {formatGeminiOutput(summary)}
              </div> */}
            </div>

            {/* Q&A Section */}
            <div className="bg-white border-0 rounded-xl shadow-2xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-purple-800">
                Ask your queries
              </h2>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type your question here..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-grow p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <button
                  onClick={handleAddFollowUp}
                  className="px-6 py-3 bg-purple-700 text-white rounded-md hover:bg-purple-800 transition"
                >
                  Ask
                </button>
                <button
                  onClick={handleAnalyzeFollowUps}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Analyze
                </button>
              </div>

              {/* Follow-up History */}
              {followUps.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h3 className="font-semibold mb-2">Follow-ups:</h3>
                  <ul className="list-disc list-inside">
                    {followUps.map((f, idx) => (
                      <li key={idx}>{f.followUpText}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Overall Analysis */}
             {topicStatus && (
  <div className="mt-4 p-4 bg-purple-50 rounded-md">
    <h3 className="font-semibold">Topic Status: {topicStatus}</h3>
    <p>{reasoning}</p>
  </div>
)
}
              {loadingAnswer && (
                <p className="mt-4 text-gray-500 italic">
                  JEE Saathi AI is analyzing...
                </p>
              )}

              {answer && (
                <div className="mt-6 p-5 bg-gray-50 border rounded-md">
                  {/* <p className="mt-2 text-gray-700 leading-relaxed">
                    {typeof answer === "object" ? JSON.stringify(answer) : answer}
                  </p> */}
                   <div className="prose max-w-none p-4 bg-gray-50 rounded-lg shadow text-left">
  <ReactMarkdown>{answer}</ReactMarkdown>
</div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Upload;
