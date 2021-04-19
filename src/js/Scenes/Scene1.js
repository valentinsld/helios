import * as THREE from 'three'
import * as Matter from 'matter-js'

import gsap from 'gsap'
import { RoughEase } from 'gsap/EasePack'
const easeRough = RoughEase.ease.config({
  template: 'power1.out',
  strength: 0.5,
  points: 10,
  taper: 'none',
  randomize: true,
  clamp: false
})

import Phaeton from '../Characters/Phaeton'
import Fragment from '../Characters/Fragment'

import Box from '../Elements/Box'
import Fire from '../Elements/Fire'
import Captor from '../Elements/Captor'
import Door from '../Elements/Door'

import LoaderModelsManager from '../utils/LoaderModelsManager'
import clearScene from '../utils/clearScene'
import transition from '../utils/transition'

import Statue from '../Elements/01_statue'

export default class Scene1 {
  constructor({camera, render, engine, globalScene, gltfLoader, textureLoader, sceneManager, game, debug}) {
    this.game = game
    this.sceneManager = sceneManager
    this.camera = camera
    this.debug = debug

    this.gltfLoader = gltfLoader
    this.textureLoader = textureLoader
    this.render = render
    this.engine = engine
    this.world = this.engine.world

    // init scene
    this.scene = new THREE.Group()
    globalScene.add(this.scene)

    this.groupDoorTemple = new THREE.Group()
    this.groupDoorTemple.position.set(800, -470, -180)
    this.groupDoorTemple.rotateY(Math.PI * 3/4)
    this.scene.add(this.groupDoorTemple)

    
    if (this.debug) this.debugSceneFolder = this.debug.addFolder('Scene params')

    this.endEnigme = false

    this.initZoomCamera()
    this.initCharacters()
    this.initModels()
    this.addElements()
  }

  initZoomCamera () {
    this.camera.zoom = 0.95

    // this.scene.position.set(-200, 100, 0)

    this.camera.updateProjectionMatrix()
  }

  initCharacters () {
    this.phaeton = new Phaeton({
      engine: this.engine,
      scene : this.scene,
      debug: this.debug,
      position : {
        x : -900,
        y : -350,
        z : 80
      }
    })

    this.fragment = new Fragment({
      canvas: this.canvas,
      engine: this.engine,
      scene : this.scene,
      camera : this.camera,
      debug: this.debug,
      position : {
        x : -1100,
        y : -250,
        z : 60
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
        url: '/models/statue2/statueAssis.gltf',
        func: this.initStatue2.bind(this)
      },
      {
        url: '/models/porte/porte.gltf',
        func: this.initPorte.bind(this)
      },
      {
        url: '/models/temple/temple.gltf',
        func: this.initTemple.bind(this)
      },
      {
        url: '/models/brasier/brasier.gltf',
        func: this.initBrasier.bind(this)
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
        y: -700,
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
      render: false,
      position : {
        x: -1250,
        y: 300,
        z: 0
      },
      optionsBox: {
        label: 'BoxNone'
      }
    })

    const wallRight = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 400,
        y: 1000,
        z: 500
      },
      render: false,
      position: {
        x: 820,
        y: 600,
        z: 0
      },
      optionsBox: {
        label: 'BoxNone'
      }
    })

    this.wallDoor = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 400,
        y: 1200,
        z: 500
      },
      render: false,
      position: {
        x: 820,
        y: -200,
        z: 0
      },
      optionsBox: {
        label: 'BoxNone'
      }
    })

    const palier = new Box({
      engine: this.engine,
      scene: this.scene,
      render: false,
      size: {
        x: 600,
        y: 200,
        z: 100
      },
      position : {
        x: 600,
        y: -465,
        z: 0
      }
    })
    palier.box.vertices[0].x -= 300
    Matter.Body.setVertices(palier.box, palier.box.vertices);


    this.door = new Door({
      scene: this.scene,
      engine: this.engine,
      sceneManager: this.sceneManager,
      phaeton: this.phaeton,
      fragment: this.fragment,
      // render: this.debug ? true : false,
      render: false,
      position : {
        x : 600,
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

  async initStatue1 (gltf) {
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
    gltf.scale.set(55, 55, 55)
    gltf.children[0].position.z = -0.1
    gltf.children[0].position.y = 0.44

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
        x: 50,
        y: -400,
        z: -30,
      },
      size: {
        x: 100,
        y: 100,
        z: 100
      }
    })

    return this.newPromise()
  }

  async initStatue2 (gltf) {
    const texture = this.textureLoader.load('/models/statue2/textureAssis2.png')
    texture.flipY = false
    const normal = this.textureLoader.load('/models/statue2/normalAssis.png')
    normal.flipY = false

    const material = new THREE.MeshStandardMaterial({
      // color: 0x444444,
      map: texture,
      normalMap: normal,
      metalness: 0,
      roughness: 0.5,
    })

    gltf = gltf.scene
    gltf.scale.set(55, 55, 55)
    gltf.children[0].position.y = -0.95
    gltf.moreY = -Math.PI / 2

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
        x: -200,
        y: -400,
        z: -80,
      },
      size: {
        x: 100,
        y: 100,
        z: 100
      }
    })

    return this.newPromise()
  }

  async initPorte (gltf) {
    // Material armature
    const textureArmature = this.textureLoader.load('/models/porte/texturearmaturetest.png')
    textureArmature.flipY = false
    const normaleArmature = this.textureLoader.load('/models/porte/normalarmature.png')
    normaleArmature.flipY = false

    const materialArmature = new THREE.MeshStandardMaterial({
      map: textureArmature,
      normalMap: normaleArmature,
      metalness: 0,
      roughness: 0.5,
    })

    // Material armature
    const textureBois = this.textureLoader.load('/models/porte/textureporteboistest.png')
    textureBois.flipY = false
    const normaleBois = this.textureLoader.load('/models/porte/normalboisporte.png')
    normaleBois.flipY = false

    const material = new THREE.MeshStandardMaterial({
      map: textureBois,
      normalMap: normaleBois,
      metalness: 0,
      roughness: 0.5,
    })

    this.porte = gltf.scene
    this.porte.scale.set(300, 300, 300)

    this.porte.traverse( function(node) {
      if (node.name === 'armaturedroit' || node.name === 'armaturegauche') {
        node.material = materialArmature
        node.castShadow = true
        node.receiveShadow = true
      } else if(node.isMesh) {
        node.material = material
        node.castShadow = true
        node.receiveShadow = true
      }
    })

    this.groupDoorTemple.add(this.porte)

    const boisgauche = this.groupDoorTemple.getObjectByName("boisgauche")
    const boisdroit = this.groupDoorTemple.getObjectByName("boisdroit")
    const armaturegauche = this.groupDoorTemple.getObjectByName("armaturegauche")
    const armaturedroit = this.groupDoorTemple.getObjectByName("armaturedroit")

    // create portes
    this.porteGauche = new THREE.Group()
    this.porteDroit = new THREE.Group()
    this.porte.add(this.porteGauche)
    this.porte.add(this.porteDroit)

    this.porteGauche.position.copy(armaturegauche.position)
    this.porteDroit.position.copy(armaturedroit.position)

    boisgauche.position.set(0,0,0)
    boisdroit.position.set(0,0,0)
    armaturegauche.position.set(0,0,0)
    armaturedroit.position.set(0,0,0)

    //
    this.porteGauche.add(boisgauche)
    this.porteGauche.add(armaturegauche)
    this.porteDroit.add(boisdroit)
    this.porteDroit.add(armaturedroit)


    if (this.debugSceneFolder) {
      var obj = {
        openDoor: this.endEnigmeAnimation.bind(this)
      }

      this.debugSceneFolder.add(obj,'openDoor')
    }

    return this.newPromise()
  }

  async initTemple (gltf) {
    // texture
    const texture = this.textureLoader.load('/models/temple/TextureTemple.png')
    texture.flipY = false
    const normal = this.textureLoader.load('/models/temple/normaltemple.png')
    normal.flipY = false

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      normalMap: normal,
      metalness: 0,
      roughness: 0.5,
    })

    const textureSoleil = this.textureLoader.load('/models/temple/TextureSoleil.png')
    textureSoleil.flipY = false
    const normalSoleil = this.textureLoader.load('/models/temple/normalsoleil.png')
    normalSoleil.flipY = false

    const materialSoleil = new THREE.MeshStandardMaterial({
      map: textureSoleil,
      normalMap: normalSoleil,
      metalness: 0,
      roughness: 0.5,
      side: THREE.DoubleSide
    })

    this.temple = gltf.scene
    this.temple.scale.set(300, 300, 300)

    this.temple.traverse( (node) => {
      switch (node.name) {
        case 'soleil':
          node.material = materialSoleil
          node.castShadow = true
          node.receiveShadow = true
          break;

        case 'interieureporte':
          node.remove()
          break;

        case 'fenetre':
          node.material = new THREE.MeshStandardMaterial({
            metalness: 0,
            roughness: 0.5,
            emissive: new THREE.Color(0xb36f24),
            emissiveIntensity: 0.1
          })

          const lightFenetre = new THREE.PointLight(0xb36f24, 8, 100) // 0xb36f24
          lightFenetre.position.copy(node.position)
          lightFenetre.position.z = -0.6

          this.temple.add(lightFenetre)

          //
          // ANIMATION
          //
          const timeline1 = gsap.timeline({repeat: -1, repeatDelay: 0.1});
          timeline1
            .to(
              lightFenetre,
              {
                intensity: 12,
                duration: 0.7,
                ease: easeRough
              }
            )
            .to(
              lightFenetre,
              {
                intensity: 8,
                duration: 0.7,
                ease: easeRough
              }
            )
          break;
      
        default:
          node.material = material
          node.castShadow = true
          node.receiveShadow = true
          break;
      }
    })

    this.groupDoorTemple.add(this.temple)

    const light = new THREE.PointLight(0xb36f24, 3.5, 700)
    light.position.set(50,300,-100)
    light.castShadow = true

    this.groupDoorTemple.add(light)

    return this.newPromise(2500)
  }

  async initBrasier (gltf) {
    gltf = gltf.scene
    gltf.scale.set(300, 300, 300)
    gltf.getObjectByName('brasier').position.y = -0.170

    this.captor = new Captor ({
      scene: this.scene,
      engine: this.engine,
      fragment: this.fragment,
      position: {
        x: 950,
        y: 550,
        z: 50,
      },
      // render: this.debug ? true : false,
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
      gltf,
      position: {
        x: -450,
        y: -400,
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

    // point light
    const paramsLight = {
      color: 0xa26d32
    }
    this.lightBrasier = new THREE.PointLight(paramsLight.color, 4.5, 1900)
    this.lightBrasier.position.set(-450, -400, -45)
    this.scene.add( this.lightBrasier )

    if (this.debugSceneFolder) {
      const color = this.debugSceneFolder.addColor(paramsLight, "color").name('Light Color')
      color.onChange((value) => {
        this.lightBrasier.color = new THREE.Color(value)
      })

      this.debugSceneFolder.add(this.lightBrasier, "intensity", 0, 10).name('Light intensity')
      this.debugSceneFolder.add(this.lightBrasier, "distance", 1000, 2000).name('Light distance')
    }

    //
    // ANIMATION
    //
    const timeline = gsap.timeline({repeat: -1, repeatDelay: 0.1});
    timeline
      .to(
        this.lightBrasier,
        {
          intensity: 6, // 5 + 3
          duration: 0.7,
          ease: easeRough
        }
      )
      .to(
        this.lightBrasier,
        {
          intensity: 4.5,
          duration: 0.7,
          ease: easeRough
        }
      )

    return this.newPromise()
  }

  getStepStatues () {
    return this.statue1.activate && this.statue2.activate
  }

  endEnigmeAnimation () {
    this.endEnigme = true
    this.door.open()

    // animation door
    gsap.to(
      this.porteGauche.rotation,
      {
        y: Math.PI / 2.2,
        ease: "steps(12)",
        duration: 2
      }
    )
    gsap.to(
      this.porteDroit.rotation,
      {
        y: -Math.PI / 2.2,
        ease: "steps(12)",
        delay: 0.5,
        duration: 2
      }
    )

    //remove box
    this.wallDoor.destroyed()

    console.log('End enigme !!')
  }

  animationEndPhaeton () {
    this.phaeton.animation = true

    gsap.to(
      this.phaeton.mesh.position,
      {
        x: "+=350",
        z: -100,
        duration: 2.5,
        ease: "sin.inOut"
      }
    )
  }

  animationEndFragment () {
    this.fragment.animation = true

    gsap.to(
      this.fragment.mesh.position,
      {
        x: "+=350",
        z: -100,
        duration: 2.5,
        ease: "sin.inOut"
      }
    )
  }

  newPromise (time = 1000) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });
  }

  //
  // Destruct
  //
  async destruct () {
    if (this.debug) {
      this.debug.removeFolder('Scene params')
      this.debug.removeFolder('Phaeton')
      this.debug.removeFolder('Fragment')
    }
    
    const trans = await transition.fade()

    clearScene(this.scene)
    Matter.World.clear(this.world);

    return new Promise(resolve => {
      resolve('destructed');
    });
  }
}