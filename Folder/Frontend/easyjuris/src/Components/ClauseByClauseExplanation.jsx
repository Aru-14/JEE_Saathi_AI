import { useParams } from "react-router-dom";
import React, { useState } from "react";

const ClauseByClauseExplanation = ()  => {
//  console.log("Fetching clause explanations for fileID:");
 const params = useParams();
  
  console.log("All parameters:", params);
  console.log("Keys in params:", Object.keys(params));
  console.log("URL:", window.location.href);
 const { fileID } = useParams(); // Extracts fileID from URL
console.log(fileID)
    const [clauses, setClauses] = useState([]);
    const [loading, setLoading] = useState(false);
            console.log("Requested")
            console.log("Requested")

    const handleClauseExplanations = async () => {
        // console.log("Fetching clause explanations for fileID:");
            console.log("Requested")

        setLoading(true);
        try {
            if(!fileID){
                console.log("Incorrect FileID")
                return;
            }
            console.log("Fetching clause explanations for fileID:");
            const response = await fetch(`https://easyjuris.onrender.com/clausebyclause/${fileID}`);
            console.log("Response received")
            if (response.ok) {
                const data = await response.json();
                setClauses(data);
            } else {
                console.error("Failed to fetch clauses");
                // alert("Failed to fetch clauses");
            }
        } catch (error) {
            console.error("Error fetching clauses:", error);
            alert("Error fetching clauses");
        }   
        setLoading(false);
    };

   

    return (
<>

   <button  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 " onClick={handleClauseExplanations}>Get Clause Explanation</button> 

<p className="text-gray-400 mt-2 mb-2"> Only 4 clauses will be explained (due to RPD limit of Gemini API; for prototype) </p>

 {/* {loading ? ( */}
  {/* //     <p>Loading...</p> */}
{/* //    ) : (     */}
{/* //        <div>
//            {clauses.length > 0 ? (
//                 <ul>
//                      {clauses.map((clause, index) => (
//                         <li key={index}>
//                             <h3>{clause.clause_id}</h3>
//                             <p><strong>Text:</strong> {clause.clause_text}</p>

//                             <p><strong>Risk Level:</strong> {clause.risk_level}</p>
//                             <p><strong>Explanation:</strong> {clause.explanation}</p>
//                             {clause.suggested_action && (

                            
//                                 <p><strong>Suggested Action:</strong> {clause.suggested_action}</p>
//                             )}
//                         </li>       

//                     ))}
//                 </ul>
//               ) : (
//                 <p>No clauses found for this document.</p>
//                 )}
//               </div>
//     )
// } */}
  
  {loading ? (
  <div className="flex justify-center items-center h-64 ">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-600">Analyzing document...</span>
  </div>
) : (    
  <div className="space-y-4 mt-10">
    {clauses.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clauses.map((clause, index) => {
          // Determine card color based on risk level
          let cardColor = "";
          let borderColor = "";
          let riskColor = "";
          
          switch(clause.risk_level?.toLowerCase()) {
            case "high":
              cardColor = "bg-red-50";
              borderColor = "border-red-200";
              riskColor = "bg-red-100 text-red-800";
              break;
            case "medium":
              cardColor = "bg-yellow-50";
              borderColor = "border-yellow-200";
              riskColor = "bg-yellow-100 text-yellow-800";
              break;
            case "low":
              cardColor = "bg-green-50";
              borderColor = "border-green-200";
              riskColor = "bg-green-100 text-green-800";
              break;
            default:
              cardColor = "bg-gray-50";
              borderColor = "border-gray-200";
              riskColor = "bg-gray-100 text-gray-800";
          }
          
          return (
            <div 
              key={index} 
              className={`rounded-lg border ${borderColor} ${cardColor} p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
              {/* Header with risk badge */}
              <div className="flex justify-between items-start mb-3">
                {/* <h3 className="font-semibold text-gray-800 text-lg">
                  {clause.clause_id}
                </h3> */}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor}`}>
                  {clause.risk_level}
                </span>
              </div>
              
              {/* Clause text */}
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1 font-medium">Clause Text:</p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {clause.clause_text.length > 150 
                    ? `${clause.clause_text.substring(0, 150)}...` 
                    : clause.clause_text
                  }
                </p>
              </div>
              
              {/* Explanation */}
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1 font-medium">Explanation:</p>
                <p className="text-gray-800 text-sm">
                  {clause.explanation}
                </p>
              </div>
              
              {/* Suggested Action (if exists) */}
              {clause.suggested_action && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1 font-medium">Suggested Action:</p>
                  <p className="text-blue-700 text-sm font-medium">
                    {clause.suggested_action}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    ) : (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">No clauses found for this document.</p>
        <p className="text-gray-400 text-sm mt-1">The document may not contain identifiable legal clauses.</p>
      </div>
    )}
  </div>
)}
</>


    )  
};

    export default ClauseByClauseExplanation;
