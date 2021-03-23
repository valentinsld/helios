import * as THREE from 'three'
import * as Matter from 'matter-js'

export default class Scene0 {
  constructor({camera, engine, globalScene, game}) {
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
    console.log('scene 5')
  }

  //
  // Destruct
  //
  async destruct () {
    this.scene.clear()
    Matter.World.clear(this.world);

    return new Promise(resolve => {
      setTimeout(() => {
        resolve('destructed');
      }, 100);
    });
  }
}