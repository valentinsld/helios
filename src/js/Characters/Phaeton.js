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
  constructor({world, scene, position = POSITION, size = SIZE}) {
    this.world = world
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
        inertia: 'Infinity',
        frictionAir: 0.1,
      }
    );

    Matter.World.add(this.world, this.box);

    console.log(this.box)
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
        // this.box.position.x -= 2 // TODO add to GUI
        Matter.Body.translate(this.box, Matter.Vector.create(2, 0))
        break;
      
      case "KeyD":
        // this.box.position.x += 2
        Matter.Body.translate(this.box, Matter.Vector.create(2, 0))
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
        case 'ladder':
          const start = this.interactionElements[0].start
          const end = this.interactionElements[0].end
          const distStart = this.mesh.position.distanceTo(start)
          const distEnd = this.mesh.position.distanceTo(end)
          
          console.log('Start ', distStart, ' ; End ', distEnd)

          if (distStart <= element.distanceInteraction) {
            this.moveTo(start, end)
          } else if(distEnd <= element.distanceInteraction) {
            this.moveTo(end, start)
          }
          
          break;
      
        default:
          break;
      }
    })
  }
  
  moveTo(start, end) {
    console.log(start, end)

    this.animation = gsap.timeline()
    const initMask = this.box.collisionFilter.mask

    console.log(this.box.velocity)

    // Matter.Body.setStatic(this.box, true)
    // Matter.Body.setVelocity(this.box, 1)
    // Matter.Body.translate(this.box, Matter.Vector.create(0, end.y - start.y))

    this.animation.to(
      this.box,
      {
        duration: 0.3,
        x: start.x,
        onUpdate: () => {
          Matter.Body.setVelocity(this.box, {x: 0, y: 1 });
        },
        onStart: () => {
          console.log('start')
          this.box.collisionFilter.mask = 10
          Matter.Body.setStatic(this.box, true)
        }
      }
    )
    .to(
      this.box,
      {
        duration: 3,
        y: "+=350",
        onComplete: () => {
          console.log('end')
          this.box.collisionFilter.mask = initMask
          
          // Matter.Body.setStatic(this.box, false)
          // Matter.Body.setPosition(
          //   this.box,
          //   Matter.Vector.create({x: end.x, y: end.y + this.size.y / 2})
          // )

          // this.box.force.y = this.world.gravity.y
        }  
      }
    )
  }

  update() {
    this.mesh.position.x = this.box.position.x
    this.mesh.position.y = this.box.position.y

    this.mesh.rotation.z = this.box.angle
  }
}
