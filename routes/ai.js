require('dotenv').config();
const pool = require('../dbconfig'); // Ensure this exports the mysql2/promise pool
const express = require('express');
const { BlobServiceClient } = require('@azure/storage-blob');
const axios = require('axios');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const accountName = process.env['AZURE_BLOB_NAME'];
const accountKey = process.env['AZURE_BLOB_ACCOUNT_KEY'];
const AZURE_STORAGE_CONNECTION_STRING = process.env['AZURE_STORAGE_CONNECTION_STRING'];
const CONTAINER_NAME = process.env['CONTAINER_NAME'];

// Azure AI Document Intelligence config
const AZURE_AI_ENDPOINT = 'https://<your-resource>.cognitiveservices.azure.com/';
const AZURE_AI_KEY = '<your-ai-api-key>';
const AI_API_PATH = 'formrecognizer/documentModels/prebuilt-document:analyze?api-version=2023-07-31';


// Backend endpoint: request body should have { blobName: "example.pdf" }
app.post('/api/process_pdf', async (req, res) => {
  const blobName = req.body.blobName;
  if (!blobName) return res.status(400).json({ error: 'blobName required' });

  try {
    // 1. Download PDF from Azure Blob Storage
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
    fs.unlinkSync(localPath); // cleanup


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

// 5. Return the full extracted fields JSON to the client
    return res.json({ success: true, fields: extractedFields });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Processing failed' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
