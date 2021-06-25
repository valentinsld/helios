import * as THREE from 'three'
import * as Matter from 'matter-js'
import gsap from 'gsap'

import Phaeton from '../Characters/Phaeton'
import Fragment from '../Characters/Fragment'

import Box from '../Elements/Box'
import Door from '../Elements/Door'

import LoaderModelsManager from '../utils/LoaderModelsManager'
import clearScene from '../utils/clearScene'
import Transition from '../utils/transition'
import AudioManager from '../utils/AudioManager'

export default class Scene0 {
  constructor({camera, engine, globalScene, gltfLoader, textureLoader, sceneManager, game}) {
    this.game = game
    this.camera = camera

    this.engine = engine
    this.gltfLoader = gltfLoader
    this.textureLoader = textureLoader
    this.sceneManager = sceneManager
    this.world = this.engine.world

    // init scene
    this.scene = new THREE.Group()
    this.scene.name = 'Scene4'
    globalScene.add(this.scene)

    this.updateCamera()
    this.initBox()
    this.initCharacters()
    this.addDoor()

    this.initModels()
  }

  updateCamera () {
    this.camera.far = 4500
    this.camera.zoom = 0.5

    this.camera.updateProjectionMatrix()
  }

  initCharacters () {
    this.phaeton = new Phaeton({
      engine: this.engine,
      scene : this.scene,
      debug: this.debug,
      textureLoader: this.textureLoader,
      gltfLoader: this.gltfLoader,
      scale: 85,
      speed: 12,
      position : {
        x : -1550,
        y : -550,
        z : -250
      }
    })

    this.fragment = new Fragment({
      game: this.game,
      canvas: this.canvas,
      engine: this.engine,
      scene : this.scene,
      camera : this.camera,
      debug: this.debug,
      radius: 33,
      distance: 500,
      multiplicatorSpeed: 1.5,
      position : {
        x: -1400,
        y: -300,
        z: -200
      }
    })

    this.fragment.box.collisionFilter.mask = 0x0001 | 0x0004
    this.fragment.box.collisionFilter.category = 0x0004
    
    this.game.addUpdatedElement('phaeton', this.phaeton.update.bind(this.phaeton))
    this.game.addUpdatedElement('fragment', this.fragment.update.bind(this.fragment))
  }

  initModels () {
    const arrayModels = [
      {
        url: '/models/scene4/cloitre.gltf',
        func: this.initMap.bind(this)
      }
    ]

    new LoaderModelsManager({
      arrayModels,
      gltfLoader: this.gltfLoader,
      endFunction: this.endLoadingModels.bind(this)
    })
  }

  initBox () {
    // FLOORS
    const floor = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff0000,
      render: false,
      size: {
        x: 4000,
        y: 350,
        z: 100
      },
      position : {
        x: 0,
        y: -922,
        z: 0
      }
    })

    //
    // WALLS
    //
    const wallLeft = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff0000,
      render: false,
      size: {
        x: 300,
        y: 3000,
        z: 100
      },
      position : {
        x: -2000,
        y: 0,
        z: 0
      }
    })
    const wallRight = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff0000,
      render: false,
      size: {
        x: 300,
        y: 3000,
        z: 100
      },
      position : {
        x: 2000,
        y: 0,
        z: 0
      }
    })

    // Walls bis
    const wallLeft2 = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff0000,
      render: false,
      size: {
        x: 300,
        y: 1000,
        z: 100
      },
      position : {
        x: -1830,
        y: 480,
        z: 0
      }
    })
    const wallRigh2 = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff0000,
      render: false,
      size: {
        x: 300,
        y: 1000,
        z: 100
      },
      position : {
        x: 1820,
        y: 520,
        z: 0
      }
    })
  }
 
  addDoor () {
    this.door = new Door({
      scene: this.scene,
      engine: this.engine,
      sceneManager: this.sceneManager,
      phaeton: this.phaeton,
      fragment: this.fragment,
      render: false,
      position : {
        x : 1800,
        y : -450,
        z : 250
      },
      size: {
        x: 200,
        y: 800,
        z: 1
      },
      open: true,
      animationEndPhaeton: this.animationEndPhaeton.bind(this),
      animationEndFragment: this.animationEndFragment.bind(this)
    })
  }

  initMap (gltf) {
    this.map = gltf.scene
    this.map.scale.set(313, 313, 313)
    this.map.position.set(-65, -750, -600)
    this.map.animations = gltf.animations

    this.scene.add(this.map)

    // TEXTURE
    const texture = this.textureLoader.load('/models/scene4/texture_cloitre.png')
    texture.flipY = false
    const normal = this.textureLoader.load('/models/scene4/normal_cloitre.png')
    normal.flipY = false

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      normalMap: normal,
      metalness: 0,
      roughness: 0.5
    })

    this.map.traverse((node) => {
      if (node.isMesh && ['roue002', 'mur', 'char', 'land', 'arbres', 'COLONNES'].includes(node.name)) {
        node.material = material
      }
    })

    this.initAnimations()
    this.initLights()
  }

  initAnimations () {
    // ANIMATION
    this.mixer = new THREE.AnimationMixer( this.map )
    const clips = this.map.animations
    this.lastClock = 0

    // ALL
    clips.forEach((clip) => {
      // console.log(clip.name)
      const clipAction = this.mixer.clipAction(clip)
      clipAction.time = Math.random() * 10
      clipAction.play()
    })


    this.game.addUpdatedElement(`clips_scene4`, this.updateAnimation.bind(this))
  }

  updateAnimation (time) {
    const dt = time - this.lastClock
    const framePerSeconds = 1 / 9
    if (dt < framePerSeconds) return

    this.mixer.update( dt )

    this.lastClock = time
  }

  initLights () {   
    for (let i = 0; i < 7; i++) {
      const name = `feu${i === 0 ? '' : '00' + i}`
      const fire = this.map.getObjectByName(name)
      
      const light = new THREE.PointLight(0xfaa961, 2.5, 300, 0.5)
      light.position.copy(fire.position)

      this.map.add(light)
    }

    // LIGHTS
    const spotLight = new THREE.SpotLight( 0xfaa961, 2.5, 2500, Math.PI * 0.4 )
    spotLight.position.set(0, 4.5, -4)

    this.map.add( spotLight )

    // target
    const targetObject = new THREE.Object3D()
    targetObject.position.copy(spotLight.position)
    targetObject.position.y -= 5
    this.map.add(targetObject)

    spotLight.target = targetObject

    // Global light
    const globalLight = new THREE.PointLight(0xfaa961, 1.2, 3400, 0.5)
    globalLight.position.set(0, 0, 0.3)
    
    this.map.add( globalLight )

    // // Second light
    // const secondLight = new THREE.PointLight(0xfaa961, 1, 3000, 0.5)
    // secondLight.position.set(0, 0.1, -5.6)
    
    // this.map.add( secondLight )

    // Second light
    const topLight = new THREE.PointLight(0xfaa961, 0.5, 2000, 0.5)
    topLight.position.set(0, 5, 2.2)
    
    this.map.add( topLight )

    
    // Light Door
    const lightDoor = new THREE.PointLight(0xfaa961, 5, 1000)
    lightDoor.position.set(8, 0.87, 0.3)
    
    this.map.add( lightDoor )
  }

  endLoadingModels () {
    const endTrans = Transition.fadeOut(this.endtransitionIntro.bind(this))
  }

  endtransitionIntro () {
    this.fragment.notStarted = false
    
    AudioManager.newSound({
      name: 'scene4_ambiance',
<<<<<<< HEAD
      volume: 0.2,
=======
      volume: 0.25,
>>>>>>> a136770 (feat ef fez)
      loop: true
    })

    // TODO : animation characters appear
    // console.log('endLoadingModels')
  }

  
  animationEndPhaeton () {
    // console.log('end animation Phaeton')
    this.phaeton.playWalk()

    this.phaeton.animation = true

    gsap.to(
      this.phaeton.mesh.position,
      {
        x: "+=450",
        duration: 1.5,
        ease: "sin.in"
      }
    )
  }
  animationEndFragment () {
    // console.log('end animation fragment')
    this.fragment.animation = true

    gsap.to(
      this.fragment.mesh.position,
      {
        x: "+=450",
        duration: 2.5,
        ease: "sin.inOut"
      }
    )
  }

  //
  // Destruct
  //
  async destruct () {
    AudioManager.stopSound('scene4_ambiance', 2.5)

    // const trans = await Transition.fadeIn(2)
    // this.game.clearUpdatedElement()
    
    // clearScene(this.scene)
    Matter.World.clear(this.world);

    return new Promise(resolve => {
      resolve('destructed');
    });
  }
}