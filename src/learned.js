/* Lista nauczonych słów – minimum, żeby przycisk działał */
import { getEl, openModal } from './ui/modals.js'
import { auth, db }        from './app.js'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'

let modal, listEl, unsub = null

function init () {
  modal  = getEl('#learned-modal')
  listEl = getEl('#learned-list')

  getEl('#show-learned-words-btn')?.addEventListener('click', () => {
    loadWords()
    openModal(modal)
  })
}

function loadWords () {
  const user = auth.currentUser
  listEl.innerHTML = '<p class="p-4 text-slate-500">Ładowanie…</p>'

  if (!user) {
    listEl.innerHTML = '<p class="p-4 text-slate-500">Zaloguj się.</p>'
    return
  }

  unsub?.()
  const q = query(
    collection(db, 'learnedWords'),
    where('userId', '==', user.uid),
    orderBy('updatedAt', 'desc')
  )

  unsub = onSnapshot(q, snap => {
    listEl.innerHTML = ''
    if (snap.empty) {
      listEl.innerHTML = '<p class="p-4 text-slate-500">Brak słów.</p>'
      return
    }
    snap.forEach(s => {
      const li = document.createElement('li')
      li.className = 'p-2 border-b'
      li.textContent = s.data().word
      listEl.appendChild(li)
    })
  }, err => (listEl.innerHTML = `<p class="p-4 text-red-500">${err.message}</p>`))
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init, { once: true })
  : init()