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
const OPTIONS = {
  label: 'Box',
  isStatic: true
}

export default class Box {
  constructor ({engine, scene, position = POSITION, size = SIZE, optionsBox = OPTIONS}) {
    this.world = engine.world
    this.scene = scene

    this.position = position
    this.size = size
    this.optionsBox = optionsBox

    this.addBoxToWorld()
    this.addBoxToScene()
    this.initPosition()
  }

  addBoxToWorld() {
    this.box = Matter.Bodies.rectangle(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y,
      this.optionsBox
    );

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

  initPosition() {
    this.mesh.position.x = this.box.position.x
    this.mesh.position.y = this.box.position.y
    this.mesh.position.z = this.position.z

    this.mesh.rotation.z = this.box.angle
  }

}