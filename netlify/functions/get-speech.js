// To jest plik /netlify/functions/get-speech.js

// Wymagane biblioteki (upewnij się, że masz je w package.json)
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');

exports.handler = async (event, context) => {
  // Krok 1: Sprawdź, czy zapytanie jest metodą POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405, // Method Not Allowed
      body: 'Błąd: Dozwolona jest tylko metoda POST',
    };
  }

  try {
    // Krok 2: Odczytaj dane wysłane z front-endu
    const { text, lang, rate } = JSON.parse(event.body);

    // --- POCZĄTEK TWOJEGO KODU DO OBSŁUGI GOOGLE ---
    // (Wklej tutaj swój kod, który łączy się z Google i generuje dźwięk)
    // Poniżej jest przykład, dostosuj go do swojego kodu

    // 1. Zdekoduj dane uwierzytelniające z Base64
    const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
    const credentialsJson = Buffer.from(credentialsBase64, 'base64').toString('ascii');
    const credentials = JSON.parse(credentialsJson);

    // 2. Zainicjuj klienta Google
    const client = new TextToSpeechClient({ credentials });

    // 3. Stwórz zapytanie do Google API
    const request = {
      input: { text: text },
      voice: { languageCode: lang, ssmlGender: 'NEUTRAL' }, // Możesz to dostosować
      audioConfig: { audioEncoding: 'MP3', speakingRate: rate },
    };

    // 4. Wywołaj API i pobierz odpowiedź
    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent.toString('base64');

    // --- KONIEC TWOJEGO KODU DO OBSŁUGI GOOGLE ---


    // Krok 3: Zwróć sukces i dane audio do front-endu
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioContent: audioContent }),
    };

  } catch (error) {
    console.error('Błąd w funkcji Netlify:', error);
    // Krok 4: Zwróć błąd serwera, jeśli coś poszło nie tak
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Wystąpił wewnętrzny błąd serwera.' }),
    };
  }
};