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
import transition from '../utils/transition'

import AnimatedFire from '../Elements/animatedFire'

export default class Scene0 {
  constructor({camera, engine, globalScene, gltfLoader, debug, textureLoader, sceneManager, game}) {
    this.game = game
    this.camera = camera
    this.debug = debug

    this.gltfLoader = gltfLoader
    this.textureLoader = textureLoader
    this.engine = engine
    this.world = this.engine.world

    // init scene
    this.scene = new THREE.Group()
    globalScene.add(this.scene)

    this.initZoomCamera()

    this.initModels()
  }

  initZoomCamera () {
    this.camera.zoom = 0.62
    
    this.camera.updateProjectionMatrix()
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
      // progressFunction: this.updateProgress.bind(this)
    })
  }

  async initFeuLeft (gltf) {
    this.fireLeft = new AnimatedFire({
      game: this.game,
      scene: this.scene,
      // debug: this.debug,
      gltf,
      position: {
        x: -920,
        y: -600,
        z: -60,
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

    this.initLightBrasier(this.fireLeft)

    return this.newPromise()
  }

  async initFeuRight (gltf) {
    this.fireRight = new AnimatedFire({
      game: this.game,
      scene: this.scene,
      // debug: this.debug,
      gltf,
      position: {
        x: 890,
        y: -600,
        z: -70,
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

    this.initLightBrasier(this.fireRight)

    return this.newPromise()
  }

  initLightBrasier (fire) {
    // point light
    const paramsLight = {
      color: 0xa26d32
    }
    const lightBrasier = new THREE.PointLight(paramsLight.color, 4.5, 1900)
    lightBrasier.position.copy(fire.position)
    
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
    this.map.position.set(-100, -680, 0)

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

    return this.newPromise()
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
    const trans = await transition.fade()

    clearScene(this.scene)
    Matter.World.clear(this.world);

    return new Promise(resolve => {
      setTimeout(() => {
        resolve('destructed');
      }, 100);
    });
  }
}