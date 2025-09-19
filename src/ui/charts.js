/*  ui/charts.js – wykres statystyk (placeholder) */
import Chart from 'chart.js/auto'
import { getEl } from './modals.js'

export function drawStats(dataByDay) {
  const canvas = getEl('#stats-chart')
  if (!canvas) return
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: Object.keys(dataByDay),
      datasets: [
        {
          data: Object.values(dataByDay),
          backgroundColor: 'rgba(59,130,246,.5)'
        }
      ]
    },
    options: { plugins: { legend: { display: false } } }
  })
}