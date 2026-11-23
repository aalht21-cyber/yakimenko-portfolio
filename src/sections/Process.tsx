import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    num: '01',
    title: 'Знакомство',
    text: 'Созваниваемся (первый созвон бесплатный), вы рассказываете о своей проблеме. Я задаю вопросы и разбираюсь, как устроены команда и процесс работы.',
  },
  {
    num: '02',
    title: 'Решение',
    text: 'Предлагаю решение, состав работ и фиксированную стоимость услуги. Делим работу на понятные этапы и действия.',
  },
  {
    num: '03',
    title: 'Подписание договора',
    text: 'Подписываем договор, при необходимости NDA. Оплата поэтапная: вы платите частями, а не за весь проект.',
  },
  {
    num: '04',
    title: 'Реализация',
    text: 'Работаю по этапам и показываю промежуточные результаты.',
  },
  {
    num: '05',
    title: 'Запуск и внедрение',
    text: 'Оптимизирую работу команды, повышаю её эффективность и даю инструкцию, как работать дальше.',
  },
  {
    num: '06',
    title: 'Поддержка',
    text: '30 дней бесплатной поддержки: отвечаю на вопросы и исправляю ошибки. Дальше поддержка и доработки по договорённости.',
  },
]

export default function Process() {
  const rootRef = useRef<HTMLElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !rootRef.current) return
    const ctx = gsap.context(() => {
      // Линия схемы дорисовывается со скроллом
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: rootRef.current, start: 'top 60%', end: 'bottom 75%', scrub: 0.4 },
        },
      )
      // Шаги проявляются по очереди
      gsap.utils.toArray<HTMLElement>('.process-step').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 46 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none none' },
          },
        )
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="process"
      ref={rootRef}
      aria-label="Процесс работы"
      className="border-t border-[var(--ink)]/10 px-5 pt-20 pb-24 md:px-10 md:pt-28"
    >
      <div className="mx-auto max-w-[1440px]">
        <h2 className="font-display text-4xl font-bold uppercase md:text-6xl">Процесс работы</h2>
        <p className="mt-3 max-w-[52ch] text-base font-medium md:text-lg">
          Шесть шагов от первого созвона до поддержки после запуска.
        </p>

        <div className="relative mt-16">
          {/* Ось схемы */}
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 left-[27px] w-[3px] origin-top bg-[var(--ink)]/15 md:left-1/2 md:-translate-x-1/2"
          >
            <div ref={lineRef} className="h-full w-full origin-top" style={{ background: 'var(--red)' }} />
          </div>

          <ol className="space-y-14 md:space-y-20">
            {STEPS.map((s, i) => {
              const left = i % 2 === 0
              const last = i === STEPS.length - 1
              return (
                <li
                  key={s.num}
                  className={`process-step relative flex items-start gap-6 md:gap-0 ${
                    left ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Узел-круг */}
                  <div
                    aria-hidden="true"
                    className={`relative z-10 flex shrink-0 items-center justify-center rounded-full border-2 md:absolute md:left-1/2 md:-translate-x-1/2 ${
                      last
                        ? 'h-24 w-24 border-[var(--red)] bg-[var(--red)] md:h-32 md:w-32'
                        : 'h-14 w-14 border-[var(--ink)] bg-[var(--paper)] md:h-16 md:w-16'
                    }`}
                  >
                    <span
                      className="font-display font-bold"
                      style={{
                        color: last ? 'var(--paper)' : 'var(--red)',
                        fontSize: last ? '1.6rem' : '1.1rem',
                      }}
                    >
                      {s.num}
                    </span>
                  </div>

                  {/* Карточка шага */}
                  <div
                    className={`max-w-xl md:w-[calc(50%-5rem)] ${
                      left ? 'md:mr-auto md:text-right' : 'md:ml-auto'
                    }`}
                  >
                    <h3
                      className={`font-extrabold ${last ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}`}
                      style={last ? { color: 'var(--red)' } : undefined}
                    >
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed font-medium md:text-base">{s.text}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
