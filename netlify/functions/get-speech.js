// To jest poprawna zawartość pliku /netlify/functions/get-speech.js

const { TextToSpeechClient } = require('@google-cloud/text-to-speech');

exports.handler = async (event, context) => {
  // Sprawdzamy, czy zapytanie jest metodą POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Błąd: Dozwolona jest tylko metoda POST',
    };
  }

  try {
    // Odczytujemy dane wysłane z front-endu (np. tekst do przeczytania)
    const { text, lang, rate } = JSON.parse(event.body);

    // Odczytujemy nasz sekretny klucz ze zmiennych środowiskowych Netlify
    const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;

    // Jeśli klucz nie istnieje, zwracamy błąd
    if (!credentialsBase64) {
      throw new Error("Zmienna GOOGLE_CREDENTIALS_BASE64 nie została ustawiona w Netlify.");
    }

    // Dekodujemy klucz z Base64 do formatu JSON
    const credentialsJson = Buffer.from(credentialsBase64, 'base64').toString('utf-8');
    const credentials = JSON.parse(credentialsJson);

    // Inicjujemy klienta Google
    const client = new TextToSpeechClient({ credentials });

    // Tworzymy zapytanie do Google API
    const request = {
      input: { text: text },
      voice: { languageCode: lang, ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: rate },
    };

    // Wywołujemy API i pobieramy odpowiedź
    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent.toString('base64');

    // Zwracamy sukces i dane audio do front-endu
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioContent: audioContent }),
    };

  } catch (error) {
    console.error('Błąd w funkcji Netlify:', error);
    // Zwracamy błąd serwera, jeśli coś poszło nie tak
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Wystąpił wewnętrzny błąd serwera.', details: error.message }),
    };
  }
};