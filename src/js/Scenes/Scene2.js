import * as THREE from 'three'
import * as Matter from 'matter-js'

import gsap from 'gsap'
import { RoughEase } from 'gsap/EasePack'
const easeRough = RoughEase.ease.config({
  template: 'power1.out',
  strength: 0.5,
  points: 10,
  taper: 'none',
  randomize: true,
  clamp: false
})

import LoaderModelsManager from '../utils/LoaderModelsManager'
import clearScene from '../utils/clearScene'
import Transition from '../utils/transition'
import MenuContextuels from '../utils/MenuContextuels'

import Phaeton from '../Characters/Phaeton'
import Fragment from '../Characters/Fragment'

import Box from '../Elements/Box'
import AnimatedFire from '../Elements/animatedFire'
import Plaque from '../Elements/Plaque'
import Door from '../Elements/Door'

export default class Scene0 {
  constructor({camera, engine, globalScene, gltfLoader, debug, textureLoader, sceneManager, game}) {
    this.game = game
    this.camera = camera
    this.debug = debug

    this.gltfLoader = gltfLoader
    this.textureLoader = textureLoader
    this.engine = engine
    this.world = this.engine.world
    this.sceneManager = sceneManager

    // init scene
    this.scene = new THREE.Group()
    globalScene.add(this.scene)

    this.open = false

    this.initZoomCamera()

    this.initSol()
    this.initCharacters()
    this.initDoor()
    this.initModels()
  }

  initZoomCamera () {
    this.camera.zoom = 0.62
    
    this.camera.updateProjectionMatrix()
  }

  initCharacters () {
    this.phaeton = new Phaeton({
      engine: this.engine,
      scene : this.scene,
      debug: this.debug,
      textureLoader: this.textureLoader,
      gltfLoader: this.gltfLoader,
      scale: 80,
      speed: 15,
      position : {
        x : -1300,
        y : -600,
        z : 80
      }
    })

    this.fragment = new Fragment({
      game: this.game,
      canvas: this.canvas,
      engine: this.engine,
      scene : this.scene,
      camera : this.camera,
      debug: this.debug,
      radius: 35,
      distance: 400,
      position : {
        x : -1150,
        y : -400,
        z : 60
      }
    })

    this.game.addUpdatedElement('phaeton', this.phaeton.update.bind(this.phaeton))
    this.game.addUpdatedElement('fragment', this.fragment.update.bind(this.fragment))
  }

  initSol () {
    // FLOORS
    const floor = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0x000000,
      // render: false,
      size: {
        x: 3600,
        y: 400,
        z: 100
      },
      position : {
        x: 0,
        y: -880,
        z: 200
      }
    })

    // Walls
    const wallRight = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff0000,
      render: false,
      size: {
        x: 400,
        y: 2000,
        z: 100
      },
      position : {
        x: 1550,
        y: 200,
        z: 100
      }
    })

    const wallLeft = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff0000,
      render: false,
      size: {
        x: 400,
        y: 2000,
        z: 100
      },
      position : {
        x: -1600,
        y: 200,
        z: 100
      }
    })
  }

  initDoor () {
    this.door = new Door({
      scene: this.scene,
      engine: this.engine,
      sceneManager: this.sceneManager,
      phaeton: this.phaeton,
      fragment: this.fragment,
      // render: false,
      position : {
        x : 1350,
        y : -500,
        z : 250
      },
      size: {
        x: 400,
        y: 400,
        z: 1
      },
      open: this.open,
      animationEndPhaeton: this.animationEndPhaeton.bind(this),
      animationEndFragment: this.animationEndFragment.bind(this)
    })
  }

  initModels() {
    console.log('scene 2')

    const arrayModels = [
      {
        url: '/models/feu/feu.gltf',
        func: this.initFeuLeft.bind(this)
      },
      {
        url: '/models/feu/feu.gltf',
        func: this.initFeuRight.bind(this)
      },
      {
        url: '/models/scene2/salle_2.gltf',
        func: this.initSalle.bind(this)
      },
    ]

    new LoaderModelsManager({
      arrayModels,
      gltfLoader: this.gltfLoader,
      endFunction: this.endLoadingModels.bind(this)
    })
  }

  endLoadingModels () {
    const endTrans = Transition.fadeOut(this.endtransitionIntro.bind(this))
  }

  endtransitionIntro () {
    // TODO : animation characters appear
    console.log('endLoadingModels')
  }

  async initFeuLeft (gltf) {
    this.fireLeft = new AnimatedFire({
      game: this.game,
      scene: this.scene,
      // debug: this.debug,
      gltf,
      position: {
        x: -870,
        y: -600,
        z: -260,
      },
      size: {
        x: 100,
        y: 100,
        z: 10
      },
      parameters: {
        colorEnd: 42
      }
    })

    this.initLightBrasier(this.fireLeft, 50)

    return this.newPromise()
  }

  async initFeuRight (gltf) {
    this.fireRight = new AnimatedFire({
      game: this.game,
      scene: this.scene,
      // debug: this.debug,
      gltf,
      position: {
        x: 940,
        y: -600,
        z: -270,
      },
      size: {
        x: 100,
        y: 100,
        z: 10
      },
      parameters: {
        colorEnd: 42
      }
    })

    this.initLightBrasier(this.fireRight, -50)

    return this.newPromise()
  }

  initLightBrasier (fire, translateX = 0) {
    // point light
    const paramsLight = {
      color: 0xa26d32
    }
    const lightBrasier = new THREE.PointLight(paramsLight.color, 4.5, 1900)
    lightBrasier.position.copy(fire.position)
    lightBrasier.position.x += translateX
    
    lightBrasier.castShadow = true
    lightBrasier.shadow.camera.far = 1800
    lightBrasier.shadow.camera.near = 200
    lightBrasier.shadow.radius = 4
    lightBrasier.shadow.mapSize.width = 512
    lightBrasier.shadow.mapSize.height = 512

    this.scene.add( lightBrasier )

    // if (this.debugSceneFolder) {
    //   const color = this.debugSceneFolder.addColor(paramsLight, "color").name('Light Color')
    //   color.onChange((value) => {
    //     lightBrasier.color = new THREE.Color(value)
    //   })

    //   this.debugSceneFolder.add(lightBrasier, "intensity", 0, 10).name('Light intensity')
    //   this.debugSceneFolder.add(lightBrasier, "distance", 1000, 2000).name('Light distance')
    // }


    //
    // ANIMATION
    //
    const timeline = gsap.timeline({repeat: -1, repeatDelay: 0.1});
    timeline
      .to(
        lightBrasier,
        {
          intensity: 5.5, 
          duration: 0.2,
          ease: easeRough
        }
      )
      .to(
        lightBrasier,
        {
          intensity: 4.5,
          duration: 0.15,
          ease: easeRough
        }
      )
      .to(
        lightBrasier,
        {
          intensity: 5,
          duration: 0.2,
          ease: easeRough
        }
      )
      .to(
        lightBrasier,
        {
          intensity: 4,
          duration: 0.15,
          ease: easeRough
        }
      )
  }

  async initSalle (gltf) {
    this.map = gltf.scene
    this.map.scale.set(250, 250, 250)
    this.map.position.set(-50, -680, -200)

    this.scene.add(this.map) 

    // TEXTURE MAP
    const texturemap = this.textureLoader.load('/models/scene2/texture_salle_bake.png')
    texturemap.flipY = false
    const normalmap = this.textureLoader.load('/models/scene2/normal_salle.png')
    normalmap.flipY = false

    const materialMap = new THREE.MeshStandardMaterial({
      map: texturemap,
      normalMap: normalmap,
      metalness: 0,
      roughness: 0.5,
    })

    // TEXTURE Statues
    const textureChar = this.textureLoader.load('/models/scene2/texture_char_bake.png')
    textureChar.flipY = false
    const normalChar = this.textureLoader.load('/models/scene2/normal_char.png')
    normalChar.flipY = false

    const materialChar = new THREE.MeshStandardMaterial({
      map: textureChar,
      normalMap: normalChar,
      metalness: 0,
      roughness: 0.5
    })

    this.map.traverse((node)=> {
      if (['char-solaire'].includes(node.name)) {
        node.material = materialChar
      } else {
        node.material = materialMap
      }
    })

    this.initPlaque()

    return this.newPromise()
  }

  initPlaque () {
    const pos = {
      x: 500,
      y: -600
    }

    this.plaque = new Plaque({
      scene: this.scene,
      engine: this.engine,
      func: this.endScene.bind(this),
      gltf: this.map.getObjectByName(`Plaque`),
      box: {
        position: {
          x: pos.x,
          y: pos.y,
          z: 0,
        },
        size: {
          x: 200,
          y: 200,
          z: 200
        }
      },
      plaque: {
        position: {
          x: pos.x,
          y: pos.y - 40,
          z: 0,
        },
        size: {
          x: 100,
          y: 25,
          z: 100
        }
      }
    })
  }

  animationEndPhaeton () {
    // console.log('end animation Phaeton')
    this.phaeton.playWalk()

    this.phaeton.animation = true

    gsap.to(
      this.phaeton.mesh.position,
      {
        x: "+=450",
        y: "-=250",
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
        y: "-=250",
        duration: 2.5,
        ease: "sin.inOut"
      }
    )
  }

  endScene () {
    if (this.open) return;

    // menu
    MenuContextuels.addMenu({
      id: 'endScene2',
      text: 'Lorsque vous marchez sur des plaques de pression, vous activez des mecanismes',
      position: new THREE.Vector3(550, -100, 0)
    })

    this.open = true
    this.door.open()
    console.log('EndScene')
    // x: 5.7, y:1.9

    gsap.to(
      this.map.getObjectByName(`PORTE`).position,
      {
        x: 5.7,
        y: 1.9,
        duration: 1.7,
        ease: 'power3.in'
      }
    )
  }

  newPromise (time = 1000) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  }

  //
  // Destruct
  //
  async destruct () {
    const trans = await Transition.fadeIn(1)

    MenuContextuels.removeMenu('endScene2')

    clearScene(this.scene)
    Matter.World.clear(this.world);

    return new Promise(resolve => {
      setTimeout(() => {
        resolve('destructed');
      }, 100);
    });
  }
}