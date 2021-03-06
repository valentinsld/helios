import * as THREE from 'three'
import Matter from 'matter-js'

const POSITION = {
  x: 0,
  y: 0,
  z: 0
}
const SIZE = {
  x: 100,
  y: 100,
  z: 100
}

export default class Lever {
  constructor ({scene, engine, phaeton, position = POSITION, size = SIZE, optionsBox = {}}) {
    this.type = 'Lever'
    this.scene = scene
    this.engine = engine
    this.world = engine.world
    this.phaeton = phaeton

    this.position = position
    this.size = size
    this.optionsBox = optionsBox
    
    this.canInteract = false
    this.activate = false

    this.addColisionToWorld()
    this.addBoxToScene()
    this.addElementToPhaeton()
  }

  
  addColisionToWorld() {
    // init element
    var collider = Matter.Bodies.rectangle(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y,
      {
        label: 'Lever',
        isSensor: true,
        isStatic: true,
        render: {
          strokeStyle: '#ff0000',
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

        if (conditionCollider && conditionPhaeton) {
          this.canInteract = true
        }
      }
    });

    Matter.Events.on(this.engine, 'collisionEnd', (event) => {
      var pairs = event.pairs;
      
      for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        const conditionCollider = pair.bodyA === collider || pair.bodyB === collider
        const conditionPhaeton = pair.bodyA.label === 'Phaeton' || pair.bodyB.label === 'Phaeton'

        if (conditionCollider && conditionPhaeton) {
          this.canInteract = false
        }
      }
    });
  }

  addBoxToScene() {
    const BOX = new THREE.BoxBufferGeometry(
      this.size.x,
      this.size.y,
      this.size.z,
      32, 32
    )
    const MATERIAL = new THREE.MeshStandardMaterial({
      color: '#0000ff',
      metalness: 0.3,
      roughness: 0.4,
    })

    this.mesh = new THREE.Mesh(BOX, MATERIAL)
    this.mesh.position.copy(this.position)
    
    this.scene.add(this.mesh)
  }

  addElementToPhaeton() {
    this.phaeton.addInteractionElements(this)
  }

  interact() {
    if (!this.canInteract) return
    this.activate = !this.activate

    if (this.activate){
      this.mesh.material.color = new THREE.Color("#ff0000")
    } else {
      this.mesh.material.color = new THREE.Color("#0000ff")
    }
  }

}