import gsap from 'gsap'

export default class Cursor {
  constructor() {
    this.body = document.querySelector('body')

    this.scale = 1
    this.animation = null

    this.disableCursor()
    this.createElement()
  }

  disableCursor () {
    this.body.style.cursor = 'none'

    //
    if (document.querySelector('#cursor')) {
      document.querySelector('#cursor').remove()
    }
  }

  createElement () {
    this.el = document.createElement('div')
    this.el.id = 'cursor'

    this.body.appendChild(this.el)
  }

  hover (inOut) {
    if (inOut) { // in
      this.animation?.kill()

      this.animation = gsap.to(
        this,
        {
          scale: 2.2,
          duration: 0.3,
          onComplete: () => {
            this.animation = null
          }
        }
      )
    } else { // out
      this.animation = gsap.to(
        this,
        {
          scale: 1,
          duration: 0.3,
          onComplete: () => {
            this.animation = null
          }
        }
      )
    }
  }

  // update
  update (x, y) {
    this.el.style.transform = `translate3d(${x}px, ${y}px, 0px) scale(${this.scale})`
  }
}