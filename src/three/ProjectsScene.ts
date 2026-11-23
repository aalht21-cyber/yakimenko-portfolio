import * as THREE from 'three'

const RED = '#9a1f20'
const INK = '#1c1a17'

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

interface FolderSpec {
  name: string
  num: string
  base: string
  ink: string
}

const FOLDERS: FolderSpec[] = [
  { name: 'BOOST MARINE', num: '01', base: RED, ink: '#f3f0e7' },
  { name: 'БЮРО A13', num: '02', base: INK, ink: '#f3f0e7' },
  { name: 'REVOLUTION PRINT', num: '03', base: RED, ink: '#f3f0e7' },
  { name: 'AART ATELIER', num: '04', base: INK, ink: '#f3f0e7' },
  { name: 'СВОИ НАРАБОТКИ', num: '05', base: RED, ink: '#f3f0e7' },
]

/* --- Текстуры --- */

/** Зернистая бумага/картон с волокнами и затемнением кромок */
function makePaperTexture(base: string, w = 512, h = 640): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  // зерно
  for (let i = 0; i < 5200; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const a = Math.random() * 0.07
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`
    ctx.fillRect(x, y, 1.4, 1.4)
  }
  // волокна
  ctx.strokeStyle = 'rgba(0,0,0,0.045)'
  for (let i = 0; i < 130; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 14 + Math.random() * 30, y + (Math.random() - 0.5) * 6)
    ctx.stroke()
  }
  // затемнение кромок (объём)
  const edge = ctx.createLinearGradient(0, 0, w, 0)
  edge.addColorStop(0, 'rgba(0,0,0,0.22)')
  edge.addColorStop(0.06, 'rgba(0,0,0,0)')
  edge.addColorStop(0.94, 'rgba(0,0,0,0)')
  edge.addColorStop(1, 'rgba(0,0,0,0.22)')
  ctx.fillStyle = edge
  ctx.fillRect(0, 0, w, h)
  const edgeY = ctx.createLinearGradient(0, 0, 0, h)
  edgeY.addColorStop(0, 'rgba(255,255,255,0.10)')
  edgeY.addColorStop(0.12, 'rgba(0,0,0,0)')
  edgeY.addColorStop(0.9, 'rgba(0,0,0,0)')
  edgeY.addColorStop(1, 'rgba(0,0,0,0.25)')
  ctx.fillStyle = edgeY
  ctx.fillRect(0, 0, w, h)
  // линия сгиба у корешка
  ctx.fillStyle = 'rgba(0,0,0,0.16)'
  ctx.fillRect(w * 0.085, 0, 2.5, h)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** Гофрокартон для коробки */
function makeCardboardTexture(): THREE.CanvasTexture {
  const w = 512
  const h = 512
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#c4a878'
  ctx.fillRect(0, 0, w, h)

  // крафт-зерно
  for (let i = 0; i < 6500; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const a = Math.random() * 0.08
    ctx.fillStyle = Math.random() > 0.45 ? `rgba(60,42,20,${a})` : `rgba(255,240,210,${a})`
    ctx.fillRect(x, y, 1.5, 1.5)
  }
  // длинные волокна
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    ctx.strokeStyle = `rgba(90,64,32,${0.04 + Math.random() * 0.05})`
    ctx.lineWidth = 1 + Math.random()
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 40 + Math.random() * 90, y + (Math.random() - 0.5) * 10)
    ctx.stroke()
  }
  // горизонтальные полосы гофры
  for (let y = 0; y < h; y += 7) {
    ctx.fillStyle = 'rgba(80,56,26,0.05)'
    ctx.fillRect(0, y, w, 1.4)
  }
  // пятна и потёртости
  for (let i = 0; i < 14; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 18 + Math.random() * 60
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(70,48,22,${0.03 + Math.random() * 0.05})`)
    g.addColorStop(1, 'rgba(70,48,22,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

/** Наклейка-этикетка на папке */
function makeLabelTexture(spec: FolderSpec): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 360
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const draw = () => {
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, c.width, c.height)
    // белая этикетка с рамкой и лёгкой тенью
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.fillRect(20, 24, 472, 312)
    ctx.fillStyle = '#f6f2e8'
    ctx.fillRect(14, 14, 472, 312)
    ctx.strokeStyle = 'rgba(20,19,16,0.55)'
    ctx.lineWidth = 3
    ctx.strokeRect(30, 30, 440, 280)
    ctx.fillStyle = '#141310'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#9a1f20'
    ctx.font = '700 88px Oswald, "Arial Narrow", sans-serif'
    ctx.fillText(spec.num, 48, 48)
    ctx.fillStyle = '#141310'
    ctx.font = '800 42px Manrope, Arial, sans-serif'
    const words = spec.name.split(' ')
    let y = 168
    let line = ''
    for (const w of words) {
      const test = line ? line + ' ' + w : w
      if (ctx.measureText(test).width > 400 && line) {
        ctx.fillText(line, 48, y)
        y += 52
        line = w
      } else {
        line = test
      }
    }
    ctx.fillText(line, 48, y)
    tex.needsUpdate = true
  }
  draw()
  if (document.fonts?.ready) document.fonts.ready.then(draw)
  return tex
}

export class ProjectsScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private folders: THREE.Group[] = []
  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2()
  private ro: ResizeObserver
  private progress = 0
  private slotScale = 1
  private disposed = false

  constructor(
    private container: HTMLElement,
    private onPick: (index: number) => void,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.domElement.style.display = 'block'
    container.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60)
    this.camera.position.set(0, 2.6, 6.2)
    this.camera.lookAt(0, 1.05, 0)

    // Свет
    this.scene.add(new THREE.HemisphereLight(0xfffaf0, 0xd8d0bd, 1.0))
    const dir = new THREE.DirectionalLight(0xffffff, 1.7)
    dir.position.set(4, 7, 5)
    dir.castShadow = true
    dir.shadow.mapSize.set(2048, 2048)
    dir.shadow.camera.left = -7
    dir.shadow.camera.right = 7
    dir.shadow.camera.top = 7
    dir.shadow.camera.bottom = -4
    dir.shadow.radius = 5
    this.scene.add(dir)

    // Пол: прозрачный, только принимает тень (фон страницы остаётся родным)
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.26 }))
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)

    this.buildBox()
    this.buildFolders()

    // Взаимодействие
    this.renderer.domElement.addEventListener('pointerdown', this.handlePointer)
    this.renderer.domElement.addEventListener('pointermove', this.handleHover)

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(container)
    this.resize()
    this.applyProgress()
    this.loop()
  }

  /** Открытая картонная коробка архива с фактурой */
  private buildBox() {
    const cardTex = makeCardboardTexture()
    const mat = new THREE.MeshStandardMaterial({
      map: cardTex,
      bumpMap: cardTex,
      bumpScale: 0.6,
      roughness: 0.95,
    })
    const t = 0.055
    const w = 3.8
    const d = 2.1
    const hFront = 1.1
    const hBack = 1.55
    const g = new THREE.Group()

    const mk = (bw: number, bh: number, bd: number, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat)
      m.position.set(x, y, z)
      m.castShadow = true
      m.receiveShadow = true
      g.add(m)
      return m
    }
    mk(w, t, d, 0, t / 2, 0) // дно
    mk(w, hFront, t, 0, hFront / 2, d / 2) // передняя стенка (пониже)
    mk(w, hBack, t, 0, hBack / 2, -d / 2) // задняя
    mk(t, hBack, d, -w / 2, hBack / 2, 0) // левая
    mk(t, hBack, d, w / 2, hBack / 2, 0) // правая

    // тёмный внутренний объём (глубина коробки)
    const inner = new THREE.Mesh(
      new THREE.BoxGeometry(w - 2 * t, 0.02, d - 2 * t),
      new THREE.MeshStandardMaterial({ color: 0x2a2015, roughness: 1 }),
    )
    inner.position.set(0, t + 0.01, 0)
    g.add(inner)

    // откидные клапаны
    const flapFront = new THREE.Mesh(new THREE.BoxGeometry(w, t, 0.62), mat)
    flapFront.position.set(0, hFront, d / 2 + 0.28)
    flapFront.rotation.x = 0.52
    flapFront.castShadow = true
    g.add(flapFront)

    const flapBack = new THREE.Mesh(new THREE.BoxGeometry(w, t, 0.62), mat)
    flapBack.position.set(0, hBack, -d / 2 - 0.28)
    flapBack.rotation.x = -0.45
    flapBack.castShadow = true
    g.add(flapBack)

    const flapL = new THREE.Mesh(new THREE.BoxGeometry(0.55, t, d), mat)
    flapL.position.set(-w / 2 - 0.24, hBack, 0)
    flapL.rotation.z = 0.5
    flapL.castShadow = true
    g.add(flapL)

    const flapR = flapL.clone()
    flapR.position.x = w / 2 + 0.24
    flapR.rotation.z = -0.5
    g.add(flapR)

    g.position.set(0, 0, -0.6)
    this.scene.add(g)
  }

  private buildFolders() {
    FOLDERS.forEach((spec, i) => {
      const grp = new THREE.Group()
      const paperTex = makePaperTexture(spec.base)
      const mat = new THREE.MeshStandardMaterial({
        map: paperTex,
        bumpMap: paperTex,
        bumpScale: 0.35,
        roughness: 0.85,
      })

      // тонкие грани, к центру папка чуть утолщается, как настоящая
      const bodyGeo = new THREE.BoxGeometry(0.95, 1.5, 0.07, 1, 8, 1)
      const bp = bodyGeo.attributes.position
      for (let v = 0; v < bp.count; v++) {
        const bulge = Math.max(0, Math.cos((bp.getY(v) / 1.5) * Math.PI))
        bp.setZ(v, bp.getZ(v) * (1 + 1.7 * bulge))
      }
      bodyGeo.computeVertexNormals()
      const body = new THREE.Mesh(bodyGeo, mat)
      body.castShadow = true
      body.receiveShadow = true
      grp.add(body)

      const tab = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.2, 0.07), mat)
      tab.position.set(-0.26, 0.85, 0)
      tab.castShadow = true
      grp.add(tab)

      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.56),
        new THREE.MeshBasicMaterial({
          map: makeLabelTexture(spec),
          transparent: true,
          toneMapped: false,
        }),
      )
      label.position.set(0, 0.22, 0.108)
      grp.add(label)

      // стартовая позиция: выглядывает из коробки
      grp.position.set((i - 2) * 0.28, 0.95, -0.75 + i * 0.12)
      grp.rotation.z = (i % 2 === 0 ? -1 : 1) * 0.05
      grp.userData.index = i
      grp.userData.slotX = (i - 2) * 1.42
      grp.traverse((o) => (o.userData.folderRoot = grp))
      this.folders.push(grp)
      this.scene.add(grp)
    })
  }

  setProgress(p: number) {
    this.progress = clamp01(p)
    this.applyProgress()
  }

  private applyProgress() {
    // На узких экранах сжимаем веер по горизонтали, чтобы крайние папки не уходили за край
    const a = this.camera.aspect || 1
    this.slotScale = a >= 1 ? 1 : Math.max(0.55, Math.min(1, a * 1.15))
    this.folders.forEach((grp, i) => {
      const start = i * 0.14
      const t = clamp01((this.progress - start) / 0.42)
      const up = easeOutCubic(clamp01(t / 0.45)) // фаза подъёма
      const lay = easeInOutCubic(clamp01((t - 0.45) / 0.55)) // фаза раскладки

      // раскладка разбита на две части: сначала вынос вперёд НАД коробкой,
      // затем спуск уже ПЕРЕД коробкой — папка никогда не проходит сквозь стенки
      const fwd = easeInOutCubic(clamp01(lay / 0.55))
      const drop = easeInOutCubic(clamp01((lay - 0.5) / 0.5))

      const startX = (i - 2) * 0.28
      const startZ = -0.75 + i * 0.12
      const topY = 0.95 + up * 1.35 // вершина подъёма: низ папки выше стенок, но в кадре
      const y = topY - drop * (topY - 0.75)
      const x = startX + (grp.userData.slotX * this.slotScale - startX) * fwd
      const z = startZ + (1.0 - startZ) * fwd
      grp.position.set(x, y, z)
      grp.rotation.z = (i % 2 === 0 ? -1 : 1) * 0.05 * (1 - lay)
      grp.rotation.y = ((i % 2 === 0 ? -1 : 1) * 0.1 + (i - 2) * 0.02) * lay
      grp.rotation.x = -0.08 * (1 - up) + 0.04 * Math.sin(lay * Math.PI)
    })
    // Камера отодвигается так, чтобы все 5 папок помещались по ширине кадра
    const aspect = this.camera.aspect || 1
    const halfW = 3.32 * this.slotScale + 0.3
    const needZ = 1 + halfW / (Math.tan(THREE.MathUtils.degToRad(17)) * Math.min(aspect, 3))
    this.camera.position.z = Math.max(6.2, Math.min(needZ, 26))
    this.camera.lookAt(0, 1.05, 0)
  }

  private handlePointer = (e: PointerEvent) => {
    const hit = this.pick(e)
    if (hit !== null) this.onPick(hit)
  }

  private handleHover = (e: PointerEvent) => {
    const hit = this.pick(e)
    this.renderer.domElement.style.cursor = hit !== null ? 'pointer' : 'default'
  }

  private pick(e: PointerEvent): number | null {
    const r = this.renderer.domElement.getBoundingClientRect()
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObjects(this.folders, true)
    if (!hits.length) return null
    const root = hits[0].object.userData.folderRoot as THREE.Group | undefined
    return root ? (root.userData.index as number) : null
  }

  private resize() {
    const w = this.container.clientWidth || 1
    const h = this.container.clientHeight || 1
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.applyProgress()
  }

  private loop = () => {
    if (this.disposed) return
    requestAnimationFrame(this.loop)
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    this.ro.disconnect()
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointer)
    this.renderer.domElement.removeEventListener('pointermove', this.handleHover)
    this.scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose()
        const m = o.material as THREE.Material | THREE.Material[]
        ;(Array.isArray(m) ? m : [m]).forEach((mm) => mm.dispose())
      }
    })
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
