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

// DOM
const DOM = document.querySelector('body')

export default class Fire {
  constructor ({fragment, engine, render, gltf, debug, scene, captor, position = POSITION, size = SIZE, optionsBox = {}, heightCone = 3800, angleCone = Math.PI * 0.02}) {
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

    this.heightCone = heightCone
    this.angleCone = angleCone

    this.canUse = false
    this.activate = false

    this.createSensor()

    if (gltf) {
      this.addGltfToScene(gltf)
    } else {
      this.addBoxToScene()
    }
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
          DOM.style.cursor = 'pointer'
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
          DOM.style.cursor = 'initial'
          // console.log('leave', this.canUse)
        }
      }
    });
  }

  createCone() {
    const radius = (this.heightCone * Math.tan(this.angleCone * 0.5)) * 2 * 0.8
    const geometryBis = new THREE.ConeGeometry(radius, this.heightCone, 32);
    geometryBis.applyMatrix4( new THREE.Matrix4().setPosition( 0, this.heightCone * -0.5, 0 ) );
    geometryBis.rotateX(-Math.PI / 2);
    const materialBis = new THREE.MeshStandardMaterial({
      color: 0xe8b591,
      transparent: true,  
      opacity: 0,
      metalness: 1,
      emissive: 0xe8b591,
      emissiveIntensity: 0.5
    });
    this.coneOpacity = 0.5
    this.cone = new THREE.Mesh(geometryBis, materialBis);
    this.scene.add(this.cone);
    this.cone.name = 'Cone'

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

  addGltfToScene (gltf) {
    this.mesh = gltf
    this.mesh.position.copy(this.position)

    this.scene.add(this.mesh)
  }

  addElementToFragment() {
    this.fragment.addInteractionElements(this)
  }

  createLight() {
    this.spotLight = new THREE.SpotLight( 0xffffff, 0, this.heightCone, this.angleCone * 3, 1, 1 );
    this.spotLight.power = 15
    this.spotLight.intensity = 0
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
    this.spotLight.intensity = 3
    this.cone.material.opacity = this.coneOpacity

    DOM.style.cursor = 'grabbing'
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