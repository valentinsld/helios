class Transition {
  constructor () {
    this.dom = document.querySelector('body')

    this.initDiv()
  }

  initDiv () {
    this.div = document.createElement('div')
    this.div.classList.add('transition')

    this.dom.append(this.div)
  }

  async fade (time = 800) {
    this.div.style.transitionDuration = time + 'ms'
    window.requestAnimationFrame(() => {
      this.div.classList.add('-fade')
    })


    return new Promise(resolve => {
      setTimeout(() => {
        this.div.classList.remove('-fade')
        
        resolve(true);
      }, time + 300);
    });
  }
}

export default new Transition()