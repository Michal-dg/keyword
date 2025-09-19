// src/main.js
import './index.css';
import './app.js';
import './decks.js';
import './learned.js';
import './stats.js';
import './stories.js';
import './srs.js';
import './review.js';

// Kluczowe: inicjalizujemy nowe UI Auth
import { initAuthUI } from './auth.js';

// Tutaj startuje logika aplikacji:
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Aplikacja wystartowała');
  initAuthUI();
  // --- DEBUG „Ucz się” ---
window.addEventListener('load', () => {
  const btn = document.getElementById('show-review-btn');
  btn?.addEventListener('click', () => {
    console.log('[DEBUG] handler LIVE');
    const screen = document.getElementById('review-screen');
    screen?.classList.remove('hidden');
  }, { capture: true });   // capture = true gwarantuje, że nic później już go nie zastąpi
});
/* --- LAST-CHANCE handler dla „Ucz się” ---------------------------- */
window.addEventListener('load', () => {
  const btn     = document.getElementById('show-review-btn');
  const screen  = document.getElementById('review-screen');
  const loader  = document.getElementById('loading-state');

  if (!btn || !screen) {
    console.warn('[review] brak przycisku albo sekcji review-screen');
    return;
  }

  btn.addEventListener('click', () => {
    console.log('[review] FINAL handler działa');
    screen.classList.remove('hidden');
    loader?.classList.add('hidden');

    import('./srs.js')
      .then(({ startSession }) => {
        if (typeof startSession === 'function') startSession();
        else console.error('[review] brak startSession w srs.js');
      })
      .catch(err => console.error('[review] błąd importu srs.js →', err));
  }, { capture: true, once: false });
});
  // ↓ dalej podłączaj swoje zdarzenia / funkcje
});
