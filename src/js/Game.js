import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'dat.gui'
import Stats from 'stats.js'

import Matter from 'matter-js'
import Bowser from 'bowser'

import SceneManager from './Scenes'
import { menuContextuelsCamera } from './utils/MenuContextuels'
import AudioManager from './utils/AudioManager'

export default class Game{
  constructor() {
    this.canvas = document.querySelector('canvas.webgl')

    this.sizes = {}

    this.clock = new THREE.Clock()

    this.updateElements = {}

    if (window.location.hash === '#DEBUG') this.initGUI()
    this.createScene()

    this.initTextLoader()
    this.initGltfLoader()
    this.initMobile()
    this.initCamera()
    this.initRenderer()
    this.initLights()

    this.initPhysicWorld()
    
    this.resize()
    this.update()
    this.createEvents()
    
    this.initSceneManager()
  }

  initMobile(){
    const ISMOBILE = Bowser.getParser(window.navigator.userAgent).parsedResult.platform.type !== 'desktop'
    var device = document.getElementById('ismobile')
    if(window.innerHeight < 1024 || ISMOBILE){
      device.classList.add('ismobile');
      console.log(ISMOBILE)
    }
  }
  
  // GUI
  initGUI() {
    dat.GUI.prototype.removeFolder = function(name) {
      var folder = this.__folders[name];
      if (!folder) {
        return;
      }
      folder.close();
      this.__ul.removeChild(folder.domElement.parentNode);
      delete this.__folders[name];
      this.onResize();
    }

    this.debug = new dat.GUI()
    this.debug.data = {}

    this.stats = new Stats()
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( this.stats.dom );
  }

  // create scene
  createScene() {
    this.globalScene = new THREE.Scene()
    this.globalScene.background = new THREE.Color(0x000000)

    if (this.debug) {
      this.debugGlobalFolder = this.debug.addFolder('Global Scene')

      const axesHelper = new THREE.AxesHelper( 500 );
      this.globalScene.add( axesHelper );
    }
  }

  initTextLoader() {
    this.textureLoader = new THREE.TextureLoader()
    // this.cubeTextureLoader = new THREE.CubeTextureLoader()
    
    // this.environmentMapTexture = this.cubeTextureLoader.load([
    //     '/textures/environmentMaps/0/px.png',
    //     '/textures/environmentMaps/0/nx.png',
    //     '/textures/environmentMaps/0/py.png',
    //     '/textures/environmentMaps/0/ny.png',
    //     '/textures/environmentMaps/0/pz.png',
    //     '/textures/environmentMaps/0/nz.png'
    // ])
  }

  initGltfLoader() {
    // const dracoLoader = new DRACOLoader()
    // dracoLoader.setDecoderPath('/draco/')

    this.gltfLoader = new GLTFLoader()
    // this.gltfLoader.setDRACOLoader(dracoLoader)

    // gltfLoader.load(
    //   '/models/Duck/glTF/Duck.gltf',
    //   (gltf) =>
    //   {
    //       console.log('success')
    //       console.log(gltf)
    //   },
    //   (progress) =>
    //   {
    //       console.log('progress')
    //       console.log(progress)
    //   },
    //   (error) =>
    //   {
    //       console.log('error')
    //       console.log(error)
    //   }
    // )
  }

  initCamera() {
    // Base camera
    this.camera =  new THREE.OrthographicCamera( 0, 0, 0, 0, 1, 1500 );
    this.camera.zoom = 0.5
    this.camera.position.set(0, 0, 600)
    this.globalScene.add(this.camera)

    // Controls
    if (this.debug) {
      this.controls = new OrbitControls(this.camera, this.canvas)
      this.controls.enabled = false
      this.controls.enableDamping = true

      this.debug.data.orbitControls = this.controls.enabled
      this.debugGlobalFolder
        .add(this.debug.data, 'orbitControls')
        .onChange(() => {
          this.controls.enabled = this.debug.data.orbitControls
        })
    }

    // add to menu contextuels
    menuContextuelsCamera.init(this.camera)
    AudioManager.initCamera(this.camera)
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    })

    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }


  initLights() {
    const light = {
      color: 0xffffff,
      intensity: 0.4
    }
    this.ambientLight = new THREE.AmbientLight(light.color, light.intensity)
    this.globalScene.add(this.ambientLight)

    if (this.debug) {
      const ambiantlightFoler = this.debugGlobalFolder.addFolder('Ambient light')

      const color = ambiantlightFoler.addColor(light, "color").name('Color')
      color.onChange((value) => {
        this.ambientLight.color = new THREE.Color(value)
      })

      const intensity = ambiantlightFoler.add(light, "intensity", 0, 1).name('Intensity')
      intensity.onChange((value) => {
        this.ambientLight.intensity = value
      })
    }
  }


  //
  //  Physic World
  //
  initPhysicWorld() {
    // module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Mouse = Matter.Mouse,
        MouseConstraint = Matter.MouseConstraint;
    
    // create an engine
    this.engine = Engine.create();
    this.world = this.engine.world
    this.world.gravity.y = -3
    

    //
    // run the engine
    //
    Engine.run(this.engine);
    
    //
    // run the renderer
    //
    if (this.debug) {
      // create a renderer
      this.render = Render.create({
        element: document.body,
        engine: this.engine,
        options: {
          width: 400,
          height: 300,
          wireframes: false, // <-- important
          showAngleIndicator: true,
          showCollisions: true,
          showVelocity: true
        },
      });
      this.render.canvas.id = 'matterRender'
      this.render.canvas.style.opacity = '0'
      Render.run(this.render);

      //
      // mouse contraints
      //
      /* var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(this.engine, {
          mouse: mouse,
          constraint: {
              stiffness: 0.2,
              render: {
                  visible: false
              }
          }
      });

      World.add(this.world, mouseConstraint);

      keep the mouse in sync with rendering
      render.mouse = mouse;

      red category objects should not be draggable with the mouse
      mouseConstraint.collisionFilter.mask = 0x0001 */
      this.render.canvas.opacity = 1
      this.render.canvas.zoom = 1

      this.paramsPhysicRender = {
        initPos: {
          min: { x: -800, y: -600 },
          max: { x: 800, y: 600 }
        },
        zoom: 1,
        more: {
          x: 0,
          y: 0
        }
      }

      Render.lookAt(
        this.render,
        {
          min: { x: -800, y: -600 },
          max: { x: 800, y: 600 }
        },
      )

      const physicFolder = this.debugGlobalFolder.addFolder('Physic World')

      const opCanvas = physicFolder.add(this.render.canvas, "opacity", 0, 1).name('Opacity Physic Worl')
      opCanvas.onChange((value) => {
        this.render.canvas.style.opacity = value
      })

      const zoom = physicFolder.add(this.paramsPhysicRender, "zoom", 0, 10).name('Zoom')
      const posX = physicFolder.add(this.paramsPhysicRender.more, "x", -500, 500).name('Position X')
      const posY = physicFolder.add(this.paramsPhysicRender.more, "y", -500, 500).name('Position Y')

      zoom.onChange(this.updatePhysicRender.bind(this))
      posX.onChange(this.updatePhysicRender.bind(this))
      posY.onChange(this.updatePhysicRender.bind(this))


    }
    
  }

  updatePhysicRender () {
    const render = this.paramsPhysicRender
    Matter.Render.lookAt(
      this.render,
      {
        min: { x: render.initPos.min.x * render.zoom + render.more.x, y: render.initPos.min.y * render.zoom + render.more.y },
        max: { x: render.initPos.max.x * render.zoom + render.more.x, y: render.initPos.max.y * render.zoom + render.more.y }
      },
    )
  }

  // Scene Manager
  initSceneManager() {
    this.sceneManager = new SceneManager({
      camera: this.camera,
      render: this.render,
      engine: this.engine,
      globalScene: this.globalScene,
      debug: this.debug,
      textureLoader: this.textureLoader,
      gltfLoader: this.gltfLoader,
      game: this
    })
  }

  addUpdatedElement(name, func) {
    this.updateElements[name] = func
  }
  removeUpdatedElement(name) {
    delete this.updateElements[name]
  }
  clearUpdatedElement() {
    this.updateElements = {}
  }

  //
  //  Update
  //
  update() {
    this.stats?.begin();
    this.elapsedTime = this.clock.getElapsedTime()

    //
    // Update object
    //
    for (const el in this.updateElements) {
      this.updateElements[el].call(null, this.elapsedTime)
    }

    // Update controls
    this.controls?.update()

    // Render
    this.renderer.render(this.globalScene, this.camera)

    // get FPS
    this.stats?.end();

    // Call tick again on the next frame
    window.requestAnimationFrame(this.update.bind(this))
  }

  // Events
  createEvents() {
    window.addEventListener('resize', this.resize.bind(this))
  }

  resize() {
    // Update sizes
    this.sizes.width = window.innerWidth
    this.sizes.height = window.innerHeight
    const ratio = this.sizes.height / this.sizes.width

    // Update camera
    this.camera.left = 1920 / - 2
    this.camera.right = 1920 / 2
    this.camera.top = 1920 * ratio / 2
    this.camera.bottom = 1920 * ratio / - 2
    this.camera.updateProjectionMatrix()

    // Update renderer
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

}
