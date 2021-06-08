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
  isStatic: true,
  friction: 1,
  frictionStatic: Infinity,
  render: {
    fillStyle: 'transparent',
    lineWidth: 2
  }
}

const COLOR = 0x777777

export default class Box {
  constructor ({engine, scene, position = POSITION, rotation = 0, size = SIZE, color = COLOR, optionsBox = {}, render = true}) {
    this.world = engine.world
    this.scene = scene

    this.position = position
    this.rotation = rotation
    this.size = size
    this.color = color
    this.optionsBox = Object.assign(OPTIONS, optionsBox)

    this.addBoxToWorld()
    if (render) {
      this.addBoxToScene()
      this.initPosition()
    }
  }

  addBoxToWorld() {
    this.box = Matter.Bodies.rectangle(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y,
      this.optionsBox
    );
    
    Matter.Body.rotate(this.box, this.rotation)

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
      color: this.color,
      metalness: 0.3,
      roughness: 0.4,
    })

    this.mesh = new THREE.Mesh(BOX, MATERIAL)
    // this.mesh.receiveShadow = true
    
    this.scene.add(this.mesh)
  }

  initPosition() {
    this.mesh.position.x = this.box.position.x
    this.mesh.position.y = this.box.position.y
    this.mesh.position.z = this.position.z

    this.mesh.rotation.z = this.box.angle
  }

  destroyed () {
    Matter.World.remove(this.world, this.box)

    if (this.mesh) {
      this.mesh.geometry.dispose()
      this.mesh.material.dispose()
      this.scene.remove(this.mesh)
    }
  }

}