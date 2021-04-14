import * as THREE from 'three'
import * as Matter from 'matter-js'

import Phaeton from '../Characters/Phaeton'
import Fragment from '../Characters/Fragment'

import Box from '../Elements/Box'
import Fire from '../Elements/Fire'
import Captor from '../Elements/Captor'
import Door from '../Elements/Door'

import LoaderModelsManager from '../LoaderModelsManager'

import Statue from '../Elements/01_statue'

export default class Scene1 {
  constructor({camera, render, engine, globalScene, gltfLoader, textureLoader, sceneManager, game}) {
    this.game = game
    this.sceneManager = sceneManager
    this.camera = camera

    this.gltfLoader = gltfLoader
    this.textureLoader = textureLoader
    this.render = render
    this.engine = engine
    this.world = this.engine.world

    // init scene
    this.scene = new THREE.Group()
    globalScene.add(this.scene)
    
    if (this.debug) this.debugSceneFolder = this.debug.addFolder('Scene params')

    this.endEnigme = false

    this.initCharacters()
    this.initModels()
    this.addElements()
  }

  initCharacters () {
    this.phaeton = new Phaeton({
      engine: this.engine,
      scene : this.scene,
      position : {
        x : -1300,
        y : -450,
        z : 200
      }
    })

    this.fragment = new Fragment({
      canvas: this.canvas,
      engine: this.engine,
      scene : this.scene,
      camera : this.camera,
      position : {
        x : -1200,
        y : -350,
        z : 0
      }
    })

    this.game.addUpdatedElement('phaeton', this.phaeton.update.bind(this.phaeton))
    this.game.addUpdatedElement('fragment', this.fragment.update.bind(this.fragment))
  }

  initModels () {
    const arrayModels = [
      {
        url: '/models/statuedebout/statuedebout.gltf',
        func: this.initStatue1.bind(this)
      },
      {
        url: '/models/statuedebout/statuedebout.gltf',
        func: this.initStatue2.bind(this)
      }
    ]

    new LoaderModelsManager({
      arrayModels,
      gltfLoader: this.gltfLoader,
      // progressFunction: this.updateProgress.bind(this)
    })
  }

  addElements () {
    const floor = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 4000,
        y: 500,
        z: 500
      },
      position : {
        x: 0,
        y: -800,
        z: 0
      }
    })

    const wallLeft = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 400,
        y: 1500,
        z: 500
      },
      position : {
        x: -2000,
        y: 200,
        z: 0
      }
    })

    const wallRight= new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 400,
        y: 1500,
        z: 500
      },
      position : {
        x: 2000,
        y: 200,
        z: 0
      }
    })

    const escalier = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 150,
        y: 550,
        z: 500
      },
      position : {
        x: 720,
        y: -557,
        z: 0
      },
      rotation: Math.PI * 0.6
    })

    const palier = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 900,
        y: 400,
        z: 500
      },
      position : {
        x: 1400,
        y: -600,
        z: 0
      }
    })

    // this.statue1 = new Statue ({
    //   scene: this.scene,
    //   engine: this.engine,
    //   phaeton: this.phaeton,
    //   position: {
    //     x: -100,
    //     y: -500,
    //     z: -50,
    //   },
    //   size: {
    //     x: 100,
    //     y: 100,
    //     z: 100
    //   }
    // })

    
    // this.statue2 = new Statue ({
    //   scene: this.scene,
    //   engine: this.engine,
    //   phaeton: this.phaeton,
    //   position: {
    //     x: 200,
    //     y: -500,
    //     z: -50,
    //   },
    //   size: {
    //     x: 100,
    //     y: 100,
    //     z: 100
    //   }
    // })


    this.captor = new Captor ({
      scene: this.scene,
      engine: this.engine,
      fragment: this.fragment,
      position: {
        x: 1200,
        y: 150,
        z: -45,
      },
      size: {
        x: 100,
        y: 100,
        z: 200
      },
      canInteract: this.getStepStatues.bind(this),
      activateAction: this.endEnigmeAnimation.bind(this)
    })

    this.fire = new Fire ({
      scene: this.scene,
      engine: this.engine,
      render: this.render,
      fragment: this.fragment,
      debug: this.debug,
      position: {
        x: -600,
        y: -500,
        z: -45,
      },
      size: {
        x: 100,
        y: 100,
        z: 10
      },
      captor: this.captor,
      angleCone: Math.PI * 0.01
    })


    this.door = new Door({
      scene: this.scene,
      engine: this.engine,
      sceneManager: this.sceneManager,
      phaeton: this.phaeton,
      fragment: this.fragment,
      position : {
        x : 1600,
        y : -250,
        z : -51
      },
      size: {
        x: 200,
        y: 300,
        z: 1
      },
      open: this.endEnigme
    })
  }

  initStatue1 (gltf) {
    const texture = this.textureLoader.load('/models/statuedebout/texturestatue1.png')
    texture.flipY = false
    const normal = this.textureLoader.load('/models/statuedebout/normalstatue1.png')
    normal.flipY = false

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      normalMap: normal,
      metalness: 0,
      roughness: 0.5,
    })

    gltf = gltf.scene
    gltf.scale.set(70, 70, 70)
    gltf.children[0].position.z = -0.1
    gltf.children[0].position.y = 0.70

    gltf.traverse( function(node) {
      if (node.isMesh) {
        node.material = material
        node.castShadow = true
        // node.receiveShadow = true
      }
    })

    this.statue2 = new Statue ({
      scene: this.scene,
      engine: this.engine,
      phaeton: this.phaeton,
      gltf,
      position: {
        x: 200,
        y: -500,
        z: -50,
      },
      size: {
        x: 100,
        y: 100,
        z: 100
      }
    })
  }

  initStatue2 (gltf) {
    const texture = this.textureLoader.load('/models/statuedebout/texturestatue1.png')
    texture.flipY = false
    const normal = this.textureLoader.load('/models/statuedebout/normalstatue1.png')
    normal.flipY = false

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      normalMap: normal,
      metalness: 0,
      roughness: 0.5,
    })

    gltf = gltf.scene
    gltf.scale.set(70, 70, 70)
    gltf.children[0].position.z = -0.1
    gltf.children[0].position.y = 0.70

    gltf.traverse( function(node) {
      if (node.isMesh) {
        node.material = material
        node.castShadow = true
        // node.receiveShadow = true
      }
    })

    this.statue1 = new Statue ({
      scene: this.scene,
      engine: this.engine,
      phaeton: this.phaeton,
      gltf,
      position: {
        x: -100,
        y: -500,
        z: -50,
      },
      size: {
        x: 100,
        y: 100,
        z: 100
      }
    })
  }


  getStepStatues () {
    return this.statue1.activate && this.statue2.activate
  }

  endEnigmeAnimation () {
    this.endEnigme = true
    this.door.open()
    console.log('End enigme !!')
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