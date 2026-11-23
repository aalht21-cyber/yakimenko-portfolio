import type { MouseEvent } from 'react'

/**
 * Плавная прокрутка к разделу по href="#id" без смены location.hash,
 * чтобы якорь не перехватывал HashRouter (иначе — пустая страница).
 */
export function scrollToHash(e: MouseEvent<HTMLAnchorElement>) {
  const hash = e.currentTarget.getAttribute('href')
  if (!hash || !hash.startsWith('#')) return
  e.preventDefault()
  document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
