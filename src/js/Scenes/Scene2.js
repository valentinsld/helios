import * as THREE from 'three'
import * as Matter from 'matter-js'

import clearScene from '../utils/clearScene'
import transition from '../utils/transition'

export default class Scene0 {
  constructor({camera, engine, globalScene, gltfLoader, textureLoader, sceneManager, game}) {
    this.game = game
    this.camera = camera

    this.engine = engine
    this.world = this.engine.world

    // init scene
    this.scene = new THREE.Group()
    globalScene.add(this.scene)

    this.initScene()
  }

  initScene() {
    console.log('scene 2')
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