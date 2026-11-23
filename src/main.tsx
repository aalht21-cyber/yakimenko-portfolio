import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'
import App from './App.tsx'

gsap.registerPlugin(ScrollTrigger)
// Не пересчитывать пины при ресайзе вьюпорта на мобильных (адресная строка)
ScrollTrigger.config({ ignoreMobileResize: true })
// Пин включать чуть заранее — убирает рывок на границе закрепления
ScrollTrigger.defaults({ anticipatePin: 1 })

// Пересчёт пинов после подгрузки шрифтов и полной загрузки страницы,
// чтобы позиции pinned-секций не «уплывали» из-за сдвига раскладки
if (document.fonts?.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {})
}
window.addEventListener('load', () => ScrollTrigger.refresh())

// Пересчёт триггеров только при реальной смене ШИРИНЫ окна
// (поворот телефона, ресайз окна). Следить за высотой нельзя:
// на мобильных это создаёт цикл «скролл → пересчёт → прыжок».
let lastW = window.innerWidth
let refreshRaf = 0
const layoutObserver = new ResizeObserver(() => {
  const w = window.innerWidth
  if (w === lastW) return
  lastW = w
  cancelAnimationFrame(refreshRaf)
  refreshRaf = requestAnimationFrame(() => ScrollTrigger.refresh())
})
layoutObserver.observe(document.body)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
