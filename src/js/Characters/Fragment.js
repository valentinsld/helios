import * as THREE from 'three'
import Matter from 'matter-js'

const POSITION = {
  x: 0,
  y: 0,
  z: 0
}
const RADIUS = 25

export default class Fragment{
  constructor({canvas, engine, scene, camera, position = POSITION, radius = RADIUS}) {
    this.canvas = canvas
    this.world = engine.world
    this.scene = scene
    this.camera = camera
    this.cameraZoom = camera.zoom

    this.position = position
    this.radius = radius

    this.interactionElements = []
    this.interactionElement = null
    this.mouseDown = false

    this.cursor = {
      x: position.x,
      y: position.y,
      prevX: position.x,
      prevY: position.y
    }

    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    
    this.viewport = {
      width: this.camera.right * 2 / this.cameraZoom,
      height: this.camera.top * 2 / this.cameraZoom
    }

    this.addFragmentToWorld()
    this.addFragmentToScene()
    // this.addPlaneToScene()
    this.createTargetObject()

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

    const SPHERE = new THREE.SphereBufferGeometry(
      this.radius,
      32, 32
    )
    const MATERIAL = new THREE.MeshStandardMaterial({
      color: '#001Af2',
      metalness: 0.3,
      roughness: 0.4,
    })

    this.sphere = new THREE.Mesh(SPHERE, MATERIAL)
    this.sphereLight = new THREE.PointLight('#ffff00', 4, 500)
    
    this.mesh.add(this.sphere, this.sphereLight)
    this.mesh.position.z = 200
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

  //
  // Events
  //
  initEvents() {
    window.addEventListener('mousemove', this.cursorMove.bind(this))
    window.addEventListener('mousedown', this.interactWithElements.bind(this))
    window.addEventListener('mouseup', this.mouseUp.bind(this))
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
      const dist = this.mesh.position.distanceTo(element.mesh.position)
      
      if (element.canUse) {
        this.interactionElement = element
        element.startInteract()
      }
    })
  }

  update() {
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