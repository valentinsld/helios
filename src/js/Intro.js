export default class Intro{
  constructor(game) {
    console.log('Start intro !')
    console.log(game)
  }
}

$('#button').on('click', function() {
  if ($('#intro').css('opacity') == 0) $('#intro').css('opacity', 1);
  else $('#intro').css('opacity', 0);
});

//game.sceneManager.next()