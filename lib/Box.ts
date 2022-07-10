import * as T from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import pebblesTexture from 'lib/textures/Pebbles_024_BaseColor.jpeg'

export default class Box implements IApp {
  private sizes = { width: 0, height: 0 }
  private colors = {
    mesh: 0xff0000,
    ambientLight: 0x222222,
    pointLight: 0xffffff,
  }
  private background = new T.Color('rgb(38, 38, 38)')
  private renderer: T.WebGLRenderer
  private controls: OrbitControls
  private scene: T.Scene
  private group: T.Group
  private camera: T.PerspectiveCamera
  private mesh: T.Mesh
  private axesHelper: T.AxesHelper
  private clock: T.Clock
  private loadingManager: T.LoadingManager
  private textureLoader: T.TextureLoader

  constructor(public container: HTMLElement = document.body) {
    this.resetSizes()
    this.scene = new T.Scene()
    this.group = new T.Group()
    this.camera = new T.PerspectiveCamera(
      40,
      this.sizes.width / this.sizes.height,
      1,
      1000
    )
    this.renderer = new T.WebGLRenderer({
      antialias: true,
    })
    this.loadingManager = new T.LoadingManager()
    this.textureLoader = new T.TextureLoader(this.loadingManager)
    this.mesh = new T.Mesh(
      new T.BoxBufferGeometry(1, 1, 1),
      new T.MeshStandardMaterial({
        map: this.textureLoader.load(pebblesTexture.src),
        opacity: 0.5,
        transparent: true,
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
    this.controls.enableDamping = true
    this.controls.update()
    this.group.add(this.mesh)
    this.scene.background = this.background
    this.scene.add(this.group).add(this.camera).add(this.axesHelper)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(this.sizes.width, this.sizes.height)

    this.setupLighting()
    this.setupDatGui()
    this.setupEventListeners()
  }

  private animate = () => {
    requestAnimationFrame(this.animate)

    this.group.rotation.y += 0.01
    this.group.position.y = Math.sin(this.clock.getElapsedTime()) / 10

    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  private onWindowResize = () => {
    this.resetSizes()
    this.camera.aspect = this.sizes.width / this.sizes.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.sizes.width, this.sizes.height)
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
    this.sizes = { width: window.innerWidth, height: window.innerHeight }
  }

  private setupLighting() {
    this.scene.add(new T.AmbientLight(this.colors.ambientLight))
    this.camera.add(new T.PointLight(this.colors.pointLight, 1))
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.onWindowResize)
    window.addEventListener('dblclick', this.onDoubleClick)
  }

  private setupDatGui() {
    const gui = new dat.GUI()

    gui.add(this.mesh.position, 'y', -2, 2, 0.01)
    gui.add(this.mesh.material, 'wireframe')
    gui.add(this.mesh.material, 'opacity', 0, 1, 0.01)
    gui
      .addColor(this.colors, 'mesh')
      .name('Mesh color')
      // @ts-ignore
      .onChange(() => this.mesh.material.color.set(this.colors.mesh))
  }

  render(): void {
    this.container.appendChild(this.renderer.domElement)
    this.animate()
  }
}
