// OSTATECZNA, POPRAWIONA WERSJA PLIKU

const { TextToSpeechClient } = require('@google-cloud/text-to-speech');

exports.handler = async (event, context) => {
  // Sprawdzamy, czy zapytanie jest metodą POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Dozwolona jest tylko metoda POST' }),
    };
  }

  try {
    // Odczytujemy dane wysłane z front-endu (np. tekst do przeczytania)
    const { text, lang, rate } = JSON.parse(event.body);

    // Odczytujemy nasz sekretny klucz ze zmiennych środowiskowych Netlify
    // Używamy nazwy GOOGLE_CREDENTIALS_JSON, tak jak w Twojej działającej aplikacji
    const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_JSON;

    // Jeśli klucz nie istnieje w ustawieniach Netlify, zwracamy błąd
    if (!credentialsBase64) {
      throw new Error("Zmienna GOOGLE_CREDENTIALS_JSON nie została ustawiona w Netlify.");
    }

    // Krok 1: Dekodujemy klucz z Base64 do formatu tekstowego
    let credentialsJson = Buffer.from(credentialsBase64, 'base64').toString('utf-8');

    // Krok 2: Naprawiamy znaki nowej linii (entery), które psują parser JSON
    credentialsJson = credentialsJson.replace(/\n/g, '\\n');

    // Krok 3: Parsujemy "wyczyszczony" tekst JSON
    const credentials = JSON.parse(credentialsJson);

    // Inicjujemy klienta Google z naszymi danymi
    const client = new TextToSpeechClient({ credentials });

    // Tworzymy zapytanie do Google API
    const request = {
      input: { text: text },
      voice: { languageCode: lang, ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: rate },
    };

    // Wywołujemy API i pobieramy odpowiedź z dźwiękiem
    const [response] = await client.synthesizeSpeech(request);
    const audioContent = response.audioContent.toString('base64');

    // Zwracamy sukces i dane audio (w Base64) do front-endu
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
