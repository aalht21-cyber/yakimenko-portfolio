import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ClockScene } from '../three/ClockScene'

gsap.registerPlugin(ScrollTrigger)

const QUALITIES = [
  {
    title: 'Автономный',
    text: 'Не жду инструкции на каждый шаг: сам предлагаю решение и прихожу с готовым вариантом.',
    // верх — стартует там же, где стрелка; смещён влево, чтобы стрелка не пересекала текст
    pos: 'left-[75%] top-[26%] -translate-x-1/2 -translate-y-1/2 text-center items-center md:left-[63%]',
  },
  {
    title: 'Системный',
    text: 'Люблю порядок, структуру, регламенты и умею строить их с нуля.',
    // право — четверть оборота
    pos: 'left-[75%] top-[74%] -translate-x-1/2 -translate-y-1/2 text-center items-center md:left-[63%]',
  },
  {
    title: 'Довожу до конца',
    text: 'Даже когда план сдвигается, довожу этапы до результата, а не бросаю на середине.',
    // низ — смещён вправо, чтобы стрелка не пересекала текст
    pos: 'left-[25%] top-[74%] -translate-x-1/2 -translate-y-1/2 text-center items-center md:left-[37%]',
  },
  {
    title: 'Честный',
    text: 'Говорю прямо, где не хватает опыта, а не приукрашиваю, и быстро учусь там, где пробел.',
    // лево
    pos: 'left-[25%] top-[26%] -translate-x-1/2 -translate-y-1/2 text-center items-center md:left-[37%]',
  },
]

// Стрелка проходит четверти: верх → право → низ → лево
const THRESHOLDS = [0.13, 0.38, 0.63, 0.88]

export default function WorkStyle() {
  const sectionRef = useRef<HTMLElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(0)
  const [sceneOk, setSceneOk] = useState(true)

  useEffect(() => {
    if (!mountRef.current || !sectionRef.current) return
    let scene: ClockScene
    try {
      scene = new ClockScene(mountRef.current)
    } catch {
      setSceneOk(false)
      setRevealed(QUALITIES.length)
      return
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let st: ScrollTrigger | undefined
    if (reduce) {
      scene.setProgress(1)
      setRevealed(QUALITIES.length)
    } else {
      st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=180%',
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          scene.setProgress(self.progress)
          setRevealed(THRESHOLDS.filter((t) => self.progress > t).length)
        },
      })
    }
    return () => {
      st?.kill()
      scene.dispose()
    }
  }, [])

  return (
    <section
      id="style"
      ref={sectionRef}
      aria-label="Стиль работы"
      className="overflow-hidden border-t border-[var(--ink)]/10"
    >
      <div className="mx-auto flex min-h-[100svh] max-w-[1440px] flex-col px-5 pt-[104px] pb-8 md:px-10">
        <h2 className="font-display text-4xl font-bold uppercase md:text-6xl">Какой я в работе</h2>

        <div className="relative mt-2 flex-1">
          {/* Стрелки по центру */}
          <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
          {!sceneOk && (
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 h-[38vh] w-2 origin-bottom -translate-x-1/2 -translate-y-full"
              style={{ background: 'var(--red)' }}
            />
          )}

          {/* Качества проявляются прямо на «часах», по четвертям */}
          {QUALITIES.map((q, i) => (
            <div
              key={q.title}
              className={`absolute flex max-w-[40vw] flex-col transition-all duration-500 md:max-w-[280px] ${q.pos} ${
                i < revealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              <h3 className="font-display text-lg font-semibold uppercase md:text-2xl">
                <span style={{ color: 'var(--red)' }}>{String(i + 1).padStart(2, '0')} </span>
                {q.title}
              </h3>
              <p className="mt-1 text-xs leading-snug font-medium md:text-base md:leading-relaxed">
                {q.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
