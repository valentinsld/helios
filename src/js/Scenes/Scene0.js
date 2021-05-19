import * as THREE from 'three'
import * as Matter from 'matter-js'
import Intro from '../Intro'

export default class Scene0 {
  constructor({camera, engine, globalScene, game, sceneManager}) {
    this.game = game
    this.camera = camera

    this.engine = engine
    this.world = this.engine.world


    // init scene
    this.scene = new THREE.Group()
    globalScene.add(this.scene)

    this.initScene()
    this.intro = new Intro(sceneManager)
  }

  initScene() {
    console.log('scene 0')

    // setTimeout(() => {
    //   const sceneManager = this.game.sceneManager
    //   sceneManager.next()
    // }, 2000);
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