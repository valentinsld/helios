import gsap, { Expo } from 'gsap'

export default class Outro {
  constructor() {
    this.initOutro()
  }

  initOutro () {
    var tl = gsap.timeline({
      delay: 1
    })

    var t2 = gsap.timeline({
      paused: true
    })

    tl.set("#adventure", {
      opacity: 0,
      ease: Expo.easeInOut,
    })

    tl.set("#construction", {
      opacity: 0,
      ease: Expo.easeInOut,
    })

    tl.set("#construction2", {
      opacity: 0,
      ease: Expo.easeInOut,
    })

    tl.set("#plus", {
      opacity: 0,
      ease: Expo.easeInOut,
    })
    
    tl.to("#adventure", 3, {
      opacity: 1
    });

    tl.to("#construction", 3, {
      opacity: 1
    }, "< 2");

    tl.to("#construction2", 3, {
      opacity: 1
    });
    
    tl.to("#plus", 3, {
      opacity: 1
    });

    t2.set("#credits", {
      opacity: 0,
      ease: Expo.easeInOut,
    })

    t2.set("#logos", {
      opacity: 0,
      ease: Expo.easeInOut,
    })
    
    t2.to("#credits", 3, {
      opacity: 1
    });
    
    t2.to("#logos", 3, {
      opacity: 1
    });



    var plus = document.getElementById('plus')
    var textOutro = document.getElementById('textOutro')
    var credits = document.getElementById('credits')

    plus.addEventListener("click", () => {
      textOutro.classList.add('hide');
      credits.classList.add('show');
      t2.play();
    })
    
  }
}
