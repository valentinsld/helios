export default class Intro {
  constructor(game) {
    console.log('Start intro !')
    console.log(game)
  }
}


// TweenMax.from(".header h1", 3, {
//   left: "-140%",
//   ease: Expo.easeInOut,
//   delay: 3.4,
// });
// TweenMax.staggerFrom(
//   ".images > div",
//   1, {
//     y: "60",
//     opacity: 0,
//     ease: Power2.easeOut,
//     delay: 6,
//   },
//   0.2
// );

// TweenMax.staggerFrom(
//   ".header > p",
//   1, {
//     y: "60",
//     opacity: 0,
//     ease: Power2.easeOut,
//     delay: 5.6,
//   },
//   0.2
// );

var tl = new TimelineLite({
  paused: true
})

var tlF = new TimelineLite({
  paused: true,
})

var tlT1 = new TimelineLite({
  paused: true,
  delay: 3
})

var tlT2 = new TimelineLite({
  paused: true,
  delay: 6
})

var tlS1 = new TimelineLite({
  paused: true,
  delay: 6
})

var tlText1S2 = new TimelineLite({
  paused: true,
  delay: 3
})

var tlText2S2 = new TimelineLite({
  paused: true,
  delay: 4
})

var tlText2S2 = new TimelineLite({
  paused: true,
  delay: 5
})

var tlText3S2 = new TimelineLite({
  paused: true,
  delay: 6
})

tl.set("#phaeton", {
    y: 90,
    width: 1400,
    opacity: 0,
    ease: Expo.easeInOut
  })
  .to("#phaeton", 10, {
    y: -10,
    width: 1000,
    opacity: 1
  });

tlF.set("#fragment", {
    x: 140,
    opacity: 0,
    ease: Expo.easeInOut
  })
  .to("#fragment", 12, {
    x: -100,
    opacity: 1
  });

tlT1.set("#text1", {
    opacity: 0,
    ease: Expo.easeInOut
  })
  .to("#text1", 8, {
    opacity: 1
  });

tlT2.set("#text2", {
    opacity: 0,
    ease: Expo.easeInOut
  })
  .to("#text2", 11, {
    opacity: 1
  });


tlS1.set("#scene1", {
    opacity: 1,
    ease: Expo.easeInOut
  })
  .to("#scene1", 3, {
    opacity: 0
  });

tlText1S2.set("#text1S2", {
    opacity: 0,
    ease: Expo.easeInOut
  })
  .to("#text1S2", 3, {
    opacity: 1
  });

  tlText2S2.set("#text2S2", {
    opacity: 0,
    ease: Expo.easeInOut
  })
  .to("#text2S2", 3, {
    opacity: 1
  });

  tlText3S2.set("#text3S2", {
    opacity: 0,
    ease: Expo.easeInOut
  })
  .to("#text3S2", 3, {
    opacity: 1
  });



$("#button").on("click", function () {
  tl.play();
  tlF.play();
  tlT1.play();
  tlT2.play();
})

$("#suite").on("click", function () {
  tlS1.play();
})


$("#phaeton").on("click", function () {
  $('#scene1').delay(500).fadeOut(2000);
  document.getElementById('scene1').style.display = 'none';
  tlText1S2.play();
  tlText2S2.play();
  tlText3S2.play();
})



// $('#scene1').delay(5000).fadeOut(4000);


//game.sceneManager.next()