import * as THREE from 'three'
import Matter from 'matter-js'
import gsap from 'gsap'

const POSITION = {
  x: 0,
  y: 0,
  z: 0
}
const SIZE = {
  x: 100,
  y: 200,
  z: 50
}

export default class Phaeton{
  constructor({engine, scene, position = POSITION, size = SIZE}) {
    this.world = engine.world
    this.scene = scene

    this.position = position
    this.size = size

    this.interactionElements = []

    this.addPhaetonToWorld()
    this.addPhaetonToScene()

    this.initEvents()

    // setInterval(() => {
    //   console.log(this.box.position.y, this.mesh.position.y)
    // }, 100);
  }

  addPhaetonToWorld() {
    this.box = Matter.Bodies.rectangle(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y,
      {
        label: 'Phaeton',
        inertia: 'Infinity',
        // frictionAir: 0.1,
        mass: 1000,
        collisionFilter: {
          category: 0x0004,
        },
      }
    );
    
    // Matter.Body.setDensity(this.box, 100)

    console.log(this.box)

    Matter.World.add(this.world, this.box);
  }
  addPhaetonToScene() {
    const BOX = new THREE.BoxBufferGeometry(
      this.size.x,
      this.size.y,
      this.size.z,
      32, 32
    )
    const MATERIAL = new THREE.MeshStandardMaterial({
      color: '#008d02',
      metalness: 0.3,
      roughness: 0.4,
    })

    this.mesh = new THREE.Mesh(BOX, MATERIAL)
    this.mesh.receiveShadow = true

    this.scene.add(this.mesh)
  }

  addInteractionElements(element) {
    this.interactionElements.push(element)
    // console.log(this.interactionElements)
  }


  //
  // Events
  //
  initEvents() {
    window.addEventListener('keypress', this.keypress.bind(this))
  }

  keypress(event){
    // console.log(event)

    switch (event.code) {
      case "KeyA":
        Matter.Body.translate(this.box, Matter.Vector.create(-5, 0))
        break;
      
      case "KeyD":
        Matter.Body.translate(this.box, Matter.Vector.create(5, 0))
        break;
    
      case "Space":
        this.interactWithElements()
        break;  

      default:
        break;
    }
  }

  interactWithElements() {

    this.interactionElements.forEach((element) => {

      switch (element.type) {
        case 'Ladder':
          const start = element.start
          const end = element.end
          const distStart = this.mesh.position.distanceTo(start)
          const distEnd = this.mesh.position.distanceTo(end)
          
          // console.log('Start ', distStart, ' ; End ', distEnd)

          if (distStart <= element.distanceInteraction) {
            this.moveTo(start, end)
          } else if(distEnd <= element.distanceInteraction) {
            this.moveTo(end, start)
          }
          
          break;

        case 'Lever':
          const dist = this.mesh.position.distanceTo(element.mesh.position)
          if (dist <= element.distanceInteraction){
            element.interact()
          }
          break;
      
        default:
          break;
      }
    })
  }
  
  moveTo(start, end) {
    this.animation = gsap.timeline()

    this.animation.to(
      this.mesh.position,
      {
        duration: 0.3,
        x: start.x,
      }
    )
    .to(
      this.mesh.position,
      {
        duration: 3,
        y: end.y + this.size.y / 2,
        onComplete: () => {
          // translation du bodie
          const newPos = Matter.Vector.create(
            start.x - this.box.position.x,
            end.y - start.y
          )
          Matter.Body.translate(this.box, newPos)

          this.animation = null
        }  
      }
    )
  }

  update() {
    if (this.animation) return
    this.mesh.position.x = this.box.position.x
    this.mesh.position.y = this.box.position.y

    // this.mesh.rotation.z = this.box.angle
  }
}
