import * as THREE from 'three'
import Matter from 'matter-js'

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
  constructor({world, scene, position = POSITION, size = SIZE, optionsBox = {}}) {
    this.world = world
    this.scene = scene

    this.position = position
    this.size = size
    this.optionsBox = optionsBox

    this.addPhaetonToWorld()
    this.addPhaetonToScene()

    this.initEvents()
  }

  addPhaetonToWorld() {
    this.box = Matter.Bodies.rectangle(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y,
      this.optionsBox
    );

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
        this.box.position.x += 2 // TODO add to GUI
        break;
      
      case "KeyD":
        this.box.position.x -= 2
        break;
    
      default:
        break;
    }
  }

  movePlayer() {
    
  }

  update() {
    this.mesh.position.x = this.box.position.x
    this.mesh.position.y = this.box.position.y

    this.mesh.rotation.z = this.box.angle
  }
}
