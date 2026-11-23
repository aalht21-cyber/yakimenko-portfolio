import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import heroPhoto from '../assets/hero-photo.png'
import { scrollToHash } from '../lib/scroll'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { value: '3→10', caption: 'команда выросла с 3 до 10 человек' },
  { value: '60%→5%', caption: 'потери заявок после внедрения таск-трекера' },
  { value: '4 проекта', caption: 'закрыты под моим руководством, более 200 000 ₽' },
]

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const [revealed, setRevealed] = useState<boolean[]>(STATS.map(() => false))

  const reveal = (i: number) =>
    setRevealed((prev) => (prev[i] ? prev : prev.map((v, idx) => (idx === i ? true : v))))

  /* Мобильная версия: подписи раскрываются сами, по очереди */
  useEffect(() => {
    const isTouch =
      window.matchMedia('(hover: none)').matches || window.matchMedia('(max-width: 767px)').matches
    if (!isTouch) return
    const timers = STATS.map((_, i) => window.setTimeout(() => reveal(i), 700 + i * 600))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [])

  /* Имя подгоняется ровно под ширину экрана */
  useEffect(() => {
    const el = nameRef.current
    if (!el) return
    const fit = () => {
      el.style.fontSize = '100px'
      el.style.width = 'max-content'
      const w = el.offsetWidth || 1
      el.style.width = ''
      const target = (el.parentElement?.clientWidth || window.innerWidth) * 0.985
      el.style.fontSize = `${Math.min((100 * target) / w, 230)}px`
    }
    fit()
    window.addEventListener('resize', fit)
    if (document.fonts?.ready) document.fonts.ready.then(fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  /* Первый скролл: экран стоит на месте (pin), фото всплывает поверх имени */
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !rootRef.current || !photoRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        photoRef.current,
        { y: 320, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: '+=25%',
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        },
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="hero"
      ref={rootRef}
      className="relative flex min-h-[calc(100svh-84px)] flex-col overflow-hidden"
      aria-label="Первый экран: Александр Якименко, операционный менеджер"
    >
      {/* Гигантское имя за фото, во всю ширину */}
      <h1
        ref={nameRef}
        className="font-display pointer-events-none relative z-0 mt-2 w-full text-center leading-[0.95] font-bold tracking-tight whitespace-nowrap uppercase select-none md:absolute md:inset-x-0 md:top-[13%] md:mt-0"
        style={{ fontSize: 'clamp(2rem, 9.3vw, 14rem)', color: 'var(--red)' }}
      >
        Александр Якименко
      </h1>

      {/* Левая колонка: метка и метрики */}
      <div className="relative z-20 mt-6 px-5 md:absolute md:top-[47%] md:left-8 md:mt-0 md:max-w-[300px] lg:left-10">
        <p className="text-base font-extrabold tracking-wide uppercase md:text-lg">
          Операционщик · IT и Digital
        </p>
        <ul className="mt-6 space-y-5 md:mt-12">
          {STATS.map((s, i) => (
            <li key={s.value}>
              <button
                type="button"
                onMouseEnter={() => reveal(i)}
                onFocus={() => reveal(i)}
                onClick={() => reveal(i)}
                className="cursor-pointer text-left text-3xl font-extrabold whitespace-nowrap md:text-4xl"
                style={{ color: 'var(--red)' }}
                aria-expanded={revealed[i]}
              >
                {s.value}
              </button>
              <div className={`stat-caption ${revealed[i] ? 'revealed' : ''}`}>
                <div>
                  <p className="pt-1 text-sm font-medium md:text-base">{s.caption}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Правая колонка: оффер, кнопка, био */}
      <div className="relative z-20 mt-8 px-5 pb-10 text-left md:absolute md:top-[47%] md:right-8 md:mt-0 md:max-w-[340px] md:p-0 md:text-right lg:right-10">
        <p className="text-xl font-extrabold md:text-2xl">
          Беру операционку и хаос на себя, чтобы CEO занимался главным.
        </p>
        <a
          href="#contacts"
          onClick={scrollToHash}
          className="mt-6 inline-block px-1 py-1 text-3xl font-extrabold lowercase transition-colors md:text-4xl"
          style={{ color: 'var(--red)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--red-bright)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--red)')}
        >
          связаться
        </a>
        <p className="mt-8 text-sm font-medium md:text-base">
          Операционный менеджер в EdTech.
          <br />
          Полгода заместителем CEO в Agile Business.
          <br />
          Навожу порядок в процессах, сроках и командах.
        </p>
      </div>

      {/* Фото поверх имени; мягкий переход только по самой нижней границе */}
      <div
        ref={photoRef}
        className="pointer-events-none relative z-10 mx-auto mt-auto w-[min(78vw,420px)] opacity-0 md:absolute md:bottom-0 md:left-1/2 md:mt-0 md:w-auto md:-translate-x-1/2"
        aria-hidden="true"
      >
        <img
          src={heroPhoto}
          alt=""
          width={1214}
          height={1500}
          className="block h-auto w-full md:h-[calc(100svh-120px)] md:w-auto"
          style={{
            maskImage: 'linear-gradient(to bottom, black 86%, transparent 99.5%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 86%, transparent 99.5%)',
          }}
        />
      </div>
    </section>
  )
}
