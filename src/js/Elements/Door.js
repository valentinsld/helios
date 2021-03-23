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
  constructor({phaeton, fragment, engine, sceneManager, scene, size = SIZE, distanceInteraction = 150, position = POSITION}) {
    this.type = 'Door'
    
    this.scene = scene
    this.engine = engine
    this.world = engine.world
    this.sceneManager = sceneManager
    console.log(this.sceneManager)

    this.phaeton = phaeton
    this.fragment = fragment

    this.size = size
    this.distanceInteraction = distanceInteraction
    this.position = position

    this.canUse = {
      phaeton: false,
      fragment: false
    }

    this.addElementToWorld()
    this.addElementToScene()

    this.addElementToPhaeton()
  }

  addElementToWorld() {
    // init element
    var collider = Matter.Bodies.rectangle(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y,
      {
        isSensor: true,
        isStatic: true,
        render: {
          strokeStyle: COLOR,
          fillStyle: 'transparent',
          lineWidth: 2
        }
      }
    );

    Matter.World.add(this.world, collider)

    // init events
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      var pairs = event.pairs;

      for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        const conditionCollider = pair.bodyA === collider || pair.bodyB === collider
        const conditionPhaeton = pair.bodyA.label === 'Phaeton' || pair.bodyB.label === 'Phaeton'
        const conditionFragment = pair.bodyA.label === 'Fragment' || pair.bodyB.label === 'Fragment'

        if (conditionCollider && conditionPhaeton) {
          this.canUse.phaeton = true
        } else if (conditionCollider && conditionFragment) {
          this.canUse.fragment = true
        }

      }
    });

    Matter.Events.on(this.engine, 'collisionEnd', (event) => {
      var pairs = event.pairs;

      for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        const conditionCollider = pair.bodyA === collider || pair.bodyB === collider
        const conditionPhaeton = pair.bodyA.label === 'Phaeton' || pair.bodyB.label === 'Phaeton'
        const conditionFragment = pair.bodyA.label === 'Fragment' || pair.bodyB.label === 'Fragment'

        if (conditionCollider && conditionPhaeton) {
          this.canUse.phaeton = false
        } else if (conditionCollider && conditionFragment) {
          this.canUse.fragment = false
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

  addElementToPhaeton() {
    this.phaeton.addInteractionElements(this)
  }

  interact() {
    if (!this.canUse.phaeton || !this.canUse.fragment) return

    this.sceneManager.next()
  }
}