import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'dat.gui'

import Matter from 'matter-js'

import SceneManager from './Scenes'

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

    this.initLights()
    this.initCamera()
    this.initRenderer()

    this.initPhysicWorld()
    this.initSceneManager()

    this.resize()
    this.update()
    this.createEvents()
  }

  // GUI
  initGUI() {
    this.debug = new dat.GUI()
    this.debug.data = {}
  }

  // create scene
  createScene() {
    this.globalScene = new THREE.Scene()

    if (this.debug) {
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
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')

    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.setDRACOLoader(dracoLoader)

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
    this.camera =  new THREE.OrthographicCamera( 0, 0, 0, 0, 1, 500 );
    this.camera.zoom = 0.5
    this.camera.position.set(0, 0, 100)
    this.globalScene.add(this.camera)

    // Controls
    if (this.debug) {
      this.controls = new OrbitControls(this.camera, this.canvas)
      this.controls.enabled = false
      this.controls.enableDamping = true

      this.debug.data.orbitControls = this.controls.enabled
      this.debug
        .add(this.debug.data, 'orbitControls')
        .onChange(() => {
          this.controls.enabled = this.debug.data.orbitControls
        })
    }
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas
    })
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }


  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.globalScene.add(ambientLight)
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
    this.world.gravity.y = -0.89
    

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

      Render.lookAt(
        this.render,
        {
          min: { x: -600, y: -400 },
          max: { x: 600, y: 400 }
        },
      )
    }
    
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
    this.elapsedTime = this.clock.getElapsedTime()

    //
    // Update object
    //
    for (const el in this.updateElements) {
      this.updateElements[el].call()
    }

    // Update controls
    this.controls?.update()

    // Render
    this.renderer.render(this.globalScene, this.camera)

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

    // Update camera
    this.camera.left = this.sizes.width / - 2
    this.camera.right = this.sizes.width / 2
    this.camera.top = this.sizes.height / 2
    this.camera.bottom = this.sizes.height / - 2
    this.camera.updateProjectionMatrix()

    // Update renderer
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

}
