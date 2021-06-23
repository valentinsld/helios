# Helios

Tester l'experience : [helios.vercel.app](https://helios.vercel.app/)

## Qu'est ce que c'est ?
Hélios est un projet de jeu multijoueur sur navigateur, revisitant le mythe de Phaéton dans une aventure à la recherche du soleil. Se jouant à deux, il vise à recréer un lien après l’isolement imposé par l’épidemie de coronavirus.


Réalisation par :
- [Lisa LEVAVASSEUR](http://lisalevavasseur.fr/) (DA)
- [Victor SOULIE](https://victor-soulie.com/) (DA)
- [Vanina IDIART](http://vaninaidiart.fr/) {DEV}
- [Valentin SALAUD](https://valentinsld.fr/) {DEV}


## Technos utiliser pour le site web

- MatterJS : moteur de physique 2D
- THREE JS : moteur de rendu 3D
- Vercel : plateform pour deployer l'application


## Architecture du projet
``` bash
../
  ./src
    ./css
    ./glsl
    ./js 
      ./libs
      ./Characters
      ./Elements
      ./Scenes
      Game.js
      Intro.js
    index.html
    script.js
    style.css
  ./static
    ./fonts
    ./img
    ./models
    ./sounds
```

## Installer le projet
Pour lancer ce projet:

``` bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```

*Réalisation dans le cadre du projet de fin d'année aux Gobelins, l’école de l’Image*