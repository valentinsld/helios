export default class LoaderModelsManager{
  constructor({ arrayModels, gltfLoader, progressFunction }) {
    this.array = arrayModels
    this.arrayLength = arrayModels.length
    this.gltfLoader = gltfLoader
    this.progressFunction = progressFunction

    this.domLoader = document.querySelector('.modelLoader')
    this.textLoader = this.domLoader.querySelector('.modelLoader__text')
    this.barLoader = this.domLoader.querySelector('.modelLoader__bar')

    this.progress = 0

    this.initLoading()
  }
  
  initLoading() {
    this.domLoader.classList.add('-show')

    for (let index in this.array) {
      this.array[index].state = 0

      this.gltfLoader.load(
        this.array[index].url,
        // success
        (gltf) =>
        {
          // scale scene :
          gltf.scene.children.forEach((child) => {
            child.scale.set(10,10,10)
          })

          this.array[index].func.call(null, gltf)
        },
        // progression
        (progress) =>
        {
          // console.log('progress', progress)
          const state = progress.loaded / progress.total
          this.array[index].state = state
          // console.log('progress state : ', state)
          
          this.updateProgress()
        },
        // error
        (error) =>
        {
          console.error('error', error)
        }
      )

    }
  }

  updateProgress() {
    let progress = 0

    for (let index in this.array) {
      progress += this.array[index].state
    }

    this.progress = Math.round(progress / this.arrayLength * 100) / 100
    this.progressFunction?.call(null, this.progress)

    this.textLoader.innerText = this.progress * 100 + '%'
    this.barLoader.style.width = this.progress * 100 + '%'

    if (progress === 1) {
      this.domLoader.classList.remove('-show')
    }
  }
}