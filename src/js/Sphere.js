import * as THREE from 'three'
import Matter from 'matter-js'

const POSITION = {
  x: 0,
  y: 0,
  z: 0
}
const RADIUS = 100

export default class Sphere {
  constructor ({world, scene, position = POSITION, radius = RADIUS, optionsBox = {}}) {
    this.world = world
    this.scene = scene

    this.position = position
    this.radius = radius
    this.optionsBox = optionsBox

    this.addBoxToWorld()
    this.addBoxToScene()
  }

  addBoxToWorld() {
    this.box = Matter.Bodies.circle(
      this.position.x,
      this.position.y,
      this.radius,
      this.optionsBox
    );

    // var cirlce = Matter.Bodies.circle(0,3,0.5)

    Matter.World.add(this.world, this.box);
  }
  addBoxToScene() {
    // Floor
    this.mesh = new THREE.Mesh(
      new THREE.SphereBufferGeometry(
        this.radius,
        32, 32
      ),   
      new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: this.environmentMapTexture
      })
    )
    this.mesh.receiveShadow = true
    
    this.scene.add(this.mesh)
  }

  update() {
    this.mesh.position.x = this.box.position.x
    this.mesh.position.y = this.box.position.y

    this.mesh.rotation.z = this.box.angle
  }

}