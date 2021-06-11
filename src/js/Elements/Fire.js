import * as THREE from 'three'
import Matter from 'matter-js'

import vertexShader from '../../glsl/sun/vertex.glsl'
import fragmentShader from '../../glsl/sun/fragment.glsl'

import MenuContextuels from '../utils/MenuContextuels'

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
  constructor ({game, fragment, engine, render, gltf, debug, scene, captor, position = POSITION, size = SIZE, optionsBox = {}, heightCone = 3800, angleCone = Math.PI * 0.02}) {
    this.game = game
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

          this.fragment.hover()

          if (!this.captor) return
          MenuContextuels.addMenu({
            id: 'captorFire',
            text: 'Cliquez et maintenez pour diriger le faisceau',
            position: new THREE.Vector3(-580, -300, 0)
          })
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

          this.fragment.hover('out')

          if (!this.captor) return
          MenuContextuels.removeMenu('captorFire')
        }
      }
    });
  }

  createCone() {
    const radius = (this.heightCone * Math.tan(this.angleCone)) * 2 * 0.8
    const geometryBis = new THREE.ConeGeometry(radius, this.heightCone, 80);
    geometryBis.applyMatrix4( new THREE.Matrix4().setPosition( 0, this.heightCone * -0.5, 0 ) );
    geometryBis.rotateX(-Math.PI / 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0xe8b591,
      transparent: true,
      opacity: 0,
      metalness: 1,
      emissive: 0xe8b591,
      emissiveIntensity: 0.5
    });

    const params = {
      glowColor: 0xffc773,
      glowRadius: 0.4,
      glowPow: 2
    }

    const glowColor = new THREE.Color(params.glowColor)
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        intensityMultiplicator: {
          value: params.glowRadius,
        },
        intensityPow: {
          value: params.glowPow,
        },
        opacity: {
          value: 0
        },
        color: new THREE.Uniform(glowColor),
        viewVector: {
          type: "v3",
          value: this.game.camera.position
        }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    if (this.debug) {
      const folder = this.debug.addFolder('Fire rayon')
      folder.add(glowMaterial.uniforms.intensityMultiplicator, 'value', 0, 1).name('intensityMultiplicator')
      folder.add(glowMaterial.uniforms.intensityPow, 'value', 2, 12).name('intensityPow')
    }

    this.coneOpacity = 0.5
    this.cone = new THREE.Mesh(geometryBis, glowMaterial);
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
  }

  addElementToFragment() {
    this.fragment.addInteractionElements(this)
  }

  createLight() {
    this.spotLight = new THREE.SpotLight( 0xebaf5b, 0, this.heightCone, this.angleCone * 2, 1, 1 );
    this.spotLight.power = 8
    this.spotLight.intensity = 0
    this.spotLight.position.copy(this.position)

    this.spotLight.castShadow = true

    this.spotLight.shadow.camera.far = 1500
    this.spotLight.shadow.camera.near = 200
    this.spotLight.shadow.camera.fov = 5
    this.spotLight.shadow.mapSize.width = 512
    this.spotLight.shadow.mapSize.height = 512

    this.scene.add( this.spotLight )

    this.spotLight.target = this.fragment.targetObject
    
    // const spotLightHelper = new THREE.SpotLightHelper( this.spotLight )
    // this.scene.add( spotLightHelper )

    // this.fragment.game.addUpdatedElement('spotLightHelper', () => {
    //   spotLightHelper.update()
    // })
  }

  startInteract() {
    this.spotLight.intensity = 10
    this.cone.material.uniforms.opacity.value = this.coneOpacity
  }

  interact(cursor) {
    const startPoint = this.mesh.position
    const endPoint = cursor
    let lookAt = new THREE.Vector3().copy(endPoint)
    lookAt.z -= 10

    this.cone.lookAt(lookAt)


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
    this.cone.material.uniforms.opacity.value = 0
  }

}