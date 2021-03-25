import * as THREE from 'three'
import * as Matter from 'matter-js'

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

    //
    // Brasier
    //
    this.gltfLoader.load(
      '/models/brasier.glb',
      (gltf) =>
      {
          console.log('success')
          console.log(gltf)

          this.brasier = gltf.scene.children[0]
          console.log(this.brasier.scale)
          this.brasier.scale.set(10,10,10)
          console.log(this.brasier.scale)

          this.scene.add(this.brasier)
      },
      (progress) =>
      {
          console.log('progress')
          console.log(progress)
      },
      (error) =>
      {
          console.log('error')
          console.log(error)
      }
    )
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