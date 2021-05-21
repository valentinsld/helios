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


export default class Ladder{
  constructor({phaeton, engine, scene, size = SIZE, distanceInteraction = 150, position = POSITION}) {
    this.type = 'Ladder'
    
    this.phaeton = phaeton
    this.scene = scene
    this.engine = engine
    this.world = engine.world
    this.size = size
    this.distanceInteraction = distanceInteraction
    this.position = position

    this.addElementToWorld()
    this.addElementToScene()
    this.addElementToPhaeton()
    this.initStartEnd()
  }

  addElementToWorld() {
    // init element
    var collider = Matter.Bodies.rectangle(
      this.position.x,
      this.position.y + this.size.y/2 + 100,
      this.size.x,
      this.size.y + 50,
      {
        label: 'Ladder',
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
    Matter.Events.on(this.engine, 'collisionStart', function(event) {
      var pairs = event.pairs;
      
      for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        const conditionCollider = pair.bodyA === collider || pair.bodyB === collider
        const conditionPhaeton = pair.bodyA.label === 'Phaeton' || pair.bodyB.label === 'Phaeton'

        if (conditionCollider && conditionPhaeton) {
          console.log('enter')
        }
      }
    });

    Matter.Events.on(this.engine, 'collisionEnd', function(event) {
      var pairs = event.pairs;
      
      for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        const conditionCollider = pair.bodyA === collider || pair.bodyB === collider
        const conditionPhaeton = pair.bodyA.label === 'Phaeton' || pair.bodyB.label === 'Phaeton'

        if (conditionCollider && conditionPhaeton) {
          console.log('leave')
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
      color: 0x00ffff,
      metalness: 0.3,
      roughness: 0.4,
    })

    this.mesh = new THREE.Mesh(BOX, MATERIAL)
    this.mesh.receiveShadow = true

    this.mesh.position.x += this.position.x
    this.mesh.position.y += this.position.y + this.size.y / 2 + 100
    this.mesh.position.z += this.position.z

    this.scene.add(this.mesh)
  }

  addElementToPhaeton() {
    this.phaeton.addInteractionElements(this)
  }

  initStartEnd() {
    this.start = new THREE.Vector3(
      this.mesh.position.x,
      this.mesh.position.y - this.size.y / 2,
      this.mesh.position.z
    )

    this.end = new THREE.Vector3(
      this.mesh.position.x,
      this.mesh.position.y + this.size.y / 2,
      this.mesh.position.z
    )
  }
}