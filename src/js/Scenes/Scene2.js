import * as THREE from 'three'
import * as Matter from 'matter-js'

import LoaderModelsManager from '../LoaderModelsManager'

import PlaneImage from '../Elements/PlaneImage'

export default class Scene0 {
  constructor({camera, engine, globalScene, gltfLoader, textureLoader, sceneManager, game, debug}) {
    this.game = game
    this.camera = camera
    this.debug = debug

    this.engine = engine
    this.world = this.engine.world

    this.textureLoader = textureLoader
    this.gltfLoader = gltfLoader

    // init scene
    this.scene = new THREE.Group()
    globalScene.add(this.scene)

    if (this.debug) this.debugSceneFolder = this.debug.addFolder('Scene params')

    this.initScene()
    this.initLights()
  }

  initScene() {
    this.camera.zoom = 1
    this.camera.updateProjectionMatrix()

    console.log('scene 2')

    //
    // Set cube
    //
    const geometry = new THREE.BoxGeometry(1000, 100, 100);
    const material = new THREE.MeshStandardMaterial({color: 0xffffff, metalness: 0, roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.2});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.y = -50

    this.debugSceneFolder?.add(cube.material, "emissiveIntensity", 0, 1).name('Intensity floor')


    cube.receiveShadow = true
    this.scene.add( cube );

    const arrayModels = [
      {
        url: '/models/brasier/brasier.glb',
        func: this.initBrasier.bind(this)
      },
      {
        url: '/models/statues/statue1.gltf',
        func: this.initStatue1.bind(this)
      },
      {
        url: '/models/statues/statue2.gltf',
        func: this.initStatue2.bind(this)
      },
      {
        url: '/models/temple/temple.gltf',
        func: this.initTemple.bind(this)
      },
      {
        url: '/models/testTexture/block.gltf',
        func: this.initTestCUbe.bind(this)
      }
    ]

    new LoaderModelsManager({
      arrayModels,
      gltfLoader: this.gltfLoader,
      // progressFunction: this.updateProgress.bind(this)
    })
  }

  initLights() {
    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    // this.scene.add(ambientLight)
    let light = {
      color: 0xe8b591
    }
    this.light = new THREE.PointLight(light.color, 1, 2300, 2);
    this.light.position.set(0, 50, 50);
    this.light.castShadow = true
    this.light.shadow.radius = 8
    this.light.shadow.mapSize.width = 2048
    this.light.shadow.mapSize.height = 2048
    this.light.shadow.bias = - 0.01
    this.scene.add(this.light)

    this.light.shadow.camera.far = 800
    console.log(this.light.shadow.camera)

    this.game.addUpdatedElement('lightTemple', this.updatePositionLight.bind(this))

    if (this.debugSceneFolder) {
      const spotLightFolder = this.debugSceneFolder.addFolder('Spot light')
  
      const color = spotLightFolder.addColor(light, "color").name('Color')
      color.onChange((value) => {
        this.light.color = new THREE.Color(value)
      })
  
      spotLightFolder.add(this.light, "intensity", 0, 1)
      spotLightFolder.add(this.light, "decay", 0, 20)
      spotLightFolder.add(this.light, "distance", 0, 20000)
      spotLightFolder.add(this.light.shadow, "radius", 0, 20)
      spotLightFolder.add(this.light.shadow.camera, "far", 0, 1000).name('far camera')
    }
  }

  updatePositionLight(time) {
    // this.light.position.z = Math.cos(time) * 50
    this.light.power = 7 + Math.cos(time*4) * 1.3
    // console.log(time)
  }

  updateProgress(progress) {
    console.log('progress', progress)
  }

  initBrasier(gltf) {
    // console.log('brasier', gltf)
    this.brasier = gltf.scene
    this.brasier.scale.set(100,100,100)
    this.brasier.position.x = -200

    this.scene.add(this.brasier)
  }
  
  initStatue1(gltf) {
    // console.log('initStatue1', gltf)
    this.statue1 = gltf.scene
    this.statue1.scale.set(10,10, 10)
    this.statue1.position.z = -100

    this.statue1.traverse( function(node) {
      if (node.isMesh) {
        node.castShadow = true
        // node.receiveShadow = true
      }
    })

    this.scene.add(this.statue1)
  }
  
  initStatue2(gltf) {
    // console.log('initStatue2', gltf)
    this.statue2 = gltf.scene

    this.statue2.scale.set(10,10, 10)
    this.statue2.position.x = 180
    this.statue2.position.z = 0

    this.statue2.traverse( function(node) {
      if (node.isMesh) {
        node.castShadow = true
        // node.receiveShadow = true
      }
    })

    this.scene.add(this.statue2)
  }

  initTemple(gltf) {
    this.temple = gltf.scene

    this.temple.scale.set(100, 100, 100)
    this.temple.rotation.y = Math.PI * 0.75
    this.temple.position.set(400, 0, -150)

    this.temple.traverse( (node) => {
      if (node.isMesh) {
        node.castShadow = true
        node.receiveShadow = true
      }
    })

    this.scene.add(this.temple)
  }

  initTestCUbe(gltf) {
    this.testCube = gltf.scene

    this.testCube.scale.set(10, 10, 10)
    this.testCube.rotation.y = Math.PI * 0.75
    this.testCube.position.set(0, 100, 100)

    const normal = this.textureLoader.load('/models/testTexture/normal.png')
    let material = this.testCube.children[0].material
    material.normalMap = normal
    material.roughness = 0.8

    // console.log(material)

    this.scene.add(this.testCube)
  }

  //
  // Destruct
  //
  async destruct () {
    this.scene.clear()
    Matter.World.clear(this.world);

    return new Promise(resolve => {
      setTimeout(() => {
        resolve('destructed');
      }, 100);
    });
  }
}