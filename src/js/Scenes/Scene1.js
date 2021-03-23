import * as THREE from 'three'
import * as Matter from 'matter-js'

import Phaeton from '../Characters/Phaeton'
import Fragment from '../Characters/Fragment'


import Box from '../Elements/Box'
import Sphere from '../Elements/Sphere'
import Ladder from '../Elements/Ladder'
import Lever from '../Elements/Lever'
import Fire from '../Elements/Fire'
import Captor from '../Elements/Captor'

export default class Scene1 {
  constructor({camera, engine, globalScene, fragment, phaeton, game}) {
    this.game = game
    this.camera = camera

    this.engine = engine
    this.world = this.engine.world

    // init scene
    this.scene = new THREE.Group()
    globalScene.add(this.scene)
    

    this.initCharacters()
    this.addElements()
  }

  initCharacters () {
    this.phaeton = new Phaeton({
      engine: this.engine,
      scene : this.scene,
      position : {
        x : 0,
        y : -100,
        z : 0
      }
    })

    this.fragment = new Fragment({
      canvas: this.canvas,
      engine: this.engine,
      scene : this.scene,
      position : {
        x : 80,
        y : 200,
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
        x: 1200,
        y: 100,
        z: 100
      },
      position : {
        x: 100,
        y: -250,
        z: 0
      },
      optionsBox : {
        isStatic: true
      }
    })
    const floor2 = new Box({
      engine: this.engine,
      scene: this.scene,
      size: {
        x: 1000,
        y: 100,
        z: 100
      },
      position : {
        x: 200,
        y: 150,
        z: 0
      },
      optionsBox : {
        isStatic: true
      }
    })



    this.ladder = new Ladder({
      scene: this.scene,
      engine: this.engine,
      phaeton: this.phaeton,
      position : {
        x : 150,
        y : -300,
        z : -51
      },
      size: {
        x: 100,
        y: 400,
        z: 1
      }
    })

    this.lever = new Lever ({
      scene: this.scene,
      phaeton: this.phaeton,
      position: {
        x: 500,
        y: 225,
        z: 0,
      },
      size: {
        x: 100,
        y: 50,
        z: 100
      }
    })


    this.captor = new Captor ({
      scene: this.scene,
      engine: this.engine,
      fragment: this.fragment,
      position: {
        x: 500,
        y: -150,
        z: -45,
      },
      size: {
        x: 100,
        y: 100,
        z: 100
      }
    })

    this.fire = new Fire ({
      scene: this.scene,
      engine: this.engine,
      fragment: this.fragment,
      debug: this.debug,
      position: {
        x: -300,
        y: -150,
        z: -45,
      },
      size: {
        x: 100,
        y: 100,
        z: 100
      },
      captor: this.captor
    })

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