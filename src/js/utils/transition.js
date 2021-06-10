import gsap from 'gsap'

const TEXTS = [
  [
    // 'Scene1 -> Scene 2',
    'La lumière est revenue.'
  ],
  [
    // 'Scene2 -> Scene 3',
    'Dans le ciel, Hélios et son char ont repris leur course.',
    'Le soleil est redevenu complet ....'
  ]
  ,
  [
    // 'Scene3 -> Scene 4',
    'Nous avons réussi notre quête.'
  ]
]

class Transition {
  constructor () {
    this.el = document.querySelector('.transition')
    this.elContainerText = this.el.querySelector('.transition__texts')
  }

  async fadeIn (textIndex, duration = 7000, time = 800) {
    this.timeStartAnimation = new Date()
    this.minDuration = duration

    // add text
    this.elContainerText.innerHTML = ''
    this.elContainerText.classList.remove('-solo')
    this.paragraphes = []
    TEXTS[textIndex].forEach((text) => {
      const paragraphe = document.createElement('p')
      paragraphe.innerHTML = text

      this.elContainerText.append(paragraphe)
      this.paragraphes.push(paragraphe)
    })
    if (TEXTS[textIndex].length === 1) {
      this.elContainerText.classList.add('-solo')
    }

    // animation
    const tl = gsap.timeline()
    tl.to(
      this.el,
      {
        opacity: 1,
        delay: 1,
        duration: time / 1000
      }
    )
    tl.to(
      this.paragraphes,
      {
        opacity: 1,
        y: 0,
        delay: 0.5,
        duration: 1.5,
        ease: 'Power4.out',
        stagger: 1.3
      }
    )

    return new Promise(resolve => {
      setTimeout(() => {      
        resolve(true);
      }, time + 1000);
    });
  }

  async fadeOut (funcEnd, time = 500) {
    // calculer delay before play animation
    const nowDate = new Date()
    const delay = Math.max(this.minDuration - (nowDate - this.timeStartAnimation), 0) / 1000
    console.log(delay)


    // animation
    this.el.style.transitionDuration = ''
    const tl = gsap.timeline({ delay })

    tl.to(
      this.paragraphes,
      {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'Power4.out',
        stagger: 0.2
      }
    )
    tl.to(
      this.el,
      {
        opacity: 0,
        duration: time / 1000,
        onComplete: funcEnd
      }
    )

  }
}

export default new Transition()