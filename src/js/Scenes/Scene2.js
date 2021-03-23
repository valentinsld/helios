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
    console.log('scene 2')

    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    const cube = new THREE.Mesh( geometry, material );
    this.scene.add( cube );
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