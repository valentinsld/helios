import gsap from 'gsap'

const TEXTS = [
  [
    'Scene1 -> Scene 2',
    'Jamais le soleil n’avait rayonné si proche de la Terre ...',
    'Sans l’intervention de Zeus, ciel, terre et océans se seraient changés en flammes.'
  ],
  [
    'Scene2 -> Scene 3',
    'Jamais le soleil n’avait rayonné si proche de la Terre ...',
    'Sans l’intervention de Zeus, ciel, terre et océans se seraient changés en flammes.'
  ]
  ,
  [
    'Scene3 -> Scene 4',
    'Jamais le soleil n’avait rayonné si proche de la Terre ...',
    'Sans l’intervention de Zeus, ciel, terre et océans se seraient changés en flammes.'
  ]
]

class Transition {
  constructor () {
    this.el = document.querySelector('.transition')
    this.elContainerText = this.el.querySelector('.transition__texts')
  }

  async fadeIn (textIndex, duration = 6000, time = 800) {
    this.timeStartAnimation = new Date()
    this.minDuration = duration

    // add text
    this.elContainerText.innerHTML = ''
    const paragraphes = []
    TEXTS[textIndex].forEach((text) => {
      const paragraphe = document.createElement('p')
      paragraphe.innerHTML = text

      this.elContainerText.append(paragraphe)
      paragraphes.push(paragraphe)
    })

    // animation
    gsap.to(
      this.el,
      {
        opacity: 1,
        duration: time / 1000
      }
    )

    return new Promise(resolve => {
      setTimeout(() => {      
        resolve(true);
      }, time + 300);
    });
  }

  async fadeOut (funcEnd, time = 500) {
    // calculer delay before play animation
    const nowDate = new Date()
    const delay = Math.max(this.minDuration - (nowDate - this.timeStartAnimation), 0) / 1000
    console.log(delay)


    // animation
    this.el.style.transitionDuration = ''
    const tl = gsap.timeline()

    tl.to(
      this.el,
      {
        opacity: 0,
        delay,
        duration: time / 1000,
        onComplete: funcEnd
      }
    )

  }
}

export default new Transition()