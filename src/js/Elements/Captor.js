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

const COLOR = '#FF8000'
const COLOR_BIS = '#ffe063'

export default class Captor {
  constructor ({fragment, engine, scene, position = POSITION, size = SIZE, optionsBox = {}}) {
    this.type = 'Captor'
    this.scene = scene
    this.fragment = fragment
    this.engine = engine
    this.world = engine.world
    
    this.position = position
    this.size = size
    this.optionsBox = optionsBox

    this.activate = false

    this.addBoxToScene()
    this.createSensor()
  }

  createSensor() {
    this.box = Matter.Bodies.rectangle(
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y,
      {
        label: 'Captor',
        collisionFilter: {
          category: 0x0008,
          mask: 0x0001
        },
        render: {
          strokeStyle: COLOR,
          fillStyle: 'transparent',
          lineWidth: 2
        }
      }
    );

    Matter.World.add(this.world, this.box)
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

  interact() {
    console.log('interact captor')

    this.activate = !this.activate
    const color = this.activate ? COLOR_BIS : COLOR
    this.mesh.material.color = new THREE.Color(color)
  }

}