import * as T from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
import * as dat from 'dat.gui'

export default class Box implements IApp {
  private sizes = { width: 0, height: 0 }
  private colors = {
    mesh: 0xff0000,
    ambientLight: 0xffffff,
    pointLight: 0xff9000,
  }
  private background = new T.Color('rgb(38, 38, 38)')
  private renderer: T.WebGLRenderer
  private controls: OrbitControls
  private scene: T.Scene
  private group: T.Group
  private camera: T.PerspectiveCamera
  private mesh: T.Mesh
  private geometry: T.BufferGeometry
  private material: T.Material
  private axesHelper: T.AxesHelper
  private clock: T.Clock
  private ambientLight!: T.AmbientLight
  private pointLight!: T.PointLight

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

    this.geometry = new T.BoxBufferGeometry()
    this.material = new T.MeshStandardMaterial({
      metalness: 0.5,
      roughness: 0.5,
      color: this.colors.mesh,
      opacity: 1,
      transparent: true,
    })
    this.mesh = new T.Mesh(this.geometry, this.material)
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
    this.ambientLight = new T.AmbientLight(this.colors.ambientLight, 0.5)
    this.pointLight = new T.PointLight(this.colors.pointLight, 2, 10)
    this.pointLight.position.set(1, 1, 1)
    // const rectAreaLight = new T.RectAreaLight(0x4e00ff, 2, 3, 3)
    const pointLightHelper = new T.PointLightHelper(this.pointLight, 0.2)

    this.scene
      .add(this.ambientLight)
      .add(this.pointLight)
      // .add(rectAreaLight)
      .add(pointLightHelper)
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.onWindowResize)
    window.addEventListener('dblclick', this.onDoubleClick)
  }

  private setupDatGui() {
    const gui = new dat.GUI()
    gui.closed = true

    gui.add(this.mesh.position, 'y', -2, 2, 0.01)
    gui.add(this.mesh.material, 'wireframe')
    gui.add(this.mesh.material, 'opacity', 0, 1, 0.01)
    gui
      .addColor(this.colors, 'mesh')
      .name('Mesh color')
      // @ts-ignore
      .onChange(() => this.mesh.material.color.set(this.colors.mesh))
    gui.add(this.material, 'metalness').min(0).max(1).step(0.0001)
    gui.add(this.material, 'roughness').min(0).max(1).step(0.0001)
    gui.add(this.ambientLight, 'intensity', 0, 1, 0.01)
  }

  render(): void {
    this.container.appendChild(this.renderer.domElement)
    this.animate()
  }
}
