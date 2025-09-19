/* Prosty wykres postępu – dummy, ale działa */
import { getEl, openModal } from './ui/modals.js'
import { auth, db }         from './app.js'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

let modal, canvas, chart

function init () {
  modal  = getEl('#stats-modal')
  canvas = getEl('#stats-chart')

  getEl('#show-stats-btn')?.addEventListener('click', () => {
    openModal(modal)
    renderChart()
  })
}

function renderChart () {
  const user = auth.currentUser
  if (!user) return

  const q = query(collection(db, 'progress'), where('userId', '==', user.uid))

  onSnapshot(q, snap => {
    const labels = []
    const data   = []

    snap.forEach(s => {
      const d = s.data()
      labels.push(new Date(d.date).toLocaleDateString())
      data.push(d.correct)
    })

    chart?.destroy()
    chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Słowa poprawne',
          data,
          borderColor: '#0284c7',
          tension: .3
        }]
      },
      options: { responsive: true }
    })
  })
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init, { once: true })
  : init()