const admin = require("firebase-admin");
const fs = require("fs");
require('dotenv').config(); // Ensure .env is loaded
// Read service account path from .env
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Load service account JSON
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

module.exports = admin;