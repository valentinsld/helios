import * as THREE from 'three'
import * as Matter from 'matter-js'

import Phaeton from '../Characters/Phaeton'
import Fragment from '../Characters/Fragment'

import Box from '../Elements/Box'
import Fire from '../Elements/Fire'
import Captor from '../Elements/Captor'
import Door from '../Elements/Door'

import LoaderModelsManager from '../utils/LoaderModelsManager'
import clearScene from '../utils/clearScene'
import transition from '../utils/transition'

import AnimatedFire from '../Elements/animatedFire'

export default class Scene3 {
  constructor({camera, engine, globalScene, gltfLoader, textureLoader, sceneManager, game}) {
    this.game = game
    this.camera = camera
    this.gltfLoader = gltfLoader
    this.textureLoader = textureLoader
    this.sceneManager = sceneManager

    this.engine = engine
    this.world = this.engine.world

    // init scene
    this.scene = new THREE.Group()
    globalScene.add(this.scene)

    this.initZoomCamera()
    this.initCharacters()
    this.initModels()
    this.initScene()
    this.addElements()
  }

  initZoomCamera () {
    this.camera.zoom = 0.55
    this.camera.updateProjectionMatrix()
  }

  initCharacters () {
    this.phaeton = new Phaeton({
      engine: this.engine,
      scene : this.scene,
      debug: this.debug,
      textureLoader: this.textureLoader,
      gltfLoader: this.gltfLoader,
      position : {
        x : -900,
        y : -350,
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
      position : {
        x : -800,
        y : -200,
        z : 60
      }
    })

    this.game.addUpdatedElement('phaeton', this.phaeton.update.bind(this.phaeton))
    this.game.addUpdatedElement('fragment', this.fragment.update.bind(this.fragment))
  }

  initModels () {
    const arrayModels = [
      {
        url: '/models/sous_terrain/sous_terrain.gltf',
        func: this.initSousTerrain.bind(this)
      }
    ]

    new LoaderModelsManager({
      arrayModels,
      gltfLoader: this.gltfLoader,
      // progressFunction: this.updateProgress.bind(this)
    })
  }

  addElements () {
    const floor1 = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff0000,
      size: {
        x: 1600,
        y: 150,
        z: 100
      },
      position : {
        x: -800,
        y: -550,
        z: 0
      }
    })
    const floor2 = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff0000,
      size: {
        x: 1540,
        y: 150,
        z: 100
      },
      position : {
        x: 1000,
        y: -550,
        z: 0
      }
    })
    const lastFloor = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff0000,
      size: {
        x: 3400,
        y: 400,
        z: 100
      },
      position : {
        x: 0,
        y: -1100,
        z: 0
      }
    })
    const topFloor = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff0000,
      size: {
        x: 900,
        y: 150,
        z: 100
      },
      position : {
        x: -1100,
        y: -150,
        z: 0
      }
    })

    const wall1 = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff0000,
      size: {
        x: 400,
        y: 2000,
        z: 100
      },
      position : {
        x: -1650,
        y: 0,
        z: 0
      }
    })
    const wall2 = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff0000,
      size: {
        x: 400,
        y: 2000,
        z: 100
      },
      position : {
        x: 1550,
        y: 0,
        z: 0
      }
    })
  }

  initSousTerrain (gltf) {
    this.sousTerrain = gltf.scene
    this.sousTerrain.scale.set(450, 450, 450)
    this.sousTerrain.position.y = -800

    this.scene.add(this.sousTerrain)
  }

  initScene () {
    console.log('scene 3')
  }

  //
  // Destruct
  //
  async destruct () {
    const trans = await transition.fade()

    clearScene(this.scene)
    Matter.World.clear(this.world);
    this.scene.parent.fog = null

    return new Promise(resolve => {
      resolve('destructed');
    });
  }
}