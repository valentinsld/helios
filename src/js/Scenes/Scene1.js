import * as THREE from 'three'
import * as Matter from 'matter-js'

import Phaeton from '../Characters/Phaeton'
import Fragment from '../Characters/Fragment'


import Box from '../Elements/Box'
import Fire from '../Elements/Fire'
import Captor from '../Elements/Captor'
import Door from '../Elements/Door'

import Statue from '../Elements/01_statue'

export default class Scene1 {
  constructor({camera, render, engine, globalScene, gltfLoader, textureLoader, sceneManager, game}) {
    this.game = game
    this.sceneManager = sceneManager
    this.camera = camera

    this.render = render
    this.engine = engine
    this.world = this.engine.world

    // init scene
    this.scene = new THREE.Group()
    globalScene.add(this.scene)
    
    this.endEnigme = false

    this.initCharacters()
    this.addElements()
  }

  initCharacters () {
    this.phaeton = new Phaeton({
      engine: this.engine,
      scene : this.scene,
      position : {
        x : -1300,
        y : -450,
        z : 0
      }
    })

    this.fragment = new Fragment({
      canvas: this.canvas,
      engine: this.engine,
      scene : this.scene,
      camera : this.camera,
      position : {
        x : -1200,
        y : -350,
        z : 0
      }
    })

    this.game.addUpdatedElement('phaeton', this.phaeton.update.bind(this.phaeton))
    this.game.addUpdatedElement('fragment', this.fragment.update.bind(this.fragment))
  }

  addElements () {
    const floor = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 4000,
        y: 500,
        z: 300
      },
      position : {
        x: 0,
        y: -800,
        z: 0
      }
    })

    const wallLeft = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 400,
        y: 1500,
        z: 300
      },
      position : {
        x: -2000,
        y: 200,
        z: 0
      }
    })

    const wallRight= new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 400,
        y: 1500,
        z: 300
      },
      position : {
        x: 2000,
        y: 200,
        z: 0
      }
    })

    const escalier = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 150,
        y: 550,
        z: 300
      },
      position : {
        x: 720,
        y: -557,
        z: 0
      },
      rotation: Math.PI * 0.6
    })

    const palier = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 900,
        y: 400,
        z: 100
      },
      position : {
        x: 1400,
        y: -600,
        z: 0
      }
    })

    this.statue1 = new Statue ({
      scene: this.scene,
      engine: this.engine,
      phaeton: this.phaeton,
      position: {
        x: -100,
        y: -500,
        z: -50,
      },
      size: {
        x: 100,
        y: 100,
        z: 100
      }
    })

    
    this.statue2 = new Statue ({
      scene: this.scene,
      engine: this.engine,
      phaeton: this.phaeton,
      position: {
        x: 200,
        y: -500,
        z: -50,
      },
      size: {
        x: 100,
        y: 100,
        z: 100
      }
    })


    this.captor = new Captor ({
      scene: this.scene,
      engine: this.engine,
      fragment: this.fragment,
      position: {
        x: 1200,
        y: 150,
        z: -45,
      },
      size: {
        x: 100,
        y: 100,
        z: 200
      },
      canInteract: this.getStepStatues.bind(this),
      activateAction: this.endEnigmeAnimation.bind(this)
    })

    this.fire = new Fire ({
      scene: this.scene,
      engine: this.engine,
      render: this.render,
      fragment: this.fragment,
      debug: this.debug,
      position: {
        x: -600,
        y: -500,
        z: -45,
      },
      size: {
        x: 100,
        y: 100,
        z: 10
      },
      captor: this.captor,
      angleCone: Math.PI * 0.01
    })


    this.door = new Door({
      scene: this.scene,
      engine: this.engine,
      sceneManager: this.sceneManager,
      phaeton: this.phaeton,
      fragment: this.fragment,
      position : {
        x : 1600,
        y : -250,
        z : -51
      },
      size: {
        x: 200,
        y: 300,
        z: 1
      },
      open: this.endEnigme
    })
  }

  getStepStatues () {
    return this.statue1.activate && this.statue2.activate
  }

  endEnigmeAnimation () {
    this.endEnigme = true
    this.door.open()
    console.log('End enigme !!')
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