import * as THREE from 'three'
import Matter from 'matter-js'
import gsap from 'gsap'

import AudioManager from '../utils/AudioManager'

const INIT = {
  position: {
    x: 0,
    y: 0,
    z: 0
  },
  size: {
    x: 100,
    y: 100,
    z: 100
  },
}

// copy from Lever
export default class Plaque {
  constructor ({scene, engine, box = INIT, gltf, plaque = INIT, func, funcParam, optionsBox = {}}) {
    this.type = 'Plaque'
    this.scene = scene
    this.engine = engine
    this.world = engine.world

    this.box = box
    this.optionsBox = optionsBox
    this.plaque = plaque

    this.func = func
    this.funcParam = funcParam

    this.animation = null
    
    this.addColisionToWorld()
    if (gltf) {
      this.initPlaqueGltf(gltf)
    } else {
      this.addBoxToScene()
    }
  }

  
  addColisionToWorld() {
    // init element
    var collider = Matter.Bodies.rectangle(
      this.box.position.x,
      this.box.position.y,
      this.box.size.x,
      this.box.size.y,
      {
        label: 'Plaque',
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
          this.startInteract()
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
          this.endInteract()
        }
      }
    });
  }

  addBoxToScene() {
    const BOX = new THREE.BoxBufferGeometry(
      this.plaque.size.x,
      this.plaque.size.y,
      this.plaque.size.z,
      32, 32
    )
    BOX.translate( 0, this.plaque.size.y / 2, 0 );

    const MATERIAL = new THREE.MeshStandardMaterial({
      color: '#0000ff',
      metalness: 0.3,
      roughness: 0.4,
    })

    this.mesh = new THREE.Mesh(BOX, MATERIAL)
    this.mesh.position.copy(this.plaque.position)
    
    this.scene.add(this.mesh)
  }

  initPlaqueGltf (gltf) {
    this.mesh = gltf
    // this.mesh.position.copy(this.plaque.position)
  }

  startInteract () {
    this.animation?.kill()
    gsap.to(
      this.mesh.scale,
      {
        y: 0.3,
        duration: 0.3
      }
    )

    AudioManager.newSound({
      name: 'plaque'
    })

    this.func.call(null, this.funcParam)
  }

  endInteract () {
    this.animation?.kill()

    AudioManager.newSound({
      name: 'plaqueOut'
    })

    gsap.to(
      this.mesh.scale,
      {
        y: 1
      }
    )
  }

}