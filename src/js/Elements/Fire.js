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

const SENSOR_LIGHT = {
  width: 1000,
  height: 60
}

const COLOR = '#ffff00'

export default class Fire {
  constructor ({fragment, engine, debug, scene, captor, distanceInteraction = 150, position = POSITION, size = SIZE, optionsBox = {}}) {
    this.type = 'Fire'
    this.scene = scene
    this.fragment = fragment
    this.engine = engine
    this.world = engine.world
    this.debug = debug
    
    this.captor = captor
    this.position = position
    this.size = size
    this.distanceInteraction = distanceInteraction
    this.optionsBox = optionsBox

    this.activate = false

    this.createSensor()
    this.createSensorLight()

    this.addBoxToScene()
    this.createLight()

    this.addElementToFragment()
  }

  createSensor() {
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
    Matter.Events.on(this.engine, 'collisionStart', function(event) {
      var pairs = event.pairs;
      
      for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        const conditionCollider = pair.bodyA === collider || pair.bodyB === collider
        const conditionFragment = pair.bodyA.label === 'Fragment' || pair.bodyB.label === 'Fragment'

        if (conditionCollider && conditionFragment) {
          console.log('enter')
        }
      }
    });

    Matter.Events.on(this.engine, 'collisionEnd', function(event) {
      var pairs = event.pairs;
      
      for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        const conditionCollider = pair.bodyA === collider || pair.bodyB === collider
        const conditionFragment = pair.bodyA.label === 'Fragment' || pair.bodyB.label === 'Fragment'

        if (conditionCollider && conditionFragment) {
          console.log('leave')
        }
      }
    });
  }

  createSensorLight() {
    this.sensorLight = Matter.Bodies.rectangle(
      this.position.x + SENSOR_LIGHT.width/2,
      this.position.y,
      SENSOR_LIGHT.width,
      SENSOR_LIGHT.height,
      {
        isSensor: true,
        isStatic: true,
        collisionFilter: {
          mask: 0x0008
        },
        render: {
          showPositions: true,
          strokeStyle: COLOR,
          fillStyle: 'transparent',
          lineWidth: 2,
        }
      }
    );

    Matter.World.add(this.world, this.sensorLight)

    Matter.Body.setCentre(this.sensorLight, Matter.Vector.create(-SENSOR_LIGHT.width/2,0), true)
    Matter.Body.setAngle(this.sensorLight, Math.PI)

    // init events
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      if (this.activate) return

      var pairs = event.pairs;
      
      for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        const conditionCollider = pair.bodyA === this.sensorLight || pair.bodyB === this.sensorLight
        const conditionColliderBox = pair.bodyA === this.captor.box || pair.bodyB === this.captor.box

        if (conditionCollider && conditionColliderBox) {
          this.captor.interact()
        }
      }
    });

    Matter.Events.on(this.engine, 'collisionEnd', (event) => {
      var pairs = event.pairs;
      
      for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        const conditionCollider = pair.bodyA === this.sensorLight || pair.bodyB === this.sensorLight
        const conditionColliderBox = pair.bodyA === this.captor.box || pair.bodyB === this.captor.box

        if (conditionCollider && conditionColliderBox) {
          this.captor.interact()
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
      color: COLOR,
      metalness: 0.3,
      roughness: 0.4,
    })

    this.mesh = new THREE.Mesh(BOX, MATERIAL)
    this.mesh.position.copy(this.position)
    
    this.scene.add(this.mesh)
  }

  addElementToFragment() {
    this.fragment.addInteractionElements(this)
  }

  createLight() {
    this.spotLight = new THREE.SpotLight( 0xffffff, 0, 2000, Math.PI * 0.05, 0.25, 1 );
    this.spotLight.position.copy(this.position)

    this.spotLight.castShadow = true

    this.spotLight.shadow.mapSize.width = 1024
    this.spotLight.shadow.mapSize.height = 1024

    this.scene.add( this.spotLight )

    this.spotLight.target = this.fragment.mesh
    
    // const spotLightHelper = new THREE.SpotLightHelper( this.spotLight )
    // this.scene.add( spotLightHelper )
  }

  startInteract() {
    this.spotLight.intensity = 1
  }

  interact(angle) {
    Matter.Body.setAngle(this.sensorLight, angle + Math.PI)
  }

  endInteract() {
    this.spotLight.intensity = 0
  }

}