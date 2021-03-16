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

export default class Lever {
  constructor ({phaeton, scene, distanceInteraction = 150, position = POSITION, size = SIZE, optionsBox = {}}) {
    this.type = 'Lever'
    this.scene = scene
    this.position = position
    this.phaeton = phaeton
    this.size = size
    this.distanceInteraction = distanceInteraction
    this.optionsBox = optionsBox

    this.activate = false

    this.addElementToPhaeton()
    this.addBoxToScene()
  }

  addBoxToScene() {
    const BOX = new THREE.BoxBufferGeometry(
      this.size.x,
      this.size.y,
      this.size.z,
      32, 32
    )
    const MATERIAL = new THREE.MeshStandardMaterial({
      color: '#0000ff',
      metalness: 0.3,
      roughness: 0.4,
    })

    this.mesh = new THREE.Mesh(BOX, MATERIAL)
    this.mesh.position.copy(this.position)
    
    this.scene.add(this.mesh)
  }

  addElementToPhaeton() {
    this.phaeton.addInteractionElements(this)
  }

  interact() {
    console.log('j appuie sur le levier', this.mesh.material.color)
    this.activate = !this.activate

    if (this.activate){
      this.mesh.material.color = new THREE.Color("#ff0000")
    } else {
      this.mesh.material.color = new THREE.Color("#0000ff")
    }
  }

}