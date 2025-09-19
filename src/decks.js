/*  src/decks.js  –  CRUD talii + subskrypcja słów  */
import { db, auth, serverNow } from './app.js'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc
} from 'firebase/firestore'
import { closeModal, openModal, getEl } from './ui/modals.js'
import { startSession } from './srs.js'

/* ───────────────────────────────────── */
/*  LOCAL STATE  */
export let activeDeckId   = null
export let activeDeckName = 'None'
let unsubscribeDecks      = null

/*  DOM refs – uzupełniane dopiero gdy DOM jest gotowy */
let decksModal,
    decksListEl,
    addDeckForm,
    activeDeckNameEl

/* ───────────────────────────────────── */
/*  HELPERS  */
const $$ = selector => document.querySelector(selector)

/* zwraca obiekt <div> reprezentujący pojedynczą talię */
function renderDeckItem(deck) {
  const el              = document.createElement('div')
  el.className          = 'p-3 border-b border-slate-100'
  el.innerHTML = `
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="font-bold truncate ${activeDeckId === deck.id ? 'text-sky-600' : ''}">
          ${deck.name}
        </p>
        <p class="text-xs text-slate-500">Deck ID: ${deck.id}</p>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button class="select-deck-btn px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded">
          Ucz się
        </button>
        <button class="delete-btn px-2 py-1 text-slate-500 hover:text-red-600">
          🗑️
        </button>
      </div>
    </div>`

  /* akcje */
  el.querySelector('.select-deck-btn').onclick = () => setActiveDeck(deck)
  el.querySelector('.delete-btn').onclick      = async () => {
    if (confirm(`Usunąć talię "${deck.name}"?`)) {
      await deleteDoc(doc(db, 'decks', deck.id))
    }
  }
  return el
}

/* ───────────────────────────────────── */
/*  LISTA  */
function renderDecks() {
  const user = auth.currentUser
  if (!user) {
    decksListEl.innerHTML =
      '<p class="text-slate-500 text-center p-4">Zaloguj się, aby zobaczyć talie.</p>'
    return
  }

  decksListEl.innerHTML =
    '<p class="text-slate-500 text-center p-4">Ładowanie…</p>'

  /* odpinamy starą subskrypcję jeśli była */
  unsubscribeDecks?.()
  const q = query(
    collection(db, 'decks'),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc')
  )

  unsubscribeDecks = onSnapshot(
    q,
    snap => {
      decksListEl.innerHTML = ''
      if (snap.empty) {
        decksListEl.innerHTML =
          '<p class="text-slate-500 text-center p-4">Brak talii.</p>'
        return
      }
      snap.forEach(s =>
        decksListEl.appendChild(renderDeckItem({ id: s.id, ...s.data() }))
      )
    },
    err =>
      (decksListEl.innerHTML =
        `<p class="text-red-500 p-4">Błąd: ${err.message}</p>`)
  )
}

/* ───────────────────────────────────── */
/*  AKTYWACJA  */
export async function setActiveDeck(deck) {
  activeDeckId         = deck.id
  activeDeckName       = deck.name
  activeDeckNameEl.textContent = activeDeckName
  closeModal(decksModal)
  startSession()
}

/* ───────────────────────────────────── */
/*  INIT  */
function initDomRefs() {
  decksModal       = getEl('#decks-modal')
  decksListEl      = getEl('#decks-list')
  addDeckForm      = getEl('#add-deck-form')
  activeDeckNameEl = getEl('#active-deck-name')
}

function initUiEvents() {
  /* pokaż listę talii */
  getEl('#show-decks-btn')?.addEventListener('click', () => {
    renderDecks()
    openModal(decksModal)
    
  })

  /* dodawanie talii */
  addDeckForm?.addEventListener('submit', async e => {
    e.preventDefault()
    const name = getEl('#new-deck-name').value.trim()
    const user = auth.currentUser
    if (!name || !user) return

    await addDoc(collection(db, 'decks'), {
      name,
      userId: user.uid,
      createdAt: serverNow()
    })
    getEl('#new-deck-name').value = ''
  })
}

/* inicjalizujemy, gdy DOM będzie gotowy */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onDomReady, { once: true })
} else {
  onDomReady()
}

function onDomReady() {
  initDomRefs()
  initUiEvents()
  /* gdy użytkownik już jest zalogowany – wyświetl talie */
  if (auth.currentUser) renderDecks()
}
