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

const COLOR = '#ffff00'

export default class Fire {
  constructor ({phaeton, engine, scene, distanceInteraction = 150, position = POSITION, size = SIZE, optionsBox = {}}) {
    this.type = 'Fire'
    this.scene = scene
    this.phaeton = phaeton
    this.engine = engine
    this.world = engine.world
    
    this.position = position
    this.size = size
    this.distanceInteraction = distanceInteraction
    this.optionsBox = optionsBox

    this.activate = false

    this.createSensor()
    // this.addElementToPhaeton()
    this.addBoxToScene()
    this.createLight()
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
    const spotLight = new THREE.SpotLight( 0xffffff, 1, 2000, Math.PI * 0.05, 0.25, 1 );
    spotLight.position.copy(this.position);

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    this.scene.add( spotLight );

    
    const spotLightHelper = new THREE.SpotLightHelper( spotLight );
    this.scene.add( spotLightHelper );
  }

  interact() {

  }

}