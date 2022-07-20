import * as T from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import gsap from 'gsap'
import matcap from 'lib/textures/8.png'
import { TextureLoader } from 'three'

export default class Text implements IApp {
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
  private mesh?: T.Mesh
  private geometry?: TextGeometry
  private material?: T.Material
  private axesHelper: T.AxesHelper
  private clock: T.Clock
  private loadingManager: T.LoadingManager
  private cubeTextureLoader: T.CubeTextureLoader
  private fontLoader: FontLoader
  private textureLoader?: T.TextureLoader

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
    this.cubeTextureLoader = new T.CubeTextureLoader()

    this.fontLoader = new FontLoader(this.loadingManager)
    this.fontLoader.load('/fonts/helvetiker_regular.typeface.json', font => {
      this.geometry = new TextGeometry('Hello world!', {
        font,
        size: 0.5,
        height: 0.2,
        curveSegments: 5,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelSegments: 4,
      })
      this.geometry.center()
      this.textureLoader = new TextureLoader()
      const matcapTexture = this.textureLoader.load(matcap.src)

      this.material = new T.MeshMatcapMaterial({
        matcap: matcapTexture,
      })
      this.mesh = new T.Mesh(this.geometry, this.material)

      const donutGeometry = new T.TorusBufferGeometry(0.3, 0.2, 20, 45)

      for (let i = 0; i < 100; i++) {
        const donut = new T.Mesh(donutGeometry, this.material)
        const scale = Math.random()

        donut.position.x = (Math.random() - 0.5) * 10
        donut.position.y = (Math.random() - 0.5) * 10
        donut.position.z = (Math.random() - 0.5) * 10
        donut.rotation.x = Math.random() * Math.PI
        donut.rotation.y = Math.random() * Math.PI
        donut.scale.set(scale, scale, scale)
        this.scene.add(donut)
      }

      this.group.add(this.mesh)
      this.scene.add(this.group).add(this.camera).add(this.axesHelper)
    })

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
    this.scene.background = this.background
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(this.sizes.width, this.sizes.height)

    this.setupLighting()
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
    const ambientLight = new T.AmbientLight(0xffffff, 0.5)
    const pointLight = new T.PointLight(0xffffff, 0.5)
    pointLight.position.x = 2
    pointLight.position.y = 3
    pointLight.position.z = 4
    this.scene.add(ambientLight)
    this.scene.add(pointLight)
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.onWindowResize)
    window.addEventListener('dblclick', this.onDoubleClick)
  }

  render(): void {
    this.container.appendChild(this.renderer.domElement)
    this.animate()
  }
}
