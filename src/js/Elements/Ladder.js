import * as THREE from 'three'
import Matter from 'matter-js'

const POSITION = {
  x: 0,
  y: 0,
  z: 0
}

const SIZE = {
  x: 150,
  y: 300,
  z: 0
}


export default class Ladder{
  constructor({phaeton, size = SIZE, scene, distanceInteraction = 150, position = POSITION}) {
    this.type = 'ladder'
    
    this.phaeton = phaeton
    this.size = size
    this.scene = scene
    this.distanceInteraction = distanceInteraction
    this.position = position

    this.addElementToScene()
    this.addElementToPhaeton()
    this.initStartEnd()
  }

  addElementToScene() {
    const BOX = new THREE.BoxBufferGeometry(
      this.size.x,
      this.size.y,
      this.size.z,
      32, 32
    )
   

    const MATERIAL = new THREE.MeshStandardMaterial({
      color: '#ff0004',
      metalness: 0.3,
      roughness: 0.4,
    })

    this.mesh = new THREE.Mesh(BOX, MATERIAL)
    this.mesh.receiveShadow = true

    this.mesh.position.x += this.position.x
    this.mesh.position.y += this.size.y / 2
    this.mesh.position.z += this.position.z

    this.scene.add(this.mesh)
  }

  addElementToPhaeton() {
    this.phaeton.addInteractionElements(this)
  }

  initStartEnd() {
    this.start = new THREE.Vector3(
      this.mesh.position.x,
      this.mesh.position.y - this.size.y / 2,
      this.mesh.position.z
    )

    this.end = new THREE.Vector3(
      this.mesh.position.x,
      this.mesh.position.y + this.size.y / 2,
      this.mesh.position.z
    )
  }
}