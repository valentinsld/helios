import gsap from 'gsap'
import {
  Expo
} from "gsap";

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
      delay: 3,
      onComplete: start
    })
    
    var tl4 = gsap.timeline({
      paused: true,
      delay: 1,
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
    
    
    tl.to("#phaeton", 6, {
      y: -10,
      width: 1000,
      opacity: 1
    });
    
    
    tl.to("#fragment", 7, {
      x: -100,
      opacity: 1
    }, "< 2");
    
    
    tl.to("#text1", 7, {
      opacity: 1
    }, "< 3");
    
    
    tl.to("#text2", 7, {
      opacity: 1
    }, "< 1");
    
    
    
    
    
    
    tl2.set("#scene1", {
      opacity: 1,
      ease: Expo.easeInOut
    });
    
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
      ease: Expo.easeInOut
    });
    
    tl2.to("#scene1", {
      opacity: 0
    });
    
    tl2.to("#temple", 10, {
      opacity: 1,
      width: "100%"
    }, "< 1");
    
    tl2.to("#text1S2", 2, {
      opacity: 1
    }, "< 2");
    
    tl2.to("#text2S2", 2, {
      opacity: 1
    }, "< 2");
    
    
    tl2.to("#text3S2", 2, {
      opacity: 1
    }, "< 1");
    
    
    tl3.set("#sun", {
      opacity: 0,
      width: "140%",
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
    
    
    tl3.to("#sun", 13, {
      opacity: 1,
      rotation: "+=60",
      width: "170%"
    });
    
    tl3.to("#text1S3", 3, {
      opacity: 1
    }, "< 2");
    
    
    tl3.to("#text2S3", 3, {
      opacity: 1
    }, "< 3");
    
    
    tl3.to("#text3S3", 3, {
      opacity: 1
    }, "< 4");
    
    
    
    tl4.set("#endStart", {
      opacity: 0,
      ease: Expo.easeInOut
    })
    tl4.to("#endStart", 3, {
      opacity: 1
    });
    
    
    var button = document.getElementById('button')
    var suite = document.getElementById('suite')
    var intro = document.getElementById('intro')
    var scene1 = document.getElementById("scene1")
    var scene2 = document.getElementById('scene2')
    var scene3 = document.getElementById('scene3')
    var startGame = document.getElementById('startGame')
    var endStart = document.getElementById('endStart')
    
    button.addEventListener("click", () => {
      console.log('click')
      intro.classList.add('hide');
      scene1.classList.add('show');
      tl.play();
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
    
    function start() {
      scene3.classList.add('hide');
      tl4.play();
    }
    
    startGame.addEventListener("click", () => {
      endStart.classList.add('hide');
      this.game.next()  
    })
    
  }
}


