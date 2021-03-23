import * as THREE from 'three'
import Matter from 'matter-js'
import gsap from 'gsap'
import GetCursorPosition from 'cursor-position'

const POSITION = {
  x: 0,
  y: 0,
  z: 0
}
const RADIUS = 25

export default class Fragment{
  constructor({canvas, engine, scene, position = POSITION, radius = RADIUS}) {
    this.canvas = canvas
    this.world = engine.world
    this.scene = scene

    this.position = position
    this.radius = radius

    this.interactionElements = []
    this.interactionElement = null
    this.mouseDown = false

    this.cursor = {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0
    }

    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    this.addFragmentToWorld()
    this.addFragmentToScene()
    this.addPlaneToScene()

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
    const SPHERE = new THREE.SphereBufferGeometry(
      this.radius,
      32, 32
    )
    const MATERIAL = new THREE.MeshStandardMaterial({
      color: '#001Af2',
      metalness: 0.3,
      roughness: 0.4,
    })

    this.mesh = new THREE.Mesh(SPHERE, MATERIAL)

    this.scene.add(this.mesh)
  }

  addPlaneToScene() {
    const PLANE = new THREE.PlaneGeometry(
      this.viewport.width * 1.08,
      this.viewport.height * 1.08,
      32, 32
    )
    const MATERIAL = new THREE.MeshStandardMaterial({
      color: '#cecece',
    })

    this.plane = new THREE.Mesh(PLANE, MATERIAL)
    this.plane.position.z = -55

    this.scene.add(this.plane)
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
    this.cursor.x = e.clientX - this.viewport.width / 2
    this.cursor.y = -e.clientY + this.viewport.height / 2
  }
  mouseUp() {
    if (!this.interactionElement) return

    this.interactionElement.endInteract()
    this.interactionElement = null
  }

  interactWithElements() {
    this.interactionElements.forEach((element) => {
      const dist = this.mesh.position.distanceTo(element.mesh.position)

      if (dist <= element.distanceInteraction) {
        this.interactionElement = element
        element.startInteract()
      }
    })
  }

  update() {
    if (this.animation) return

    // apply force body
    let forceX = (this.box.position.x - this.cursor.x) / -1000
    let forceY = (this.box.position.y - this.cursor.y) / -1000
    forceX = Math.max(Math.min(forceX, 1), -1)
    forceY = Math.max(Math.min(forceY, 1), -1)
    
    Matter.Body.applyForce(
      this.box,
      Matter.Vector.create(0,0),
      Matter.Vector.create(forceX, forceY)
    )

    // update position mesh
    this.mesh.position.x = this.box.position.x
    this.mesh.position.y = this.box.position.y

    // get angle interaction
    if (this.interactionElement) {
      // const angle = this.mesh.position.angleTo(this.interactionElement.mesh.position)
      const p1 = new THREE.Vector2(0,0).copy(this.mesh.position);
      const p2 = new THREE.Vector2(0,0).copy(this.interactionElement.mesh.position);

      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

      this.interactionElement.interact(angle)
    }
  }
}