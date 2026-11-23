import * as THREE from 'three'

const INK = 0x1b1b19
const NAVY = 0x232c3d
const RED = 0x9a1f20
const SKIN = 0xd9b08c

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export type BoardroomMode = 'grid' | 'table'

/* ---------- Текстуры ---------- */

/** Excel-сетка как текстура пола */
function makeGridTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 1600
  c.height = 440
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#f3f0e7'
  ctx.fillRect(0, 0, c.width, c.height)
  const headCol = 90
  const headRow = 64
  const cols = 8
  const rows = 2
  const cw = (c.width - headCol) / cols
  const rh = (c.height - headRow) / rows
  // шапка столбцов и строк — фирменный экселевский приглушённый зелёный
  ctx.fillStyle = 'rgba(46,125,50,0.13)'
  ctx.fillRect(0, 0, c.width, headRow)
  ctx.fillRect(0, 0, headCol, c.height)
  ctx.strokeStyle = 'rgba(27,27,25,0.32)'
  ctx.lineWidth = 1.4
  for (let i = 0; i <= cols; i++) {
    ctx.beginPath()
    ctx.moveTo(headCol + i * cw, 0)
    ctx.lineTo(headCol + i * cw, c.height)
    ctx.stroke()
  }
  for (let j = 0; j <= rows; j++) {
    ctx.beginPath()
    ctx.moveTo(0, headRow + j * rh)
    ctx.lineTo(c.width, headRow + j * rh)
    ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(27,27,25,0.45)'
  ctx.strokeRect(0.7, 0.7, c.width - 1.4, c.height - 1.4)
  ctx.beginPath()
  ctx.moveTo(headCol, 0)
  ctx.lineTo(headCol, c.height)
  ctx.moveTo(0, headRow)
  ctx.lineTo(0, c.height)
  ctx.stroke()
  ctx.fillStyle = 'rgba(27,27,25,0.6)'
  ctx.font = '700 26px Manrope, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const letters = 'ABCDEFGH'
  for (let i = 0; i < cols; i++) ctx.fillText(letters[i], headCol + i * cw + cw / 2, headRow / 2)
  for (let j = 0; j < rows; j++) ctx.fillText(String(j + 1), headCol / 2, headRow + j * rh + rh / 2)
  // читаемые значения в ячейках, как в настоящей таблице
  ctx.font = '600 30px Manrope, Arial, sans-serif'
  ctx.fillStyle = 'rgba(27,27,25,0.72)'
  const vals: [number, number, string][] = [
    [0, 0, 'проект'],
    [1, 0, 'срок'],
    [3, 0, '12'],
    [5, 0, 'OK'],
    [2, 1, '04'],
    [4, 1, '₽'],
    [6, 1, 'готово'],
  ]
  vals.forEach(([ci, ri, v]) =>
    ctx.fillText(v, headCol + ci * cw + cw / 2, headRow + ri * rh + rh / 2),
  )
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** Тёмное дерево столешницы: доски, текстура годовых колец, поры */
function makeWoodTexture(): THREE.CanvasTexture {
  const w = 1024
  const h = 512
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#7d5f42'
  ctx.fillRect(0, 0, w, h)

  // доски
  const planks = 4
  for (let p = 0; p < planks; p++) {
    const y0 = (p * h) / planks
    const shade = 0.92 + Math.random() * 0.16
    ctx.fillStyle = `rgba(${Math.round(125 * shade)},${Math.round(95 * shade)},${Math.round(66 * shade)},1)`
    ctx.fillRect(0, y0, w, h / planks)
    // волокна вдоль доски
    for (let i = 0; i < 46; i++) {
      const y = y0 + Math.random() * (h / planks)
      const dark = Math.random() > 0.4
      ctx.strokeStyle = dark
        ? `rgba(30,18,10,${0.05 + Math.random() * 0.12})`
        : `rgba(214,178,138,${0.04 + Math.random() * 0.07})`
      ctx.lineWidth = 0.8 + Math.random() * 1.8
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 0; x <= w; x += 64) {
        ctx.lineTo(x, y + Math.sin(x / 90 + p * 3 + i) * (2 + Math.random() * 4))
      }
      ctx.stroke()
    }
    // сучки
    if (Math.random() > 0.35) {
      const kx = Math.random() * w
      const ky = y0 + (h / planks) * (0.3 + Math.random() * 0.4)
      for (let r = 9; r > 0; r -= 2) {
        ctx.strokeStyle = `rgba(28,17,9,${0.16 - r * 0.01})`
        ctx.beginPath()
        ctx.ellipse(kx, ky, r * 1.8, r, 0.2, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    // шов между досками
    ctx.fillStyle = 'rgba(15,9,5,0.5)'
    ctx.fillRect(0, y0, w, 2)
  }
  // поры-точки
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(20,12,6,${Math.random() * 0.12})`
    ctx.fillRect(Math.random() * w, Math.random() * h, 1.6, 1)
  }
  // мягкий свет по центру
  const g = ctx.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, w / 1.4)
  g.addColorStop(0, 'rgba(255,230,190,0.10)')
  g.addColorStop(1, 'rgba(0,0,0,0.10)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** Текст подвала прямо на столешнице; строки проявляются по мере скролла */
function makeTableText(): {
  tex: THREE.CanvasTexture
  draw: (alphas: [number, number, number]) => void
} {
  const c = document.createElement('canvas')
  c.width = 2048
  c.height = 820
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const draw = (alphas: [number, number, number]) => {
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const maxW = c.width - 170
    // подгоняем кегль, чтобы строка гарантированно влезала в столешницу
    const fit = (text: string, weight: number, size: number, family: string) => {
      let s = size
      ctx.font = `${weight} ${s}px ${family}`
      while (ctx.measureText(text).width > maxW && s > 22) {
        s -= 4
        ctx.font = `${weight} ${s}px ${family}`
      }
    }

    ctx.globalAlpha = alphas[0]
    ctx.fillStyle = '#f3f0e7'
    fit('ПОКА ВЫ СТРОИТЕ БИЗНЕС,', 700, 148, 'Oswald, "Arial Narrow", sans-serif')
    ctx.fillText('ПОКА ВЫ СТРОИТЕ БИЗНЕС,', c.width / 2, 200)

    ctx.globalAlpha = alphas[1]
    ctx.fillStyle = '#9a1f20'
    fit('Я СТРОЮ ПОРЯДОК И СТАБИЛЬНОСТЬ.', 700, 148, 'Oswald, "Arial Narrow", sans-serif')
    ctx.fillText('Я СТРОЮ ПОРЯДОК И СТАБИЛЬНОСТЬ.', c.width / 2, 400)

    ctx.globalAlpha = alphas[2]
    ctx.fillStyle = 'rgba(243,240,231,0.92)'
    fit(
      'Александр Якименко · +7 (977) 568-94-60 · Xyakimenko200656@gmail.com · Telegram @Alexandr_Vadimovich20',
      600,
      64,
      'Manrope, Arial, sans-serif',
    )
    ctx.fillText(
      'Александр Якименко · +7 (977) 568-94-60 · Xyakimenko200656@gmail.com · Telegram @Alexandr_Vadimovich20',
      c.width / 2,
      640,
    )
    ctx.globalAlpha = 1
    tex.needsUpdate = true
  }
  return { tex, draw }
}

/* ---------- Фигуры ---------- */

interface Figure {
  root: THREE.Group
  torso: THREE.Mesh
  head: THREE.Mesh
  armL: THREE.Group
  armR: THREE.Group
  legL: THREE.Group
  legR: THREE.Group
  kneeL: THREE.Group
  kneeR: THREE.Group
  startRot?: number
  start?: THREE.Vector3
  seat?: THREE.Vector3
  seatRot?: number
  delay?: number
  idlePhase: number
  idleSpeed: number
}

function makeFigure(suit: number): Figure {
  const root = new THREE.Group()
  const suitMat = new THREE.MeshStandardMaterial({ color: suit, roughness: 0.7 })
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.8 })
  const skinMat = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.55 })
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x14100c, roughness: 0.35 })

  // ноги: бедро (группа в бедре) + голень со ступнёй (группа в колене) —
  // так можно согнуть ногу при посадке, не проходя сквозь стул
  const mkLeg = (side: number) => {
    const hip = new THREE.Group()
    hip.position.set(side * 0.11, 0.8, 0)
    root.add(hip)
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.2, 4, 10), pantsMat)
    thigh.position.set(0, -0.17, 0)
    thigh.castShadow = true
    hip.add(thigh)
    const knee = new THREE.Group()
    knee.position.set(0, -0.34, 0)
    hip.add(knee)
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.3, 4, 10), pantsMat)
    shin.position.set(0, -0.19, 0)
    shin.castShadow = true
    knee.add(shin)
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.3), shoeMat)
    shoe.position.set(0, -0.42, 0.07)
    shoe.castShadow = true
    knee.add(shoe)
    return { hip, knee }
  }
  const { hip: legL, knee: kneeL } = mkLeg(-1)
  const { hip: legR, knee: kneeR } = mkLeg(1)

  // торс (пиджак)
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.5, 4, 16), suitMat)
  torso.position.y = 0.98
  torso.castShadow = true
  root.add(torso)

  // плечи — широкие, как у взрослого человека
  const shoulders = new THREE.Mesh(new THREE.CapsuleGeometry(0.125, 0.44, 4, 12), suitMat)
  shoulders.rotation.z = Math.PI / 2
  shoulders.position.y = 1.26
  shoulders.castShadow = true
  root.add(shoulders)

  // воротник рубашки
  const collar = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.1, 0.06),
    new THREE.MeshStandardMaterial({ color: 0xf3f0e7, roughness: 0.6 }),
  )
  collar.position.set(0, 1.3, 0.16)
  root.add(collar)

  // шея и голова
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 10), skinMat)
  neck.position.y = 1.36
  root.add(neck)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.155, 24, 18), skinMat)
  head.position.y = 1.52
  head.scale.set(0.92, 1.05, 0.98)
  head.castShadow = true
  root.add(head)

  // волосы с пробором
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.158, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.52),
    new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 0.85 }),
  )
  hair.position.y = 1.545
  hair.castShadow = true
  root.add(hair)

  // руки: плечо + предплечье с кистью (группа для жестов)
  const mkArm = (side: number) => {
    const g = new THREE.Group()
    g.position.set(side * 0.385, 1.24, 0)
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.3, 4, 10), suitMat)
    upper.position.y = -0.18
    upper.castShadow = true
    g.add(upper)
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.26, 4, 10), suitMat)
    fore.position.set(0, -0.42, 0.07)
    fore.rotation.x = -0.5
    fore.castShadow = true
    g.add(fore)
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), skinMat)
    hand.position.set(0, -0.56, 0.14)
    hand.scale.set(0.85, 0.55, 1.15) // ладонь, а не шар
    hand.castShadow = true
    g.add(hand)
    g.rotation.z = side * 0.28
    root.add(g)
    return g
  }
  const armL = mkArm(-1)
  const armR = mkArm(1)

  return {
    root,
    torso,
    head,
    armL,
    armR,
    legL,
    legR,
    kneeL,
    kneeR,
    idlePhase: Math.random() * Math.PI * 2,
    idleSpeed: 0.8 + Math.random() * 0.7,
  }
}

/* ---------- Сцена ---------- */

// габариты стола
const TABLE_W = 7.2
const TABLE_D = 2.9
const SEAT_Z = 2.0
const SEAT_XS = [-2.3, 0, 2.3]
const END_X = 4.15
// центр Excel-сетки
const GRID_Z = -3.0

export class BoardroomScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private tableGroup = new THREE.Group()
  private tableText = makeTableText()
  private lastAlphas = '-1,-1,-1'
  private walkers: Figure[] = []
  private seated: Figure[] = []
  private progress = 0
  private gridExitZ = 1
  private ro: ResizeObserver
  private disposed = false
  private time = 0

  constructor(
    private container: HTMLElement,
    private mode: BoardroomMode = 'table',
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.domElement.style.display = 'block'
    container.appendChild(this.renderer.domElement)

    // Камера строго сверху, лёгкая перспектива
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80)
    this.camera.up.set(0, 0, -1)
    this.camera.position.set(0, 12, 0.35)
    this.camera.lookAt(0, 0, 0)

    this.scene.add(new THREE.HemisphereLight(0xfffaf0, 0xcfc6b2, 0.9))
    const dir = new THREE.DirectionalLight(0xffffff, 1.8)
    dir.position.set(4, 9, 3)
    dir.castShadow = true
    dir.shadow.mapSize.set(2048, 2048)
    dir.shadow.camera.left = -8
    dir.shadow.camera.right = 8
    dir.shadow.camera.top = 8
    dir.shadow.camera.bottom = -8
    dir.shadow.radius = 5
    this.scene.add(dir)

    this.buildFloor()
    this.buildWalkers()
    if (this.mode === 'table') this.buildTableScene()
    this.applyProgress()

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(container)
    this.resize()
    this.loop()
  }

  private buildFloor() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ opacity: 0.25 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)

    if (this.mode !== 'grid') return
    const grid = new THREE.Mesh(
      new THREE.PlaneGeometry(9.5, 2.6),
      new THREE.MeshStandardMaterial({ map: makeGridTexture(), roughness: 1 }),
    )
    grid.rotation.x = -Math.PI / 2
    grid.position.set(0, 0.012, GRID_Z)
    grid.receiveShadow = true
    this.scene.add(grid)
  }

  /** Фигуры: в режиме сетки стоят на ней, в режиме стола заходят сверху и садятся */
  private buildWalkers() {
    const spots: [number, number][] = [
      [-2.6, -2.9],
      [-0.8, -2.3],
      [0.9, -2.9],
      [-3.6, -2.4],
    ]
    const seats: { pos: THREE.Vector3; rot: number }[] = [
      { pos: new THREE.Vector3(SEAT_XS[0], 0, -SEAT_Z), rot: 0 },
      { pos: new THREE.Vector3(SEAT_XS[1], 0, -SEAT_Z), rot: 0 },
      { pos: new THREE.Vector3(SEAT_XS[2], 0, -SEAT_Z), rot: 0 },
      { pos: new THREE.Vector3(-END_X, 0, 0), rot: Math.PI / 2 },
    ]
    const suits = [INK, NAVY, RED, INK]
    spots.forEach(([x, z], i) => {
      const f = makeFigure(suits[i])
      f.root.position.set(x, 0, z)
      f.root.rotation.y = Math.random() * Math.PI * 2
      f.startRot = f.root.rotation.y
      f.start = new THREE.Vector3(x, 0, z)
      f.seat = seats[i].pos
      f.seatRot = seats[i].rot
      f.delay = 0.1 + i * 0.05
      this.walkers.push(f)
      this.scene.add(f.root)
    })
  }

  /** Стол переговоров, стулья и уже сидящие фигуры */
  private buildTableScene() {
    const woodTex = makeWoodTexture()
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      bumpMap: woodTex,
      bumpScale: 0.5,
      roughness: 0.55,
    })
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x2b2b2e,
      roughness: 0.35,
      metalness: 0.75,
    })
    const chairWoodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.6,
      color: 0xd8c9b2,
    })

    // столешница
    const table = new THREE.Mesh(new THREE.BoxGeometry(TABLE_W, 0.3, TABLE_D), woodMat)
    table.position.y = 0.78
    table.castShadow = true
    table.receiveShadow = true
    this.tableGroup.add(table)

    // текст подвала прямо на столе
    const textPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(TABLE_W - 0.7, ((TABLE_W - 0.7) / 2048) * 820),
      new THREE.MeshBasicMaterial({ map: this.tableText.tex, transparent: true, toneMapped: false }),
    )
    textPlane.rotation.x = -Math.PI / 2
    textPlane.position.y = 0.935
    this.tableGroup.add(textPlane)
    this.tableText.draw([0, 0, 0])

    // металлическое основание стола
    const leg = new THREE.Mesh(new THREE.BoxGeometry(TABLE_W - 1.6, 0.68, TABLE_D - 1.1), metalMat)
    leg.position.y = 0.36
    leg.castShadow = true
    this.tableGroup.add(leg)

    // стулья: металлические ножки + деревянные сиденье и спинка (спинкой ОТ стола)
    const mkChair = (x: number, z: number, rotY: number) => {
      const g = new THREE.Group()
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.56), chairWoodMat)
      seat.position.y = 0.44
      seat.castShadow = true
      g.add(seat)
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.6, 0.08), chairWoodMat)
      back.position.set(0, 0.78, -0.28)
      back.castShadow = true
      g.add(back)
      // ножки
      ;[
        [-0.24, -0.24],
        [0.24, -0.24],
        [-0.24, 0.24],
        [0.24, 0.24],
      ].forEach(([lx, lz]) => {
        const legM = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.44, 8), metalMat)
        legM.position.set(lx, 0.22, lz)
        legM.castShadow = true
        g.add(legM)
      })
      g.position.set(x, 0, z)
      g.rotation.y = rotY
      this.tableGroup.add(g)
    }
    SEAT_XS.forEach((x) => mkChair(x, -SEAT_Z, 0))
    SEAT_XS.forEach((x) => mkChair(x, SEAT_Z, Math.PI))
    mkChair(-END_X, 0, Math.PI / 2)
    mkChair(END_X, 0, -Math.PI / 2)

    // Трое уже сидят за столом (южная сторона) и обсуждают — с первого кадра
    const seatedSuits = [NAVY, INK, NAVY]
    SEAT_XS.forEach((x, i) => {
      const f = makeFigure(seatedSuits[i])
      f.root.position.set(x, -0.04, SEAT_Z)
      f.root.rotation.y = Math.PI
      f.torso.rotation.x = 0.16
      this.poseLegs(f, 1) // сидячая поза: ноги согнуты и видны из-под стола
      this.seated.push(f)
      this.tableGroup.add(f.root)
    })

    this.scene.add(this.tableGroup)
  }

  /** Поза ног: sit=0 — стоя/шаг, sit=1 — сидя.
   *  Бедро ложится вперёд над сиденьем, голень свешивается ПЕРЕД стулом —
   *  ничего не проходит сквозь стул, ноги остаются видимыми */
  private poseLegs(f: Figure, sit: number, stride = 0) {
    const hipRot = -1.4 * sit
    f.legL.rotation.x = stride * 0.55 * (1 - sit) + hipRot
    f.legR.rotation.x = -stride * 0.55 * (1 - sit) + hipRot
    f.kneeL.rotation.x = 1.4 * sit
    f.kneeR.rotation.x = 1.4 * sit
    const hy = lerp(0.8, 0.53, sit)
    f.legL.position.y = hy
    f.legR.position.y = hy
  }

  setProgress(p: number) {
    this.progress = clamp01(p)
    this.applyProgress()
  }

  private applyProgress() {
    if (this.mode === 'grid') {
      this.fitCamera()
      const p = this.progress
      // Люди уходят с Excel-таблицы вниз по экрану — на встречу столу переговоров
      this.walkers.forEach((f) => {
        const t = clamp01((p - (f.delay ?? 0) * 1.4) / 0.5)
        const e = easeInOut(t)
        const walking = t > 0 && t < 1
        const stride = Math.sin(t * Math.PI * 6) * (walking ? 1 : 0)
        this.poseLegs(f, 0, stride)
        f.root.position.z = lerp(f.start!.z, this.gridExitZ, e)
        f.root.position.y = Math.abs(stride) * 0.05
        // разворачиваются лицом к выходу (на юг экрана)
        const toSouth = Math.min(1, t * 3)
        f.root.rotation.y = lerp(f.startRot ?? 0, 0, toSouth)
      })
      return
    }
    const p = this.progress

    // Текст на столе проявляется построчно
    const a1 = smooth(0.5, 0.58, p)
    const a2 = smooth(0.64, 0.72, p)
    const a3 = smooth(0.78, 0.86, p)
    const key = `${a1.toFixed(2)},${a2.toFixed(2)},${a3.toFixed(2)}`
    if (key !== this.lastAlphas) {
      this.lastAlphas = key
      this.tableText.draw([a1, a2, a3])
    }

    // Идущие за стол: заходят сверху и садятся.
    // До старта скрыты — иначе видны дубли людей с экрана контактов
    this.walkers.forEach((f) => {
      const t = clamp01((p - (f.delay ?? 0)) / 0.45)
      f.root.visible = t > 0
      const e = easeInOut(t)
      const walk = clamp01(e / 0.8)
      const sit = smooth(0.8, 1, e)

      const x = lerp(f.start!.x, f.seat!.x, walk)
      const z = lerp(f.start!.z, f.seat!.z, walk)
      const bob = Math.sin(t * Math.PI * 5) * 0.045 * (1 - sit) * (t > 0 && t < 1 ? 1 : 0)
      f.root.position.set(x, -0.04 * sit + Math.abs(bob), z)

      // шаг: ноги и руки в противофазе; при посадке ноги складываются под стол
      const stride = Math.sin(t * Math.PI * 5) * (1 - sit) * (t > 0 && t < 1 ? 1 : 0)
      this.poseLegs(f, sit, stride)

      const toSeat = Math.atan2(f.seat!.x - f.start!.x, f.seat!.z - f.start!.z)
      const rot = t < 0.02 ? f.root.rotation.y : toSeat
      f.root.rotation.y = lerp(rot, f.seatRot!, sit)

      f.torso.rotation.x = 0.16 * sit
    })

    this.fitCamera()
  }

  private fitCamera() {
    const a = this.camera.aspect || 1
    if (this.mode === 'grid') {
      // кадрируем только Excel-сетку с людьми
      const y = Math.max(8.5, 14.5 / a)
      this.camera.position.y = y
      this.camera.position.z = 0.35
      this.camera.lookAt(0, 0, GRID_Z + 0.2)
      // нижний край кадра + запас: сюда люди уходят со скроллом
      this.gridExitZ = GRID_Z + 0.2 + y * Math.tan((30 * Math.PI) / 360) + 1
    } else {
      // статичный кадр: весь стол, вход сверху
      this.camera.position.y = Math.max(11.5, 14.2 / a) + 2.5
      this.camera.position.z = 0.35
      this.camera.lookAt(0, 0, 0)
    }
  }

  /** Живая анимация: стоящие переминаются, сидящие жестикулируют */
  private animateIdle(dt: number) {
    this.time += dt
    const t = this.time

    if (this.mode === 'grid') {
      this.walkers.forEach((f) => {
        const tw = clamp01((this.progress - (f.delay ?? 0) * 1.4) / 0.5)
        if (tw > 0.01) return // идёт к выходу — позой управляет скролл
        const ph = f.idlePhase
        const sp = f.idleSpeed
        f.root.position.y = Math.sin(t * sp * 0.9 + ph) * 0.008
        f.torso.rotation.z = Math.sin(t * sp * 0.6 + ph) * 0.03
        f.head.rotation.y = Math.sin(t * sp * 0.4 + ph * 1.7) * 0.35
        f.head.rotation.x = Math.sin(t * sp * 0.9 + ph) * 0.06
        f.armL.rotation.x = Math.sin(t * sp * 0.5 + ph) * 0.06
        f.armR.rotation.x = Math.sin(t * sp * 0.55 + ph * 1.3) * 0.06
      })
      return
    }

    const animate = (f: Figure, arrived: boolean) => {
      if (!arrived) return
      const ph = f.idlePhase
      const sp = f.idleSpeed
      f.torso.rotation.x = 0.16 + Math.sin(t * sp + ph) * 0.045
      f.torso.rotation.z = Math.sin(t * sp * 0.7 + ph * 1.3) * 0.05
      f.head.rotation.x = Math.sin(t * sp * 1.4 + ph) * 0.12
      f.head.rotation.y = Math.sin(t * sp * 0.5 + ph * 2.1) * 0.3
      // жесты руками: правая «объясняет», левая поддакивает
      f.armR.rotation.z = 0.28 + Math.max(0, Math.sin(t * sp * 0.9 + ph * 1.7)) * 0.55
      f.armR.rotation.x = Math.sin(t * sp * 0.8 + ph) * 0.3
      f.armL.rotation.z = -0.28 - Math.max(0, Math.sin(t * sp * 0.6 + ph * 2.4)) * 0.35
    }

    this.seated.forEach((f) => animate(f, true))
    this.walkers.forEach((f) => {
      const tw = clamp01((this.progress - (f.delay ?? 0)) / 0.45)
      animate(f, tw >= 1)
    })
  }

  private lastTs = performance.now()
  private loop = () => {
    if (this.disposed) return
    requestAnimationFrame(this.loop)
    const now = performance.now()
    const dt = Math.min(0.05, (now - this.lastTs) / 1000)
    this.lastTs = now
    this.animateIdle(dt)
    this.renderer.render(this.scene, this.camera)
  }

  private resize() {
    const w = this.container.clientWidth || 1
    const h = this.container.clientHeight || 1
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.applyProgress()
  }

  dispose() {
    this.disposed = true
    this.ro.disconnect()
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
