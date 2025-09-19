// src/ui/modals.js
export const getEl = sel => document.querySelector(sel);

let locks = 0;
function setScrollLock(lock) {
  const docEl = document.documentElement;
  if (lock) {
    if (locks++ === 0) {
      const sw = window.innerWidth - docEl.clientWidth;           // szerokość paska
      docEl.style.overflow = 'hidden';
      if (sw > 0) document.body.style.paddingRight = `${sw}px`;
    }
  } else {
    if (--locks <= 0) {
      locks = 0;
      docEl.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }
}

/*  NOWE: przyjmujemy zarówno element, jak i string/id */
function norm(elOrId) {
  return typeof elOrId === 'string' ? getEl(`#${elOrId}`) : elOrId;
}

export function openModal(elOrId) {
  const modal = norm(elOrId);
  if (!modal) return;
  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.querySelector('.modal-content')?.classList.remove('scale-95');
  setScrollLock(true);
}

export function closeModal(elOrId) {
  const modal = norm(elOrId);
  if (!modal) return;
  modal.classList.add('opacity-0', 'pointer-events-none');
  modal.querySelector('.modal-content')?.classList.add('scale-95');
  setScrollLock(false);
}

/* delegowane atrybuty data-close="id-modalu" działają jak dotąd */
document.addEventListener('click', e => {
  const id = e.target?.getAttribute?.('data-close');
  if (id) closeModal(id);
});