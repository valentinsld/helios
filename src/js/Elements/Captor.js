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
  constructor ({fragment, engine, scene, position = POSITION, size = SIZE, optionsBox = {}, render, canInteract, activateAction}) {
    this.type = 'Captor'
    this.scene = scene
    this.fragment = fragment
    this.engine = engine
    this.world = engine.world
    
    this.position = position
    this.size = size
    this.optionsBox = optionsBox

    this.activate = false
    this.canInteract = canInteract
    this.activateAction = activateAction

    if(render) this.addBoxToScene()
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
        isSensor: true,
        isStatic: true,
        render: {
          strokeStyle: COLOR,
          fillStyle: 'transparent',
          lineWidth: 2
        }
      }
    );

    this.box.interact = this.interact.bind(this)

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

  interact(inOut) {
    // console.log(this.activate)
    if (!this.canInteract.call(null) || this.activate) return
    // console.log('interact captor :', inOut)
    const condition = inOut === 'in'
    
    this.activate = condition ? true : false
    const color = condition ? COLOR_BIS : COLOR
    if (this.mesh) this.mesh.material.color = new THREE.Color(color)

    if (this.activate) {
      this.activateAction.call(null)
    }
  }

}