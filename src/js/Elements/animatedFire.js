import * as THREE from 'three'

import fragmentShaderFireParticules from '../../glsl/fireParticules/fragment.glsl'
import vertexShaderFireParticules from '../../glsl/fireParticules/vertex.glsl'
import fragmentShaderFire from '../../glsl/fire/fragment.glsl'

const POSITION = {
  x: 0,
  y: 0,
  z: 0
}

const PARAMETERS = {
  scale: 100,
  count: 6,
  size: 30, // 5000
  largeur: 5,
  height: 750,
  radius: 150,
  timeScaleY: 450,
  windX: 400,
  scaleNoise: 400,
  colorBack: 0xd74216,
  colorFront: 0xffe572,
  colorStart: 10,
  colorEnd: 50,
}


export default class AnimatedFire {
  constructor ({game, debug, scene, gltf, position = POSITION, parameters}) {
    this.game = game
    this.debug = debug
    this.position = position
    this.scene = scene

    this.parameters = Object.assign(PARAMETERS, parameters)

    this.geometry = null
    this.material = null
    this.points = null

    this.initParticules()
    this.initMesh(gltf)

    this.game.addUpdatedElement('clip', this.updateAnimationFire.bind(this))
    if (this.debug) {
      this.debugFolder = this.debug.addFolder('Fire')
      this.initDebug()
    }
  }

  initParticules () {
    const positions = new Float32Array(this.parameters.count * 3)
    const colors = new Float32Array(this.parameters.count * 3)
    const scale = new Float32Array(this.parameters.count)
    const aRandom = new Float32Array(this.parameters.count)

    const color = new THREE.Color(this.parameters.colorBack)

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
      scale[i] = Math.random() * 0.4 + 0.6
      
      // random
      aRandom[i] = Math.random()
    }

    this.geometry = new THREE.BufferGeometry()
    this.material = new THREE.ShaderMaterial({
      // size: parameters.size,
      // sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      vertexShader: vertexShaderFireParticules,
      fragmentShader: fragmentShaderFireParticules,
      uniforms: {
        uInitPosition : new THREE.Uniform(this.position),
        uTime: {
          value: 0
        },
        uSize: {
          value: this.parameters.size * this.game.renderer.getPixelRatio()
        },
        uHeight: {
          value: this.parameters.height
        },
        uLarge: {
          value: this.parameters.largeur
        },
        uDisparition: {
          value: 50
        },
        uTimeScaleY: {
          value: this.parameters.timeScaleY
        },
        uWindX: {
          value: this.parameters.windX
        },
        uScaleNoise: {
          value: this.parameters.windX
        }
      }
    })

    console.log(positions)
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    this.geometry.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))
    this.geometry.setAttribute('aRandom', new THREE.BufferAttribute(aRandom, 1))

    /**
     * Points
     */
    this.points = new THREE.Points(this.geometry, this.material)

    this.scene.add(this.points)
  }

  initMesh (gltf) {
    // mesh
    this.mesh = gltf.scene
    const scale = this.parameters.scale
    this.mesh.scale.set(scale,scale,scale)
    this.mesh.position.copy(this.position)
    this.mesh.position.z += 20

    // add OWN fragment shader
    this.mesh.traverse((node) => {
      if (node.name === 'feu') {
        let material = node.material
        material.onBeforeCompile = (shader) => {
          // ADD UNIFORMS
          shader.uniforms.colorBack = {
            value: new THREE.Color(this.parameters.colorBack)
          }
          shader.uniforms.colorFront = {
            value: new THREE.Color(this.parameters.colorFront)
          }
          shader.uniforms.uStart = new THREE.Uniform(this.parameters.colorStart + this.position.z)
          shader.uniforms.uEnd = new THREE.Uniform(this.parameters.colorEnd + this.position.z)

          // VERTEX SHADER
          const startVertex = 'varying vec4 vPosition;\n'
          const endVertex = `\nvPosition = modelMatrix * vec4(position, 1.0);\n}`
          shader.vertexShader = startVertex + shader.vertexShader.replace('}', endVertex)

          // FRAGMENT SHADER
          let fragmentShader = shader.fragmentShader
          const regex = /void main\(\) \{((.|\n)*)\}/g
          
          fragmentShader = fragmentShader.replace(regex, fragmentShaderFire)
          shader.fragmentShader = fragmentShader

          // if DEBUG
          if (this.debug) {
            const uniforms = shader.uniforms

            const color1 = this.debugFolder.addColor(this.parameters, "colorBack").name('Color Back')
            color1.onChange((value) => {
              uniforms.colorBack.value = new THREE.Color(value)
            })
            const color2 = this.debugFolder.addColor(this.parameters, "colorFront").name('Color Front')
            color2.onChange((value) => {
              uniforms.colorFront.value = new THREE.Color(value)
            })

            this.debugFolder.add(uniforms.uStart, 'value', -100, 100).name('Start gradient')
            this.debugFolder.add(uniforms.uEnd, 'value', -100, 100).name('End Gradient')
          }
        }

      }
    })

    this.scene.add(this.mesh)

    // animation
    this.mixer = new THREE.AnimationMixer( this.mesh )
    const clips = gltf.animations

    const clip = THREE.AnimationClip.findByName( clips, "KeyAction" );
    this.action = this.mixer.clipAction( clip );
    this.action.play();

    this.lastClock = 0
  }

  updateAnimationFire (time) {
    const dt = time - this.lastClock
    const framePerSeconds = 1 / 9
    if (dt < framePerSeconds) return

    // console.log(dt)
    this.mixer.update( framePerSeconds )
    this.material.uniforms.uTime.value = time

    this.lastClock = time
  }

  initDebug () {
    const folder = this.debugFolder
    // folder.open()
    let uniforms = this.material.uniforms

    folder.add(uniforms.uSize, 'value', 0, 100).name('Size particules')
    folder.add(uniforms.uHeight, 'value', 200, 1200).name('Hauteur fire')
    folder.add(uniforms.uLarge, 'value', 1, 100).name('Largeur fire')
    folder.add(uniforms.uDisparition, 'value', 1, 150).name('Durée disparition')

    folder.add(uniforms.uTimeScaleY, 'value', 0, 700).name('time scale Y')
    folder.add(uniforms.uWindX, 'value', -700, 700).name('Wind X')
    folder.add(uniforms.uScaleNoise, 'value', 0, 500).name('Scale Noise')
  }
}