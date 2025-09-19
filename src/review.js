import { getEl } from './ui/modals.js';
import { startSession } from './srs.js';

function init() {
  console.log('🔧 Inicjalizuję przycisk "Ucz się"...');

  const btn = getEl('#show-review-btn');

  if (!btn) {
    console.error('❌ [review] Nie znalazłem przycisku #show-review-btn');
    return;
  }

  console.log('✅ [review] Znaleziono przycisk "Ucz się"');

  btn.addEventListener('click', () => {
    console.log('🎯 [review] Kliknięto przycisk "Ucz się"');

    const screen = getEl('#review-screen');
    if (!screen) {
      console.error('❌ [review] Nie znalazłem #review-screen');
      return;
    }

    console.log('✅ [review] Znaleziono sekcję review-screen');

    // Pokaż sekcję uczenia się
    screen.classList.remove('hidden');
    console.log('👁️ [review] Pokazano sekcję review-screen');

    // Ukryj loading state
    const loadingState = getEl('#loading-state');
    if (loadingState) {
      loadingState.classList.add('hidden');
      console.log('🙈 [review] Ukryto loading-state');
    }

    try {
      console.log('🚀 [review] Uruchamiam startSession()...');
      startSession();
    } catch (err) {
      console.error('❌ [SRS] startSession error:', err);
    }
  });

  console.log('✅ [review] Event listener dodany do przycisku');
}

if (document.readyState === 'loading') {
  console.log('⏳ [review] DOM się ładuje, czekam na DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  console.log('✅ [review] DOM już gotowy, inicjalizuję od razu');
  init();
}