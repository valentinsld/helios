import * as THREE from 'three'

import fragmentShader from '../../glsl/fragmentShaderFire.glsl'
import vertexShader from '../../glsl/vertexShaderFire.glsl'

const POSITION = {
  x: 0,
  y: 0,
  z: 0
}

const PARAMETERS = {
  count: 15,
  size: 10000, // 5000
  height: 500,
  radius: 100,
  timeScaleY: 100
}


export default class AnimatedFire {
  constructor ({game, debug, scene, position = POSITION, parameters}) {
    this.game = game
    this.debug = debug
    this.position = position
    this.scene = scene

    this.parameters = Object.assign(PARAMETERS, parameters)

    this.geometry = null
    this.material = null
    this.points = null

    this.initParticules()
    this.game.addUpdatedElement('fireShader', this.updateTimeShader.bind(this))
    if (this.debug) this.initDebug()
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
      positions[i3 + 1] = Math.random() * this.parameters.height
      positions[i3 + 2] = (Math.random() - 0.5 ) * this.parameters.radius
  
      colors[i3    ] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      // scale
      scale[i] = 1
    }

    this.geometry = new THREE.BufferGeometry()
    this.material = new THREE.ShaderMaterial({
      // size: parameters.size,
      // sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      vertexShader,
      fragmentShader,
      uniforms: {
        uInitPosition : new THREE.Uniform(this.position),
        uTime: {
          value: 0
        },
        uSize: {
          value: this.parameters.size * this.game.renderer.getPixelRatio()
        },
        uHeight: {
          value: 500
        },
        uLarge: {
          value: 5
        },
        uDisparition: {
          value: 50
        },
        uTimeScaleY: {
          value: this.parameters.timeScaleY
        }
      }
    })

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    this.geometry.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))

    /**
     * Points
     */
    this.points = new THREE.Points(this.geometry, this.material)
    // this.points.position.copy(this.position)

    this.scene.add(this.points)
  }

  updateTimeShader (elapsedTime) {
    this.material.uniforms.uTime.value = elapsedTime
  }

  initDebug () {
    const folder = this.debug.addFolder('Fire')
    let uniforms = this.material.uniforms

    folder.add(uniforms.uHeight, 'value', 200, 1200).name('Hauteur fire')
    folder.add(uniforms.uLarge, 'value', 1, 15).name('Largeur fire')
    folder.add(uniforms.uDisparition, 'value', 1, 150).name('Durée disparition')

    folder.add(uniforms.uTimeScaleY, 'value', 0, 450).name('time scale Y')
  }
}