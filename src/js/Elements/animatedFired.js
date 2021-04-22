import * as THREE from 'three'

import fragmentShader from '../../glsl/fragmentShaderFire.glsl'
import vertexShader from '../../glsl/vertexShaderFire.glsl'

const POSITION = {
  x: 0,
  y: 0,
  z: 0
}

const PARAMETERS = {
  count: 12,
  size: 10000, // 5000
  radius: 100,
  spin: 1
}


export default class AnimatedFire {
  constructor ({game, debug, scene, position = POSITION, parameters}) {
    this.game = game
    this.debug = debug
    this.position = position
    this.scene = scene

    this.parameters = Object.assign(PARAMETERS, parameters)

    this.initParticules()
  }

  initParticules () {


    const positions = new Float32Array(this.parameters.count * 3)
    const colors = new Float32Array(this.parameters.count * 3)
    const scale = new Float32Array(this.parameters.count)

    const color = new THREE.Color(0xff6030)

    for(let i = 0; i < this.parameters.count; i++)
    {
      const i3 = i * 3

      // Position
      positions[i3    ] = (Math.random() - 0.5 ) * this.parameters.radius
      positions[i3 + 1] = Math.random() * 400
      positions[i3 + 2] = (Math.random() - 0.5 ) * this.parameters.radius
  
      colors[i3    ] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      // scale
      scale[i] = 1
    }

    const geometry = new THREE.BufferGeometry()
    const material = new THREE.ShaderMaterial({
      // size: parameters.size,
      // sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: {
          value: 0
        },
        uSize: {
          value: this.parameters.size * this.game.renderer.getPixelRatio()
        }
      }
    })

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))

    /**
     * Points
     */
    const points = new THREE.Points(geometry, material)
    this.scene.add(points)

    this.game.addUpdatedElement('aaa', (elapsedTime) => {
      material.uniforms.uTime.value = elapsedTime
    })
  }
}