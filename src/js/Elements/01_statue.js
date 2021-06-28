import * as THREE from 'three'
import Matter from 'matter-js'
import gsap from 'gsap'

import MenuContextuels from '../utils/MenuContextuels'
import AudioManager from '../utils/AudioManager'

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

export default class Statue {
  constructor ({scene, engine, phaeton, gltf = null, initStep, position = POSITION, size = SIZE}) {
    this.type = 'Statue'
    this.scene = scene
    this.engine = engine
    this.world = engine.world
    this.phaeton = phaeton

    this.gltf = gltf
    this.position = position
    this.size = size
    
    this.canInteract = false
    this.step = initStep || Math.floor(Math.random() * 4)
    this.activate = this.step % 4 === 0

    this.addColisionToWorld()
    if (this.gltf) {
      this.addGltf(this.gltf)
    } else {
      this.addBoxToScene()
    }
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

          MenuContextuels.addMenu({
            id: 'Statues',
            text: `Intéragissez avec <br><span>Espace</span> pour tourner <br>la statue `,
            position: new THREE.Vector3(-320, -150, 0)
          })
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

          MenuContextuels.removeMenu('Statues')
        }
      }
    });
  }

  addGltf (gltf) {
    this.mesh = gltf

    const moreY = this.mesh.moreY || 0
    this.mesh.rotation.y = this.step * Math.PI / 2 + moreY
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
  }

  addElementToPhaeton() {
    this.phaeton.addInteractionElements(this)
  }

  interact() {
    if (!this.canInteract) return

    MenuContextuels.removeMenu('Statues')
    AudioManager.newSound({
      name: 'scene1_statue',
      volume: 0.5
    })
    
    // console.log(this.step, this.step % 4 === 0)
    // this.mesh.rotation.y = this.step * Math.PI / 2
    const moreY = this.mesh.moreY || 0
    this.step += 1

    gsap.to(
      this.mesh.rotation,
      {
        y: this.step * Math.PI / 2 + moreY,
        ease: "steps(6)", //'Power2.out'
        duration: 0.5,
        onComplete: () => {
          if (this.step % 4 === 0) {
            this.activate = true
            // if (!this.gltf) this.mesh.material.color = new THREE.Color("#ff0000")
          } else {
            this.activate = false
            // if (!this.gltf) this.mesh.material.color = new THREE.Color("#0000ff")
          }
          // console.log(this.activate)
        }
      }
    )
  }

}