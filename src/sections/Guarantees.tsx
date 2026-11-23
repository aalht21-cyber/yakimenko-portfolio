import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import { KeyboardScene } from '../three/KeyboardScene'

gsap.registerPlugin(ScrollTrigger)

const GUARANTEES = [
  {
    key: 'КАК СВОЙ',
    title: 'Каждый проект как свой',
    text: 'Каждый проект для меня важен. Работаю с ним так, будто это мой бизнес: вы и я одна команда с одной целью.',
  },
  {
    key: 'ДОГОВОР',
    title: 'Договор и NDA',
    text: 'Фиксируем объём работ, сроки и стоимость в договоре. При необходимости подписываем NDA: данные вашего бизнеса остаются конфиденциальными.',
  },
  {
    key: 'ФИКС ЦЕНА',
    title: 'Фиксированная цена',
    text: 'Стоимость, о которой договорились, не меняется без вашего согласия. Правки вне согласованного объёма фиксируем и оцениваем отдельно.',
  },
  {
    key: 'ЭТАПЫ',
    title: 'Поэтапная оплата',
    text: 'Платите частями, по мере выполнения этапов, а не всю сумму вперёд.',
  },
  {
    key: 'ОБУЧЕНИЕ',
    title: 'Инструкция и обучение',
    text: 'Внедряю все исправления и правки в вашу команду и слежу за эффективностью работы команды и процесса создания продукта. После запуска передаю инструкцию и показываю команде, как работать по-новому.',
  },
  {
    key: '30 ДНЕЙ',
    title: '30 дней бесплатного сопровождения',
    text: 'После внедрения я рядом: отвечаю на ваши вопросы, на месте исправляю то, что выходит из-под контроля, и работаю с командой. Дальше поддержка и доработки по договорённости.',
  },
]

export default function Guarantees() {
  const sectionRef = useRef<HTMLElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<KeyboardScene | null>(null)
  const [active, setActive] = useState(0)
  const [sceneOk, setSceneOk] = useState(true)

  useEffect(() => {
    if (!mountRef.current || !sectionRef.current) return
    try {
      sceneRef.current = new KeyboardScene(mountRef.current, (i) => setActive(i), GUARANTEES)
    } catch {
      setSceneOk(false)
      return
    }
    const scene = sceneRef.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      scene.resetIntro()
    } else {
      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 65%',
        once: true,
        onEnter: () => scene.playIntro(),
      })
      return () => {
        st.kill()
        scene.dispose()
        sceneRef.current = null
      }
    }
    return () => {
      scene.dispose()
      sceneRef.current = null
    }
  }, [])

  const press = (i: number) => {
    setActive(i)
    sceneRef.current?.press(i)
  }

  return (
    <section
      id="guarantees"
      ref={sectionRef}
      aria-label="Гарантии"
      className="border-t border-[var(--ink)]/10 px-5 pt-20 pb-20 md:px-10 md:pt-28"
    >
      <div className="mx-auto max-w-[1440px]">
        <h2 className="font-display text-4xl font-bold uppercase md:text-6xl">Гарантии</h2>
        <p className="mt-3 max-w-[52ch] text-base font-medium md:text-lg">
          Шесть клавиш — шесть гарантий. Нажмите, и текст появится на табло.
        </p>

        {/* 3D-клавиатура с табло — почти во весь экран */}
        <div className="relative mt-4 h-[52vh] min-h-[340px] md:h-[68vh]">
          {!sceneOk && (
            <div aria-hidden="true" className="absolute inset-0 grid grid-cols-3 gap-3 p-6">
              {GUARANTEES.map((g, i) => (
                <div
                  key={g.key}
                  className="border-2 border-[var(--ink)]"
                  style={{ background: i === 5 ? 'var(--paper)' : 'var(--ink)' }}
                />
              ))}
            </div>
          )}
          <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
        </div>

        {/* Текст для скринридеров дублирует табло */}
        <p aria-live="polite" className="sr-only">
          {GUARANTEES[active].title}. {GUARANTEES[active].text}
        </p>

        {/* Кнопки-дубли клавиш */}
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {GUARANTEES.map((g, i) => (
            <li key={g.key}>
              <button
                type="button"
                onClick={() => press(i)}
                aria-pressed={active === i}
                className={`cursor-pointer border-2 border-[var(--ink)] px-3 py-2 text-xs font-extrabold tracking-wide uppercase transition-colors ${
                  active === i
                    ? 'bg-[var(--red)] text-[var(--paper)]'
                    : 'hover:bg-[var(--ink)] hover:text-[var(--paper)]'
                }`}
              >
                {g.key}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
