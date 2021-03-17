import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

import Matter from 'matter-js'

import Phaeton from './Characters/Phaeton'
import Fragment from './Characters/Fragment'

import Box from './Elements/Box'
import Sphere from './Elements/Sphere'
import Ladder from './Elements/Ladder'
import Lever from './Elements/Lever'
import Fire from './Elements/Fire'

export default class Game{
  constructor() {
    this.canvas = document.querySelector('canvas.webgl')

    this.sizes = {}

    this.clock = new THREE.Clock()

    this.initGUI()
    this.createScene()
    this.initTextLoader()

    // this.initScene()
    this.initLights()
    this.initCamera()
    this.initRenderer()

    this.initPhysicWorld()

    this.addElements()

    this.resize()
    this.update()
    this.createEvents()
  }

  // GUI
  initGUI() {
    this.gui = new dat.GUI()
  }

  // create scene
  createScene() {
    this.scene = new THREE.Scene()

    const axesHelper = new THREE.AxesHelper( 500 );
    this.scene.add( axesHelper );
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

  initCamera() {
    // Base camera
    this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 10, 100*100) // TODO : optimiser le far
    this.camera.position.set(0, 200, 400)
    this.scene.add(this.camera)

    // Controls
    this.controls = new OrbitControls(this.camera, this.canvas)
    this.controls.enableDamping = true
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    this.scene.add(ambientLight)

    // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
    // directionalLight.castShadow = true
    // directionalLight.shadow.mapSize.set(1024, 1024)
    // directionalLight.shadow.camera.far = 15
    // directionalLight.shadow.camera.left = - 7
    // directionalLight.shadow.camera.top = 7
    // directionalLight.shadow.camera.right = 7
    // directionalLight.shadow.camera.bottom = - 7
    // directionalLight.position.set(5, 5, 5)

    // this.scene.add(directionalLight)
  }


  //
  //  Physic World
  //
  initPhysicWorld() {
    // module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render;
        // World = Matter.World,
        // Bodies = Matter.Bodies;
    
    // create an engine
    this.engine = Engine.create();
    this.world = this.engine.world
    this.world.gravity.y = -0.89
    
    // create a renderer
    var render = Render.create({
      element: document.body,
      engine: this.engine,
      showVelocity: true,
      options: {
        wireframes: false // <-- important
      }
    });
    
    
    // run the engine
    Engine.run(this.engine);
    
    // run the renderer
    Render.run(render);
    Render.lookAt(
      render,
      {
        min: {
          x: -600,
          y: -200
        },
        max: {
          x: 600,
          y: 600
        }
      },
    )
    render.canvas.id = 'matterRender'
    
  }

  addElements() {
    const floor = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 1000,
        y: 100,
        z: 100
      },
      position : {
        x: 0,
        y: -50,
        z: 0
      },
      optionsBox : {
        isStatic: true
      }
    })
    const floor2 = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 1000,
        y: 100,
        z: 100
      },
      position : {
        x: 300,
        y: 350,
        z: 0
      },
      optionsBox : {
        isStatic: true
      }
    })


    this.phaeton = new Phaeton({
      engine: this.engine,
      scene : this.scene,
      position : {
        x : 0,
        y : 100,
        z : 0
      }
    })

    this.fragment = new Fragment({
      engine: this.engine,
      scene : this.scene,
      position : {
        x : 0,
        y : 100,
        z : 0
      }
    })

    this.ladder = new Ladder({
      scene: this.scene,
      engine: this.engine,
      phaeton: this.phaeton,
      position : {
        x : 250,
        y : 0,
        z : -51
      },
      size: {
        x: 100,
        y: 400,
        z: 1
      }
    })

    this.lever = new Lever ({
      scene: this.scene,
      phaeton: this.phaeton,
      position: {
        x: 700,
        y: 425,
        z: 0,
      },
      size: {
        x: 100,
        y: 50,
        z: 100
      }
    })

    this.lever = new Lever ({
      scene: this.scene,
      engine: this.engine,
      phaeton: this.phaeton,
      position: {
        x: 700,
        y: 425,
        z: 0,
      },
      size: {
        x: 100,
        y: 50,
        z: 100
      }
    })


    // const box2 = new Box({
    //   world: this.world,
    //   scene: this.scene,
    //   position: {
    //     x: 50,
    //     y: 500,
    //     z: 0
    //   },
    // })

    // const circle = new Sphere({
    //   world: this.world,
    //   scene: this.scene,
    //   position: {
    //     x: 0,
    //     y: 800,
    //     z: 0
    //   },
    // })
  }

  //
  //  Update
  //
  update() {
    this.elapsedTime = this.clock.getElapsedTime()

    //
    // update world
    //

    // Update Phaeton position
    this.phaeton.update()

    // Update controls
    this.controls.update()

    // Render
    this.renderer.render(this.scene, this.camera)

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
    this.camera.aspect = this.sizes.width / this.sizes.height
    this.camera.updateProjectionMatrix()

    // Update renderer
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

}
