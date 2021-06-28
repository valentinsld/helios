import * as THREE from 'three'
import Matter from 'matter-js'
import gsap from 'gsap'

import AudioManager from '../utils/AudioManager'

const POSITION = {
  x: 0,
  y: 0,
  z: 0
}
const SIZE = {
  x: 100,
  y: 200,
  z: 10
}

const COLOR = '#008d02'
const SCALE = 50
const ANIMATIONS = {
  idle: 'iddle2',
  marche: 'course',
  echelle: 'echelle'
}

export default class Phaeton{
  constructor({engine, scene, debug, textureLoader, gltfLoader, position = POSITION, size = SIZE, scale = SCALE, speed = 10, sound = 'pas_temple'}) {
    this.world = engine.world
    this.scene = scene
    this.textureLoader = textureLoader
    this.gltfLoader = gltfLoader

    this.debug = debug
    this.position = position
    this.size = size
    this.scale = scale

    this.animation = null
    this.speed = speed
    this.runed = false
    this.isTurnedTo = 'right'
    this.sound = sound
    this.interactionElements = []

    this.addPhaetonToWorld()
    this.loadGltf()
    if(this.debug) this.addDebug()

    this.initEvents()
  }

  addPhaetonToWorld () {
    this.box = Matter.Bodies.rectangle(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y,
      {
        label: 'Phaeton',
        inertia: 'Infinity',
        frictionAir: 0.1,
        // chamfer: 10,
        friction: 0,
        mass: 0,
        collisionFilter: {
          category: 0x0004,
        },
        render: {
          fillStyle : COLOR
        }
      }
    );
    
    // Matter.Body.setDensity(this.box, 100)

    Matter.World.add(this.world, this.box);
  }

  loadGltf () {
    this.gltfLoader.load(
      '/models/Phaeton/phaeton.gltf',
      (gltf) =>
      {
        this.initPhaetonModel(gltf)
      },
      (progress) =>
      {
        // console.log('progress')
        // console.log(progress)
      },
      (error) =>
      {
        console.log('error')
        console.log(error)
        this.addPhaetonToScene()
      }
    )
  }

  initPhaetonModel (gltf) {
    this.mesh = gltf.scene
    this.mesh.scale.set(this.scale, this.scale, this.scale)
    this.mesh.name = 'Phaeton'
    this.mesh.position.z = this.position.z
    this.mesh.rotation.y = Math.PI * 1.5

    this.mesh.castShadow = true
    this.mesh.receiveShadow = true

    const texture = this.textureLoader.load('/models/Phaeton/texture_full.png')
    texture.flipY = false
    const normal = this.textureLoader.load('/models/Phaeton/normal_phaeton.png')
    normal.flipY = false

    const emissive = {
      intensity: 0.25,
      color: 0x25231e
    }

    this.mesh.traverse((node) => {
      if (node.isMesh) {
        const material = node.material

        material.map = texture
        material.normalMap = normal
        material.emissive = new THREE.Color(emissive.color)
        material.emissiveIntensity = emissive.intensity

        if (this.debugFolder) {
          this.debugFolder.add(material, 'emissiveIntensity', 0, 1).name('Emissive intensity')
          this.debugFolder.addColor(emissive, 'color',).name('Emissive color').onChange((value) => {
            material.emissive = new THREE.Color(value)
          })
        }
      }
    })

    this.scene.add(this.mesh)

    // animation
    this.mixer = new THREE.AnimationMixer( this.mesh )

    this.actions = {};

    for ( let i = 0; i < gltf.animations.length; i ++ ) {

      const clip = gltf.animations[ i ]
      const action = this.mixer.clipAction( clip )
      this.actions[ clip.name ] = action
    }

    this.activeAction = this.actions[ANIMATIONS.idle]
    this.activeAction.play()

    this.lastClock = 0
  }

  addPhaetonToScene () {
    const phaetonTexture = this.textureLoader.load('/textures/Phaeton.png')
    const phaetonAlpha = this.textureLoader.load('/textures/PhaetonAlpha.png')

    const BOX = new THREE.BoxBufferGeometry(
      this.size.x,
      this.size.y,
      this.size.z,
      32, 32
    )
    const MATERIAL = new THREE.MeshStandardMaterial({
      map: phaetonTexture,
      transparent: true,
      alphaMap: phaetonAlpha,
      // color: COLOR,
      metalness: 0.3,
      roughness: 0.4,
    })

    this.mesh = new THREE.Mesh(BOX, MATERIAL)
    // this.mesh.receiveShadow = true
    // this.mesh.castShadow = true
    this.mesh.position.z = this.position.z

    this.scene.add(this.mesh)
  }

  addDebug () {
    this.debugFolder = this.debug.addFolder('Phaeton')
    this.debugFolder.add(this, "speed", 0, 20)
  }

  addInteractionElements (element) {
    this.interactionElements.push(element)
    // console.log(this.interactionElements)
  }


  //
  // Events
  //
  initEvents () {
    window.addEventListener('keydown', this.keydown.bind(this))
    window.addEventListener('keyup', this.keyup.bind(this))
  }

  keydown (event){
    if (this.animation) return

    switch (event.code) {
      case "KeyA":
        this.goToLeft()
        break;
      case "ArrowLeft":
        this.goToLeft()
        break;
      
      case "KeyD":
        this.goToRight()
        break;
      case "ArrowRight":
        this.goToRight()
        break;

      default:
        break;
    }
  }

  goToLeft () {
    this.fadeToAction(ANIMATIONS.marche, 1)

    AudioManager.newSound({
      name: this.sound,
      volume: 0.5,
      loop: true
    })

    if (this.isTurnedTo === 'right') {
      gsap.to(
        this.mesh.rotation,
        {
          y: Math.PI * 2.5,
          duration: 0.8,
          ease: 'Power2.out'
        }
      )
    }

    if (!this.runed) this.runed = this.lastClock
    this.isTurnedTo = 'left'
  }
  goToRight () {
    this.fadeToAction(ANIMATIONS.marche, 1)

    AudioManager.newSound({
      name: this.sound,
      volume: 0.5,
      loop: true
    })

    if (this.isTurnedTo === 'left') {
      gsap.to(
        this.mesh.rotation,
        {
          y: Math.PI * 1.5,
          duration: 0.8,
          ease: 'Power2.out'
        }
      )
    }

    if (!this.runed) this.runed = this.lastClock
    this.isTurnedTo = 'right'
  }

  playWalk() {
    this.animation = true
    this.fadeToAction(ANIMATIONS.marche, 1)
  }

  keyup(event){
    AudioManager.stopSound(this.sound, 0.1)

    this.runed = false
    if (this.animation) return

    switch (event.code) {  
      case "Space":
        this.interactWithElements()
        break;  

      default:
        this.fadeToAction(ANIMATIONS.idle, 0.5);
        break;
    }
  }

  interactWithElements() {
    if (this.animation) return

    this.interactionElements.forEach((element) => {

      switch (element.type) {
        case 'Ladder':
          const start = element.start
          const end = element.end
          const distStart = this.mesh.position.distanceTo(start)
          const distEnd = this.mesh.position.distanceTo(end)
          
          // console.log('Start ', distStart, ' ; End ', distEnd)

          if (distStart <= element.distanceInteraction) {
            this.useLadder(start, end, true)
          } else if(distEnd <= element.distanceInteraction) {
            this.useLadder(end, start, false)
          }
          
          break;
      
        default:
          element.interact()
          break;
      }
    })
  }
  
  useLadder (start, end, upDown) {
    const THAT = this
    this.animation = gsap.timeline()

    this.fadeToAction(ANIMATIONS.echelle, 0.6)

    AudioManager.newSound({
      name: 'scene3_echelle',
      volume: 0.25,
      loop: true
    })

    this.animation.to(
      this.mesh.position,
      {
        duration: upDown ? 0.4 : 0.8,
        x: start.x,
        y: upDown ? "-=0" : "-=150"
      }
    )
    .to(
      this.mesh.rotation,
      {
        duration: 0.5,
        y: Math.PI * 2,
      },
      '<'
    )
    .to(
      this.mesh.position,
      {
        duration: 2,
        y: end.y,
        ease: 'linear',
        onUpdate: function (ev) {
          if (upDown && this.progress() > 0.88) {
            // console.log(this.progress())
            AudioManager.stopSound('scene3_echelle', 0.1)
            THAT.fadeToAction(ANIMATIONS.idle, 0.4)
          }
        },
        onComplete: () => {
          AudioManager.stopSound('scene3_echelle', 0.1)
          this.fadeToAction(ANIMATIONS.idle, 0.3)
        }
      }
    )
    .to(
      this.mesh.rotation,
      {
        duration: 0.3,
        y: Math.PI * 1.5,
        onComplete: () => {
          // translation du bodie
          const newPos = Matter.Vector.create(
            start.x - this.box.position.x,
            end.y - start.y
          )
          Matter.Body.translate(this.box, newPos)

          this.animation = null
          this.isTurnedTo = 'right'
        }  
      }
    )
  }

  fadeToAction (name, duration) {
    if (this.activeAction._clip.name === name) return

    this.previousAction = this.activeAction
    this.activeAction = this.actions[ name ];

    if ( this.previousAction !== this.activeAction ) {

      this.previousAction.fadeOut( duration )

    }

    this.activeAction
      .reset()
      .setEffectiveTimeScale( 1 )
      .setEffectiveWeight( 1 )
      .fadeIn( duration )
      .play()

  }

  update(time) {
    const dt = time - this.lastClock;
    if ( this.mixer ) this.mixer.update( dt );
    this.lastClock = time

    if (this.animation || !this.mesh) return
    if (this.runed) {
      let speed = this.isTurnedTo === 'right' ? this.speed : -this.speed
      speed = speed * Math.min(time - this.runed, 1)
      Matter.Body.translate(this.box, Matter.Vector.create(speed, 0))
    }

    this.mesh.position.x = this.box.position.x
    this.mesh.position.y = this.box.position.y - this.size.y / 2
  }
}
