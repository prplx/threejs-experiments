import * as T from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
import * as dat from 'dat.gui'

interface IApp {
  render(): void
}

export default class App implements IApp {
  private size = { width: 0, height: 0 }
  private background = new T.Color('rgb(38, 38, 38)')
  private renderer: T.WebGLRenderer
  private controls: OrbitControls
  private scene: T.Scene
  private group: T.Group
  private camera: T.PerspectiveCamera
  private mesh: T.Mesh
  private axesHelper: T.AxesHelper
  private clock: T.Clock

  constructor(public container: HTMLElement = document.body) {
    this.resetSizes()
    this.scene = new T.Scene()
    this.group = new T.Group()
    this.camera = new T.PerspectiveCamera(
      40,
      this.size.width / this.size.height,
      1,
      1000
    )
    this.renderer = new T.WebGLRenderer({
      antialias: true,
    })
    this.mesh = new T.Mesh(
      new T.BoxBufferGeometry(1, 1, 1),
      new T.MeshStandardMaterial({
        color: 'red',
        opacity: 0.5,
        transparent: true,
        // wireframe: true,
      })
    )
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.clock = new T.Clock()
    this.axesHelper = new T.AxesHelper(0)

    this.camera.position.set(1, 1, 6)
    this.controls.maxPolarAngle = Math.PI
    this.controls.minDistance = 5
    this.controls.maxDistance = 5
    this.controls.rotateSpeed = 2
    this.controls.enablePan = false
    this.controls.update()
    this.controls.enableDamping = true
    this.group.add(this.mesh)
    this.scene.background = this.background
    this.scene.add(this.group).add(this.camera).add(this.axesHelper)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(this.size.width, this.size.height)

    this.setupLighting()
    this.setupDatGui()
    this.setupEventListeners()
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate)

    this.group.rotation.y += 0.01
    this.group.position.y = Math.sin(this.clock.getElapsedTime()) / 10

    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  private onWindowResize = () => {
    this.resetSizes()
    this.camera.aspect = this.size.width / this.size.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.size.width, this.size.height)
  }

  private onDoubleClick = () => {
    if (!document.fullscreenEnabled) {
      return
    }

    if (document.fullscreenElement) {
      return document.exitFullscreen()
    }

    return this.renderer.domElement.requestFullscreen()
  }

  private resetSizes() {
    this.size = { width: window.innerWidth, height: window.innerHeight }
  }

  private setupLighting() {
    this.scene.add(new T.AmbientLight(0x222222))
    this.camera.add(new T.PointLight(0xffffff, 1))
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.onWindowResize)
    window.addEventListener('dblclick', this.onDoubleClick)
  }

  private setupDatGui() {
    const gui = new dat.GUI()
  }

  render(): void {
    this.container.appendChild(this.renderer.domElement)
    this.animate()
  }
}
