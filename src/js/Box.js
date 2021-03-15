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

export default class Box {
  constructor ({world, scene, position = POSITION, size = SIZE, optionsBox = {}}) {
    this.world = world
    this.scene = scene

    this.position = position
    this.size = size
    this.optionsBox = optionsBox

    this.addBoxToWorld()
    this.addBoxToScene()
  }

  addBoxToWorld() {
    this.box = Matter.Bodies.rectangle(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y,
      this.optionsBox
    );

    // var cirlce = Matter.Bodies.circle(0,3,0.5)

    Matter.World.add(this.world, this.box);
  }
  addBoxToScene() {
    const BOX = new THREE.BoxBufferGeometry(
      this.size.x,
      this.size.y,
      this.size.z,
      32, 32
    )
    const MATERIAL = new THREE.MeshStandardMaterial({
      color: '#777777',
      metalness: 0.3,
      roughness: 0.4,
    })

    this.mesh = new THREE.Mesh(BOX, MATERIAL)
    this.mesh.receiveShadow = true
    
    this.scene.add(this.mesh)
  }

  update() {
    this.mesh.position.x = this.box.position.x
    this.mesh.position.y = this.box.position.y


    this.mesh.rotation.z = this.box.angle
  }

}