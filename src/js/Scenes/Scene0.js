import * as THREE from 'three'
import * as Matter from 'matter-js'
import Intro from '../Intro'

import vertexShader from '../../glsl/gradient/vertex.glsl'
import fragmentShader from '../../glsl/gradient/fragmentIntro.glsl'

export default class Scene0 {
  constructor({camera, engine, globalScene, game, sceneManager, debug}) {
    this.game = game
    this.camera = camera

    this.engine = engine
    this.world = this.engine.world
    this.debug = debug

    // init scene
    this.scene = new THREE.Group()
    this.scene.name = 'Scene0'
    globalScene.add(this.scene)

    this.initScene()
    this.initBackground()
    this.intro = new Intro(sceneManager)
  }

  initScene() {
    console.log('scene 0')
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
        uOpacity: { value: 1 },
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

    if (this.debug) {
      this.debugSceneFolder = this.debug.addFolder('Scene params intro')

      const colorTop = this.debugSceneFolder.addColor(color, "top").name('background color')
      colorTop.onChange((value) => {
        material.uniforms.uColorB.value = new THREE.Color(value)
      })

      const colorBottom = this.debugSceneFolder.addColor(color, "bottom").name('background color')
      colorBottom.onChange((value) => {
        material.uniforms.uColorA.value = new THREE.Color(value)
      })

      this.debugSceneFolder.add(material.uniforms.uSize, "value", 0, 5).name('Size')
      this.debugSceneFolder.add(material.uniforms.uSizeNoise, "value", 0, 1).name('Size noise')
      this.debugSceneFolder.add(material.uniforms.uSpeedTime, "value", 0, 4).name('Speed noise')
    }
  }

  updateNoise (time) {
    this.planeNoise.material.uniforms.uTime.value = time
  }

  //
  // Destruct
  //
  async destruct () {
    // this.scene.clear()
    // Matter.World.clear(this.world);

    return new Promise(resolve => {
      setTimeout(() => {
        resolve('destructed');
      }, 100);
    });
  }
}