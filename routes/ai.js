require('dotenv').config();
const express = require('express');
const { BlobServiceClient } = require('@azure/storage-blob');
const axios = require('axios');
const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js'); // Use legacy build for Node.js compatibility
const PDFParser = require("pdf2json");
const path = require('path');
const pdfParse = require('pdf-parse');
const pdf_fields= require('./pdf_fields'); // Assuming pdf-fields is a library for extracting fields from PDFs
const router = express.Router();

const accountName = process.env['AZURE_BLOB_NAME'];
const accountKey = process.env['AZURE_BLOB_ACCOUNT_KEY'];
const AZURE_STORAGE_CONNECTION_STRING = process.env['AZURE_STORAGE_CONNECTION_STRING'];
const CONTAINER_NAME = process.env['CONTAINER_NAME'];

// Azure AI Document Intelligence config
const AZURE_AI_ENDPOINT = process.env['AZURE_AI_ENDPOINT'];
const AZURE_AI_KEY = process.env['AZURE_AI_KEY'];
const AI_API_PATH = 'formrecognizer/documentModels/prebuilt-document:analyze?api-version=2023-07-31';


// Backend endpoint: request body should have { blobName: "example.pdf", fields: ["field1", "field2"] }
router.post('/Azure_process_pdf_fields', async (req, res) => {
  const { blobName, fields: requestedFields } = req.body;
  if (!blobName) return res.status(400).json({ error: 'blobName required' });
  if (!Array.isArray(requestedFields) || requestedFields.length === 0) {
    return res.status(400).json({ error: 'fields array required' });
  }

  try {
    // 1. Download PDF from Azure Blob Storage
    console.log('About to download blob:', blobName, 'from container:', CONTAINER_NAME);

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);

    // Store locally for API call
    const localPath = path.join(__dirname, blobName);
    const writer = fs.createWriteStream(localPath);
    await new Promise((resolve, reject) => {
      downloadBlockBlobResponse.readableStreamBody
        .pipe(writer)
        .on('finish', resolve)
        .on('error', reject);
    });
    console.log(`Stored blob ${blobName} locally at ${localPath}`);
    // 2. Call Azure AI Document Intelligence
    const pdfBuffer = fs.readFileSync(localPath);

    const aiResponse = await axios.post(
      AZURE_AI_ENDPOINT + AI_API_PATH,
      pdfBuffer,
      {
        headers: {
          'Content-Type': 'application/pdf',
          'Ocp-Apim-Subscription-Key': AZURE_AI_KEY
        }
      }
    );
    console.log(`Processed blob ${blobName} with Azure AI.`);
    // 3. Extract only requested fields and their values
    let extractedFields = {};
    const docResults = aiResponse.data?.analyzeResult?.documentResults;
    if (docResults && docResults.length > 0) {
      const fields = docResults[0].fields;
      if (fields) {
        for (const fieldName of requestedFields) {
          const fieldData = fields[fieldName];
          extractedFields[fieldName] =
            fieldData?.content ?? fieldData?.value ?? fieldData?.text ?? null;
        }
      }
    }
    fs.unlinkSync(localPath); // cleanup

    // Return only the requested fields
    return res.json({ success: true, fields: extractedFields });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Processing failed' });
  }
});

// Backend endpoint: request body should have { blobName: "example.pdf" }
router.post('/Azure_process_pdf', async (req, res) => {
  const blobName = req.body.blobName;
  if (!blobName) return res.status(400).json({ error: 'blobName required' });

  try {
    console.log('AZURE_STORAGE_CONNECTION_STRING:', AZURE_STORAGE_CONNECTION_STRING);
    console.log('CONTAINER_NAME:', CONTAINER_NAME);
    console.log('About to download blob:', blobName, 'from container:', CONTAINER_NAME);
    // 1. Download PDF from Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    console.log(`Downloaded blob ${blobName} successfully.`);
    // Store locally for API call
    const localPath = path.join(__dirname, blobName);
    const writer = fs.createWriteStream(localPath);
    await new Promise((resolve, reject) => {
      downloadBlockBlobResponse.readableStreamBody
        .pipe(writer)
        .on('finish', resolve)
        .on('error', reject);
    });
    console.log(`Stored blob ${blobName} locally at ${localPath}`);

    // 2. Call Azure AI Document Intelligence

        const pdfBuffer = fs.readFileSync(localPath);
        console.log('PDF buffer length:', pdfBuffer.length);
        console.log('PDF buffer type:', typeof pdfBuffer);
        console.log('About to read file at:', localPath);
        console.log('File exists:', fs.existsSync(localPath));
      
    
    const aiResponse = await axios.post(
      AZURE_AI_ENDPOINT + AI_API_PATH,
      pdfBuffer,
      {
        headers: {
          'Content-Type': 'application/pdf',
          'Ocp-Apim-Subscription-Key': AZURE_AI_KEY
        }
      }
    );
    
    console.log(`Processed blob ${blobName} with Azure AI.`);
      
    // 3. Extract all fields and their values
    let extractedFields = {};
    
    const docResults = aiResponse.data?.analyzeResult?.documentResults;
    if (docResults && docResults.length > 0) {
      const fields = docResults[0].fields;
      if (fields) {
        for (const [fieldName, fieldData] of Object.entries(fields)) {
          // Extract the best available value — 'content', 'value', or raw 'text'
          extractedFields[fieldName] =
            fieldData.content ?? fieldData.value ?? fieldData.text ?? null;
        }
      }
    }
      
    fs.unlinkSync(localPath); // cleanup
    console.log(`Extracted fields from blob ${blobName}:`, extractedFields);
// 5. Return the full extracted fields JSON to the client
    return res.json({ success: true, fields: extractedFields });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Processing failed' });
  }
});


router.post('/process_file', async (req, res) => {
  const blobName = req.body.blobName;
  if (!blobName) return res.status(400).json({ error: 'blobName required' });
  // --- Detect file type by extension ---
  const ext = path.extname(blobName).toLowerCase();
  let fileType = 'pdf';
  if (ext === '.xls' || ext === '.xlsx') fileType = 'xls';
  else if (ext === '.doc' || ext === '.docx') fileType = 'doc';

  try {
    console.log('AZURE_STORAGE_CONNECTION_STRING:', AZURE_STORAGE_CONNECTION_STRING);
    console.log('CONTAINER_NAME:', CONTAINER_NAME);
    console.log('About to download blob:', blobName, 'from container:', CONTAINER_NAME);
    // 1. Download PDF from Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    console.log(`Downloaded blob ${blobName} successfully.`);
    // Store locally for API call
    const localPath = path.join(__dirname, blobName);
    const writer = fs.createWriteStream(localPath);
    await new Promise((resolve, reject) => {
      downloadBlockBlobResponse.readableStreamBody
        .pipe(writer)
        .on('finish', resolve)
        .on('error', reject);
    });
    console.log(`Stored blob ${blobName} locally at ${localPath}`);

       // --- Treat file based on type ---
    if (fileType === 'pdf') {
      // PDF processing

        const pdfBuffer = fs.readFileSync(localPath);
        console.log('PDF buffer length:', pdfBuffer.length);
        console.log('PDF buffer type:', typeof pdfBuffer);
        console.log('About to read file at:', localPath);
        console.log('File exists:', fs.existsSync(localPath));
   

    // 2. Parse PDF with pdf2json and extract text with coordinates
    const textItems = await extractTextWithCoordinates(localPath);
      // Save textItems to a local JSON file for inspection
    fs.writeFileSync(
      path.join(__dirname, `${blobName}_textItems.json`),
      JSON.stringify(textItems, null, 2),
      'utf8'
    );
    const extractedfields=pdf_fields.buildExtractedArray(textItems);
    fs.unlinkSync(localPath); // cleanup
    console.log(`Extracted fields from blob ${blobName}:`, extractedfields);
// 5. Return the full extracted fields JSON to the client
    return res.json({ success: true, fields: extractedfields });

  } else if (fileType === 'xls') {
      // XLS/XLSX processing
      // Example: Use 'xlsx' npm package
      const xlsx = require('xlsx');
      const workbook = xlsx.readFile(localPath);
      const sheetNames = workbook.SheetNames;
      const data = {};
      sheetNames.forEach(name => {
        data[name] = xlsx.utils.sheet_to_json(workbook.Sheets[name], { defval: null });
      });
      fs.unlinkSync(localPath); // cleanup
      return res.json({ success: true, type: 'xls', data });

    } else if (fileType === 'doc') {
      // DOC/DOCX processing
      // Example: Use 'mammoth' npm package for docx, or 'officeparser' for doc
      let docText = '';
      if (ext === '.docx') {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ path: localPath });
        docText = result.value;
      } else {
        docText = 'DOC (not DOCX) parsing not implemented';
      }
      fs.unlinkSync(localPath); // cleanup
      return res.json({ success: true, type: 'doc', text: docText });
    } else {
      fs.unlinkSync(localPath); // cleanup
      return res.status(400).json({ error: 'Unsupported file type' });
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Processing failed' });
  }
});

async function pdfjs_dist_TextFromPDF(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}

// Helper function to extract text with coordinates using pdf2json
function extractTextWithCoordinates(filePath) {
    console.log('Extracting text with coordinates from PDF:', filePath);
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
      
      resolve(pdfData);
    });
    pdfParser.loadPDF(filePath);
  });
}
module.exports = router;