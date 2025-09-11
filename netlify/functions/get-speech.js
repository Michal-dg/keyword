// OSTATECZNA WERSJA #3 - PROSTA, BEZ BASE64

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

    // --- KLUCZOWA ZMIANA ---
    // Odczytujemy zmienną, która zawiera CZYSTY TEKST JSON
    const credentialsJsonString = process.env.GOOGLE_CREDENTIALS_JSON;
    if (!credentialsJsonString) {
      throw new Error("Zmienna GOOGLE_CREDENTIALS_JSON nie została ustawiona w Netlify.");
    }
    
    // Parsujemy ten tekst JSON bezpośrednio
    const credentials = JSON.parse(credentialsJsonString);
    // --- KONIEC ZMIANY ---

    const client = new TextToSpeechClient({ credentials });

    const request = {
      input: { text: text },
      voice: { languageCode: lang, ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: rate },
    };

    const [response] = await client.synthesizeSpeech(request);
    // Zwracamy dźwięk w Base64, tak jak wymaga tego front-end
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
