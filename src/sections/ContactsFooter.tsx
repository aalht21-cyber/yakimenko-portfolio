import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BoardroomScene } from '../three/BoardroomScene'

gsap.registerPlugin(ScrollTrigger)

const CONTACTS = [
  {
    cell: 'A3',
    label: 'Telegram',
    value: '@Alexandr_Vadimovich20',
    href: 'https://t.me/Alexandr_Vadimovich20',
  },
  {
    cell: 'B3',
    label: 'Почта',
    value: 'Xyakimenko200656@gmail.com',
    href: 'mailto:Xyakimenko200656@gmail.com',
  },
  {
    cell: 'C3',
    label: 'Телефон',
    value: '+7 (977) 568-94-60',
    href: 'tel:+79775689460',
  },
]

/** Экран 1: Excel-таблица с людьми и карточка контактов в ячейках */
function ContactsGrid() {
  const sectionRef = useRef<HTMLElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const [sceneOk, setSceneOk] = useState(true)

  useEffect(() => {
    if (!mountRef.current || !sectionRef.current) return
    let scene: BoardroomScene | null = null
    try {
      scene = new BoardroomScene(mountRef.current, 'grid')
    } catch {
      setSceneOk(false)
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !scene) {
      return () => {
        scene?.dispose()
      }
    }
    // Пока экран уходит вверх, люди уходят с таблицы вниз — к столу переговоров
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => scene.setProgress(self.progress),
      onRefresh: (self) => scene.setProgress(self.progress),
    })
    return () => {
      st.kill()
      scene?.dispose()
    }
  }, [])

  return (
    <section
      id="contacts"
      ref={sectionRef}
      aria-label="Контакты"
      className="relative h-[100svh] overflow-hidden border-t border-[var(--ink)]/10"
    >
      {/* Подложка, если WebGL недоступен */}
      {!sceneOk && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent 0 63px, rgba(20,19,16,0.18) 63px 64px), repeating-linear-gradient(90deg, transparent 0 119px, rgba(20,19,16,0.18) 119px 120px)',
          }}
        />
      )}

      {/* 3D-сцена: Excel-сетка, люди ждут приглашения за стол */}
      <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />

      {/* Контакты — вся информация в ячейках Excel-таблицы */}
      <div className="absolute inset-x-0 top-0 px-5 pt-40 md:px-10 md:pt-24">
        <div className="mx-auto flex max-w-[1440px] justify-start md:justify-end">
          <div className="max-w-full border border-[var(--ink)]/60 bg-[var(--paper)] md:w-full md:max-w-3xl">
            {/* буквы столбцов, как в Excel */}
            <div className="hidden grid-cols-[1.75rem_repeat(3,1fr)] border-b border-[var(--ink)]/40 bg-[rgba(46,125,50,0.10)] text-[11px] font-bold uppercase sm:grid">
              <span className="border-r border-[var(--ink)]/40 px-1.5 py-1" />
              <span className="border-r border-[var(--ink)]/40 px-2 py-1 text-center">A</span>
              <span className="border-r border-[var(--ink)]/40 px-2 py-1 text-center">B</span>
              <span className="px-2 py-1 text-center">C</span>
            </div>
            {/* строка 1: заголовок */}
            <div className="grid grid-cols-[1.6rem_1fr] border-b border-[var(--ink)]/40 sm:grid-cols-[1.75rem_1fr]">
              <span className="border-r border-[var(--ink)]/40 bg-[rgba(46,125,50,0.10)] px-1 py-4 text-center text-[11px] font-bold">
                1
              </span>
              <h2 className="font-display px-4 py-3.5 text-2xl leading-[0.98] font-bold uppercase md:px-5 md:text-4xl">
                Устали от операционной деятельности?
              </h2>
            </div>
            {/* строка 2: оффер */}
            <div className="grid grid-cols-[1.6rem_1fr] border-b border-[var(--ink)]/40 sm:grid-cols-[1.75rem_1fr]">
              <span className="border-r border-[var(--ink)]/40 bg-[rgba(46,125,50,0.10)] px-1 py-4 text-center text-[11px] font-bold">
                2
              </span>
              <div className="px-4 py-3 md:px-5">
                <p
                  className="font-display text-lg font-semibold uppercase md:text-2xl"
                  style={{ color: 'var(--red)' }}
                >
                  Вам есть куда обратиться.
                </p>
                <p className="mt-1 max-w-[52ch] text-sm font-medium md:text-base">
                  Готов к сотрудничеству и открыт к разговору: от разовой настройки процессов
                  до постоянной работы в команде.
                </p>
              </div>
            </div>
            {/* строка 3: три ячейки с контактами */}
            <div className="grid grid-cols-[1.6rem_1fr] sm:grid-cols-[1.75rem_1fr_1fr_1fr]">
              <span className="border-r border-[var(--ink)]/40 bg-[rgba(46,125,50,0.10)] px-1 py-4 text-center text-[11px] font-bold max-sm:row-span-3 max-sm:border-b-0">
                3
              </span>
              {CONTACTS.map((c, i) => (
                <a
                  key={c.cell}
                  href={c.href}
                  target={c.href.startsWith('http') ? '_blank' : undefined}
                  rel={c.href.startsWith('http') ? 'noreferrer' : undefined}
                  className={`block min-w-0 px-4 py-3 transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)] md:px-5 ${
                    i > 0 ? 'border-[var(--ink)]/40 max-sm:border-t sm:border-l' : ''
                  }`}
                >
                  <span className="flex items-baseline gap-2 text-[11px] font-extrabold tracking-wider uppercase opacity-60">
                    <span style={{ color: 'var(--red)' }}>{c.cell}</span>
                    {c.label}
                  </span>
                  <span className="mt-0.5 block text-[13px] font-extrabold whitespace-nowrap md:text-sm">
                    {c.value}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Экран 2 (подвал): люди из таблицы заходят и садятся за стол переговоров */
function Boardroom() {
  const sectionRef = useRef<HTMLElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const [sceneOk, setSceneOk] = useState(true)

  useEffect(() => {
    if (!mountRef.current || !sectionRef.current) return
    let scene: BoardroomScene | null = null
    try {
      scene = new BoardroomScene(mountRef.current, 'table')
    } catch {
      setSceneOk(false)
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce || !scene) {
      scene?.setProgress(1)
      return () => {
        scene?.dispose()
      }
    }

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=160%',
      pin: true,
      onUpdate: (self) => scene.setProgress(self.progress),
      onRefresh: (self) => scene.setProgress(self.progress),
    })

    return () => {
      st.kill()
      scene.dispose()
    }
  }, [])

  return (
    <section
      id="boardroom"
      ref={sectionRef}
      aria-label="Подвал: стол переговоров"
      className="relative h-[100svh] overflow-hidden"
    >
      {!sceneOk && (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: 'var(--paper-deep)' }}
        />
      )}

      {/* 3D-сцена: стол переговоров, люди из Excel-таблицы занимают места */}
      <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />

      {/* Мобильная полоса контактов — на телефоне текст на столе слишком мелкий */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-[var(--ink)]/15 bg-[var(--paper)]/95 px-4 py-3 text-center md:hidden">
        <p className="font-display text-sm font-bold uppercase">
          Пока вы строите бизнес,{' '}
          <span style={{ color: 'var(--red)' }}>я строю порядок и стабильность.</span>
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed font-semibold">
          Александр Якименко · <a href="tel:+79775689460">+7 (977) 568-94-60</a>
          <br />
          <a href="mailto:Xyakimenko200656@gmail.com">Xyakimenko200656@gmail.com</a> ·{' '}
          <a href="https://t.me/Alexandr_Vadimovich20" target="_blank" rel="noreferrer">
            Telegram @Alexandr_Vadimovich20
          </a>
        </p>
      </div>

      {/* Текст подвала показан на столе в 3D-сцене; здесь — для скринридеров */}
      <div className="sr-only">
        <p>Пока вы строите бизнес, я строю порядок и стабильность.</p>
        <p>
          Александр Якименко · <a href="tel:+79775689460">+7 (977) 568-94-60</a> ·{' '}
          <a href="mailto:Xyakimenko200656@gmail.com">Xyakimenko200656@gmail.com</a> ·{' '}
          <a href="https://t.me/Alexandr_Vadimovich20" target="_blank" rel="noreferrer">
            Telegram @Alexandr_Vadimovich20
          </a>
        </p>
      </div>
    </section>
  )
}

export default function ContactsFooter() {
  return (
    <>
      <ContactsGrid />
      <Boardroom />
    </>
  )
}
