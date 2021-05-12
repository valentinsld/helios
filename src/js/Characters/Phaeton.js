import * as THREE from 'three'
import Matter from 'matter-js'
import gsap from 'gsap'

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

const ANIMATIONS = {
  idle: 'idle',
  marche: 'marche_avant'
}

export default class Phaeton{
  constructor({engine, scene, debug, textureLoader, gltfLoader, position = POSITION, size = SIZE}) {
    this.world = engine.world
    this.scene = scene
    this.textureLoader = textureLoader
    this.gltfLoader = gltfLoader

    this.debug = debug
    this.position = position
    this.size = size

    this.animation = null
    this.speed = 9.5
    this.isTurnedTo = 'right'
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
        friction: 1,
        mass: 1000,
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
      '/models/Phaeton/anims/phaeton.gltf',
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
    this.mesh.scale.set(50, 50, 50)
    this.mesh.name = 'Phaeton'
    this.mesh.position.z = this.position.z
    this.mesh.rotation.y = Math.PI * 1.5

    this.mesh.castShadow = true
    this.mesh.receiveShadow = true

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
    Matter.Body.translate(this.box, Matter.Vector.create(-this.speed, 0))

    if (this.isTurnedTo === 'right') {
      gsap.to(
        this.mesh.rotation,
        {
          y: Math.PI * 0.5,
          duration: 0.8,
          ease: 'Power2.out'
        }
      )
    }

    this.isTurnedTo = 'left'
  }
  goToRight () {
    this.fadeToAction(ANIMATIONS.marche, 1)
    Matter.Body.translate(this.box, Matter.Vector.create(this.speed, 0))

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

    this.isTurnedTo = 'right'
  }

  keyup(event){
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
            this.moveTo(start, end)
          } else if(distEnd <= element.distanceInteraction) {
            this.moveTo(end, start)
          }
          
          break;
      
        default:
          element.interact()
          break;
      }
    })
  }
  
  moveTo(start, end) {
    this.animation = gsap.timeline()

    this.animation.to(
      this.mesh.position,
      {
        duration: 0.3,
        x: start.x,
      }
    )
    .to(
      this.mesh.position,
      {
        duration: 3,
        y: end.y + this.size.y / 2,
        onComplete: () => {
          // translation du bodie
          const newPos = Matter.Vector.create(
            start.x - this.box.position.x,
            end.y - start.y
          )
          Matter.Body.translate(this.box, newPos)

          this.animation = null
        }  
      }
    )
  }

  fadeToAction( name, duration ) {
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
    if (this.animation || !this.mesh) return
    this.mesh.position.x = this.box.position.x
    this.mesh.position.y = this.box.position.y - this.size.y / 2

    const dt = time - this.lastClock;

    if ( this.mixer ) this.mixer.update( dt );

    this.lastClock = time
  }
}
