'use strict';

var stage = new createjs.Stage('game-canvas');
var queue = new createjs.LoadQueue();

var tileWidth = 100;
var tileHeight = 83;

var hudText = document.querySelector('#level');
var hudKey = document.querySelector('#key');

var bugs = [];
var hero;
var key;
var door;

var level = 1;
var keyCollected = false;

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
  { id: 'screamSound', src: 'audio/man-scream.mp3' },
  { id: 'keySound', src: 'audio/key-pickup.mp3' },
  { id: 'splashSound', src: 'audio/water-splash.mp3' },
  { id: 'doorSound', src: 'audio/door-open.mp3' },
]);

function init() {
  createLevel();
  createBugs();
  createHero();
  resetLevel();

  bindKeys();
  createTicker();
}

function createLevel() {
  for (var i = 0; i < 6; i++) {
    var type = 'stone';

    if (i === 0) {
      type = 'water';
    } else if (i === 5) {
      type = 'grass';
    }

    for (var j = 0; j < 7; j++) {
      createTile(type, i, j);
    }

    if (i === 0) {
      createDoor();
    }
  }
  createKey();
}

function createTile(type, i, j) {
  var tile = new createjs.Bitmap(queue.getResult(type)).set({
    x: j * tileWidth,
    y: i * tileHeight - 50,
  });
  stage.addChild(tile);
}

function createDoor() {
  door = new createjs.Bitmap(queue.getResult('door'));
  door.y = -65;
  stage.addChild(door);
}

function resetDoor() {
  door.x = Math.floor(Math.random() * 6 + 1) * tileWidth;
}

function createKey() {
  key = new createjs.Bitmap(queue.getResult('key'));
  stage.addChild(key);
}

function resetKey() {
  hudKey.innerHTML = '';
  keyCollected = false;
  key.visible = true;
  key.set({
    x: Math.floor(Math.random() * 6 + 1) * tileWidth,
    y: Math.floor(Math.random() * 4) * tileHeight,
  });
}

function collectKey() {
  createjs.Sound.play('keySound');
  key.visible = false;
  keyCollected = true;

  hudKey.appendChild(queue.getResult('key'));
}

function createBugs() {
  for (var i = 0; i < 5; i++) {
    createBug();
  }
}

function createBug() {
  var bug = new createjs.Bitmap(queue.getResult('bug'));
  setBug(bug);

  bugs.push(bug);
  stage.addChild(bug);
}

function setBug(bug) {
  bug.set({
    x: - (Math.random() + 1) * tileWidth,
    y: Math.floor(Math.random() * 4) * tileHeight,
    speed: (Math.random() + 1) * (Math.random() + 1),
  });
}

function resetBugs() {
  bugs.splice(5).forEach(function(bug) {
    stage.removeChild(bug);
  });
  bugs.forEach(setBug);
}

function createHero() {
  hero = new createjs.Bitmap(queue.getResult('hero'));
  stage.addChild(hero);
}

function resetHero() {
  hero.x = tileWidth * 3;
  hero.y = tileHeight * 4;
}

function resetLevel() {
  resetHero();
  resetKey();
  resetDoor();
}

function bindKeys() {
  var actions = {
    37: 'left',
    38: 'top',
    39: 'right',
    40: 'bottom',
  };

  window.addEventListener('keydown', function(e) {
    moveHero(actions[e.keyCode]);
  });
}

function moveHero(action) {
  var newX = hero.x;
  var newY = hero.y;

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

function checkCollision(obj1, obj2) {
  obj2 = obj2 || hero;

  return obj1.y === obj2.y && 
         obj1.x + tileWidth * 0.75 > obj2.x && 
         obj2.x + tileWidth * 0.75 > obj1.x;
}

function dive() {
  createjs.Sound.play('splashSound');
  resetHero();
}

function nextLevel() {
  createjs.Sound.play('doorSound');
  hudText.innerText = ++level;
  resetLevel();
  console.log('level ' + level);

  if (level % 3 === 0) {
    createBug();
  }
}

function gameOver() {
  console.log('lost on lvl ' + level);
  createjs.Sound.play('screamSound');
  hudText.innerText = level = 1;
  resetLevel();
  resetBugs();
}

function createTicker() {
  createjs.Ticker.timingMode = createjs.Ticker.RAF;
  createjs.Ticker.addEventListener('tick', function(e) {
    if (e.delta > 1000) {
      return;
    }

    moveBugs(e.delta);
    checkHit();
    stage.update();
  });
}

function moveBugs(delta) {
  for (var bug of bugs) {
    bug.x += bug.speed * delta / 10;
    if (bug.x > stage.canvas.width) {
      setBug(bug);
    }
  }
}

function checkHit() {
  for (var bug of bugs) {
    if (checkCollision(bug)) {
      createjs.Ticker.paused = true;
      gameOver();
    }
  }
}
