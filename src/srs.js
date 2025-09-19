/*  src/srs.js – core spaced-repetition */
import { db, auth, getToday, addDays } from './app.js'
import { collection, doc, onSnapshot, updateDoc, Timestamp } from 'firebase/firestore'
import { activeDeckId } from './decks.js'
import { updateFlashcardUI } from './ui/flashcard.js'

/* ——— stan ——— */
let words = []
let newQueue = []
let reviewQueue = []
let currentCard = null

/* —————————————————————————— */
function buildQueues() {
  const today = getToday()
  const unlearned = words.filter(w => !w.learned && (w.interval || 0) === 0)
  const due = words.filter(w => (w.interval || 0) > 0 && w.nextReview?.toDate() <= today)
  newQueue = unlearned
  reviewQueue = due.sort(() => Math.random() - 0.5)
}

export function startSession() {
  console.log('🎯 Rozpoczynam sesję uczenia się...');

  if (!activeDeckId) {
    console.error('❌ Brak aktywnej talii!');
    return;
  }

  console.log('📚 Aktywna talia:', activeDeckId);

  // WAŻNE: Pokaż sekcję review-screen i ukryj loading
  const reviewScreen = document.getElementById('review-screen');
  const loadingState = document.getElementById('loading-state');

  if (reviewScreen) {
    reviewScreen.classList.remove('hidden');
    console.log('✅ Pokazuję review-screen');
  } else {
    console.error('❌ Nie znaleziono #review-screen');
  }

  if (loadingState) {
    loadingState.classList.add('hidden');
    console.log('✅ Ukrywam loading-state');
  }

  const q = collection(db, 'decks', activeDeckId, 'words')
  onSnapshot(q, snap => {
    words = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    console.log('📖 Załadowano słów:', words.length);

    // DEBUG: Sprawdź strukturę pierwszego słowa
    if (words.length > 0) {
      console.log('🔍 Struktura pierwszego słowa:', words[0]);
      console.log('🔍 Dostępne pola:', Object.keys(words[0]));
    }

    buildQueues()
    console.log('📝 Nowe słowa:', newQueue.length, 'Do powtórki:', reviewQueue.length);

    // DEBUG: Sprawdź strukturę słów w kolejkach
    if (newQueue.length > 0) {
      console.log('🆕 Pierwsze nowe słowo:', newQueue[0]);
    }
    if (reviewQueue.length > 0) {
      console.log('🔄 Pierwsze słowo do powtórki:', reviewQueue[0]);
    }

    nextCard()
  })
}

function nextCard() {
  if (reviewQueue.length) {
    currentCard = reviewQueue.shift()
    console.log('🔄 Powtórka - cała karta:', currentCard);
    console.log('🔄 Słowo:', currentCard.word || currentCard.front || currentCard.english || 'BRAK');
  } else if (newQueue.length) {
    currentCard = newQueue.shift()
    console.log('🆕 Nowe słowo - cała karta:', currentCard);
    console.log('🆕 Słowo:', currentCard.word || currentCard.front || currentCard.english || 'BRAK');
  } else {
    // Kolejka pusta → koniec sesji
    console.log('🎉 Koniec sesji!');
    showSummary()
    return
  }

  console.log('🎯 Wywołuję updateFlashcardUI z kartą:', currentCard);
  updateFlashcardUI(currentCard)   // odświeżenie widoku karty
}

/* —————————————————————————— */
/*  Proste podsumowanie sesji                     */
function showSummary() {
  console.log('📊 Pokazuję podsumowanie sesji');

  // ukryj sekcję nauki
  const reviewScreen = document.getElementById('review-screen');
  if (reviewScreen) {
    reviewScreen.classList.add('hidden');
  }

  // pokaż loading state z komunikatem o zakończeniu
  const loadingState = document.getElementById('loading-state');
  if (loadingState) {
    loadingState.classList.remove('hidden');
    loadingState.innerHTML = `
      <div class="text-center p-8">
        <div class="text-4xl mb-4">🎉</div>
        <h2 class="text-xl font-bold text-green-600 mb-2">Świetna robota!</h2>
        <p class="text-slate-600">Ukończyłeś sesję uczenia się.</p>
        <p class="text-sm text-slate-500 mt-2">Przerobiłeś ${words.length} słów w tej talii.</p>
        <button id="restart-session" class="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg">
          Rozpocznij ponownie
        </button>
      </div>
    `;

    // Dodaj event listener do przycisku restart
    const restartBtn = loadingState.querySelector('#restart-session');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        loadingState.classList.add('hidden');
        startSession();
      });
    }
  }

  // opcjonalnie wyzeruj kolejki na następną sesję
  newQueue = []
  reviewQueue = []
}


/* —————————————————————————— */
/*  public API do flashcard-UI  */
export function processAnswer(difficulty) {
  if (!currentCard) {
    console.error('❌ Brak aktualnej karty!');
    return;
  }

  console.log('⚡ Przetwarzam odpowiedź, trudność:', difficulty);

  /* 1 = again, 3 = good, 5 = easy */
  if (difficulty === 1) {
    // Again - resetuj interwał, dodaj z powrotem do kolejki
    currentCard.interval = 0
    reviewQueue.unshift(currentCard)
    console.log('🔴 Again - słowo wraca do kolejki');
  } else if (difficulty === 3) {
    // Good - standardowy algorytm SRS
    const newInterval = Math.max(1, Math.floor((currentCard.interval || 0) * 2.5));
    currentCard.interval = newInterval;
    currentCard.nextReview = Timestamp.fromDate(addDays(getToday(), newInterval));
    console.log('🟢 Good - następna powtórka za', newInterval, 'dni');
  } else if (difficulty === 5) {
    // Easy - dłuższy interwał
    const newInterval = Math.max(4, Math.floor((currentCard.interval || 1) * 3.5));
    currentCard.interval = newInterval;
    currentCard.nextReview = Timestamp.fromDate(addDays(getToday(), newInterval));
    console.log('🔵 Easy - następna powtórka za', newInterval, 'dni');
  }

  // Zapisz zmiany w bazie danych
  if (difficulty !== 1) { // Nie zapisuj dla "Again"
    updateDoc(doc(db, 'decks', activeDeckId, 'words', currentCard.id), {
      interval: currentCard.interval,
      nextReview: currentCard.nextReview || null
    }).then(() => {
      console.log('💾 Zapisano zmiany w bazie danych');
    }).catch(err => {
      console.error('❌ Błąd zapisu:', err);
    });
  }

  nextCard()
}