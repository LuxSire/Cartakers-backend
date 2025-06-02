const { TranslationServiceClient } = require("@google-cloud/translate").v3;
const dotenv = require("dotenv");

dotenv.config();

// Load Google Cloud Project ID from environment variables
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = "global"; // Use "global" unless a specific region is needed

//  Initialize Google Translate API Client with explicit credentials
const client = new TranslationServiceClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Path to service account JSON file
});

/**
 *  Detect the language of a given text.
 * @param {string} text - The text to detect language.
 * @returns {Promise<string>} - Returns the detected language code (e.g., 'en', 'fr').
 */
async function detectLanguage(text) {
    try {
        const [response] = await client.detectLanguage({
            parent: `projects/${projectId}/locations/${location}`,
            content: text,
        });

        if (response.languages.length > 0) {
            return response.languages[0].language; // ✅ Corrected field name
        }
        return "en"; // Default to English if no language detected
    } catch (error) {
        console.error("❌ Error detecting language:", error.message);
        return "en"; // Return English on error
    }
}

/**
 *  Translate text to the user's preferred language.
 * @param {string} text - The text to translate.
 * @param {string} userId - The ID of the user (used to fetch their language preference).
 * @param {Function} getUserLanguage - Function to fetch the user's preferred language from the database.
 * @returns {Promise<string>} - Returns translated text.
 */
async function translateText(text, targetLanguage) {
    try {
        if (!targetLanguage) {
            console.warn("⚠️ Target language not provided. Defaulting to English.");
            return text; // Return original text if no target language is provided
        }

        // Detect the source language
        const sourceLanguage = await detectLanguage(text);

        // Avoid translation if both languages are the same
        if (sourceLanguage === targetLanguage) {
            return text;
        }

        // Perform translation
        const [response] = await client.translateText({
            parent: `projects/${projectId}/locations/${location}`,
            contents: [text],
            mimeType: "text/plain",
            sourceLanguageCode: sourceLanguage,
            targetLanguageCode: targetLanguage,
        });

        return response.translations[0].translatedText;
    } catch (error) {
        console.error("Error translating text:", error.message);
        return text; // Return original text on error
    }
}


// Export the functions
module.exports = {
    translateText,
};
