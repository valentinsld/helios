export default class Intro {
  constructor(game) {
    console.log('Start intro !')
    console.log(game)
  }
}

var tl = new TimelineLite({
  paused: true,
  delay: 3
})

var tlF = new TimelineLite({
  paused: true,
  delay: 4
})

var tlT1 = new TimelineLite({
  paused: true,
  delay: 5
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

var tlTemple = new TimelineLite({
  paused: true,
  delay: 5
})

var tlSun = new TimelineLite({
  paused: true,
  delay: 7,
  onComplete : start
})

var tlText1S3 = new TimelineLite({
  paused: true,
  delay: 8,
  onComplete : start
})

var tlText2S3 = new TimelineLite({
  paused: true,
  delay: 9,
  onComplete : start
})

var tlText3S3 = new TimelineLite({
  paused: true,
  delay: 10,
  onComplete : start
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

tlTemple.set("#temple", {
    opacity: 0,
    width: "80%",
    ease: Expo.easeInOut
  })
  .to("#temple", 8, {
    opacity: 1,
    width: "100%"
  });

tlSun.set("#sun", {
    opacity: 0,
    width: "140%",
    ease: Expo.easeInOut
  })
  .to("#sun", 10, {
    opacity: 1,
    rotation: "+=60",
    width: "170%"
  });

tlText1S3.set("#text1S3", {
    opacity: 0,
    ease: Expo.easeInOut
  })
  .to("#text1S3", 3, {
    opacity: 1
  });

tlText2S3.set("#text2S3", {
    opacity: 0,
    ease: Expo.easeInOut
  })
  .to("#text2S3", 3, {
    opacity: 1
  });

tlText3S3.set("#text3S3", {
    opacity: 0,
    ease: Expo.easeInOut
  })
  .to("#text3S3", 3, {
    opacity: 1
  });


$("#button").on("click", function () {
  $('#intro').delay(500).fadeOut(2000);
  $('#scene1').delay(500).fadeIn(2000);
  tl.play();
  tlF.play();
  tlT1.play();
  tlT2.play();
})

$("#suite").on("click", function () {
  tlS1.play();
})


$("#suite").on("click", function () {
  $('#scene1').delay(500).fadeOut(2000);
  tlText1S2.play();
  tlText2S2.play();
  tlText3S2.play();
  tlTemple.play();
})


$("#suite2").on("click", function () {
  $('#scene2').delay(500).fadeOut(4000)
  tlSun.play();
  tlText1S3.play();
  tlText2S3.play();
  tlText3S3.play();
})

function start() {
  $('#scene3').delay(500).fadeOut(4000)
}

// $('#scene1').delay(5000).fadeOut(4000);


//game.sceneManager.next()