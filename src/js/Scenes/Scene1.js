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
import Transition from '../utils/transition'

import Statue from '../Elements/01_statue'
import AnimatedFire from '../Elements/animatedFire'

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
    // globalScene.fog = new THREE.Fog(globalScene.background, 950, 1200)

    this.groupDoorTemple = new THREE.Group()
    this.groupDoorTemple.position.set(640, -450, -180)
    this.groupDoorTemple.rotateY(Math.PI * 3/4)
    this.scene.add(this.groupDoorTemple)

    this.groupeBrasier = new THREE.Group()
    this.groupeBrasier.scale.set(300, 300, 300)
    this.groupeBrasier.rotation.y = 2.25
    this.groupeBrasier.position.set(680, -455, -135)

    this.scene.add(this.groupeBrasier)

    
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
        url: '/models/statues_brasier/statues_brasier.gltf',
        func: this.initStatuesBrasier.bind(this)
      },
      {
        url: '/models/porte/porte.gltf',
        func: this.initPorte.bind(this)
      },
      {
        url: '/models/temple/temple_soleil.gltf',
        func: this.initTemple.bind(this)
      },
      {
        url: '/models/feu/feu.gltf',
        func: this.initFeu.bind(this)
      },
      {
        url: '/models/cailloux_arbre/cailloux_arbre.gltf',
        func: this.initarbres.bind(this)
      }
    ]

    new LoaderModelsManager({
      arrayModels,
      gltfLoader: this.gltfLoader,
      // endFunction: this.endLoadingModels.bind(this)
    })
  }

  addElements () {
    const floor = new Box({
      engine: this.engine,
      scene: this.scene,
      color: 0x000000,
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
        x: 660,
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
        x: 660,
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
        y: 210,
        z: 100
      },
      position : {
        x: 440,
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
        x : 440,
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

    // first plan
    const paln = this.textureLoader.load('/models/premier_plan.png')
    // paln.flipY = false
    const textureFirstPlan = new THREE.MeshStandardMaterial({
      color: 0x000000,
      transparent: true,
      alphaMap: paln
    })

    const ww = (this.game.camera.right - this.game.camera.left) / this.game.camera.zoom
    const plane = new THREE.PlaneBufferGeometry(
      ww,
      ww * 0.12, // 231/1920
      1,
      1
    )

    const planeMesh = new THREE.Mesh(plane, textureFirstPlan)
    planeMesh.position.set(0, -330, 150)

    this.scene.add(planeMesh)
  }

  async initStatuesBrasier (gltf) {

    let brasier = null
    let statue1 = new THREE.Group()
    let statue2 = new THREE.Group()
    this.groupeBrasier.add(statue1)
    this.groupeBrasier.add(statue2)

    const children = [...gltf.scene.children]
    for (const node of children) {
      if (node.name === 'statue_debout') {
        node.position.y = 0.021
        node.position.z = -2.121

        statue1.add(node)
        statue1.position.copy(node.position)
        node.position.set(0,0,0)
      } else if (node.name === 'statue_assis') {
        node.position.y = 0.257
        node.position.z = -2.725

        statue2.add(node)
        statue2.position.copy(node.position)
        node.position.set(0,0,0)
      } else if (node.name === 'brasier') {
        brasier = node
        this.groupeBrasier.add(brasier)
      }
    }
    
    await this.initBrasier(brasier)
    await this.initStatue1(statue1)
    await this.initStatue2(statue2)

    return this.newPromise()
  }

  async initStatue1 (gltf) {
    const texture = this.textureLoader.load('/models/statues_brasier/texture_debout_anamorphose.png')
    texture.flipY = false
    const normal = this.textureLoader.load('/models/statues_brasier/normal_debout_anamorphose.png')
    normal.flipY = false

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      normalMap: normal,
      metalness: 0,
      roughness: 0.5,
    })

    gltf.traverse( function(node) {
      if (node.isMesh) {
        node.material = material
        node.castShadow = true
      }
    })

    this.statue1 = new Statue ({
      scene: this.scene,
      engine: this.engine,
      phaeton: this.phaeton,
      gltf,
      initStep: 1,
      position: {
        x: -80,
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
    const texture = this.textureLoader.load('/models/statues_brasier/texture_assis_anamorphose.png')
    texture.flipY = false
    const normal = this.textureLoader.load('/models/statues_brasier/normal_assis_anamorphose.png')
    normal.flipY = false

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      normalMap: normal,
      metalness: 0,
      roughness: 0.5,
    })

    gltf.traverse( function(node) {
      if (node.isMesh) {
        node.material = material
        node.castShadow = true
      }
    })

    this.statue2 = new Statue ({
      scene: this.scene,
      engine: this.engine,
      phaeton: this.phaeton,
      gltf,
      initStep: 1,
      position: {
        x: -320,
        y: -400,
        z: -80,
      },
      size: {
        x: 160,
        y: 100,
        z: 100
      }
    })

    return this.newPromise()
  }

  async initPorte (gltf) {
    // console.log(gltf)

    // Material armature
    const texture = this.textureLoader.load('/models/porte/texture_porte.png')
    texture.flipY = false
    const normale = this.textureLoader.load('/models/porte/normal_porte.png')
    normale.flipY = false

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      normalMap: normale,
      metalness: 0,
      roughness: 0.5,
    })

    this.porte = gltf.scene
    this.porte.scale.set(300, 300, 300)

    this.porte.traverse( (node) => {
      if(node.isMesh) {
        node.material = material
        node.receiveShadow = true
      }
    })

    this.groupDoorTemple.add(this.porte)

    const boisgauche = this.groupDoorTemple.getObjectByName("batant_g")
    const boisdroit = this.groupDoorTemple.getObjectByName("batant_d")
    const armaturegauche = this.groupDoorTemple.getObjectByName("armature_g")
    const armaturedroit = this.groupDoorTemple.getObjectByName("armature_d")

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
    const texture = this.textureLoader.load('/models/temple/Texture_Temple.png')
    texture.flipY = false
    const normal = this.textureLoader.load('/models/temple/normal_Temple.png')
    normal.flipY = false

    let material = new THREE.MeshStandardMaterial({
      map: texture,
      normalMap: normal,
      emissive: 0xffffff,
      emissiveMap: texture,
      emissiveIntensity: 0.14,
      metalness: 0,
      roughness: 0.75,
    })

    const textureSoleil = this.textureLoader.load('/models/temple/Texture_Soleil2.png')
    textureSoleil.flipY = false
    const normalSoleil = this.textureLoader.load('/models/temple/Normal_Soleil.png')
    normalSoleil.flipY = false

    this.materialSoleil = new THREE.MeshStandardMaterial({
      map: textureSoleil,
      normalMap: normalSoleil,
      emissive: 0xebaf5b,
      emissiveMap: textureSoleil,
      emissiveIntensity: 0.25,
      metalness: 0,
      roughness: 0.5
    })

    this.temple = gltf.scene
    this.temple.scale.set(300, 300, 300)

    let emissive = {
      intensity: 0.5,
      color: 0xffffff
    }
    this.debugSceneFolder?.add(emissive, 'intensity', -1, 2).name('Emissive temple').onChange((value) => {
      material.emissiveIntensity = value
      this.materialSoleil.emissiveIntensity = value
    })
    this.debugSceneFolder?.addColor(emissive, 'color',).name('Emissive color').onChange((value) => {
      material.emissive = new THREE.Color(value)
      this.materialSoleil.emissive = new THREE.Color(value)
    })

    this.temple.traverse( (node) => {
      switch (node.name) {
        case 'soleil002':
          node.material = this.materialSoleil
          node.receiveShadow = true
          break;

        case 'interieure_porte':
          node.remove()
          node.geometry.dispose()
          node.material.dispose()
          break;

        case 'fenetre':
          node.material = new THREE.MeshStandardMaterial({
            metalness: 0,
            roughness: 0.5,
            emissive: new THREE.Color(0xf2b24b),
            emissiveIntensity: 0.8
          })

          const lightFenetre = new THREE.PointLight(0xb36f24, 8, 70) // 0xb36f24
          lightFenetre.position.copy(node.position)
          lightFenetre.position.z = -0.6
          lightFenetre.position.x = -1.388

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
          // node.castShadow = true
          node.receiveShadow = true
          break;
      }
    })

    this.groupDoorTemple.add(this.temple)

    const light = new THREE.PointLight(0xb36f24, 3.5, 500)
    light.position.set(50,300,-100)
    // light.castShadow = true

    this.groupDoorTemple.add(light)

    return this.newPromise(2500)
  }

  async initBrasier (gltf) {
    const texture = this.textureLoader.load('/models/statues_brasier/texture_brasier.png')
    texture.flipY = false
    const normal = this.textureLoader.load('/models/statues_brasier/normal_brasier.png')
    normal.flipY = false

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      normalMap: normal,
      metalness: 0,
      roughness: 0.5,
    })

    gltf.traverse( function(node) {
      if (node.isMesh) {
        node.material = material
      }
    })

    this.captor = new Captor ({
      scene: this.scene,
      engine: this.engine,
      fragment: this.fragment,
      position: {
        x: 450,
        y: 350,
        z: -50,
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
      game: this.game,
      scene: this.scene,
      engine: this.engine,
      render: this.render,
      fragment: this.fragment,
      debug: this.debug,
      gltf,
      position: {
        x: -630,
        y: -400,
        z: -29,
      },
      size: {
        x: 100,
        y: 100,
        z: 10
      },
      captor: this.captor,
      angleCone: Math.PI * 0.01
    })

    this.initLightBrasier()

    return this.newPromise()
  }

  async initFeu (gltf) {
    this.fireAnimated = new AnimatedFire({
      game: this.game,
      scene: this.scene,
      debug: this.debug,
      gltf,
      position: {
        x: -620,
        y: -420,
        z: -80
      },
      parameters: {
        scale: 70,
        height: 380,
        radius: 10,
        timeScaleY: 365,
        windX: 100,
        largeur: 20
      }
    })

    return this.newPromise()
  }

  initLightBrasier () {
    // point light
    const paramsLight = {
      color: 0xa26d32
    }
    this.lightBrasier = new THREE.PointLight(paramsLight.color, 4.5, 1900)
    this.lightBrasier.position.copy(this.fire.position)
    
    this.lightBrasier.castShadow = true
    this.lightBrasier.shadow.camera.far = 1800
    this.lightBrasier.shadow.camera.near = 200
    this.lightBrasier.shadow.radius = 4
    this.lightBrasier.shadow.mapSize.width = 512
    this.lightBrasier.shadow.mapSize.height = 512

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
          intensity: 5.5, 
          duration: 0.2,
          ease: easeRough
        }
      )
      .to(
        this.lightBrasier,
        {
          intensity: 4.5,
          duration: 0.15,
          ease: easeRough
        }
      )
      .to(
        this.lightBrasier,
        {
          intensity: 5,
          duration: 0.2,
          ease: easeRough
        }
      )
      .to(
        this.lightBrasier,
        {
          intensity: 4,
          duration: 0.15,
          ease: easeRough
        }
      )
  }

  async initarbres (gltf) {
    const textureArbre = this.textureLoader.load('/models/cailloux_arbre/arbre.png')
    textureArbre.flipY = false
    const normalArbre = this.textureLoader.load('/models/cailloux_arbre/normal_arbre.png')
    normalArbre.flipY = false

    const materialArbre = new THREE.MeshStandardMaterial({
      map: textureArbre,
      normalMap: normalArbre,
      metalness: 0,
      roughness: 0.5,
    })

    const textureCailloux = this.textureLoader.load('/models/cailloux_arbre/cailloux.png')
    textureCailloux.flipY = false
    const normalCailloux = this.textureLoader.load('/models/cailloux_arbre/normal_cailloux.png')
    normalCailloux.flipY = false

    const materialCailloux = new THREE.MeshStandardMaterial({
      map: textureCailloux,
      normalMap: normalCailloux,
      metalness: 0,
      roughness: 0.5,
    })


    this.arbreCailloux = gltf.scene
    this.arbreCailloux.scale.set(300, 300, 300)
    this.arbreCailloux.rotation.y = Math.PI * 0.69
    this.arbreCailloux.position.set(675, -455, -60)
    
    this.arbreCailloux.traverse( function(node) {
      if (node.name === 'arbre') {
        node.material = materialArbre
      } else if (node.name === 'cailloux') {
        node.material = materialCailloux
      }
    })

    this.scene.add(this.arbreCailloux)

    return this.newPromise()
  }

  getStepStatues () {
    return this.statue1.activate && this.statue2.activate
  }

  endEnigmeAnimation () {
    this.endEnigme = true
    this.door.open()

    // animation door
    const initEmmisive = this.materialSoleil.emissiveIntensity
    const timeline = gsap.timeline()
    timeline
      .to (
        this.materialSoleil,
        {
          emissiveIntensity: 3,
          ease: "steps(14)",
          duration: 1.2
        }
      )
      .to (
        this.materialSoleil,
        {
          emissiveIntensity: initEmmisive + 0.5,
          ease: "steps(5)",
          duration: 0.5
        }
      )
      .to(
        this.porteGauche.rotation,
        {
          // y: -Math.PI / 1.25,
          y: Math.PI / 2.2,
          ease: "steps(12)",
          duration: 2,
          delay: 0.5
        }
      )
      .to(
        this.porteDroit.rotation,
        {
          // y: Math.PI / 1.25,
          y: -Math.PI / 2.2,
          ease: "steps(12)",
          delay: 0.5,
          duration: 2
        },
        "-=1.6"
      )

    //remove box
    this.wallDoor.destroyed()

    // console.log('End enigme !!')
  }

  animationEndPhaeton () {
    this.phaeton.playWalk()

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
      this.debug.removeFolder('Fire')
    }
    
    const trans = await Transition.fadeIn(0)

    clearScene(this.scene)
    Matter.World.clear(this.world);
    this.scene.parent.fog = null

    return new Promise(resolve => {
      resolve('destructed');
    });
  }
}