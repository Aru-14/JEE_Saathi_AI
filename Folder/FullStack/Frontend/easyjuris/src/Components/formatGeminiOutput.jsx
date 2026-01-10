import React from "react";

const formatGeminiOutput = (text) => {
  if (!text) return null;

  // Ensure text is a string
  const textStr = typeof text === "string" ? text : String(text);

  // Split by newline to handle each line separately
  const lines = textStr.split(/\n/).filter(line => line.trim() !== "");

  return lines.map((line, index) => {
    const trimmed = line.trim();

    // Bold headings
    const boldHeadingMatch = trimmed.match(/^\*\*(.+?)\*\*\s*$/);
    if (boldHeadingMatch) {
      return (
        <h3
          key={`line-${index}`}
          className="text-lg font-semibold text-purple-800 mt-4 mb-2"
        >
          {boldHeadingMatch[1]}
        </h3>
      );
    }

    // Numbered list
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      return (
        <p key={`line-${index}`} className="ml-4 mb-1">
          <strong>{numberedMatch[1]}.</strong> {numberedMatch[2]}
        </p>
      );
    }

    // Bulleted list
    const bulletMatch = trimmed.match(/^(\*|-)\s*(.*)/);
    if (bulletMatch) {
      return (
        <p key={`line-${index}`} className="ml-6 mb-1">
          • {bulletMatch[2]}
        </p>
      );
    }

    return <p key={`line-${index}`} className="mb-2">{trimmed}</p>;
  });
};

export default formatGeminiOutput;
