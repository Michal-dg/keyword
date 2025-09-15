  // ===================================================================================
  // KEYWORD APP - FIREBASE VERSION (FULL)
  // ===================================================================================
  document.addEventListener('DOMContentLoaded', async () => {
    // --- FIREBASE CONFIG ---
    const firebaseConfig = {
      apiKey: "AIzaSyDI4cJBA8rw2DDav440fk-0erx3ZoG-41o",
      authDomain: "englishapp-ff793.firebaseapp.com",
      projectId: "englishapp-ff793",
      storageBucket: "englishapp-ff793.appspot.com",
      messagingSenderId: "851511819588",
      appId: "1:851511819588:web:c91e67102c7338bba62b11",
      measurementId: "G-9J5Q0E7ZR3"
    };

    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();

    // Offline (Firestore persistence)
    try {
      await db.enablePersistence({
        synchronizeTabs: true
      });
    } catch (e) {
      console.warn('Offline persistence not enabled:', e.code || e.message);
    }

    // --- CONSTANTS & HELPERS ---
    const ENGLISH_ACCENT = 'en-GB';
    const REVIEW_IGNORE_DATE = true;
    const DAILY_NEW_LIMIT = Infinity;

    const getToday = () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const addDays = (date, days) => {
      const r = new Date(date);
      r.setDate(r.getDate() + days);
      return r;
    };

    const formatDate = (date) => date.toLocaleDateString('en-GB');

    // --- DOM ELEMENTS ---
    const mainContent = document.getElementById('main-content');
    const loadingState = document.getElementById('loading-state');
    const showAuthBtn = document.getElementById('show-auth-btn');
    const showDecksBtn = document.getElementById('show-decks-btn');
    const showLearnedWordsBtn = document.getElementById('show-learned-words-btn');
    const showStatsBtn = document.getElementById('show-stats-btn');
    const showStoriesBtn = document.getElementById('show-stories-btn');
    const showReviewBtn = document.getElementById('show-review-btn');
    const authModal = document.getElementById('auth-modal');
    const decksModal = document.getElementById('decks-modal');
    const learnedWordsModal = document.getElementById('learned-words-modal');
    const statsModal = document.getElementById('stats-modal');
    const storiesModal = document.getElementById('stories-modal');
    const storyViewerModal = document.getElementById('story-viewer-modal');
    const addWordModal = document.getElementById('add-word-modal');
    const reviewModal = document.getElementById('review-modal');
    const decksListEl = document.getElementById('decks-list');
    const addDeckForm = document.getElementById('add-deck-form');
    const authForm = document.getElementById('auth-form');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const authErrorMessage = document.getElementById('auth-error-message');
    const authSuccessMessage = document.getElementById('auth-success-message');
    const authLoginSuccess = document.getElementById('auth-login-success');
    const userInfo = document.getElementById('user-info');
    const userEmailDisplay = document.getElementById('user-email-display');
    const authIconUser = document.getElementById('auth-icon-user');
    const authIconLogout = document.getElementById('auth-icon-logout');
    const verifyEmailContainer = document.getElementById('verify-email-container');
    const verifyEmailAddress = document.getElementById('verify-email-address');
    const resendVerificationButton = document.getElementById('resend-verification-button');
    const activeDeckNameEl = document.getElementById('active-deck-name');
    const resetProgressBtn = document.getElementById('reset-progress');

    // Learning UI
    const learningState = document.getElementById('learning-state');
    const summaryState = document.getElementById('summary-state');
    const testState = document.getElementById('test-state');
    const testSummaryState = document.getElementById('test-summary-state');
    const startNewSessionEarlyBtn = document.getElementById('start-new-session-early');
    const newCountEl = document.getElementById('new-count');
    const reviewCountEl = document.getElementById('review-count');
    const learnedCountEl = document.getElementById('learned-count');
    const flashcard = document.getElementById('flashcard');
    const cardRankEl = document.getElementById('card-rank');
    const cardEnglishEl = document.getElementById('card-english');
    const cardPolishEl = document.getElementById('card-polish');
    const cardExampleEnEl = document.getElementById('card-example-en');
    const cardExamplePlEl = document.getElementById('card-example-pl');
    const cardImageEl = document.getElementById('card-image');
    const showAnswerBtn = document.getElementById('show-answer-btn');
    const difficultyButtons = document.getElementById('difficulty-buttons');
    const speakBtnFront = document.getElementById('speak-btn-front');
    const speakBtnBack = document.getElementById('speak-btn-back');
    const imageUploadInput = document.getElementById('image-upload-input');
    const addImageBtn = document.getElementById('add-image-btn');
    const headerImageEl = document.getElementById('header-image');
    const uploadHeaderBtn = document.getElementById('upload-header-btn');
    const headerUploadInput = document.getElementById('header-upload-input');
    const uploadGlobalBgBtn = document.getElementById('upload-global-bg-btn');
    const globalBgUploadInput = document.getElementById('global-bg-upload-input');
    const cardFrontBgEl = document.getElementById('card-front-bg');
    const uploadStoryBgBtn = document.getElementById('upload-story-bg-btn');
    const storyBgUploadInput = document.getElementById('story-bg-upload-input');
    const storyViewerBgContainer = document.getElementById('story-viewer-bg-container');

    // Deck Details
    const deckDetailsView = document.getElementById('deck-details-view');
    const deckDetailsName = document.getElementById('deck-details-name');
    const deckDetailsWords = document.getElementById('deck-details-words');
    const deckDetailsSourceBadge = document.getElementById('deck-details-source-badge');
    const openAddWordModalBtn = document.getElementById('open-add-word-modal-btn');

    // Add Words Modal
    const addWordForm = document.getElementById('add-word-form');
    const addWordDeckName = document.getElementById('add-word-deck-name');
    const bulkWordsInput = document.getElementById('bulk-words-input');

    // Learned Words Modal
    const learnedWordsList = document.getElementById('learned-words-list');
    const learnedWordsCountEl = document.getElementById('learned-words-count');

    // Stats
    const statsChartCanvas = document.getElementById('stats-chart');
    let statsChart = null;

    // Stories
    const storiesListEl = document.getElementById('stories-list');
    const addStoryBtn = document.getElementById('add-story-btn');
    const storyUploadInput = document.getElementById('story-upload-input');
    const storyViewerTitle = document.getElementById('story-viewer-title');
    const storyViewerContent = document.getElementById('story-viewer-content');
    const listenFullStoryBtn = document.getElementById('listen-full-story-btn');
    const speedSlider = document.getElementById('speed-slider');

    // Test Mode
    const testQuestion = document.getElementById('test-question');
    const testAnswers = document.getElementById('test-answers');
    const testNextBtn = document.getElementById('test-next-btn');
    const testCurrentQuestion = document.getElementById('test-current-question');
    const testTotalQuestions = document.getElementById('test-total-questions');
    const testScoreEl = document.getElementById('test-score');
    const testSummaryTotalEl = document.getElementById('test-summary-total');
    const backToMainMenuBtn = document.getElementById('back-to-main-menu-btn');

    // --- STATE ---
    let unsubscribeDecks = null;
    let unsubscribeWords = null;
    let activeDeckId = null;
    let activeDeckName = 'None';
    let words = [];
    let newQueue = [];
    let reviewQueue = [];
    let currentCard = null;
    let sessionWordCounter = 0;
    let sessionCompleted = false;
    let globalFlashcardBgUrl = null;

    // Stories state
    let storySentences = [];
    let currentSentenceIndex = 0;
    let isStoryPlaying = false;
    const synth = window.speechSynthesis;
    let currentAudio = null;
    let storySpeechRate = 1.0;

    // Test state
    let testWords = [];
    let currentTestQuestionIndex = 0;
    let testScore = 0;
    let testDirection = 'en2pl';

    // --- MODALS ---
    function openModal(modal) {
      if (!modal) return;
      modal.classList.remove('pointer-events-none', 'opacity-0');
      modal.querySelector('.modal-content')?.classList.remove('scale-95');
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.add('pointer-events-none', 'opacity-0');
      modal.querySelector('.modal-content')?.classList.add('scale-95');
    }

    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });

    document.querySelectorAll('.modal .close-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
    });

    // --- SPEECH ---
    // --- SPEECH ---
function nativeSpeak(text, lang = ENGLISH_ACCENT, rate = 1.0, onEnd) {
  if (!text || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  // wycisz ewentualne poprzednie dźwięki
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (synth.speaking) synth.cancel();

  // spróbuj wybrać głos Google z akcentem UK
  const voices = speechSynthesis.getVoices();
  const googleUk = voices.find(
    v => v.lang === lang && v.name.toLowerCase().includes('google')
  );

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang  = lang;          // 'en-GB' → brytyjski
  utter.voice = googleUk || null;
  utter.rate  = rate;
  utter.onend = () => onEnd?.();

  synth.speak(utter);
}

    async function speak(text, lang = ENGLISH_ACCENT, rate = 1.0, onEnd) {
      // Fallback to Web Speech for now
      nativeSpeak(text, lang, rate, onEnd);
    }

    // --- AUTH FLOW ---
    showAuthBtn.addEventListener('click', () => {
      const user = auth.currentUser;
      authErrorMessage.classList.add('hidden');
      authSuccessMessage.classList.add('hidden');
      authLoginSuccess.classList.add('hidden');

      if (user) {
        userInfo.classList.remove('hidden');
        authForm.classList.add('hidden');
        userEmailDisplay.textContent = user.email || '';
      } else {
        userInfo.classList.add('hidden');
        authForm.classList.remove('hidden');
      }
      openModal(authModal);
    });

    registerBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      authErrorMessage.classList.add('hidden');
      const email = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-password').value;

      try {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        await cred.user.sendEmailVerification();
        authForm.classList.add('hidden');
        authSuccessMessage.classList.remove('hidden');
      } catch (err) {
        authErrorMessage.textContent = err.message || 'Register failed';
        authErrorMessage.classList.remove('hidden');
      }
    });

    loginBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      authErrorMessage.classList.add('hidden');
      const email = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-password').value;

      try {
        await auth.signInWithEmailAndPassword(email, password);
        authLoginSuccess.textContent = 'Logged in successfully.';
        authLoginSuccess.classList.remove('hidden');
        setTimeout(() => {
          authLoginSuccess.classList.add('hidden');
          closeModal(authModal);
        }, 800);
      } catch (err) {
        authErrorMessage.textContent = err.message || 'Login failed';
        authErrorMessage.classList.remove('hidden');
      }
    });

    logoutBtn.addEventListener('click', async () => {
      await auth.signOut();
      closeModal(authModal);
    });

    resendVerificationButton?.addEventListener('click', async () => {
      const user = auth.currentUser;
      if (!user) return;
      await user.sendEmailVerification();
      alert('Wysłano ponownie e-mail weryfikacyjny.');
    });

    // --- DECKS CRUD & RENDER ---
    async function renderDecks() {
      const user = auth.currentUser;
      if (!user) {
        decksListEl.innerHTML = '<p class="text-slate-500 text-center p-4">Zaloguj się, aby zobaczyć swoje talie.</p>';
        return;
      }

      decksListEl.innerHTML = '<p class="text-slate-500 text-center p-4">Ładowanie talii...</p>';
      if (unsubscribeDecks) unsubscribeDecks();

      unsubscribeDecks = db.collection('decks')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .onSnapshot(async snapshot => {
          if (snapshot.empty) {
            decksListEl.innerHTML = '<p class="text-slate-500 text-center p-4">Nie masz jeszcze żadnych talii.</p>';
            return;
          }

          decksListEl.innerHTML = '';
          snapshot.forEach(doc => {
            const deck = {
              id: doc.id,
              ...doc.data()
            };
            const deckEl = document.createElement('div');
            deckEl.className = 'p-3 border-b border-slate-100';
            deckEl.innerHTML = `
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-bold truncate ${activeDeckId === deck.id ? 'text-sky-600' : ''}">${deck.name}</p>
                  <p class="text-xs text-slate-500">Deck ID: ${deck.id}</p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <button class="select-deck-btn px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded">Ucz się</button>
                  <button class="view-words-btn px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded">Słówka</button>
                  <button class="rename-btn px-2 py-1 text-slate-500 hover:text-sky-600">✏️</button>
                  <button class="delete-btn px-2 py-1 text-slate-500 hover:text-red-600">🗑️</button>
                </div>
              </div>
            `;

            deckEl.querySelector('.select-deck-btn').addEventListener('click', async () => {
              await setActiveDeck(deck.id, deck.name);
              closeModal(decksModal);
            });

            deckEl.querySelector('.view-words-btn').addEventListener('click', () => {
              showDeckDetails(deck);
            });

            deckEl.querySelector('.rename-btn').addEventListener('click', async () => {
              const newName = prompt('Nowa nazwa talii:', deck.name);
              if (newName && newName.trim() && newName.trim() !== deck.name) {
                await db.collection('decks').doc(deck.id).update({
                  name: newName.trim()
                });
                if (deck.id === activeDeckId) {
                  activeDeckName = newName.trim();
                  activeDeckNameEl.textContent = activeDeckName;
                }
              }
            });

            deckEl.querySelector('.delete-btn').addEventListener('click', async () => {
              if (!confirm(`Usunąć talię "${deck.name}" i wszystkie jej słowa?`)) return;

              // Delete words
              const wordsSnap = await db.collection('decks').doc(deck.id).collection('words').get();
              const batchSize = 400;
              let batch = db.batch();
              let counter = 0;
              wordsSnap.forEach(wd => {
                batch.delete(wd.ref);
                counter++;
                if (counter % batchSize === 0) {
                  batch.commit();
                  batch = db.batch();
                }
              });
              await batch.commit();

              // Delete deck
              await db.collection('decks').doc(deck.id).delete();

              if (activeDeckId === deck.id) {
                activeDeckId = null;
                activeDeckName = 'None';
                activeDeckNameEl.textContent = activeDeckName;
                words = [];
                startSession();
              }
            });

            decksListEl.appendChild(deckEl);
          });
        }, err => {
          console.error('Decks error:', err);
          decksListEl.innerHTML = `<p class="text-red-500 text-center p-4">Błąd ładowania talii.</p>`;
        });
    }

    addDeckForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) return alert('Musisz być zalogowany.');

      const deckNameInput = document.getElementById('new-deck-name');
      const name = deckNameInput.value.trim();
      if (!name) return;

      await db.collection('decks').add({
        name,
        userId: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      deckNameInput.value = '';
    });

    async function setActiveDeck(deckId, deckName) {
      activeDeckId = deckId;
      activeDeckName = deckName || 'Deck';
      activeDeckNameEl.textContent = activeDeckName;
      await subscribeWordsForActiveDeck();
    }

    async function showDeckDetails(deck) {
      deckDetailsView.classList.remove('hidden');
      deckDetailsName.textContent = deck.name;
      deckDetailsSourceBadge.textContent = 'Cloud';
      deckDetailsSourceBadge.className = 'text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700';
      deckDetailsWords.innerHTML = '<p class="text-slate-500 text-sm">Ładowanie...</p>';

      const wordsSnap = await db.collection('decks').doc(deck.id).collection('words').orderBy('createdAt', 'asc').get();

      if (wordsSnap.empty) {
        deckDetailsWords.innerHTML = '<p class="text-slate-500 text-sm">Brak słów w tej talii.</p>';
        return;
      }

      deckDetailsWords.innerHTML = '';
      wordsSnap.forEach(doc => {
        const w = doc.data();
        const line = document.createElement('div');
        line.className = 'text-sm py-1';
        line.textContent = `${w.english} - ${w.polish}`;
        deckDetailsWords.appendChild(line);
      });
      openModal(decksModal);
    }

    openAddWordModalBtn.addEventListener('click', () => {
      if (!activeDeckId) {
        alert('Najpierw wybierz talię.');
        return;
      }
      addWordDeckName.textContent = activeDeckName || 'Deck';
      bulkWordsInput.value = '';
      closeModal(decksModal);
      openModal(addWordModal);
    });

    addWordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) return alert('Musisz być zalogowany.');
      if (!activeDeckId) return alert('Brak aktywnej talii.');

      const text = (bulkWordsInput.value || '').trim();
      if (!text) return;

      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const batchSize = 400;
      let batch = db.batch();
      let counter = 0;
      const wordsCol = db.collection('decks').doc(activeDeckId).collection('words');

      for (const line of lines) {
        const parts = line.split(';').map(p => p.trim());
        if (parts.length !== 2 && parts.length !== 4) {
          alert(`Nieprawidłowy format: "${line}". Użyj "ang;pl" albo "ang;pl;przykład_en;przykład_pl".`);
          return;
        }

        const [english, polish, example_en = '', example_pl = ''] = parts;
        const ref = wordsCol.doc();
        batch.set(ref, {
          english,
          polish,
          example_en,
          example_pl,
          imageUrl: null,
          interval: 0,
          easeFactor: 2.5,
          nextReview: firebase.firestore.Timestamp.fromDate(getToday()),
          successCount: 0,
          learnedDate: null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        counter++;
        if (counter % batchSize === 0) {
          await batch.commit();
          batch = db.batch();
        }
      }
      await batch.commit();
      closeModal(addWordModal);
      alert(`${counter} słów dodano do "${activeDeckName}".`);
    });

    // --- WORDS SUBSCRIBE ---
   async function subscribeWordsForActiveDeck() {
  if (!activeDeckId) {
    words = [];
    startSession();          // pokaż pusty ekran „Wybierz talię…”
    return;
  }

  // wyłącz poprzedni listener (jeśli zmieniasz talię)
  if (unsubscribeWords) unsubscribeWords();

  let firstSnapshot = true;  // ← flaga: tylko pierwsze dane uruchomią sesję

  unsubscribeWords = db
    .collection('decks')
    .doc(activeDeckId)
    .collection('words')
    .orderBy('createdAt', 'asc')
    .onSnapshot(
      snap => {
        // aktualizuj lokalną tablicę
        words = snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));

        // uruchom tryb nauki tylko raz — przy pierwszym odebraniu danych
        if (firstSnapshot) {
          startSession();
          firstSnapshot = false;
        }
        // przy kolejnych aktualizacjach NIE resetujemy sesji,
        // dzięki czemu kolejka kart się nie zeruje
      },
      err => console.error('Words snapshot error:', err)
    );
}

    // --- LEARNING FLOW (SRS) ---
    function updateLearnedCount() {
      const count = words.filter(w => (w.successCount || 0) >= 3).length;
      learnedCountEl.textContent = count;
    }

    function buildQueues(reviewWords = null) {
      if (reviewWords) {
        newQueue = [];
        reviewQueue = [...reviewWords].sort(() => Math.random() - 0.5);
        return;
      }
      const today = getToday();
      const unlearned = words.filter(w => (w.interval || 0) === 0);
      const due = words.filter(w => (w.interval || 0) > 0 && (REVIEW_IGNORE_DATE || (w.nextReview && w.nextReview.toDate() <= today)));
      newQueue = unlearned.slice(0, DAILY_NEW_LIMIT);
      reviewQueue = due.sort(() => Math.random() - 0.5);
    }

    function startSession(reviewWords = null) {
      sessionWordCounter = 0;
      sessionCompleted = false;
      learningState.classList.remove('hidden');
      testState.classList.add('hidden');
      testSummaryState.classList.add('hidden');
      summaryState.classList.add('hidden');

      if (!activeDeckId) {
        loadingState.innerHTML = '<p class="text-center text-slate-500 p-8">Select or create a deck to start learning.</p>';
        loadingState.style.display = 'block';
        learningState.classList.add('hidden');
        return;
      }

      loadingState.style.display = 'none';
      buildQueues(reviewWords);

      if (reviewQueue.length === 0 && newQueue.length === 0) {
        showSummary();
      } else {
        nextCard();
        updateCounts();
      }
    }

    function nextCard() {
      flashcard.classList.remove('is-flipped');
      difficultyButtons.classList.add('hidden');
      showAnswerBtn.classList.remove('hidden');

      setTimeout(() => {
        if (reviewQueue.length > 0) {
          currentCard = reviewQueue.shift();
          currentCard.type = 'review';
        } else if (newQueue.length > 0) {
          currentCard = newQueue.shift();
          currentCard.type = 'new';
          currentCard.isLearning = true;
        } else {
          currentCard = null;
        }

        if (currentCard) {
          updateCardUI();
          updateCounts();
        } else {
          showSummary();
        }
      }, 300);
    }

    function updateCardUI() {
      if (globalFlashcardBgUrl) cardFrontBgEl.src = globalFlashcardBgUrl;
      cardRankEl.textContent = `#${currentCard.id}`;
      cardEnglishEl.textContent = currentCard.english || '';
      cardPolishEl.textContent = currentCard.polish || '';
      cardExampleEnEl.textContent = currentCard.example_en || '';
      cardExamplePlEl.textContent = currentCard.example_pl || '';

      if (currentCard.imageUrl) {
        cardImageEl.src = currentCard.imageUrl;
        cardImageEl.style.display = 'block';
      } else {
        cardImageEl.style.display = 'none';
      }
    }

    function updateCounts() {
      const newCurrent = (currentCard && currentCard.type === 'new') ? 1 : 0;
      const reviewCurrent = (currentCard && currentCard.type === 'review') ? 1 : 0;
      newCountEl.textContent = newQueue.length + newCurrent;
      reviewCountEl.textContent = reviewQueue.length + reviewCurrent;
      updateLearnedCount();
    }

    function showSummary() {
      learningState.classList.add('hidden');
      testState.classList.add('hidden');
      testSummaryState.classList.add('hidden');
      summaryState.classList.remove('hidden');

      const cardsRemaining = newQueue.length > 0 || reviewQueue.length > 0;
      const summaryText = document.querySelector('#summary-state p');
      const keepGoingBtn = document.getElementById('start-new-session-early');

      if (cardsRemaining) {
        summaryText.textContent = "Masz świetną passę. Tak trzymaj!";
        keepGoingBtn.textContent = "Keep going!";
        keepGoingBtn.disabled = false;
        sessionCompleted = false;
      } else {
        summaryText.textContent = "Gratulacje! Ukończyłeś całą talię :)";
        keepGoingBtn.textContent = "Start again.";
        keepGoingBtn.disabled = false;
        sessionCompleted = true;
      }
    }

    async function processAnswer(difficulty) {
      if (!currentCard) return;

      const ref = db.collection('decks').doc(activeDeckId).collection('words').doc(currentCard.id);

      if (difficulty === 1) { // Again
        currentCard.interval = 0;
        reviewQueue.unshift(currentCard);
      } else if (difficulty === 3) { // Good
        currentCard.isLearning = false;
        currentCard.interval = Math.max(1, (currentCard.interval || 0) * (currentCard.easeFactor || 2.5));
        currentCard.easeFactor = (currentCard.easeFactor || 2.5) + 0.1;
        currentCard.successCount = (currentCard.successCount || 0) + 1;
        if (currentCard.successCount === 3 && !currentCard.learnedDate) {
          currentCard.learnedDate = firebase.firestore.Timestamp.fromDate(getToday());
        }
      }

      currentCard.nextReview = firebase.firestore.Timestamp.fromDate(addDays(getToday(), Math.round(currentCard.interval || 0)));

      await ref.update({
        interval: currentCard.interval || 0,
        easeFactor: currentCard.easeFactor || 2.5,
        nextReview: currentCard.nextReview || null,
        successCount: currentCard.successCount || 0,
        learnedDate: currentCard.learnedDate || null
      });

      sessionWordCounter++;
      if (sessionWordCounter > 0 && sessionWordCounter % 100 === 0 && (newQueue.length > 0 || reviewQueue.length > 0)) {
        showSummary();
      } else {
        nextCard();
      }
    }

    // Events: SRS UI
    showAnswerBtn.addEventListener('click', () => {
      flashcard.classList.add('is-flipped');
      showAnswerBtn.classList.add('hidden');
      difficultyButtons.classList.remove('hidden');
      if (currentCard) {
        setTimeout(() => speak(currentCard.example_en, ENGLISH_ACCENT, 1.0), 400);
      }
    });

    difficultyButtons.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (btn && btn.dataset.difficulty) {
        processAnswer(parseInt(btn.dataset.difficulty, 10));
      }
    });

    speakBtnFront.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentCard) speak(currentCard.english, ENGLISH_ACCENT, 1.0);
    });

    speakBtnBack.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentCard) speak(currentCard.example_en, ENGLISH_ACCENT, 1.0);
    });

    startNewSessionEarlyBtn.addEventListener('click', () => {
      if (sessionCompleted) {
        summaryState.classList.add('hidden');
        startSession([...words]);
      } else {
        summaryState.classList.add('hidden');
        learningState.classList.remove('hidden');
        nextCard();
      }
    });

    // --- REVIEW MODAL + TEST MODE ---
    showReviewBtn.addEventListener('click', () => openModal(reviewModal));

    document.querySelectorAll('.review-btn-learn, .review-btn-test').forEach(btn => {
      btn.addEventListener('click', () => {
        if (words.length === 0) {
          alert('Brak słów w aktywnej talii.');
          return;
        }

        const type = btn.dataset.type;
        const count = btn.dataset.count ? parseInt(btn.dataset.count, 10) : null;
        const learned = words.filter(w => (w.successCount || 0) >= 3);
        let wordsToReview = [];

        if (type === 'last' && count) {
          wordsToReview = learned
            .filter(w => w.learnedDate)
            .sort((a, b) => a.learnedDate.toMillis() - b.learnedDate.toMillis())
            .slice(-count)
            .reverse();
        } else if (type === 'today') {
          const todayStr = formatDate(getToday());
          wordsToReview = learned.filter(w => w.learnedDate && formatDate(w.learnedDate.toDate()) === todayStr);
        } else {
          wordsToReview = learned;
        }

        const isTest = btn.classList.contains('review-btn-test');
        closeModal(reviewModal);

        if (isTest) {
          testDirection = btn.dataset.direction || 'en2pl';
          startTest(wordsToReview);
        } else {
          startSession(wordsToReview);
        }
      });
    });

    function startTest(list) {
      if (!list || list.length < 4) {
        alert('Za mało słów do testu.');
        return;
      }
      learningState.classList.add('hidden');
      testState.classList.remove('hidden');
      testSummaryState.classList.add('hidden');
      testWords = list.sort(() => Math.random() - 0.5);
      testScore = 0;
      currentTestQuestionIndex = 0;
      displayTestQuestion();
    }

    function displayTestQuestion() {
      if (currentTestQuestionIndex >= testWords.length) {
        showTestSummary();
        return;
      }

      const currentWord = testWords[currentTestQuestionIndex];
      testCurrentQuestion.textContent = currentTestQuestionIndex + 1;
      testTotalQuestions.textContent = testWords.length;
      testNextBtn.classList.add('hidden');
      testQuestion.textContent = (testDirection === 'pl2en') ? currentWord.polish : currentWord.english;

      const otherWords = words.filter(w => w.id !== currentWord.id);
      let options = [currentWord];
      while (options.length < 4 && otherWords.length > 0) {
        const i = Math.floor(Math.random() * otherWords.length);
        options.push(otherWords.splice(i, 1)[0]);
      }
      options.sort(() => Math.random() - 0.5);

      testAnswers.innerHTML = '';
      const correctId = currentWord.id;
      const correctMap = options.map(o => o.id === correctId);

      options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors';
        btn.textContent = (testDirection === 'pl2en') ? opt.english : opt.polish;
        btn.onclick = () => checkTestAnswer(opt.id === correctId, btn, correctMap);
        testAnswers.appendChild(btn);
      });
    }

    function checkTestAnswer(isCorrect, clickedButton, correctMap) {
      const buttons = Array.from(testAnswers.querySelectorAll('button'));
      buttons.forEach((btn, index) => {
        btn.disabled = true;
        if (correctMap[index]) {
          btn.classList.add('!bg-green-200', 'border-green-400');
        }
      });

      if (isCorrect) {
        testScore++;
        clickedButton.classList.add('!bg-green-500', 'text-white');
      } else {
        clickedButton.classList.add('!bg-red-500', 'text-white');
      }
      testNextBtn.classList.remove('hidden');
    }

    testNextBtn.addEventListener('click', () => {
      currentTestQuestionIndex++;
      displayTestQuestion();
    });

    function showTestSummary() {
      testState.classList.add('hidden');
      testSummaryState.classList.remove('hidden');
      testScoreEl.textContent = testScore;
      testSummaryTotalEl.textContent = testWords.length;
    }

    backToMainMenuBtn.addEventListener('click', () => startSession());

    // --- LEARNED WORDS MODAL ---
    showLearnedWordsBtn.addEventListener('click', () => {
      const learned = words.filter(w => (w.successCount || 0) >= 3)
        .sort((a, b) => {
          const aD = a.learnedDate?.toMillis?.() || 0;
          const bD = b.learnedDate?.toMillis?.() || 0;
          return aD - bD;
        });

      learnedWordsList.innerHTML = learned.length ?
        learned.map(w => `<div class="py-2 border-b"><span class="font-bold w-24 inline-block">${w.english}</span><span>${w.polish}</span></div>`).join('') :
        '<p class="text-slate-500 text-center p-4">You haven’t learned any words yet. Keep going!</p>';
      learnedWordsCountEl.textContent = learned.length;
      openModal(learnedWordsModal);
    });

    // --- STATS ---
    showStatsBtn.addEventListener('click', () => {
      const learnedByDay = words
        .filter(w => (w.successCount || 0) >= 3 && w.learnedDate)
        .reduce((acc, w) => {
          const day = formatDate(w.learnedDate.toDate());
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {});

      const days = Object.keys(learnedByDay).sort((a, b) => new Date(a) - new Date(b));

      if (statsChart) statsChart.destroy();
      statsChart = new Chart(statsChartCanvas, {
        type: 'bar',
        data: {
          labels: days,
          datasets: [{
            label: 'Words learned',
            data: days.map(d => learnedByDay[d]),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
      openModal(statsModal);
    });

    // --- STORIES ---
    showStoriesBtn.addEventListener('click', async () => {
      const user = auth.currentUser;
      if (!user) {
        openModal(authModal);
        return;
      }

      storiesListEl.innerHTML = '<p class="text-center text-slate-500 p-4">Ładowanie...</p>';
      const snap = await db.collection('users').doc(user.uid).collection('stories').orderBy('title', 'asc').get();
      storiesListEl.innerHTML = '';

      if (snap.empty) {
        storiesListEl.innerHTML = `<p class="text-center text-slate-500 p-8">Your library is empty. Add your first story from a .txt file.</p>`;
      } else {
        snap.forEach(doc => renderStoryItem({
          id: doc.id,
          ...doc.data()
        }));
      }
      openModal(storiesModal);
    });

    function renderStoryItem(story) {
      const storyEl = document.createElement('div');
      storyEl.className = 'flex justify-between items-center p-3 hover:bg-slate-100 rounded-lg cursor-pointer';
      storyEl.innerHTML = `
        <p class="truncate pr-4">${story.title}</p>
        <button data-id="${story.id}" class="delete-story-btn text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">&times;</button>
      `;

      storyEl.addEventListener('click', (e) => {
        if (!e.target.closest('.delete-story-btn')) {
          storyViewerTitle.textContent = story.title;
          storyViewerContent.textContent = story.content || '';
          closeModal(storiesModal);
          openModal(storyViewerModal);
        }
      });

      storyEl.querySelector('.delete-story-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm(`Delete "${story.title}"?`)) return;
        const user = auth.currentUser;
        if (!user) return;
        await db.collection('users').doc(user.uid).collection('stories').doc(story.id).delete();
        showStoriesBtn.click();
      });

      storiesListEl.appendChild(storyEl);
    }

    addStoryBtn.addEventListener('click', () => storyUploadInput.click());

    storyUploadInput.addEventListener('change', (event) => {
      const user = auth.currentUser;
      if (!user) {
        openModal(authModal);
        return;
      }

      const file = event.target.files[0];
      if (file && file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          await db.collection('users').doc(user.uid).collection('stories').add({
            title: file.name,
            content: e.target.result || '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
          showStoriesBtn.click();
        };
        reader.readAsText(file);
      }
      event.target.value = '';
    });

    let storyPlayIcon = listenFullStoryBtn.querySelector('.play-icon');
    let storyStopIcon = listenFullStoryBtn.querySelector('.stop-icon');

    speedSlider.addEventListener('input', (e) => {
      storySpeechRate = parseFloat(e.target.value || '1');
    });

    listenFullStoryBtn.addEventListener('click', () => {
      if (isStoryPlaying) {
        isStoryPlaying = false;
        if (currentAudio) currentAudio.pause();
        synth.cancel();
        storyPlayIcon.classList.remove('hidden');
        storyStopIcon.classList.add('hidden');
      } else {
        const text = storyViewerContent.textContent || '';
        if (text) {
          isStoryPlaying = true;
          storySentences = text.match(/[^.!?]+[.!?]+/g) || [text];
          currentSentenceIndex = 0;
          storyPlayIcon.classList.add('hidden');
          storyStopIcon.classList.remove('hidden');
          playNextSentence();
        }
      }
    });

    function playNextSentence() {
      if (!isStoryPlaying || currentSentenceIndex >= storySentences.length) {
        isStoryPlaying = false;
        storyPlayIcon.classList.remove('hidden');
        storyStopIcon.classList.add('hidden');
        return;
      }
      const sentence = (storySentences[currentSentenceIndex] || '').trim();
      if (sentence) {
        speak(sentence, ENGLISH_ACCENT, storySpeechRate, () => {
          currentSentenceIndex++;
          playNextSentence();
        });
      } else {
        currentSentenceIndex++;
        playNextSentence();
      }
    }

    // --- UPLOADS: IMAGES & BACKGROUNDS ---
    addImageBtn.addEventListener('click', () => {
      if (!currentCard) return;
      imageUploadInput.click();
    });

    imageUploadInput.addEventListener('change', async (e) => {
      const user = auth.currentUser;
      if (!user) {
        openModal(authModal);
        return;
      }
      const file = e.target.files[0];
      if (!file || !currentCard || !activeDeckId) return;

      const path = `users/${user.uid}/images/${Date.now()}_${file.name}`;
      const ref = storage.ref().child(path);
      await ref.put(file);
      const url = await ref.getDownloadURL();

      await db.collection('decks').doc(activeDeckId).collection('words').doc(currentCard.id).update({
        imageUrl: url
      });
      currentCard.imageUrl = url;
      updateCardUI();
      e.target.value = '';
    });

    uploadHeaderBtn.addEventListener('click', () => headerUploadInput.click());
    headerUploadInput.addEventListener('change', async (e) => {
      const user = auth.currentUser;
      if (!user) {
        openModal(authModal);
        return;
      }
      const file = e.target.files[0];
      if (!file) return;

      const path = `users/${user.uid}/backgrounds/header_${Date.now()}_${file.name}`;
      const ref = storage.ref().child(path);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      headerImageEl.src = url;

      await db.collection('users').doc(user.uid).collection('settings').doc('ui').set({
        headerImageUrl: url
      }, {
        merge: true
      });
      e.target.value = '';
    });

    uploadGlobalBgBtn.addEventListener('click', () => globalBgUploadInput.click());
    globalBgUploadInput.addEventListener('change', async (e) => {
      const user = auth.currentUser;
      if (!user) {
        openModal(authModal);
        return;
      }
      const file = e.target.files[0];
      if (!file) return;

      const path = `users/${user.uid}/backgrounds/flashcard_${Date.now()}_${file.name}`;
      const ref = storage.ref().child(path);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      globalFlashcardBgUrl = url;
      cardFrontBgEl.src = url;

      await db.collection('users').doc(user.uid).collection('settings').doc('ui').set({
        globalFlashcardBgUrl: url
      }, {
        merge: true
      });
      e.target.value = '';
    });

    uploadStoryBgBtn.addEventListener('click', () => storyBgUploadInput.click());
    storyBgUploadInput.addEventListener('change', async (e) => {
      const user = auth.currentUser;
      if (!user) {
        openModal(authModal);
        return;
      }
      const file = e.target.files[0];
      if (!file) return;

      const path = `users/${user.uid}/backgrounds/story_${Date.now()}_${file.name}`;
      const ref = storage.ref().child(path);
      await ref.put(file);
      const url = await ref.getDownloadURL();
      storyViewerBgContainer.style.backgroundImage = `url(${url})`;

      await db.collection('users').doc(user.uid).collection('settings').doc('ui').set({
        storyBgUrl: url
      }, {
        merge: true
      });
      e.target.value = '';
    });

    // --- RESET PROGRESS (ACTIVE DECK) ---
    resetProgressBtn.addEventListener('click', async () => {
      if (!activeDeckId) return alert('Brak aktywnej talii.');
      if (!confirm('Zresetować postęp (SRS) dla tej talii?')) return;

      const snap = await db.collection('decks').doc(activeDeckId).collection('words').get();
      const batchSize = 400;
      let batch = db.batch();
      let counter = 0;

      snap.forEach(doc => {
        batch.update(doc.ref, {
          interval: 0,
          easeFactor: 2.5,
          nextReview: firebase.firestore.Timestamp.fromDate(getToday()),
          successCount: 0,
          learnedDate: null
        });
        counter++;
        if (counter % batchSize === 0) {
          batch.commit();
          batch = db.batch();
        }
      });
      await batch.commit();
      alert('Postęp zresetowany.');
    });

    // --- NAV ---
    showDecksBtn.addEventListener('click', () => {
      const user = auth.currentUser;
      if (!user) {
        openModal(authModal);
        return;
      }
      renderDecks();
      openModal(decksModal);
    });

    // --- AUTH STATE OBSERVER ---
    auth.onAuthStateChanged(async (user) => {
      const isLoggedIn = !!user;
      authIconUser.classList.toggle('hidden', isLoggedIn);
      authIconLogout.classList.toggle('hidden', !isLoggedIn);
      loadingState.style.display = 'none';
      mainContent.style.display = 'block';

      // Email verification prompt
      if (user && !user.emailVerified) {
        verifyEmailAddress.textContent = user.email || '';
        verifyEmailContainer.style.display = 'block';
      } else {
        verifyEmailContainer.style.display = 'none';
      }

      if (isLoggedIn) {
        userInfo.classList.remove('hidden');
        userEmailDisplay.textContent = user.email || '';

        // Load UI settings (header/bg)
        const uiDoc = await db.collection('users').doc(user.uid).collection('settings').doc('ui').get();
        const ui = uiDoc.data() || {};
        if (ui.headerImageUrl) headerImageEl.src = ui.headerImageUrl;
        if (ui.globalFlashcardBgUrl) {
          globalFlashcardBgUrl = ui.globalFlashcardBgUrl;
          cardFrontBgEl.src = globalFlashcardBgUrl;
        }
        if (ui.storyBgUrl) {
          storyViewerBgContainer.style.backgroundImage = `url(${ui.storyBgUrl})`;
        }

        renderDecks();
      } else {
        // User is signed out
        userInfo.classList.add('hidden');
        activeDeckId = null;
        activeDeckName = 'None';
        activeDeckNameEl.textContent = activeDeckName;
        words = [];
        startSession();
      }
    });
  });