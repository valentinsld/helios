export default class SceneManager {
  constructor(params) {
    const scenesContext = require.context('./', true, /.js$/)
    this.scenes = scenesContext.keys()
      .filter(key => key !== './index.js')
      .map(key => require(`${key}`).default)

    this.params = params
    this.debug = this.params.debug
    this.initDebug()

    this.state = {
      currentSceneIndex: 0,
      currentScene: new this.scenes[0](this.params),
      isTransitioning: false,
    }
  }

  initDebug() {
    this.debug.data.sceneManager = {}
    this.debug.data.sceneManager.nextScene = this.next.bind(this)
    this.debug.data.sceneManager.previousScene = this.previous.bind(this)

    
    const folder = this.debug.addFolder('sceneManager')
    folder.add(this.debug.data.sceneManager,'nextScene')
    folder.add(this.debug.data.sceneManager,'previousScene')
  }

  async previous() {
    const destructed = await this.state.currentScene.destruct()
    this.state.currentScene = new this.scenes[ --this.state.currentSceneIndex ](this.params)
  }

  async next() {
    const destructed = await this.state.currentScene.destruct()
    // console.log(destructed)
    this.state.currentScene = new this.scenes[ ++this.state.currentSceneIndex ](this.params)
  }
}
