const DOM = document.querySelector('body')
const MENU_DOM = document.querySelector('#ModelMenu')
const MIN_DURATION = 5000

class CAMERA {
  constructor () {
    this.random = Math.random()
  }

  init (camera) {
    this.camera = camera
  }

  getPos2D(el) {
    if (!this.camera) {
      console.error('No camera')
      return false
    }
    const visibleWidth = this.camera.right - this.camera.left
    const visibleHeight = this.camera.top - this.camera.bottom

    // this will give us position relative to the world
    const p = el.clone()

    // determine where in the visible area the sphere is,
    // with percX=0 meaning the left edge and 1 meaning the right
    // and percY=0 meaning top and 1 meaning bottom
    const percX = (p.x - this.camera.left) / visibleWidth
    const percY = 1 - ((p.y - this.camera.bottom) / visibleHeight)

    // scale these values to our viewport size
    const left = percX * window.innerWidth
    const top = percY * window.innerHeight
    console.log(left, top)

    return {
      x: left,
      y: top
    }
  }
}

export const menuContextuelsCamera =  new CAMERA()

class Menu {
  constructor ({ text = 'No text', position = {x: 0, y: 0, z: 0} }) {
    this.text = text
    this.position = position
    this.camera = menuContextuelsCamera
    
    this.init()
  }
  
  init () {
    this.initTime = new Date()

    // init DOM
    this.el = MENU_DOM.cloneNode(true)
    this.el.removeAttribute('id')
    this.el.removeAttribute('hidden')

    // add text
    this.el.querySelector('.MenuContextuel__content').innerHTML = this.text
    DOM.append(this.el)

    const pos = this.camera.getPos2D(this.position)
    this.el.style.left = pos.x + 'px'
    this.el.style.top = pos.y + 'px'

    // animation
    setTimeout(() => {
      this.el.classList.add('-see')
    }, 50);
  }

  remove () {
    const nowDate = new Date()
    const delay = Math.max(MIN_DURATION - (nowDate - this.initTime), 0)

    setTimeout(() => {
      this.el.classList.remove('-see')
    }, delay);

    setTimeout(() => {
      this.el.remove()
    }, delay + 800);
  }
}

class MenuContextuels {
  constructor() {
    this.menus = {}
  }

  addMenu ({id, text, position}) {
    if (this.menus[id]) return

    this.menus[id] = new Menu({text, position})
  }

  removeMenu(id) {
    this.menus[id].remove()
  }
}

export default new MenuContextuels()