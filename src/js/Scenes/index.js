export default class SceneManager {
  constructor(params) {
    const scenesContext = require.context('./', true, /.js$/)
    this.scenes = scenesContext.keys()
      .filter(key => key !== './index.js')
      .map(key => require(`${key}`).default)

    this.params = params
    this.params.sceneManager = this

    if (this.params.debug) {
      this.initDebug()
    }

    this.state = {
      currentSceneIndex: 0,
      currentScene: new this.scenes[0](this.params),
      isTransitioning: false,
    }
  }

  initDebug() {
    this.debug = this.params.debug

    this.debug.data.sceneManager = {}
    this.debug.data.sceneManager.nextScene = this.next.bind(this)
    this.debug.data.sceneManager.previousScene = this.previous.bind(this)

    
    const folder = this.debug.addFolder('sceneManager')
    folder.add(this.debug.data.sceneManager,'nextScene')
    folder.add(this.debug.data.sceneManager,'previousScene')
  }

  async previous() {
    if (this.currentSceneIndex === 0) return
    
    const destructed = await this.state.currentScene.destruct()
    this.state.currentScene = new this.scenes[ --this.state.currentSceneIndex ](this.params)
  }

  async next() {
    if (this.currentSceneIndex === this.scenes.length) return

    const destructed = await this.state.currentScene.destruct()
    this.state.currentScene = new this.scenes[ ++this.state.currentSceneIndex ](this.params)
  }
}
