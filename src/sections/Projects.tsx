import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ProjectsScene } from '../three/ProjectsScene'
import { PROJECTS, type Project } from '../data/projects'

gsap.registerPlugin(ScrollTrigger)

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[var(--ink)]/45 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        className="max-h-[88dvh] w-full max-w-4xl overflow-y-auto border-2 border-[var(--ink)] bg-[var(--paper)] p-6 shadow-[10px_10px_0_var(--ink)] md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6">
          <h3 className="font-display text-3xl font-bold uppercase md:text-5xl">{project.title}</h3>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="shrink-0 cursor-pointer border-2 border-[var(--ink)] px-3 py-1 text-xl font-extrabold transition-colors hover:bg-[var(--red)] hover:text-[var(--paper)]"
          >
            ✕
          </button>
        </div>

        <p className="mt-4 max-w-[65ch] text-base font-medium md:text-lg">{project.description}</p>

        {project.term && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="border-l-4 border-[var(--red)] pl-4">
              <p className="text-sm font-extrabold tracking-wide uppercase" style={{ color: 'var(--red)' }}>
                Срок
              </p>
              <p className="mt-1 text-base">{project.term}</p>
            </div>
            <div className="border-l-4 border-[var(--red)] pl-4">
              <p className="text-sm font-extrabold tracking-wide uppercase" style={{ color: 'var(--red)' }}>
                Результат
              </p>
              <p className="mt-1 text-base">{project.result}</p>
            </div>
          </div>
        )}

        {project.shots && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {project.shots.map((s) => (
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                loading="lazy"
                className="w-full border border-[var(--ink)]/20 object-cover"
              />
            ))}
          </div>
        )}

        {project.cases && (
          <div className="mt-8 space-y-6">
            {project.cases.map((c, i) => (
              <article key={c.title} className="border-t-2 border-[var(--ink)]/15 pt-4">
                <h4 className="text-lg font-extrabold md:text-xl">
                  <span style={{ color: 'var(--red)' }}>{String(i + 1).padStart(2, '0')}</span>{' '}
                  {c.title}
                </h4>
                <p className="mt-2 max-w-[70ch] text-sm md:text-base">{c.text}</p>
                <p className="mt-2 text-sm font-bold md:text-base">
                  Результат: <span className="font-medium">{c.result}</span>
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<ProjectsScene | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const [sceneOk, setSceneOk] = useState(true)

  useEffect(() => {
    if (!mountRef.current || !sectionRef.current) return
    try {
      sceneRef.current = new ProjectsScene(mountRef.current, (i) => setOpen(i))
    } catch {
      setSceneOk(false)
      return
    }
    const scene = sceneRef.current

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let st: ScrollTrigger | undefined
    if (reduce) {
      scene.setProgress(1)
    } else {
      st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=180%',
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => scene.setProgress(self.progress),
      })
    }
    return () => {
      st?.kill()
      scene.dispose()
      sceneRef.current = null
    }
  }, [])

  return (
    <section id="projects" ref={sectionRef} aria-label="Проекты" className="relative overflow-hidden">
      <div className="flex min-h-[100svh] flex-col px-5 pt-[104px] md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-bold uppercase md:text-6xl">
              Закрытые проекты
              <br />
              под моим руководством
            </h2>
            <p className="mt-3 max-w-[52ch] text-base font-medium md:text-lg">
              4 проекта в роли операционного менеджера на сумму более 200 000 ₽ — и собственные
              наработки пятой папкой.
            </p>
          </div>
          <p className="hidden text-sm font-bold tracking-wide uppercase opacity-60 md:block">
            листайте — папки достанутся сами · нажмите на папку, чтобы открыть
          </p>
        </div>

        <div className="relative mt-2 flex-1">
          {/* Статичная подложка на случай отсутствия WebGL */}
          {!sceneOk && (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-end justify-center gap-3 pb-[12%]"
            >
              {PROJECTS.map((p, i) => (
                <div
                  key={p.id}
                  className="h-40 w-24 border border-[var(--ink)]/30"
                  style={{
                    background: i % 2 === 0 ? 'var(--red)' : 'var(--ink)',
                  }}
                />
              ))}
            </div>
          )}
          <div
            ref={mountRef}
            className="absolute inset-0 min-h-[55vh]"
            aria-hidden="true"
          />
        </div>

        {/* Кнопки-дубли для клавиатуры и тача */}
        <ul className="flex flex-wrap justify-center gap-2 pb-6">
          {PROJECTS.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="cursor-pointer border border-[var(--ink)]/40 px-3 py-2 text-xs font-extrabold tracking-wide uppercase transition-colors hover:bg-[var(--red)] hover:text-[var(--paper)] focus-visible:bg-[var(--red)] focus-visible:text-[var(--paper)]"
              >
                {String(i + 1).padStart(2, '0')} · {p.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {open !== null && <ProjectModal project={PROJECTS[open]} onClose={() => setOpen(null)} />}
    </section>
  )
}
