import * as THREE from 'three'
import * as Matter from 'matter-js'

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
    this.engine = engine
    this.world = this.engine.world

    // init scene
    this.scene = new THREE.Group()
    globalScene.add(this.scene)

    this.initScene()
  }

  initScene() {
    console.log('scene 2')

    const arrayModels = [
      {
        url: '/models/feu/feu.gltf',
        func: this.initFeu.bind(this)
      }
    ]

    new LoaderModelsManager({
      arrayModels,
      gltfLoader: this.gltfLoader,
      // progressFunction: this.updateProgress.bind(this)
    })
  }

  initFeu (gltf) {
    this.fire = new AnimatedFire({
      game: this.game,
      scene: this.scene,
      debug: this.debug,
      gltf
    })
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