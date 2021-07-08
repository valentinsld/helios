import * as THREE from 'three'
import * as Matter from 'matter-js'

import gsap from 'gsap'

import vertexShader from '../../glsl/gradient/vertex.glsl'
import fragmentShader from '../../glsl/gradient/fragmentIntro.glsl'

import Outro from '../Outro'

export default class Scene0 {
  constructor({camera, engine, globalScene, gltfLoader, textureLoader, sceneManager, game}) {
    this.game = game
    this.camera = camera

    this.engine = engine
    this.world = this.engine.world

    // init scene
    this.scene = new THREE.Group()
    globalScene.add(this.scene)

    this.initBackground()
  }

  initBackground () {
    const color = {
      top: 0xd4491a, // 0x25180e,
      bottom: 0x90909 // 0x170707
    }
    
    const geometry = new THREE.PlaneGeometry(2, 2, 1, 1)
    // const material = new THREE.MeshBasicMaterial({color: 0xffff00})

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColorA: { value: new THREE.Color(color.bottom) },
        uColorB: { value: new THREE.Color(color.top) },
        uOpacity: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: 1 },
        uSizeNoise: { value: 0.57 },
        uSpeedTime: { value: 0.18 }
      },
      vertexShader,
      fragmentShader,
      transparent: true
    });

    this.planeNoise = new THREE.Mesh(geometry, material)
    this.planeNoise.name = 'NoiseBackground'
    this.scene.add(this.planeNoise)

    this.game.addUpdatedElement('NoiseBackground', this.updateNoise.bind(this))

    gsap.to(
      this.planeNoise.material.uniforms.uOpacity,
      {
        value: 1,
        duration: 1.2,
        onComplete: () => {
          this.game.clearUpdatedElement()
          this.game.addUpdatedElement('NoiseBackground', this.updateNoise.bind(this))

          new Outro()

          // remove cursor
          document.querySelector('#cursor').remove()
          document.querySelector('body').style.cursor = 'initial'
        }
      }
    )
  }

  updateNoise (time) {
    this.planeNoise.material.uniforms.uTime.value = time
  }

  //
  // Destruct
  //
  async destruct () {
    this.scene.clear()
    Matter.World.clear(this.world);
    this.game.clearUpdatedElement()
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('destructed');
      }, 100);
    });
  }
}