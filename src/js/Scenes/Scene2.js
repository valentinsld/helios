import * as THREE from 'three'
import * as Matter from 'matter-js'

import LoaderModelsManager from '../LoaderModelsManager'

export default class Scene0 {
  constructor({camera, engine, globalScene, gltfLoader, textureLoader, sceneManager, game}) {
    this.game = game
    this.camera = camera

    this.engine = engine
    this.world = this.engine.world

    this.gltfLoader = gltfLoader

    // init scene
    this.scene = new THREE.Group()
    globalScene.add(this.scene)

    this.initScene()
  }

  initScene() {
    console.log('scene 2')

    //
    // Set cube
    //
    const geometry = new THREE.BoxGeometry( 100, 100, 100 );
    const material = new THREE.MeshBasicMaterial( {color: 0x624226} );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.y = -50

    this.scene.add( cube );

    const arrayModels = [
      {
        url: '/models/brasier/brasier.glb',
        func: this.initBrasier.bind(this)
      },
      {
        url: '/models/statues/statue1.gltf',
        func: this.initStatue1.bind(this)
      },
      {
        url: '/models/statues/statue2.gltf',
        func: this.initStatue2.bind(this)
      }
    ]

    new LoaderModelsManager({
      arrayModels,
      gltfLoader: this.gltfLoader,
      progressFunction: this.updateProgress.bind(this)
    })
  }

  updateProgress(progress) {
    console.log('progress', progress)
  }

  initBrasier(gltf) {
    console.log('brasier', gltf)

    this.scene.add(gltf.scene)
  }
  
  initStatue1(gltf) {
    console.log('initStatue1', gltf)

    this.scene.add(gltf.scene)
  }
  
  initStatue2(gltf) {
    console.log('initStatue2', gltf)

    this.scene.add(gltf.scene)
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