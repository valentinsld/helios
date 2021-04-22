import * as THREE from 'three'
import Matter from 'matter-js'
import gsap from 'gsap'

import vertexShader from '../../glsl/vertexShaderSun.glsl'
import fragmentShader from '../../glsl/fragmentShaderSun.glsl'

const POSITION = {
  x: 0,
  y: 0,
  z: 0
}
const RADIUS = 21

// DOM
const DOM = document.querySelector('body')


export default class Fragment{
  constructor({canvas, engine, game, scene, camera, debug, position = POSITION, radius = RADIUS}) {
    this.game = game
    this.canvas = canvas
    this.world = engine.world
    this.scene = scene
    this.camera = camera
    this.cameraZoom = camera.zoom
    this.debug = debug

    this.params = {
      color: 0xebaf5b,
      metalness: 0.3,
      roughness: 0.4,
      emissiveColor: 0xfaa961,
      emissiveIntensity: 1,
      intensity: 4,
      distance: 330,
      glowColor: 0xf7f77f,
      glowRadius: 0.7,
      glowPow: 4.5
    }

    this.position = position
    this.radius = radius

    this.animation = null
    this.interactionElements = []
    this.interactionElement = null
    this.mouseDown = false

    this.cursor = {
      x: position.x,
      y: position.y,
      prevX: position.x,
      prevY: position.y
    }

    this.resize()
    this.addFragmentToWorld()
    this.addFragmentToScene()
    // this.addPlaneToScene()
    this.createTargetObject()

    if(this.debug) this.addDebug()

    this.initEvents()
  }

  addFragmentToWorld() {
    this.box = Matter.Bodies.circle(
      this.position.x,
      this.position.y,
      this.radius,

      {
        label: 'Fragment',
        // isStatic: true,
        inertia: 'Infinity',
        frictionAir: 1,
        mass: 0,
        collisionFilter: {
          mask: 0x0001 | 0x0002
        },
        render: {
          fillStyle: '#001Af2'
        }
      }
    );

    Matter.World.add(this.world, this.box);
  }

  addFragmentToScene() {
    this.mesh = new THREE.Group()
    this.scene.add(this.mesh)

    // SPHERE
    const SPHERE = new THREE.SphereBufferGeometry(
      this.radius,
      32, 32
    )
    const MATERIAL = new THREE.MeshStandardMaterial({
      color: this.params.color,
      metalness: this.params.metalness,
      roughness: this.params.roughness,
      emissive: this.params.emissiveColor,
      emissiveIntensity: this.params.emissiveIntensity
    })

    this.sphere = new THREE.Mesh(SPHERE, MATERIAL)

    // LIGHT
    this.sphereLight = new THREE.PointLight(this.params.color, this.params.intensity, this.params.distance)
    this.sphereLight.castShadow = true
    this.sphereLight.shadow.radius = 8
    this.sphereLight.shadow.mapSize.width = 2048
    this.sphereLight.shadow.mapSize.height = 2048
    this.sphereLight.shadow.bias = - 0.01
    this.sphereLight.shadow.camera.far = 800

    // ADD ELEMENTS
    this.mesh.add(this.sphere, this.sphereLight)
    this.mesh.position.z = this.position.z


    //
    // Glow effect
    //
    const glowColor = new THREE.Color(this.params.glowColor)
    let glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        intensityMultiplicator: {
          value: this.params.glowRadius,
        },
        intensityPow: {
          value: this.params.glowPow,
        },
        color: new THREE.Uniform(glowColor),
        viewVector: {
          type: "v3",
          value: this.camera.position
        }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    let glowGeometry = new THREE.SphereBufferGeometry(
      this.radius + 25,
      32, 32
    );
    
    let glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.z -= this.radius * 2

    this.sphere.add(glowMesh);
    this.sphere.glow = glowMesh;
    this.mesh.add(this.sphere);
    
    // LOOP
    this.game.addUpdatedElement('loopGlow', this.loopGlow.bind(this))
  }

  loopGlow (time) {
    // let viewVector = new THREE.Vector3().subVectors( this.camera.position, this.sphere.glow.getWorldPosition());
    let viewVector = new THREE.Vector3().subVectors( this.camera.position, this.sphere.glow.position);
    this.sphere.glow.material.uniforms.viewVector.value = viewVector;
  }

  addPlaneToScene() {
    const PLANE = new THREE.PlaneGeometry(
      this.viewport.width,
      this.viewport.height,
      32, 32
    )
    const MATERIAL = new THREE.MeshStandardMaterial({
      color: '#cecece',
    })

    this.plane = new THREE.Mesh(PLANE, MATERIAL)
    this.plane.position.z = -55

    this.scene.add(this.plane)
  }

  createTargetObject() {
    this.targetObject = new THREE.Object3D();
    this.scene.add(this.targetObject);
  }


  addInteractionElements(element) {
    this.interactionElements.push(element)
    // console.log(this.interactionElements)
  }

  addDebug () {
    this.debugFolder = this.debug.addFolder('Fragment')

    this.debugFolder.addColor(this.params, 'color').onChange((color) => {
      this.sphere.material.color = new THREE.Color(color)
      this.sphereLight.color = new THREE.Color(color)
    })
    this.debugFolder.add(this.sphere.material, "metalness", 0, 1)
    this.debugFolder.add(this.sphere.material, "roughness", 0, 1)
    this.debugFolder.addColor(this.params, 'emissiveColor').onChange((color) => {
      this.sphere.material.emissive = new THREE.Color(color)
    })
    this.debugFolder.add(this.sphere.material, "emissiveIntensity", 0, 1)

    this.debugFolder.add(this.sphereLight, "intensity", 0, 15)
    this.debugFolder.add(this.sphereLight, "distance", 0, 1000)

    this.debugFolder.addColor(this.params, 'glowColor').onChange((color) => {
      const colorThree = new THREE.Color(color)
      this.sphere.glow.material.uniforms.color = new THREE.Uniform(colorThree)
      
    })
    this.debugFolder.add(this.params, "glowRadius", 0, 10).onChange((value) => {
      this.sphere.glow.material.uniforms.intensityMultiplicator.value = value;
    })
    this.debugFolder.add(this.params, "glowPow", 0, 10).onChange((value) => {
      this.sphere.glow.material.uniforms.intensityPow.value = value;
    })
  }

  hover (hov = 'in') {
    hov = hov === 'in'

    DOM.style.cursor = hov ? 'pointer' : 'initial'
    gsap.to(
      this.mesh.scale,
      {
        x: hov ? 1.2 : 1,
        y: hov ? 1.2 : 1,
        z: hov ? 1.2 : 1,
        duration: 0.3,
        ease: 'Power3.out'
      }
    )
  }

  //
  // Events
  //
  initEvents() {
    window.addEventListener('mousemove', this.cursorMove.bind(this))
    window.addEventListener('mousedown', this.interactWithElements.bind(this))
    window.addEventListener('mouseup', this.mouseUp.bind(this))

    window.addEventListener('resize', this.resize.bind(this))
  }

  resize () {
    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    
    this.viewport = {
      width: this.camera.right * 2 / this.cameraZoom,
      height: this.camera.top * 2 / this.cameraZoom
    }
  }

  cursorMove(e) {
    this.cursor.x = (e.clientX - this.screen.width / 2) * this.viewport.width / window.innerWidth
    this.cursor.y = (-e.clientY + this.screen.height/ 2) * this.viewport.height / window.innerHeight
  }
  mouseUp() {
    if (!this.interactionElement) return

    this.interactionElement.endInteract()
    this.interactionElement = null
  }

  interactWithElements() {
    this.interactionElements.forEach((element) => {     
      if (element.canUse) {
        this.interactionElement = element
        element.startInteract()
      }
    })
  }

  update() {
    if (this.animation) return

    // interact with element
    if (this.interactionElement) {
      var direction = new THREE.Vector2()
      direction.subVectors(this.cursor, this.box.position)
      direction.normalize()
      // console.log(direction)

      const positionInteractement = this.interactionElement.box.position
      // update position mesh
      Matter.Body.setPosition(this.box, Matter.Vector.create(positionInteractement.x, positionInteractement.y))

      // update position mesh
      this.targetObject.position.x = positionInteractement.x + direction.x * 2000
      this.targetObject.position.y = positionInteractement.y + direction.y * 2000
      
      this.interactionElement.interact(this.targetObject.position)
    } else {
      // apply force body
      let forceX = (this.box.position.x - this.cursor.x) / -500 * this.cameraZoom
      let forceY = (this.box.position.y - this.cursor.y) / -500 * this.cameraZoom
      forceX = Math.max(Math.min(forceX, 0.4), -0.4)
      forceY = Math.max(Math.min(forceY, 0.4), -0.4)
      
      Matter.Body.applyForce(
        this.box,
        Matter.Vector.create(0,0),
        Matter.Vector.create(forceX, forceY)
      )

    }

      // update position mesh
      this.mesh.position.x = this.box.position.x
      this.mesh.position.y = this.box.position.y
  } 
}