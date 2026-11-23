import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SERVICES = [
  {
    title: 'Аудит и консультация',
    text: 'Разбираю, как сейчас устроены ваши команда и процессы, нахожу, где теряются время и заявки, и даю понятный план, что исправить. Можно ограничиться консультацией: вы забираете рекомендации и внедряете сами.',
    pos: 'md:left-[6%] md:top-[2%] md:w-[31%] md:-rotate-1',
  },
  {
    title: 'Процессы и сроки',
    text: 'Выстраиваю путь задачи от постановки до результата и убираю места, где она стоит. Внедряю трекер задач и регламенты, чтобы сроки не зависели от того, кто что помнит.',
    pos: 'md:left-[36%] md:top-[0%] md:w-[31%] md:rotate-1',
  },
  {
    title: 'Команда',
    text: 'Ставлю задачи, слежу за нагрузкой и вовлечённостью, собираю людей в работающую систему. Помогаю выстроить найм и адаптацию новых сотрудников. Создаю корпоративную культуру и командные традиции.',
    pos: 'md:left-[66%] md:top-[8%] md:w-[30%] md:-rotate-1',
  },
  {
    title: 'Узкие места и потери',
    text: 'Нахожу, где теряются заявки, документы и время, и закрываю. Не жду инструкций: сам предлагаю решение и прихожу с готовым вариантом.',
    pos: 'md:left-[20%] md:top-[52%] md:w-[33%] md:rotate-1',
  },
  {
    title: 'Запуск проектов и контроль сроков',
    text: 'Веду проект от ТЗ до сдачи: координирую команду и подрядчиков, контролирую сроки, согласую правки с клиентом.',
    pos: 'md:left-[50%] md:top-[56%] md:w-[32%] md:-rotate-1',
  },
]

export default function Services() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.service-window').forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 70, scale: 0.92 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: rootRef.current,
              start: `top+=${i * 9}% 65%`,
              end: `top+=${i * 9 + 18}% 45%`,
              scrub: 0.4,
            },
          },
        )
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="services"
      ref={rootRef}
      aria-label="Услуги"
      className="border-t border-[var(--ink)]/10 px-5 pt-20 pb-16 md:px-10 md:pt-28"
    >
      <div className="mx-auto max-w-[1440px]">
        <h2 className="font-display text-4xl font-bold uppercase md:text-6xl">
          Чем я могу быть полезен
        </h2>
        <p className="mt-3 max-w-[52ch] text-base font-medium md:text-lg">
          Выберите задачу или опишите свою — подберу формат под вас.
        </p>

        <div className="mt-12 space-y-5 md:relative md:mt-6 md:h-[580px] md:space-y-0">
          {SERVICES.map((s, i) => (
            <article
              key={s.title}
              className={`service-window border-2 border-[var(--ink)] bg-[var(--paper)] shadow-[8px_8px_0_rgba(20,19,16,0.85)] transition-transform duration-200 hover:-translate-y-1.5 md:absolute ${s.pos}`}
            >
              <header
                className="flex items-center justify-between gap-3 border-b-2 border-[var(--ink)] px-4 py-2"
                style={{ background: i % 2 === 0 ? 'var(--red)' : 'var(--ink)' }}
              >
                <h3 className="text-sm font-extrabold tracking-wide uppercase text-[var(--paper)] md:text-base">
                  {s.title}
                </h3>
                <span className="flex gap-1.5" aria-hidden="true">
                  <i className="block h-2.5 w-2.5 bg-[var(--paper)]/85" />
                  <i className="block h-2.5 w-2.5 bg-[var(--paper)]/85" />
                  <i className="block h-2.5 w-2.5 bg-[var(--paper)]" />
                </span>
              </header>
              <p className="px-4 py-4 text-sm leading-relaxed font-medium md:text-base">{s.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center md:mt-1">
          <a
            href="#contacts"
            className="inline-block border-2 border-[var(--ink)] px-8 py-4 text-lg font-extrabold tracking-wide uppercase transition-colors hover:bg-[var(--red)] hover:text-[var(--paper)] focus-visible:bg-[var(--red)] focus-visible:text-[var(--paper)]"
          >
            Обсудить задачу
          </a>
        </div>
      </div>
    </section>
  )
}
