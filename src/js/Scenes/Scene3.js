import * as THREE from 'three'
import * as Matter from 'matter-js'

import Phaeton from '../Characters/Phaeton'
import Fragment from '../Characters/Fragment'

import Box from '../Elements/Box'
import Plaque from '../Elements/Plaque'
import Ladder from '../Elements/Ladder'
import Fire from '../Elements/Fire'
import Door from '../Elements/Door'

import LoaderModelsManager from '../utils/LoaderModelsManager'
import clearScene from '../utils/clearScene'
import transition from '../utils/transition'

import AnimatedFire from '../Elements/animatedFire'

const CODE = [1,0,2,3]

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

    this.code = []
    this.open = false

    this.initZoomCamera()
    this.initCharacters()
    this.initModels()
    
    this.addWallsAndFloors()
    this.addPlaques()
    this.addLadder()
    this.addDoor()
  }

  initZoomCamera () {
    this.camera.zoom = 0.62
    
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
        x : -1200,
        y : 50,
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

  addWallsAndFloors () {
    // FLOORS
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
        y: -450,
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
        y: -450,
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
      color: 0xff00ff,
      size: {
        x: 900,
        y: 150,
        z: 100
      },
      position : {
        x: -1100,
        y: -50,
        z: 0
      },
      optionsBox: {
        collisionFilter: {
          category: 0x0004
        },
      }
    })

    // WALLS
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
        y: 100,
        z: 0
      },
      optionsBox: {
        collisionFilter: {
          category: 0x0001 || 0x0002
        },
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
        y: 100,
        z: 0
      },
      optionsBox: {
        collisionFilter: {
          category: 0x0001 || 0x0002
        },
      }
    })

    // block phaeton
    const blockTopFloor = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff00ff,
      size: {
        x: 100,
        y: 400,
        z: 100
      },
      position : {
        x: -600,
        y: 100,
        z: 0
      },
      optionsBox: {
        collisionFilter: {
          category: 0x0004
        },
      }
    })

    this.blockCenter = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff00ff,
      size: {
        x: 300,
        y: 400,
        z: 100
      },
      position : {
        x: 100,
        y: -400,
        z: 0
      },
      optionsBox: {
        collisionFilter: {
          category: 0x0004
        },
      }
    })
  }

  addPlaques () {
    this.plaques = []

    const plaques = [
      {
        x: -750,
        y: 65,
        z: 0,
      },
      {
        x: -1050,
        y: 65,
        z: 0,
      },
      {
        x: -750,
        y: -335,
        z: 0,
      },
      {
        x: -1150,
        y: -335,
        z: 0,
      }
    ]

    plaques.forEach((pos, i) => {
      const plaque = new Plaque({
        scene: this.scene,
        engine: this.engine,
        func: this.pressPlaque.bind(this),
        funcParam: i,
        box: {
          position: {
            x: pos.x,
            y: pos.y,
            z: 0,
          },
          size: {
            x: 100,
            y: 100,
            z: 100
          }
        },
        plaque: {
          position: {
            x: pos.x,
            y: pos.y - 40,
            z: 0,
          },
          size: {
            x: 100,
            y: 25,
            z: 100
          }
        }
      })

      this.plaques.push(plaque)
    })

  }

  pressPlaque (i) {
    this.symboles[i].material.color = new THREE.Color(0xffffff)
    this.code.push(i)

    console.log(i, this.code)

    if (JSON.stringify(this.code) === JSON.stringify(CODE)) {
      console.log('SAME')
    } else if (this.code.length === CODE.length) {
      this.code = []

      this.symboles.forEach((sym) => {
        sym.material.color = new THREE.Color(0xff00ff)
      })
    }
  }  
  addLadder () {
    this.ladder = new Ladder({
      scene: this.scene,
      engine: this.engine,
      phaeton: this.phaeton,
      position : {
        x : -900,
        y : -470,
        z : 0
      },
      size: {
        x: 100,
        y: 400,
        z: 0
      }
    })
  }

  addDoor () {
    this.door = new Door({
      scene: this.scene,
      engine: this.engine,
      sceneManager: this.sceneManager,
      phaeton: this.phaeton,
      fragment: this.fragment,
      render: this.debug ? true : false,
      render: false,
      position : {
        x : 1240,
        y : -130,
        z : 250
      },
      size: {
        x: 200,
        y: 420,
        z: 1
      },
      open: this.endEnigme,
      animationEndPhaeton: this.animationEndPhaeton.bind(this),
      animationEndFragment: this.animationEndFragment.bind(this)
    })
  }

  initSousTerrain (gltf) {
    this.sousTerrain = gltf.scene
    this.sousTerrain.scale.set(450, 450, 450)
    this.sousTerrain.position.y = -700

    this.scene.add(this.sousTerrain)

    this.symboles = []
    this.sousTerrain.traverse((node)=> {
      if (node.isMesh && ['1','2','3','4'].includes(node.name)) {
        const material = new THREE.MeshStandardMaterial({
          color: 0xff00ff
        })
        node.material = material

        this.symboles.push(node)
      }
    })

  }

  endScene () {
    this.open = true
    this.door.open()

    // moove center block
    console.log(this.blockCenter.box)
    Matter.Body.translate(this.blockCenter.box, Matter.Vector.create(0, -180))
  }

  animationEndPhaeton () {
    console.log('end animation Phaeton')
  }
  animationEndFragment () {
    console.log('end animation fragment')
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