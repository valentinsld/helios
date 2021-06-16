import * as THREE from 'three'
import * as Matter from 'matter-js'

import LoaderModelsManager from '../utils/LoaderModelsManager'
import clearScene from '../utils/clearScene'
import Transition from '../utils/transition'
// import MenuContextuels from '../utils/MenuContextuels'

export default class Scene0 {
  constructor({camera, engine, globalScene, gltfLoader, textureLoader, sceneManager, game}) {
    this.game = game
    this.camera = camera

    this.engine = engine
    this.gltfLoader = gltfLoader
    this.textureLoader = textureLoader
    this.world = this.engine.world

    // init scene
    this.scene = new THREE.Group()
    globalScene.add(this.scene)

    this.cameraFar()
    // this.initCharacters()

    this.initModels()
  }

  cameraFar () {
    this.camera.far = 4500

    this.camera.updateProjectionMatrix()
  }

  initCharacters () {
    this.phaeton = new Phaeton({
      engine: this.engine,
      scene : this.scene,
      debug: this.debug,
      textureLoader: this.textureLoader,
      gltfLoader: this.gltfLoader,
      scale: 60,
      speed: 15,
      position : {
        x : -1300,
        y : 100,
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
      radius: 30,
      distance: 400,
      position : {
        x : -1150,
        y : 200,
        z : 60
      }
    })

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

  initMap (gltf) {
    this.map = gltf.scene
    this.map.scale.set(310, 310, 310)
    this.map.position.set(-50, -700, -600)
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
      console.log(node.name)
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

    // Second light
    const secondLight = new THREE.PointLight(0xfaa961, 1, 3000, 0.5)
    secondLight.position.set(0, 0.1, -5.6)
    
    this.map.add( secondLight )

    
    // Light Door
    const lightDoor = new THREE.PointLight(0xfaa961, 5, 1000)
    lightDoor.position.set(8, 0.87, 0.3)
    
    this.map.add( lightDoor )
  }

  endLoadingModels () {
    const endTrans = Transition.fadeOut(this.endtransitionIntro.bind(this))
  }

  endtransitionIntro () {
    // TODO : animation characters appear
    console.log('endLoadingModels')
  }

  //
  // Destruct
  //
  async destruct () {
    clearScene(this.scene)
    Matter.World.clear(this.world);
    this.scene.parent.fog = null

    return new Promise(resolve => {
      resolve('destructed');
    });
  }
}