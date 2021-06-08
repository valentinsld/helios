import * as THREE from 'three'
import * as Matter from 'matter-js'
import gsap from 'gsap'

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

const CODE = [0,1,2,3]

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
    // this.initSousTerrainWorld()
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
      scale: 65,
      speed: 15,
      position : {
        x : -1300,
        y : 100,
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
      radius: 30,
      distance: 400,
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
        url: '/models/Scene3/Enigme_3.gltf',
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
    this.game.ambientLight.intensity = this.debug ? 1 : 0.17
    
    // FLOORS
    const floor1 = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0xff0000,
      render: false,
      size: {
        x: 1600,
        y: 150,
        z: 100
      },
      position : {
        x: -930,
        y: -414,
        z: 0
      }
    })
    const floor2 = new Box({
      engine: this.engine,
      scene: this.scene,
      render: false,
      color: 0xff0000,
      size: {
        x: 1540,
        y: 150,
        z: 100
      },
      position : {
        x: 890,
        y: -414,
        z: 0
      }
    })
    const lastFloor = new Box({
      engine: this.engine,
      scene: this.scene,
      render: false,
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
      render: false,
      color: 0xff00ff,
      size: {
        x: 900,
        y: 150,
        z: 100
      },
      position : {
        x: -1100,
        y: -10,
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
      render: false,
      size: {
        x: 400,
        y: 2000,
        z: 100
      },
      position : {
        x: -1620,
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
      render: false,
      size: {
        x: 400,
        y: 2000,
        z: 100
      },
      position : {
        x: 1390,
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
      render: false,
      color: 0xff00ff,
      size: {
        x: 100,
        y: 400,
        z: 100
      },
      position : {
        x: -700,
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
      render: false,
      size: {
        x: 300,
        y: 400,
        z: 100
      },
      position : {
        x: 0,
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

  pressPlaque (i) {
    if (this.open) return

    let inc = this.code.includes(i)
    if (!this.code.includes(i)) {
      this.symboles[i].material.emissiveIntensity = 0.25
      this.code.push(i)
    }

    if (JSON.stringify(this.code) === JSON.stringify(CODE)) {
      this.endScene()
    } else if (this.code.length === CODE.length || inc) {
      this.code = []

      this.symboles.forEach((sym) => {
        sym.material.emissiveIntensity = 0
      })
    }
  }

  addLadder () {
    this.ladder = new Ladder({
      scene: this.scene,
      engine: this.engine,
      phaeton: this.phaeton,
      position : {
        x : -1030,
        y : -430,
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
        x : 1140,
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
    this.map = gltf.scene
    this.map.scale.set(470, 470, 470)
    this.map.position.set(-100, -680, 180)

    this.scene.add(this.map) 

    this.renePhaeton = new THREE.Group()
    this.renePhaeton.position.set(0.67, 0.7, 0)
    const phaeton = this.map.getObjectByName('Phaeton')
    const renes = this.map.getObjectByName('Renes')
    
    this.renePhaeton.add(phaeton)
    this.renePhaeton.add(renes)
    this.map.add(this.renePhaeton)

    phaeton.position.x = 0
    phaeton.position.y = 0

    renes.position.x = -0.350
    renes.position.y = 1.330

    // TEXTURE MAP
    const texturemap = this.textureLoader.load('/models/Scene3/Texture_Enigme3_modif.png')
    texturemap.flipY = false
    const normalmap = this.textureLoader.load('/models/Scene3/Normal_Decors.png')
    normalmap.flipY = false

    const materialMap = new THREE.MeshStandardMaterial({
      map: texturemap,
      normalMap: normalmap,
      metalness: 0,
      roughness: 0.5,
    })

    // TEXTURE Statues
    const textureStatues = this.textureLoader.load('/models/Scene3/Texture_statues.png')
    textureStatues.flipY = false
    const normalStatues = this.textureLoader.load('/models/Scene3/Normal_statues.png')
    normalStatues.flipY = false

    const materialStatues = new THREE.MeshStandardMaterial({
      map: textureStatues,
      normalMap: normalStatues,
      metalness: 0,
      roughness: 0.5
    })

    this.symboles = []
    this.map.traverse((node)=> {
      if (node.isMesh && ['F','I','L','S'].includes(node.name)) {
        const mat = new THREE.MeshStandardMaterial({
          map: texturemap,
          normalMap: normalmap,
          metalness: 0,
          roughness: 0.5,
          emissive: new THREE.Color(0xfaa961),
          emissiveIntensity: 0
        })
        this.symboles.push(node)
        node.material = mat
      } else if (['Helios','Phaeton','Renes'].includes(node.name)) {
        node.material = materialStatues
      } else if(!['premier_plan'].includes(node.name)) {
        node.material = materialMap
      }
    })

    // add light door
    this.map.getObjectByName('porte').castShadow = true
    this.map.getObjectByName('murs').receiveShadow = true

    this.lightDoor = new THREE.PointLight(0xfaa961, 5, 300, 0.5)
    this.lightDoor.castShadow = true
    this.lightDoor.position.set(3.17, 1.5, 0)
    this.map.add(this.lightDoor)

    //Set up shadow properties for the light
    this.lightDoor.shadow.mapSize.width = 512; // default
    this.lightDoor.shadow.mapSize.height = 512; // default
    this.lightDoor.shadow.camera.near = 0.5; // default
    this.lightDoor.shadow.camera.far = 500; // default

    console.log(this.game.renderer.shadowMap)

    this.initPlaques()
  }

  initPlaques () {
    this.plaques = []

    const plaques = [
      { // 0
        x: -1150,
        y: 105,
        z: 0
      },
      { // 3
        x: -800,
        y: -305,
        z: 0
      },
      { // 1
        x: -880,
        y: 105,
        z: 0
      },
      { // 2
        x: -1200,
        y: -305,
        z: 0
      },

    ]

    plaques.forEach((pos, i) => {
      const plaque = new Plaque({
        scene: this.scene,
        engine: this.engine,
        func: this.pressPlaque.bind(this),
        funcParam: i,
        gltf: this.map.getObjectByName(`Plaque_${i+1}`),
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

  initSousTerrainWorld () {
    const select = function(root, selector) {
      return Array.prototype.slice.call(root.querySelectorAll(selector));
    };

    const loadSvg = function(url) {
      return fetch(url)
          .then(function(response) { return response.text(); })
          .then(function(raw) { return (new window.DOMParser()).parseFromString(raw, 'image/svg+xml'); });
    };

    loadSvg('https://raw.githubusercontent.com/liabru/matter-js/master/demo/svg/terrain.svg')
      .then(function(root) {
          var paths = select(root, 'path');

          console.log(paths)
          var vertexSets = paths.map(function(path) { return Matter.Svg.pathToVertices(path, 30); });

          var terrain = Matter.Bodies.fromVertices(400, 350, vertexSets, {
            isStatic: true,
            render: {
              fillStyle: '#060a19',
              strokeStyle: '#060a19',
              lineWidth: 1
            }
          }, true);

          Matter.Composite.add(this.world, terrain);

          var bodyOptions = {
            frictionAir: 0, 
            friction: 0.0001,
            restitution: 0.6
          };
          
          Matter.Composite.add(this.world, Matter.Composites.stack(80, 100, 20, 20, 10, 10, function(x, y) {
            if (Matter.Query.point([terrain], { x: x, y: y }).length === 0) {
              return Matter.Bodies.polygon(x, y, 5, 12, bodyOptions);
            }
          }));
      });
    
  }

  endScene () {
    this.open = true
    this.door.open()

    const tl = gsap.timeline()

    // add light
    const spotLight = new THREE.SpotLight(0xfaa961, 0, 1200)
    spotLight.decay = -0.1
    spotLight.penumbra = 0.3
    spotLight.power = 15

    spotLight.position.set(0, 1200, 40)
    this.scene.add( spotLight )

    // const spotLightHelper = new THREE.SpotLightHelper( spotLight )
    // this.scene.add( spotLightHelper )

    tl.to(
      spotLight,
      {
        intensity: 3,
        angle: 0.5
      }
    )

    // animation lanière
    tl.to(
      this.map.getObjectByName('Renes').position,
      {
        delay: 0.5,
        y: 1,
        ease: "power2.in"
      }
    )

    // animation personnage
    tl.to(
      this.renePhaeton.rotation,
      {
        z: Math.PI * 0.45,
        duration: 3,
        ease: "power4.in"
      },
      '-=0.5'
    )
    tl.to(
      this.renePhaeton.rotation,
      {
        z: Math.PI * 0.43,
        duration: 0.2,
        ease: "power2.out"
      }
    )
    tl.to(
      this.renePhaeton.rotation,
      {
        z: Math.PI * 0.45,
        duration: 0.15,
        ease: "power1.in"
      }
    )

    // animation porte
    tl.to(
      this.map.getObjectByName('porte').position,
      {
        y: 2.5,
        duration: 1.5,
        ease: "power1.in"
      }
    )

    // moove center block
    Matter.Body.translate(this.blockCenter.box, Matter.Vector.create(0, -140))

    // add block
    const up = Matter.Bodies.rectangle(
      0,
      -325,
      250,
      50,
      {
        label: 'Box',
        isStatic: true,
        friction: 1,
        frictionStatic: Infinity,
        render: {
          fillStyle: 'transparent',
          lineWidth: 2
        }
      }
    );
    Matter.World.add(this.world, up);

    up.vertices[0].x -= 100
    up.vertices[1].x += 100
    Matter.Body.setVertices(up, up.vertices);
  }

  animationEndPhaeton () {
    console.log('end animation Phaeton')
    this.phaeton.playWalk()

    this.phaeton.mesh.position.z = 120
    this.phaeton.animation = true

    gsap.to(
      this.phaeton.mesh.position,
      {
        x: "+=450",
        y: -70,
        z: 120,
        duration: 1.5,
        ease: "sin.in"
      }
    )
  }
  animationEndFragment () {
    console.log('end animation fragment')
    this.fragment.animation = true

    gsap.to(
      this.fragment.mesh.position,
      {
        x: "+=450",
        z: 120,
        duration: 2.5,
        ease: "sin.inOut"
      }
    )
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