import * as THREE from 'three'
import Matter from 'matter-js'

const POSITION = {
  x: 0,
  y: 0,
  z: 0
}


//
// Plane exemple
//
// this.temple = new PlaneImage({
//   scene: this.scene,
//   engine: this.engine,
//   textureLoader: this.textureLoader,
//   urlImg: '/models/decors_png/temple.png',
//   width: 500
// })

export default class PlaneImage{
  constructor({ scene, engine, textureLoader, urlImg, width, position = POSITION }) {
    this.scene = scene
    this.world = engine.world
    this.textureLoader = textureLoader

    this.urlImg = urlImg
    this.width = width
    this.position = position

    this.initLoader()
  }

  initLoader() {
    this.textureLoader.load(
      this.urlImg,
      // on succes
      (texture) => {
        // in this example we create the material when the texture is loaded
        this.initPlane(texture)
      },
      undefined,
      (err) => {
        console.error( 'An error happened.' );
      }
    );

  }

  initPlane(colorTexture) {
    const alphaMap = new THREE.TextureLoader().load('/models/decors_png/temple.png');
    const img = colorTexture.image
    
    const geometry = new THREE.PlaneGeometry( img.width, img.height, 32 );
    const material = new THREE.MeshBasicMaterial({
      map: colorTexture,
      alphaMap
    });
    const plane = new THREE.Mesh( geometry, material );
    this.scene.add( plane );
  }
}