// /netlify/functions/get-speech.js
const textToSpeech = require('@google-cloud/text-to-speech');

// Parsowanie danych logowania ze zmiennej środowiskowej
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

// Inicjalizacja klienta z danymi konta usługi (Service Account)
const client = new textToSpeech.TextToSpeechClient({ credentials });

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { text, lang, rate } = JSON.parse(event.body);

        if (!text) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing "text" parameter' }) };
        }

        const request = {
            input: { text: text },
            voice: { languageCode: lang || 'en-US', ssmlGender: 'NEUTRAL' },
            audioConfig: { 
                audioEncoding: 'MP3',
                speakingRate: rate || 1.0
            },
        };

        const [response] = await client.synthesizeSpeech(request);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                audioContent: response.audioContent.toString('base64')
            }),
        };

    } catch (error) {
        console.error('Google Text-to-Speech function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to synthesize speech.', details: error.message }),
        };
    }
};