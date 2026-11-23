import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import gsap from 'gsap'

const INK = 0x1b1b19
const CREAM = 0xf3f0e7

export interface GuaranteeText {
  key: string
  title: string
  text: string
}

function makeCapTexture(label: string, accent: boolean): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 256
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const draw = () => {
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.fillStyle = accent ? '#9a1f20' : '#f3f0e7'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '800 64px Manrope, Arial, sans-serif'
    ctx.fillText(label, c.width / 2, c.height / 2)
    tex.needsUpdate = true
  }
  draw()
  if (document.fonts?.ready) document.fonts.ready.then(draw)
  return tex
}

/** Текстовое табло в самой сцене — над клавишами, в той же плоскости */
function makeDisplay(): { tex: THREE.CanvasTexture; draw: (g: GuaranteeText) => void } {
  const c = document.createElement('canvas')
  c.width = 1400
  c.height = 340
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const draw = (g: GuaranteeText) => {
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#9a1f20'
    ctx.font = '700 60px Oswald, "Arial Narrow", sans-serif'
    ctx.fillText(g.title.toUpperCase(), 12, 4)
    ctx.fillStyle = '#141310'
    // перенос строк по ширине; кегль уменьшаем, пока текст не влезет целиком
    const wrap = (maxW: number): string[] => {
      const words = g.text.split(' ')
      const out: string[] = []
      let line = ''
      for (const w of words) {
        const test = line ? line + ' ' + w : w
        if (ctx.measureText(test).width > maxW && line) {
          out.push(line)
          line = w
        } else {
          line = test
        }
      }
      if (line) out.push(line)
      return out
    }
    let size = 38
    let lines: string[] = []
    let lh = 46
    for (; size >= 24; size -= 2) {
      ctx.font = `500 ${size}px Manrope, Arial, sans-serif`
      lh = size + 8
      lines = wrap(1370)
      if (92 + lines.length * lh <= c.height - 10) break
    }
    lines.forEach((ln, i) => ctx.fillText(ln, 12, 92 + i * lh))
    tex.needsUpdate = true
  }
  return { tex, draw }
}

export class KeyboardScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private keys: THREE.Group[] = []
  private board = new THREE.Group()
  private display: ReturnType<typeof makeDisplay>
  private raycaster = new THREE.Raycaster()
  private pointer = new THREE.Vector2()
  private ro: ResizeObserver
  private disposed = false

  constructor(
    private container: HTMLElement,
    private onPress: (index: number) => void,
    texts: GuaranteeText[],
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.domElement.style.display = 'block'
    container.appendChild(this.renderer.domElement)

    // Камера почти сверху, лёгкий наклон — видны все клавиши сразу
    this.camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60)
    this.fitCamera()

    this.scene.add(new THREE.HemisphereLight(0xfffaf0, 0xd8d0bd, 1.0))
    const dir = new THREE.DirectionalLight(0xffffff, 1.6)
    dir.position.set(3.5, 6.5, 4.5)
    dir.castShadow = true
    dir.shadow.mapSize.set(2048, 2048)
    dir.shadow.camera.left = -6
    dir.shadow.camera.right = 6
    dir.shadow.camera.top = 6
    dir.shadow.camera.bottom = -6
    dir.shadow.radius = 4
    this.scene.add(dir)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ opacity: 0.26 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.55
    ground.receiveShadow = true
    this.scene.add(ground)

    this.display = makeDisplay()
    this.buildKeyboard(texts)
    this.scene.add(this.board)
    this.display.draw(texts[0])
    if (document.fonts?.ready) document.fonts.ready.then(() => this.display.draw(texts[0]))

    this.renderer.domElement.addEventListener('pointerdown', this.handlePointer)
    this.renderer.domElement.addEventListener('pointermove', this.handleHover)

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(container)
    this.resize()
    this.loop()

    this.texts = texts
  }

  private texts: GuaranteeText[]

  private buildKeyboard(texts: GuaranteeText[]) {
    // Основание клавиатуры с табло
    const base = new THREE.Mesh(
      new RoundedBoxGeometry(7.6, 0.32, 5.6, 3, 0.1),
      new THREE.MeshStandardMaterial({ color: INK, roughness: 0.7 }),
    )
    base.position.set(0, -0.2, 0.3)
    base.castShadow = true
    base.receiveShadow = true
    this.board.add(base)

    // Табло с описанием — врезано в основание, читается сверху
    const displayMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(6.9, 1.68),
      new THREE.MeshBasicMaterial({
        map: this.display.tex,
        transparent: true,
        toneMapped: false,
      }),
    )
    // лёгкий наклон к камере; плоскость ПОДНЯТА над плашкой,
    // иначе нижний край тонет в ней и обрезает последние строки
    displayMesh.rotation.x = -Math.PI / 2 + 0.08
    displayMesh.position.set(0, 0.05, -1.55)
    this.board.add(displayMesh)
    // кремовая плашка под текстом
    const displayPlate = new THREE.Mesh(
      new RoundedBoxGeometry(7.1, 0.06, 1.86, 2, 0.025),
      new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.85 }),
    )
    displayPlate.position.set(0, -0.06, -1.55)
    displayPlate.receiveShadow = true
    this.board.add(displayPlate)

    // 6 клавиш: 2 ряда по 3
    texts.forEach((g, i) => {
      const accent = i === 5
      const grp = new THREE.Group()
      const keyMat = new THREE.MeshStandardMaterial({
        color: accent ? CREAM : INK,
        roughness: 0.55,
      })

      const key = new THREE.Mesh(new RoundedBoxGeometry(2.05, 0.5, 1.35, 3, 0.07), keyMat)
      key.castShadow = true
      key.receiveShadow = true
      grp.add(key)

      const cap = new THREE.Mesh(new RoundedBoxGeometry(1.75, 0.16, 1.05, 3, 0.05), keyMat)
      cap.position.y = 0.32
      cap.castShadow = true
      grp.add(cap)

      const labelPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 0.8),
        new THREE.MeshBasicMaterial({
          map: makeCapTexture(g.key, accent),
          transparent: true,
          toneMapped: false,
        }),
      )
      labelPlane.rotation.x = -Math.PI / 2
      labelPlane.position.y = 0.41
      grp.add(labelPlane)

      const col = i % 3
      const row = Math.floor(i / 3)
      grp.position.set((col - 1) * 2.35, 0.3, 0.35 + row * 1.65)
      grp.userData.index = i
      grp.traverse((o) => (o.userData.keyRoot = grp))
      this.keys.push(grp)
      this.board.add(grp)
    })
  }

  /** Нажатие клавиши: утапливание с отскоком + обновление табло */
  press(i: number) {
    const grp = this.keys[i]
    if (!grp) return
    this.display.draw(this.texts[i])
    gsap.killTweensOf(grp.position)
    gsap
      .timeline()
      .to(grp.position, { y: 0.08, duration: 0.12, ease: 'power2.in' })
      .to(grp.position, { y: 0.3, duration: 0.5, ease: 'elastic.out(1, 0.45)' })
  }

  /** Клавиши поднимаются по очереди при входе в секцию */
  playIntro() {
    this.keys.forEach((grp, i) => {
      grp.position.y = -1.6
      grp.visible = true
      gsap.to(grp.position, {
        y: 0.3,
        duration: 0.7,
        delay: 0.12 * i,
        ease: 'back.out(1.6)',
      })
    })
  }

  resetIntro() {
    this.keys.forEach((grp) => {
      grp.position.y = 0.3
      grp.visible = true
    })
  }

  private fitCamera() {
    const a = this.camera.aspect || 1
    // почти прямой вид сверху; на узких экранах отодвигаем камеру дальше
    const f = a >= 1 ? 1 : Math.min(3.4, 1 / (a * 0.7))
    this.camera.position.set(0, 9.6 * f, 1.75 * f)
    this.camera.lookAt(0, 0, 0.42)
  }

  private handlePointer = (e: PointerEvent) => {
    const hit = this.pick(e)
    if (hit !== null) {
      this.press(hit)
      this.onPress(hit)
    }
  }

  private handleHover = (e: PointerEvent) => {
    const hit = this.pick(e)
    this.renderer.domElement.style.cursor = hit !== null ? 'pointer' : 'default'
  }

  private pick(e: PointerEvent): number | null {
    const r = this.renderer.domElement.getBoundingClientRect()
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObjects(this.keys, true)
    if (!hits.length) return null
    const root = hits[0].object.userData.keyRoot as THREE.Group | undefined
    return root ? (root.userData.index as number) : null
  }

  private resize() {
    const w = this.container.clientWidth || 1
    const h = this.container.clientHeight || 1
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.fitCamera()
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
