'use strict';

const stage = new createjs.Stage('game-canvas');
const queue = new createjs.LoadQueue();
const tileWidth = 100;
const tileHeight = 83;
const bugs = [];
const levelText = document.querySelector('#level');
let level = 1;
let hero;

queue.addEventListener('complete', init);
queue.installPlugin(createjs.Sound);
queue.loadManifest([
  { id: 'hero', src: 'img/char-boy.png' },
  { id: 'grass', src: 'img/grass-block.png' },
  { id: 'water', src: 'img/water-block.png' },
  { id: 'stone', src: 'img/stone-block.png' },
  { id: 'bug', src: 'img/enemy-bug.png' },
  { id: 'scream', src: 'audio/man-scream.mp3' },
  { id: 'splash', src: 'audio/water-splash.mp3' },
]);

function init() {
  createLevel();
  createHero();
  createBugs();
  createTicker();
  bindKeys();
}

function createLevel() {
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 6; j++) {
      let type = 'stone';
      if (j === 0) {
        type = 'water';
      } else if (j === 5) {
        type = 'grass';
      }

      const tile = new createjs.Bitmap(queue.getResult(type)).set({
        x: i * tileWidth,
        y: j * tileHeight - 50,
      });
      stage.addChild(tile);
    }
  }
}

function createHero() {
  hero = new createjs.Bitmap(queue.getResult('hero'));
  resetHero();
  stage.addChild(hero);
}

function resetHero() {
  hero.x = tileWidth * 3;
  hero.y = tileHeight * 4;
}

function createBugs() {
  for (let i = 0; i < 5; i++) {
    const bug = new createjs.Bitmap(queue.getResult('bug'));
    setBug(bug);

    bugs.push(bug);
    stage.addChild(bug);
  }
}

function setBug(bug) {
  bug.set({
    x: - (Math.random() + 1) * tileWidth,
    y: Math.floor(Math.random() * 4) * tileHeight,
    speed: (Math.random() + 1) * (Math.random() + 1) * (2 + level * 0.05),
  });
}

function moveBugs() {
  for (const bug of bugs) {
    bug.x += bug.speed;
    if (bug.x > stage.canvas.width) {
      setBug(bug);
    }
  }
}

function checkHit() {
  for (const bug of bugs) {
    if (bug.y === hero.y && 
        bug.x + tileWidth * 0.75 > hero.x && 
        hero.x + tileWidth * 0.75 > bug.x) {
      gameOver();
    }
  }
}

function bindKeys() {
  window.addEventListener('keydown', function(e) {
    const actions = {
      37: 'left',
      38: 'top',
      39: 'right',
      40: 'bottom',
    };

    moveHero(actions[e.keyCode]);
  });
}

function moveHero(action) {
  let newX = hero.x;
  let newY = hero.y;

  switch (action) {
    case 'left':
      newX -= tileWidth;
      break;
    case 'right':
      newX += tileWidth;
      break;
    case 'top':
      newY -= tileHeight;
      break;
    case 'bottom':
      newY += tileHeight;
      break;
  }

  if (newY < 0) {
    gameWin();
  } else {
    hero.x = newX >= 0 && newX < stage.canvas.width ? newX : hero.x;
    hero.y = newY < stage.canvas.height - 100 ? newY : hero.y;
  }
}

function gameWin() {
  console.log('win');
  createjs.Sound.play('splash');
  levelText.innerText = ++level;
  resetHero();
}

function gameOver() {
  console.log('lost');
  createjs.Sound.play('scream');
  levelText.innerText = level = 1;
  resetHero();
}

function createTicker() {
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.framerate = 60;
  createjs.Ticker.addEventListener('tick', function() {
    moveBugs();
    checkHit();
    stage.update();
  });
}














