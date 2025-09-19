import { processAnswer } from '../srs.js';

export function updateFlashcardUI(card) {
  console.log('🎯 updateFlashcardUI wywołane z kartą:', card);

  const container = document.getElementById('flashcard-container');
  const controlsContainer = document.getElementById('srs-controls');

  if (!container) {
    console.error('❌ Nie znaleziono #flashcard-container');
    return;
  }

  if (!card) {
    console.error('❌ Brak karty do wyświetlenia');
    return;
  }

  console.log('✅ Renderuję kartę i przyciski...');

   container.innerHTML = '';
  container.appendChild(renderCard(card));

  if (controlsContainer) {
    controlsContainer.innerHTML = '';
    controlsContainer.appendChild(renderSRSButtons());
    console.log('✅ Przyciski SRS dodane');
  } else {
    console.error('❌ Nie znaleziono #srs-controls');
  }
}

function renderCard(card) {
  console.log('🎨 Renderuję kartę:', card);

    const frontText = card.word || card.front || card.english || card.term || 'Brak słowa';

    const backText = card.translation || card.back || card.polish || card.definition || card.meaning || 'Brak tłumaczenia';

  console.log('📝 Przód karty:', frontText);
  console.log('📝 Tył karty:', backText);

  const div = document.createElement('div');
  div.className = 'card relative w-full h-full flex items-center justify-center rounded-lg bg-white shadow-lg border transition-all duration-300 cursor-pointer';
  div.innerHTML = `
    <div class="card-face card-face-front flex items-center justify-center p-6">
      <div class="text-2xl font-bold text-center">${frontText}</div>
    </div>
    <div class="card-face card-face-back flex items-center justify-center p-6 hidden">
      <div class="text-lg text-center text-slate-600">${backText}</div>
    </div>
  `;

  div.addEventListener('click', () => {
    console.log('🔄 Odwracam kartę');
    const front = div.querySelector('.card-face-front');
    const back = div.querySelector('.card-face-back');

    if (front && back) {
      front.classList.toggle('hidden');
      back.classList.toggle('hidden');
    }
  });

  return div;
}

function renderSRSButtons() {
  console.log('🎮 Renderuję przyciski SRS');

  const div = document.createElement('div');
  div.className = 'flex justify-center gap-3';
  div.innerHTML = `
    <button class="btn-difficulty px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium" data-difficulty="1">
      Again
    </button>
    <button class="btn-difficulty px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium" data-difficulty="3">
      Good
    </button>
    <button class="btn-difficulty px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium" data-difficulty="5">
      Easy
    </button>
  `;

  div.querySelectorAll('.btn-difficulty').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const difficulty = parseInt(e.target.dataset.difficulty);
      console.log('🎯 Kliknięto przycisk trudności:', difficulty);
      processAnswer(difficulty);
    });
  });

  return div;
}