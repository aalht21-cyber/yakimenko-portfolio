import * as THREE from 'three'

const INK = 0x141310
const RED = 0x9a1f20
const CREAM = 0xf3f0e7

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * Минималистичные «часы»: только две объёмные стрелки вокруг оси
 * и их длинные тени на фоне — без буквального циферблата.
 */
export class ClockScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private mainHand = new THREE.Group()
  private secondHand = new THREE.Group()
  private ro: ResizeObserver
  private disposed = false

  constructor(private container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.domElement.style.display = 'block'
    container.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50)
    this.camera.position.set(0, 0.35, 5.6)
    this.camera.lookAt(0, 0.05, 0)

    this.scene.add(new THREE.HemisphereLight(0xfffaf0, 0xcfc6b2, 0.85))
    const dir = new THREE.DirectionalLight(0xffffff, 2.0)
    dir.position.set(3.2, 3.8, 4.4)
    dir.castShadow = true
    dir.shadow.mapSize.set(2048, 2048)
    dir.shadow.camera.left = -4
    dir.shadow.camera.right = 4
    dir.shadow.camera.top = 4
    dir.shadow.camera.bottom = -4
    dir.shadow.radius = 5
    this.scene.add(dir)

    this.buildHands()

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(container)
    this.resize()
    this.loop()
  }

  private buildHands() {
    // Фоновая стенка, принимающая длинные тени стрелок
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), new THREE.ShadowMaterial({ opacity: 0.34 }))
    wall.position.z = -0.4
    wall.receiveShadow = true
    this.scene.add(wall)


    // Главная красная стрелка — крупная объёмная призма
    const handMat = new THREE.MeshStandardMaterial({ color: RED, roughness: 0.4 })
    const main = new THREE.Mesh(new THREE.BoxGeometry(0.13, 2.15, 0.1), handMat)
    main.position.set(0, 0.92, 0)
    main.castShadow = true
    this.mainHand.add(main)
    // стрелка сужается к концу — наконечник
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.34, 4), handMat)
    tip.position.set(0, 2.16, 0)
    tip.rotation.y = Math.PI / 4
    tip.castShadow = true
    this.mainHand.add(tip)
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.5, 0.08), handMat)
    tail.position.set(0, -0.32, 0)
    tail.castShadow = true
    this.mainHand.add(tail)
    this.mainHand.position.z = 0.02
    this.mainHand.scale.setScalar(0.6) // короче, чтобы не задевать тексты качеств
    this.scene.add(this.mainHand)

    // Вторая стрелка — кремовая с чернильным кантом, короче
    const secMat = new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.5 })
    const secEdge = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.55 })
    const sec = new THREE.Mesh(new THREE.BoxGeometry(0.17, 1.3, 0.08), secEdge)
    sec.position.set(0, 0.5, 0)
    sec.castShadow = true
    this.secondHand.add(sec)
    const secFace = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.24, 0.03), secMat)
    secFace.position.set(0, 0.5, 0.05)
    this.secondHand.add(secFace)
    const secTail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.3, 0.06), secEdge)
    secTail.position.set(0, -0.2, 0)
    secTail.castShadow = true
    this.secondHand.add(secTail)
    this.secondHand.position.z = -0.06
    this.secondHand.scale.setScalar(0.75)
    this.scene.add(this.secondHand)

    // Центральная ось
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.16, 32),
      new THREE.MeshStandardMaterial({ color: INK, roughness: 0.4 }),
    )
    cap.rotation.x = Math.PI / 2
    cap.position.z = 0.08
    cap.castShadow = true
    this.scene.add(cap)
    const capDot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.18, 24),
      new THREE.MeshStandardMaterial({ color: RED, roughness: 0.4 }),
    )
    capDot.rotation.x = Math.PI / 2
    capDot.position.z = 0.1
    this.scene.add(capDot)
  }

  setProgress(p: number) {
    const t = clamp01(p)
    this.mainHand.rotation.z = -t * Math.PI * 2
    this.secondHand.rotation.z = -t * Math.PI + 0.7
  }

  private resize() {
    const w = this.container.clientWidth || 1
    const h = this.container.clientHeight || 1
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    // На узких экранах часы крупнее относительно текста — стрелки короче
    const k = this.camera.aspect < 0.9 ? 0.78 : 1
    this.mainHand.scale.setScalar(0.6 * k)
    this.secondHand.scale.setScalar(0.75 * k)
  }

  private loop = () => {
    if (this.disposed) return
    requestAnimationFrame(this.loop)
    this.renderer.render(this.scene, this.camera)
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
