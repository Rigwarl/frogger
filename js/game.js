'use strict';

const stage = new createjs.Stage('game-canvas');
const queue = new createjs.LoadQueue();

const tileWidth = 100;
const tileHeight = 83;

const hudText = document.querySelector('#level');
const hudKey = document.querySelector('#key');

const bugs = [];
let hero;
let key;
let door;

let level = 1;
let keyCollected = false;

queue.addEventListener('complete', init);
queue.installPlugin(createjs.Sound);
queue.loadManifest([
  { id: 'hero', src: 'img/char-boy.png' },
  { id: 'grass', src: 'img/grass-block.png' },
  { id: 'water', src: 'img/water-block.png' },
  { id: 'stone', src: 'img/stone-block.png' },
  { id: 'bug', src: 'img/enemy-bug.png' },
  { id: 'key', src: 'img/key.png' },
  { id: 'door', src: 'img/door.png' },
  { id: 'scream', src: 'audio/man-scream.mp3' },
  { id: 'splash', src: 'audio/water-splash.mp3' },
  { id: 'door-open', src: 'audio/door-open.mp3' },
]);

function init() {
  createLevel();
  createKey();
  createHero();
  createBugs();
  createTicker();
  bindKeys();
}

function createLevel() {
  for (let i = 0; i < 6; i++) {
    let type = 'stone';

    if (i === 0) {
      type = 'water';
    } else if (i === 5) {
      type = 'grass';
    }

    for (let j = 0; j < 7; j++) {
      createTile(type, i, j);
    }

    if (i === 0) {
      createDoor();
    }
  }
}

function createTile(type, i, j) {
  const tile = new createjs.Bitmap(queue.getResult(type)).set({
    x: j * tileWidth,
    y: i * tileHeight - 50,
  });
  stage.addChild(tile);
}

function createDoor() {
  door = new createjs.Bitmap(queue.getResult('door')).set({
    x: Math.floor(Math.random() * 7) * tileWidth,
    y: -65,
  });
  stage.addChild(door);
}

function createKey() {
  key = new createjs.Bitmap(queue.getResult('key'));
  resetKey();
  stage.addChild(key);
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
    speed: (Math.random() + 1) * (Math.random() + 1) * 1.5,
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
    if (checkCollision(bug)) {
      gameOver();
    }
  }
}

function checkCollision(obj1, obj2) {
  obj2 = obj2 || hero;

  return obj1.y === obj2.y && 
         obj1.x + tileWidth * 0.75 > obj2.x && 
         obj2.x + tileWidth * 0.75 > obj1.x;
}

function collectKey() {
  key.visible = false;
  keyCollected = true;

  hudKey.appendChild(queue.getResult('key'));
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

  if (checkMove(newX, newY)) {
    hero.x = newX;
    hero.y = newY;
  }
}

function checkMove(newX, newY) {
  if (key.visible && checkCollision(key, { x: newX, y: newY })) {
    collectKey();
  }

  if (newY < 0) {
    if (hero.x === door.x) {
      if (keyCollected) {
        nextLevel();
      }
    } else {
      dive();
    }

    return false;
  }

  return newX >= 0 && 
         newX < stage.canvas.width && 
         newY < stage.canvas.height - 100;
}

function dive() {
  createjs.Sound.play('splash');
  resetHero();
}

function nextLevel() {
  console.log('nextLevel');
  createjs.Sound.play('door-open');
  hudText.innerText = ++level;
  resetLevel();
}

function gameOver() {
  console.log('lost on lvl ' + level);
  createjs.Sound.play('scream');
  hudText.innerText = level = 1;
  resetLevel();
}

function resetLevel() {
  resetHero();
  resetKey();
  door.x = Math.floor(Math.random() * 7) * tileWidth;
}

function resetKey() {
  hudKey.innerHTML = '';
  keyCollected = false;
  key.visible = true;
  key.set({
    x: Math.floor(Math.random() * 7) * tileWidth,
    y: Math.floor(Math.random() * 5) * tileHeight,
  });
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
