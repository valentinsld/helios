import * as THREE from 'three'
import gsap from 'gsap'

const LIST_AUDIO = {
  plaque: 'plaque_pression.mp3',
  
  scene1_ambiance: 'Intro/intro.wav',
  scene2_ambiance: 'Enigme_1/ambiance2.mp3',
  scene2_brasier: 'Enigme_1/fragment_brasier.mp3',
  scene2_porte: 'Enigme_1/porte.mp3',
  scene2_reussite: 'Enigme_1/reussite.mp3',
  scene2_statue: 'Enigme_1/statue.mp3',
  scene3_ambiance: 'Enigme_2/ambiance.mp3',
  scene3_portPierre: 'Enigme_2/porte_pierre.mp3',
  scene_: '',
}

class Audio {
  constructor ({audioLoader, listener, name, volume, loop}) {
    this.audioLoader = audioLoader
    this.listener = listener
    this.name = name
    this.volume = volume
    this.loop = loop

    this.initsound()
  }

  initsound () {
    this.sound = new THREE.Audio(this.listener)
    
    this.audioLoader.load('./sounds/' + LIST_AUDIO[this.name], (buffer) => {
      this.sound.setBuffer(buffer)
      this.sound.setLoop(this.loop)
      this.sound.setVolume(this.volume)
      this.sound.play()
    })
  }

  stop (duration) {
    gsap.to(
      this.sound.gain.gain,
      {
        value: 0,
        duration,
        onComplete: () => {
          this.sound.stop()
        }
      }
    )
  }
}

// AudioManager.newSound({
//   name: 'scene1_ambiance',
//   loop: true
// })

// AudioManager.stopSound('scene1_ambiance', 2.5)

class AudioManager {
  constructor () {
    this.audios = {}
  }

  /*
  name : String
  */
  newSound ({name = '', volume = 1, loop = false}) {
    if (this.audios[name]) return

    const audio = new Audio({
      listener: this.listener,
      audioLoader: this.audioLoader,
      name,
      volume,
      loop
    })

    if (loop) {
      this.audios[name] = audio
    }
  }

  stopSound (name, duration = 2) {
    if (!this.audios[name]) return

    this.audios[name].stop(duration)
    delete this.audios[name]
  }

  initCamera (camera) {
    this.listener = new THREE.AudioListener()
    this.audioLoader = new THREE.AudioLoader()

    this.camera = camera
    this.camera.add(this.listener)
  }
}

export default new AudioManager()