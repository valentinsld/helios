import * as THREE from 'three'
import * as Matter from 'matter-js'
import gsap from 'gsap'

import Phaeton from '../Characters/Phaeton'
import Fragment from '../Characters/Fragment'

import Box from '../Elements/Box'
import Fire from '../Elements/Fire'
import Captor from '../Elements/Captor'
import Door from '../Elements/Door'

import LoaderModelsManager from '../LoaderModelsManager'

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
    this.groupDoorTemple.position.set(1100, -570, -180)
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
    this.camera.zoom = 0.65
    this.camera.updateProjectionMatrix()
  }

  initCharacters () {
    this.phaeton = new Phaeton({
      engine: this.engine,
      scene : this.scene,
      debug: this.debug,
      position : {
        x : -1300,
        y : -350,
        z : 200
      }
    })

    this.fragment = new Fragment({
      canvas: this.canvas,
      engine: this.engine,
      scene : this.scene,
      camera : this.camera,
      debug: this.debug,
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
      },
      {
        url: '/models/porte/porte.gltf',
        func: this.initPorte.bind(this)
      },
      {
        url: '/models/temple/temple.gltf',
        func: this.initTemple.bind(this)
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
      render: false,
      position : {
        x: -1650,
        y: 200,
        z: 0
      },
      optionsBox: {
        label: 'BoxNone'
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
      render: false,
      position: {
        x: 1150,
        y: 200,
        z: 0
      },
      optionsBox: {
        label: 'BoxNone'
      }
    })

    const escalier = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 150,
        y: 400,
        z: 500
      },
      position : {
        x: 500,
        y: -590,
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
        x: 1050,
        y: -650,
        z: 0
      }
    })


    this.captor = new Captor ({
      scene: this.scene,
      engine: this.engine,
      fragment: this.fragment,
      position: {
        x: 850,
        y: 240,
        z: 50,
      },
      render: this.debug ? true : false,
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
      // render: this.debug ? true : false,
      render: false,
      position : {
        x : 900,
        y : -150,
        z : 250
      },
      size: {
        x: 200,
        y: 400,
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

    this.statue1 = new Statue ({
      scene: this.scene,
      engine: this.engine,
      phaeton: this.phaeton,
      gltf,
      position: {
        x: 200,
        y: -500,
        z: -80,
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

    this.statue2 = new Statue ({
      scene: this.scene,
      engine: this.engine,
      phaeton: this.phaeton,
      gltf,
      position: {
        x: -100,
        y: -500,
        z: -80,
      },
      size: {
        x: 100,
        y: 100,
        z: 100
      }
    })
  }

  initPorte (gltf) {
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

    console.log(this.porteGauche)
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
  }

  initTemple (gltf) {
    // texture
    const texture = this.textureLoader.load('/models/temple/TextureTemple2.png')
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
    })

    this.temple = gltf.scene
    this.temple.scale.set(300, 300, 300)

    this.temple.traverse( function(node) {
      if (node.name === 'soleil') {
        node.material = materialSoleil
        node.receiveShadow = true
      } else if (node.isMesh) {
        node.material = material
        node.castShadow = true
        node.receiveShadow = true
      }
    })

    this.groupDoorTemple.add(this.temple)
  }


  getStepStatues () {
    return this.statue1.activate && this.statue2.activate
  }

  endEnigmeAnimation () {
    this.endEnigme = true
    this.door.open()

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