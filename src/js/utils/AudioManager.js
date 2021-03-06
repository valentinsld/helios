import * as THREE from 'three'
import gsap from 'gsap'

const LIST_AUDIO = {
  plaque: 'plaque_pression.mp3',
  plaqueOut: 'plaque_pression2.mp3',
  info: 'info.mp3',
  pas_temple: 'pas_temple.mp3',
  pas_dehors: 'pas_dehors.mp3',
  
  scene0_ambiance: 'Intro/intro.wav',
  scene1_ambiance: 'Enigme_1/ambiance2.mp3',
  scene1_brasier: 'Enigme_1/fragment_brasier.mp3',
  scene1_porte: 'Enigme_1/porte.mp3',
  scene1_reussite: 'Enigme_1/reussite_2.mp3',
  scene1_statue: 'Enigme_1/statue.mp3',
  scene2_ambiance: 'Enigme_2/ambiance.mp3',
  scene2_portPierre: 'Enigme_2/porte_pierre_2.mp3',
  scene3_ambiance: 'Enigme_3/ambiance_cave_2.mp3',
  scene3_chute: 'Enigme_3/chute_statue.mp3',
  scene3_echelle: 'Enigme_3/echelle.mp3',
  scene3_renes: 'Enigme_3/renes.mp3',
  scene4_ambiance: 'Enigme_4/ambiance_cloitre.mp3',
  scene_: '',
}

class Audio {
  constructor ({audioLoader, listener, name, volume, loop}) {
    this.audioLoader = audioLoader
    this.listener = listener
    this.name = name
    this.volume = volume
    this.loop = loop

    this.play = true

    this.initsound()
  }

  initsound () {
    this.sound = new THREE.Audio(this.listener)
    
    this.audioLoader.load('./sounds/' + LIST_AUDIO[this.name], (buffer) => {
      this.sound.setBuffer(buffer)
      this.sound.setLoop(this.loop)
      this.sound.setVolume(this.volume)
      if (this.play) this.sound.play()
    })
  }

  stop (duration) {
    gsap.to(
      this.sound.gain.gain,
      {
        value: 0,
        duration,
        onComplete: () => {
          this.play = false
          this.sound.stop()
        }
      }
    )
  }
}

// AudioManager.newSound({
//   name: 'name',
//   loop: true
// })

// AudioManager.stopSound('name', 2.5)

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