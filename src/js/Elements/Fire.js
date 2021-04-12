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
  constructor ({fragment, engine, render, debug, scene, captor, position = POSITION, size = SIZE, optionsBox = {}}) {
    this.type = 'Fire'
    this.scene = scene
    this.fragment = fragment
    this.engine = engine
    this.world = engine.world
    this.render = render
    this.debug = debug
    
    this.captor = captor
    this.position = position
    this.size = size
    this.optionsBox = optionsBox

    this.canUse = false
    this.activate = false

    this.createSensor()
    // this.createSensorLight()

    this.addBoxToScene()
    this.createLight()
    this.createCone()

    this.addElementToFragment()
  }

  createSensor() {
    this.box = Matter.Bodies.rectangle(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y,
      {
        label: 'Fire',
        isSensor: true,
        isStatic: true,
        render: {
          strokeStyle: COLOR,
          fillStyle: 'transparent',
          lineWidth: 2
        }
      }
    );

    Matter.World.add(this.world, this.box)

    // init events
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      var pairs = event.pairs;
      
      for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        const conditionCollider = pair.bodyA === this.box || pair.bodyB === this.box
        const conditionFragment = pair.bodyA.label === 'Fragment' || pair.bodyB.label === 'Fragment'

        if (conditionCollider && conditionFragment) {
          this.canUse = true
          // console.log('enter', this.canUse)
        }
      }
    });

    Matter.Events.on(this.engine, 'collisionEnd', (event) => {
      var pairs = event.pairs;
      
      for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        const conditionCollider = pair.bodyA === this.box || pair.bodyB === this.box
        const conditionFragment = pair.bodyA.label === 'Fragment' || pair.bodyB.label === 'Fragment'

        if (conditionCollider && conditionFragment) {
          this.canUse = false
          // console.log('leave', this.canUse)
        }
      }
    });
  }

  createSensorLight() {
    const startPoint = {
      x: 300,
      y: 0
    }
    const endPoint = {
      x: 500,
      y: -150
    }

    // console.log(this.render)
    Matter.Events.on(this.render, 'afterRender', () => {
      const context = this.render.context,
        bodies = Matter.Composite.allBodies(this.world)

      var collisions = Matter.Query.ray(bodies, startPoint, endPoint);

      Matter.Render.startViewTransform(this.render);

      context.beginPath();
      context.moveTo(startPoint.x, startPoint.y);
      context.lineTo(endPoint.x, endPoint.y);
      if (collisions.length > 0) {
        context.strokeStyle = '#fff';
        console.log('colisioned line')
      } else {
        context.strokeStyle = '#555';
      }
      context.lineWidth = 4;
      context.stroke();

      Matter.Render.endViewTransform(this.render);
    });
  }

  createCone() {
    const heightCone = 1800

    const geometryBis = new THREE.ConeGeometry(100, heightCone, 32);
    geometryBis.applyMatrix4( new THREE.Matrix4().setPosition( 0, heightCone * -0.5, 0 ) );
    geometryBis.rotateX(-Math.PI / 2);
    const materialBis = new THREE.MeshStandardMaterial({
      color: 0xe8b591,
      transparent: true,  
      opacity: 0,
      metalness: 1,
      emissive: 0xe8b591,
      emissiveIntensity: 1
    });
    this.coneOpacity = 0.5
    this.cone = new THREE.Mesh(geometryBis, materialBis);
    this.scene.add(this.cone);

    this.cone.position.copy(this.position)
    this.cone.rotation.z = Math.PI
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
    this.spotLight = new THREE.SpotLight( 0xffffff, 0, 2000, Math.PI * 0.02, 0.25, 1 );
    this.spotLight.position.copy(this.position)

    this.spotLight.castShadow = true

    this.spotLight.shadow.mapSize.width = 1024
    this.spotLight.shadow.mapSize.height = 1024

    this.scene.add( this.spotLight )

    this.spotLight.target = this.fragment.targetObject
    
    // const spotLightHelper = new THREE.SpotLightHelper( this.spotLight )
    // this.scene.add( spotLightHelper )
  }

  startInteract() {
    this.spotLight.intensity = 1
    this.cone.material.opacity = this.coneOpacity
  }

  interact(cursor) {
    const startPoint = this.mesh.position
    const endPoint = cursor

    this.cone.lookAt(new THREE.Vector3().copy(endPoint))


    const allbodies = Matter.Composite.allBodies(this.world),
      bodies = allbodies.filter(bodie => 
        (bodie.collisionFilter.category === 1) &&
        (bodie.label === 'Box' || bodie.label === 'Door' || bodie.label === 'Captor')
      )
    // console.log(bodies, captors)

    var collisionsBodies = Matter.Query.ray(bodies, startPoint, endPoint);
    const condition = collisionsBodies.length === 1 && collisionsBodies?.[0].body.label === 'Captor'
    // console.log(collisionsBodies?.[0].body.label)

    if (condition) {
      // console.log(collisionsBodies[0])
      collisionsBodies[0].body.interact.call(null, 'in')
      this.lastInteract = collisionsBodies[0]
    } else if(this.lastInteract) {
      this.lastInteract.body.interact.call(null, 'out')
      this.lastInteract = null
    }

    if (this.render) {
      const context = this.render.context

      Matter.Render.startViewTransform(this.render);
  
      context.beginPath();
      context.moveTo(startPoint.x, startPoint.y);
      context.lineTo(endPoint.x, endPoint.y);
      context.strokeStyle = condition ? '#ff0000' : '#fff'
      context.lineWidth = 4;
      context.stroke();
  
      Matter.Render.endViewTransform(this.render);
    }
  }

  endInteract() {
    this.spotLight.intensity = 0
    this.cone.material.opacity = 0
  }

}