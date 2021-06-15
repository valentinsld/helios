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
    console.log(this.camera)
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
    this.map.scale.set(470, 470, 470)
    this.map.position.set(-100, -680, 180)

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
      if (node.isMesh) {
        node.material = material
      }
    })

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