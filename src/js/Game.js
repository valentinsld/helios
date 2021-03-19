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
import Captor from './Elements/Captor'

export default class Game{
  constructor() {
    this.canvas = document.querySelector('canvas.webgl')

    this.sizes = {}

    this.clock = new THREE.Clock()

    if (window.location.hash === '#DEBUG') this.initGUI()
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
    this.debug = new dat.GUI()
    this.debug.data = {}
  }

  // create scene
  createScene() {
    this.scene = new THREE.Scene()

    if (this.debug) {
      const axesHelper = new THREE.AxesHelper( 500 );
      this.scene.add( axesHelper );
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

  initCamera() {
    // Base camera
    this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 10, 100*100) // TODO : optimiser le far
    this.camera.position.set(0, 0, 630)
    this.scene.add(this.camera)

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
    this.scene.add(ambientLight)
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
      var render = Render.create({
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
      render.canvas.id = 'matterRender'
      Render.run(render);

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
        render,
        {
          min: { x: -600, y: -400 },
          max: { x: 600, y: 400 }
        },
      )
    }
    
  }

  addElements() {
    const floor = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 1200,
        y: 100,
        z: 100
      },
      position : {
        x: 100,
        y: -250,
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
        x: 200,
        y: 150,
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
        y : -100,
        z : 0
      }
    })

    this.fragment = new Fragment({
      canvas: this.canvas,
      engine: this.engine,
      scene : this.scene,
      position : {
        x : 80,
        y : 200,
        z : 0
      }
    })

    this.ladder = new Ladder({
      scene: this.scene,
      engine: this.engine,
      phaeton: this.phaeton,
      position : {
        x : 150,
        y : -300,
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
        x: 500,
        y: 225,
        z: 0,
      },
      size: {
        x: 100,
        y: 50,
        z: 100
      }
    })


    this.captor = new Captor ({
      scene: this.scene,
      engine: this.engine,
      fragment: this.fragment,
      position: {
        x: 500,
        y: -150,
        z: -45,
      },
      size: {
        x: 100,
        y: 100,
        z: 100
      }
    })

    this.fire = new Fire ({
      scene: this.scene,
      engine: this.engine,
      fragment: this.fragment,
      debug: this.debug,
      position: {
        x: -300,
        y: -150,
        z: -45,
      },
      size: {
        x: 100,
        y: 100,
        z: 100
      },
      captor: this.captor
    })

  }

  //
  //  Update
  //
  update() {
    this.elapsedTime = this.clock.getElapsedTime()

    //
    // update world
    //
    // Update Phaeton & fragement position
    this.phaeton.update()
    this.fragment.update()

    // Update controls
    this.controls?.update()

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
