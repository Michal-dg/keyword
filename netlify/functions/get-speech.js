// OSTATECZNA WERSJA PLIKU /netlify/functions/get-speech.js

const { TextToSpeechClient } = require('@google-cloud/text-to-speech');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Dozwolona jest tylko metoda POST' }),
    };
  }

  try {
    const { text, lang, rate } = JSON.parse(event.body);

    const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
    if (!credentialsBase64) {
      throw new Error("Zmienna GOOGLE_CREDENTIALS_BASE64 nie została ustawiona w Netlify.");
    }

    // Krok 1: Dekodujemy klucz z Base64 do formatu tekstowego
    let credentialsJson = Buffer.from(credentialsBase64, 'base64').toString('utf-8');

    // --- OTO OSTATECZNA POPRAWKA ---
    // Ta linijka zamienia prawdziwe znaki nowej linii (entery) na tekst "\\n",
    // co jest poprawnym formatem dla parsera JSON.
    credentialsJson = credentialsJson.replace(/\n/g, '\\n');
    // --------------------------------

    // Krok 2: Parsujemy "wyczyszczony" tekst JSON
    const credentials = JSON.parse(credentialsJson);

    // Inicjujemy klienta Google z naszymi danymi
    const client = new TextToSpeechClient({ credentials });

    const request = {
      input: { text: text },
      voice: { languageCode: lang, ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: rate },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent.toString('base64');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioContent: audioContent }),
    };

  } catch (error) {
    console.error('Błąd w funkcji Netlify:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Wystąpił wewnętrzny błąd serwera.', details: error.message }),
    };
  }
};
