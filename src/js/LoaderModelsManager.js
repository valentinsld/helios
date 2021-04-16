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

    this.updateProgress()
    this.initLoading()
  }
  
  initLoading() {
    this.domLoader.classList.add('-show')

    for (let index in this.array) {
      this.array[index].state = 0

      this.gltfLoader.load(
        this.array[index].url,
        // success
        async (gltf) =>
        {
          const create = await this.array[index].func.call(null, gltf)
          // console.log(create)

          this.updateProgress()
        },
        // progression
        (progress) =>
        {
          // console.log('progress', progress)
          // const state = progress.loaded / progress.total
          // this.array[index].state = state
          // console.log('progress state : ', state)
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
    this.progress +=1

    const progress = this.progress / this.arrayLength

    this.textLoader.innerText = progress * 100 + '%'
    this.barLoader.style.width = progress * 100 + '%'

    // console.log(progress)
    if (progress === 1) {
      setTimeout(() => {
        console.log('ENDED', this.domLoader)
        this.domLoader.classList.remove('-show')
      }, 500)
    }
  }
}