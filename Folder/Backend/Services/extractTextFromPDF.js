const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const { PDFDocument } = require("pdf-lib");

async function extractTextFromPDF(fileId, gridfsBucket) {
  if (!gridfsBucket) throw new Error("GridFSBucket not initialized yet");

  const chunks = [];
  const downloadStream = gridfsBucket.openDownloadStream(fileId);

  return new Promise((resolve, reject) => {
    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("end", async () => {
      try {
        const fileBuffer = Buffer.concat(chunks);
        const fileType = await import("file-type"); // dynamic import
        const type = await fileType.fileTypeFromBuffer(fileBuffer);
        let text = "";

        if (type?.mime === "application/pdf") {
          const data = await pdfParse(fileBuffer);
          text = data.text;

          if (!text || !text.trim()) {
            const pdfDoc = await PDFDocument.load(fileBuffer);
            const pages = pdfDoc.getPages();
            for (const page of pages) {
              const imgs = page.node.Resources?.XObject?.dict || {};
              for (const key of Object.keys(imgs)) {
                const imgObj = imgs[key];
                const imgBytes = imgObj?.object?.contents;
                if (imgBytes) {
                  const ocrResult = await Tesseract.recognize(imgBytes, "eng");
                  text += ocrResult.data.text + "\n";
                }
              }
            }
          }
        } else if (type?.mime.startsWith("image/")) {
          const ocrResult = await Tesseract.recognize(fileBuffer, "eng");
          text = ocrResult.data.text;
        } else {
          reject(new Error("Unsupported file type"));
        }

        resolve(text || "No text found in document");
      } catch (err) {
        reject(err);
      }
    });

    downloadStream.on("error", (err) => reject(err));
  });
}

module.exports = { extractTextFromPDF };












// const pdfParse = require("pdf-parse");
// const Tesseract = require("tesseract.js");
// const fileType = require("file-type"); // npm i file-type

// async function extractTextFromFile(fileId, gridfsBucket) {
//   if (!gridfsBucket) throw new Error("GridFSBucket not initialized yet");

//   const downloadStream = gridfsBucket.openDownloadStream(fileId);
//   const chunks = [];

//   return new Promise((resolve, reject) => {
//     downloadStream.on("data", (chunk) => chunks.push(chunk));
//     downloadStream.on("end", async () => {
//       try {
//         const fileBuffer = Buffer.concat(chunks);

//         // Detect file type
//         const type = await fileType.fromBuffer(fileBuffer);
//         let text = "";

//         if (type?.mime === "application/pdf") {
//           // Extract PDF text
//           const data = await pdfParse(fileBuffer);
//           text = data.text;
          

//         } 
        
//         else if (type?.mime.startsWith("image/")) {
//           // Extract text from image
//           const ocrResult = await Tesseract.recognize(fileBuffer, "eng");
//           text = ocrResult.data.text;
//         } 
        
//         else {
//           reject(new Error("Unsupported file type"));
//         }

//         if (!text || !text.trim()) text = "No text found in the document";
//         resolve(text);
//       } catch (err) {
//         reject(err);
//       }
//     });

//     downloadStream.on("error", (err) => reject(err));
//   });
// }

// module.exports = { extractTextFromFile };













// // const pdfParse = require("pdf-parse");
// // const Tesseract = require("tesseract.js");
// // const pdf2img = require("pdf-img-convert"); // convert PDF pages to images
// // const fileType = require("file-type"); // detect file type

// // async function extractTextFromPDF(fileId, gridfsBucket) {
// //   if (!gridfsBucket) throw new Error("GridFSBucket not initialized yet");

// //   const downloadStream = gridfsBucket.openDownloadStream(fileId);
// //   const chunks = [];

// //   return new Promise((resolve, reject) => {
// //     downloadStream.on("data", (chunk) => chunks.push(chunk));
// //     downloadStream.on("end", async () => {
// //       try {
// //         const fileBuffer = Buffer.concat(chunks);

// //         // Detect file type
// //         const type = await fileType.fromBuffer(fileBuffer);
// //         const mime = type?.mime || "";

// //         let text = "";

// //         if (mime === "application/pdf") {
// //           // Try extracting PDF text
// //           const data = await pdfParse(fileBuffer);
// //           text = data.text;

// //           // If no text, OCR PDF pages
// //           if (!text || !text.trim()) {
// //             const images = await pdf2img.convert(fileBuffer);
// //             for (const img of images) {
// //               const ocr = await Tesseract.recognize(img, "eng");
// //               text += ocr.data.text + "\n";
// //             }
// //           }
// //         } else if (mime.startsWith("image/")) {
// //           // OCR directly for image files
// //           const ocrResult = await Tesseract.recognize(fileBuffer, "eng");
// //           text = ocrResult.data.text;
// //         } else {
// //           return reject(new Error(`Unsupported file type: ${mime}`));
// //         }

// //         resolve(text);
// //       } catch (err) {
// //         reject(err);
// //       }
// //     });

// //     downloadStream.on("error", (err) => reject(err));
// //   });
// // }

// // module.exports = { extractTextFromPDF };










// // // const pdfParse = require("pdf-parse");
// // // const Tesseract = require("tesseract.js");
// // // const pdf2img = require("pdf-img-convert"); // convert PDF pages to images
// // // async function extractTextFromPDF(fileId, gridfsBucket) {
// // //   if (!gridfsBucket) throw new Error("GridFSBucket not initialized yet");

// // //   const downloadStream = gridfsBucket.openDownloadStream(fileId);
// // //   const chunks = [];

// // //   return new Promise((resolve, reject) => {
// // //     downloadStream.on("data", (chunk) => chunks.push(chunk));
// // //     downloadStream.on("end", async () => {
// // //       try {
// // //         const fileBuffer = Buffer.concat(chunks);

// // //         let data = await pdfParse(fileBuffer);
// // //         let text = data.text;

// // //         if (!text || text.trim().length === 0) {
// // //           const ocrResult = await Tesseract.recognize(fileBuffer, "eng");
// // //           text = ocrResult.data.text;
// // //         }

// // //         resolve(text);
// // //       } catch (err) {
// // //         reject(err);
// // //       }
// // //     });

// // //     downloadStream.on("error", (err) => reject(err));
// // //   });
// // // }

// // // module.exports = { extractTextFromPDF };
