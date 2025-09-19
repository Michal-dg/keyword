/* Biblioteka historyjek – placeholder + Firestore */
import { getEl, openModal } from './ui/modals.js'
import { auth, db }         from './app.js'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

let modal, listEl

function init () {
  modal  = getEl('#stories-modal')
  listEl = getEl('#stories-list')

  getEl('#show-stories-btn')?.addEventListener('click', () => {
    loadStories()
    openModal(modal)
  })
}

function loadStories () {
  const user = auth.currentUser
  listEl.innerHTML = '<p class="p-4 text-slate-500">Ładowanie…</p>'

  if (!user) {
    listEl.innerHTML = '<p class="p-4 text-slate-500">Zaloguj się.</p>'
    return
  }

  const q = query(collection(db, 'stories'), where('userId', '==', user.uid))
  onSnapshot(q, snap => {
    listEl.innerHTML = ''
    if (snap.empty) {
      listEl.innerHTML = '<p class="p-4 text-slate-500">Brak historii.</p>'
      return
    }
    snap.forEach(s => {
      const li = document.createElement('li')
      li.className = 'p-2 border-b'
      li.textContent = s.data().title
      listEl.appendChild(li)
    })
  })
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init, { once: true })
  : init()