import { scrollToHash } from '../lib/scroll'

const NAV = [
  { label: 'ПРОЕКТЫ', href: '#projects' },
  { label: 'УСЛУГИ', href: '#services' },
  { label: 'СТИЛЬ РАБОТЫ', href: '#style' },
  { label: 'ПРОЦЕСС', href: '#process' },
  { label: 'ГАРАНТИИ', href: '#guarantees' },
  { label: 'КОНТАКТЫ', href: '#contacts' },
]

/** Неровный «карандашный» овал вокруг пункта меню, дорисовывается при наведении */
function PencilCircle() {
  return (
    <svg viewBox="0 0 100 42" aria-hidden="true" focusable="false">
      <path
        pathLength={100}
        d="M49 4 C 73 1.5, 96.5 8.5, 97.2 19.5 C 97.9 30.5, 77 38, 51 38.2 C 25 38.4, 2.8 31.5, 2.6 20 C 2.4 8.8, 27 2.2, 56 3.4"
      />
    </svg>
  )
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ink)]/10 bg-[var(--paper)]">
      <nav
        aria-label="Основная навигация"
        className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 py-5 md:justify-between md:px-8 lg:px-10"
      >
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={scrollToHash}
            className="pencil-link inline-block px-2 py-1 text-sm font-bold tracking-wide uppercase md:text-base lg:text-lg"
          >
            {item.label}
            <PencilCircle />
          </a>
        ))}
      </nav>
    </header>
  )
}
