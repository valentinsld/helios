import * as THREE from 'three'
import Matter from 'matter-js'

const POSITION = {
  x: 0,
  y: 0,
  z: 0
}

const SIZE = {
  x: 150,
  y: 300,
  z: 0
}

const COLOR = '#ff00ff'

export default class Door{
  constructor({phaeton, fragment, engine, sceneManager, scene, render = false, size = SIZE, position = POSITION, open = false, animationEndPhaeton, animationEndFragment}) {
    this.type = 'Door'
    
    this.scene = scene
    this.engine = engine
    this.world = engine.world
    this.sceneManager = sceneManager
    // console.log(this.sceneManager)

    this.opened = open
    this.phaeton = phaeton
    this.fragment = fragment
    this.animationEndFragment = animationEndFragment
    this.animationEndPhaeton = animationEndPhaeton

    this.size = size
    this.position = position

    this.entered = {
      phaeton: false,
      fragment: false
    }

    this.addElementToWorld()
    if (render) this.addElementToScene()
  }

  addElementToWorld() {
    // init element
    this.collider = Matter.Bodies.rectangle(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y,
      {
        label: 'Door',
        isSensor: true,
        isStatic: true,
        render: {
          strokeStyle: COLOR,
          fillStyle: 'transparent',
          lineWidth: 2
        }
      }
    );

    Matter.World.add(this.world, this.collider)

    // init events
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      if (!this.opened) return

      var pairs = event.pairs;

      for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        const conditionCollider = pair.bodyA === this.collider || pair.bodyB === this.collider
        const conditionPhaeton = pair.bodyA.label === 'Phaeton' || pair.bodyB.label === 'Phaeton'
        const conditionFragment = pair.bodyA.label === 'Fragment' || pair.bodyB.label === 'Fragment'

        if (conditionCollider && conditionPhaeton) {
          this.animationEndPhaeton.call(true)
          this.entered.phaeton = true

          if (this.entered.fragment) {
            this.sceneManager.next()
          } else {
            setTimeout(() => {
              if (!this.entered.fragment) {
                this.sceneManager.next()
              }
            }, 5000);
          }
        } else if (conditionCollider && conditionFragment) {
          this.animationEndFragment.call(true)
          this.entered.fragment = true
          
          if (this.entered.phaeton) {
            this.sceneManager.next()
          } else {
            setTimeout(() => {
              if (!this.entered.phaeton) {
                this.sceneManager.next()
              }
            }, 5000);
          }
        }

      }
    });
  }

  addElementToScene() {
    const BOX = new THREE.BoxBufferGeometry(
      this.size.x,
      this.size.y,
      this.size.z,
      32, 32
    )
   

    const MATERIAL = new THREE.MeshStandardMaterial({
      color: COLOR,
      metalness: 0.3,
      roughness: 0.4,
    })

    this.mesh = new THREE.Mesh(BOX, MATERIAL)
    this.mesh.receiveShadow = true

    this.mesh.position.x += this.position.x
    this.mesh.position.y += this.position.y
    this.mesh.position.z += this.position.z

    this.scene.add(this.mesh)
  }

  open () {
    this.opened = true
    if (this.mesh) this.mesh.material.color = new THREE.Color(0x00ffff)

    var Bounds = Matter.Bounds;
    const newBounds = this.collider.bounds

    for(var j = 0; j < this.world.bodies.length; j++) {
      const bodie = this.world.bodies[j]
      const boundsA = Bounds.create(bodie.vertices)
      const ifCollide = Bounds.overlaps(boundsA, newBounds)
      if (!ifCollide) return

      if (bodie.label === "Phaeton") {
        this.animationEndPhaeton.call(true)
        this.entered.phaeton = true

        if (this.entered.fragment) {
          this.sceneManager.next()
        } else {
          setTimeout(() => {
            if (!this.entered.fragment) {
              this.sceneManager.next()
            }
          }, 5000);
        }
      } else if (bodie.label === "Fragment") {
        this.animationEndFragment.call(true)
        this.entered.fragment = true
        
        if (this.entered.phaeton) {
          this.sceneManager.next()
        } else {
          setTimeout(() => {
            if (!this.entered.phaeton) {
              this.sceneManager.next()
            }
          }, 5000);
        }
      }
    }

  }

  close () {
    this.opened = false
    if (this.mesh) this.mesh.material.color = new THREE.Color(COLOR)
  }
}