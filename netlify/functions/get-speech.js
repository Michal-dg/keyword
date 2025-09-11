// OSTATECZNA, POPRAWIONA WERSJA PLIKU /netlify/functions/get-speech.js

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

    // Odczytujemy nasz sekretny klucz ze zmiennych Netlify
    const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
    if (!credentialsBase64) {
      throw new Error("Zmienna GOOGLE_CREDENTIALS_BASE64 nie została ustawiona w Netlify.");
    }

    // --- KLUCZOWA ZMIANA ---
    // Zamiast dekodować i parsować, tworzymy obiekt credentials W INNY SPOSÓB.
    // Najpierw dekodujemy Base64 do stringa, który powinien być JSON-em.
    const credentialsJsonString = Buffer.from(credentialsBase64, 'base64').toString('utf-8');
    
    // Teraz parsujemy ten string do obiektu JSON.
    const credentials = JSON.parse(credentialsJsonString);
    
    // Inicjujemy klienta Google, przekazując mu gotowy obiekt.
    const client = new TextToSpeechClient({ credentials });
    
    // --- KONIEC KLUCZOWEJ ZMIANY ---

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
    // Dodajemy więcej szczegółów do logu błędu
    console.error('Błąd w funkcji Netlify:', error.message);
    console.error('Stack trace:', error.stack);
    if (error.details) console.error('Szczegóły błędu:', error.details);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Wystąpił wewnętrzny błąd serwera.', details: error.message }),
    };
  }
};