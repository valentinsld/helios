import gsap, { Expo } from 'gsap'

import AudioManager from './utils/AudioManager'

export default class Intro {
  constructor(game) {
    console.log('Start intro !')
    this.game = game
    this.initIntro()
  }

  initIntro() {
    var tl = gsap.timeline({
      paused: true
    })
    
    var tl2 = gsap.timeline({
      paused: true,
      delay: 1
    })
    
    var tl3 = gsap.timeline({
      paused: true,
      delay: 1,
      // onComplete: start
    })
    
    var tl4 = gsap.timeline({
      paused: true
    })

    var tl5 = gsap.timeline({
      paused: true
    })
    
    
    tl.set("#phaeton", {
      y: 90,
      width: 1400,
      opacity: 0,
      ease: Expo.easeInOut
    })
    
    tl.set("#fragment", {
      x: 140,
      opacity: 0,
      ease: Expo.easeInOut
    })
    
    tl.set("#text1", {
      opacity: 0,
      ease: Expo.easeInOut
    })
    
    tl.set("#text2", {
      opacity: 0,
      ease: Expo.easeInOut
    })

    tl.set("#suite", {
      opacity: 0,
      ease: Expo.easeInOut,
    })
    
    tl.to("#phaeton", 3, {
      y: -10,
      width: 1000,
      opacity: 1
    });
    
    
    tl.to("#fragment", 2, {
      x: -100,
      opacity: 1
    }, "< 2");
    
    
    tl.to("#text1", 2, {
      opacity: 1
    }, "< 1");
    
    
    tl.to("#text2", 2, {
      opacity: 1
    }, "< 1");

    tl.to("#suite", 2, {
      opacity: 1
    }, "< 1");

    
    
    tl2.set("#text1S2", {
      opacity: 0,
      ease: Expo.easeInOut
    });
    
    tl2.set("#text2S2", {
      opacity: 0,
      ease: Expo.easeInOut
    });
    
    tl2.set("#text3S2", {
      opacity: 0,
      ease: Expo.easeInOut
    });
    
    tl2.set("#temple", {
      opacity: 0,
      width: "80%",
      ease: Expo.easeOut
    });

    tl2.set("#suite2", {
      opacity: 0,
      ease: Expo.easeInOut
    });
    
    tl2.to("#temple", 7, {
      opacity: 1,
      width: "100%"
    });
    
    tl2.to("#text1S2", 1, {
      opacity: 1
    }, "< 2");
    
    tl2.to("#text2S2", 2, {
      opacity: 1
    }, "< 1");
    
    
    tl2.to("#text3S2", 2, {
      opacity: 1
    }, "< 1");

    tl2.to("#suite2", 2, {
      opacity: 1
    }, "< 1");
    
    
    tl3.set("#sun", {
      opacity: 0,
      width: "150%",
      ease: Expo.easeInOut
    })
    
    tl3.set("#text1S3", {
      opacity: 0,
      ease: Expo.easeInOut
    })
    
    tl3.set("#text2S3", {
      opacity: 0,
      ease: Expo.easeInOut
    })
    
    tl3.set("#text3S3", {
      opacity: 0,
      ease: Expo.easeInOut
    })
    
    
    tl3.set("#text2S3", {
      opacity: 0,
      ease: Expo.easeInOut
    })

    tl3.set("#suite3", {
      opacity: 0,
      ease: Expo.easeInOut
    })
    
    
    tl3.to("#sun", 10, {
      opacity: 1,
      rotation: "+=60",
      width: "170%"
    }, "< 1");
    
    tl3.to("#text1S3", 1, {
      opacity: 1
    }, "< 2");
    
    
    tl3.to("#text2S3", 2, {
      opacity: 1
    }, "< 1");
    
    
    tl3.to("#text3S3", 1, {
      opacity: 1
    }, "< 1");

    tl3.to("#suite3", 1, {
      opacity: 1
    }, "< 1");
    
  
    tl4.set("#endStart", {
      opacity: 0,
      ease: Expo.easeInOut
    })

    tl4.to("#endStart", 3, {
      opacity: 1
    });

    tl4.set("#baseline", {
      opacity: 0,
      ease: Expo.easeInOut
    })

    tl4.to("#baseline", 3, {
      opacity: 1,
    });

    tl4.set("#baseline", {
      marginTop: "10%",
      ease: Expo.easeInOut
    })

    tl4.to("#baseline", 2, {
      marginTop: "0"
    }, "< 1");

    tl4.set("#playerPhaeton", {
      opacity: 0,
      ease: Expo.easeInOut
    })

    tl4.to("#playerPhaeton", 3, {
      opacity: 1,
    });

    tl4.set("#playerFragment", {
      opacity: 0,
      ease: Expo.easeInOut
    })

    tl4.to("#playerFragment", 3, {
      opacity: 1,
    });


    
    var button = document.getElementById('button')
    var suite = document.getElementById('suite')
    var intro = document.getElementById('intro')
    var scene1 = document.getElementById("scene1")
    var scene2 = document.getElementById('scene2')
    var scene3 = document.getElementById('scene3')
    var startGame = document.getElementById('startGame')
    var endStart = document.getElementById('endStart')
    var introMobile = document.getElementById('introMobile')
    var moreButton = document.getElementById('moreButton')
    var project = document.getElementById('project')
    var suite3 = document.getElementById('suite3')
    
    
    button.addEventListener("click", () => {
      console.log('click')
      intro.classList.add('hide');
      scene1.classList.add('show');
      tl.play();

      // Start sound
      AudioManager.newSound({
        name: 'scene0_ambiance',
        loop: true
      })
    })
    
    suite.addEventListener("click", () => {
      scene1.classList.add('hide');
      scene2.classList.add('show');
      tl2.play();
    })
    
    suite2.addEventListener("click", () => {
      scene2.classList.add('hide');
      scene3.classList.add('show');
      tl3.play();
    })

    suite3.addEventListener("click", () => {
      scene3.classList.add('hidePlay');
      tl4.play();
      // this.game.next();
    })
   
    moreButton.addEventListener("click", () => {
      introMobile.classList.add('hide');
      project.classList.add('show');
    })

    document.addEventListener('keydown', (e) => {
      if (e.code == 'KeyA' || e.code == 'KeyD' ) {
        e.keypress = 'KeyA';
        e.keypress = 'KeyD';
        document.getElementById("keyActivate").innerHTML = 'Activé';
        document.getElementById("keyActivate2").style.display = 'none';
      };
      startGame.classList.add('showPlay');
    });

    startGame.addEventListener("click", () => {
      endStart.classList.add('hide');
      this.game.state.next().style.display = "none"
      this.game.state.currentScene.initScene()
    })

  }
}