(function(){
  'use strict';

  var TILE_WIDTH = 100;
  var TILE_HEIGHT = 83;

  var hudLevel = document.querySelector('#level');
  var hudKey = document.querySelector('#key');

  var stage = new createjs.Stage('game-canvas');
  var queue = new createjs.LoadQueue();

  var preloader;
  var hero;
  var key;
  var door;
  var bugs = [];

  var level = 1;
  var keyCollected = false;

  init();

  function init() {
    queue.addEventListener('complete', start);
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

    createPreloader();
    createTicker();
  }

  function createPreloader() {
    preloader = new createjs.Text('Loading... 0%', '35px Arial', '#000').set({
      x: stage.canvas.width / 2,
      y: stage.canvas.height / 2,
      textAlign: 'center',
      textBaseline: 'middle',
    });
    queue.addEventListener('progress', movePreloader);

    stage.addChild(preloader);
  }

  function movePreloader(e) {
    preloader.text = 'Loading... ' + Math.floor(e.progress * 100) + '%';
  }

  function removePreloader() {
    queue.removeEventListener('progress', movePreloader);
    stage.removeChild(preloader);
    preloader = null;
  }

  function start() {
    removePreloader();
    createLevel();
    createBugs();
    createHero();
    setLevel(1);
    bindKeys();
    bindTouch();
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
      x: j * TILE_WIDTH,
      y: i * TILE_HEIGHT - 50,
    });
    stage.addChild(tile);
  }

  function createDoor() {
    door = new createjs.Bitmap(queue.getResult('door'));
    door.y = -65;
    stage.addChild(door);
  }

  function resetDoor() {
    door.x = Math.floor(Math.random() * 6 + 1) * TILE_WIDTH;
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
      x: Math.floor(Math.random() * 6 + 1) * TILE_WIDTH,
      y: Math.floor(Math.random() * 4) * TILE_HEIGHT,
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
      x: - (Math.random() + 1) * TILE_WIDTH,
      y: Math.floor(Math.random() * 4) * TILE_HEIGHT,
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
    hero.x = TILE_WIDTH * 3;
    hero.y = TILE_HEIGHT * 4;
  }

  function setLevel(lvl) {
    level = lvl;
    hudLevel.innerText = 'Level: ' + lvl;

    resetHero();
    resetKey();
    resetDoor();
  }

  function bindKeys() {
    var actions = {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down',
    };

    window.addEventListener('keydown', function(e) {
      moveHero(actions[e.keyCode]);
    });
  }

  function bindTouch() {
    var touch;
    var x;
    var y;

    stage.canvas.addEventListener('touchstart', function(e) {
      if (e.touches.length !== 1) {
        return;
      }

      touch = e.changedTouches[0];
      x = touch.pageX;
      y = touch.pageY;
    });

    stage.canvas.addEventListener('touchend', function(e) {
      touch = e.changedTouches[0];

      var dX = touch.pageX - x;
      var dY = touch.pageY - y;
      var action;

      if (Math.abs(dX) > Math.abs(dY)) {
        if (dX > 0) {
          action = 'right';
        } else {
          action = 'left';
        }
      } else {
        if (dY > 0) {
          action = 'down';
        } else {
          action = 'up';
        }
      }

      moveHero(action);
    });

    stage.canvas.addEventListener('touchmove', function(e) {
      e.preventDefault();
    });
  }

  function moveHero(action) {
    var newX = hero.x;
    var newY = hero.y;

    switch (action) {
      case 'left':
        newX -= TILE_WIDTH;
        break;
      case 'right':
        newX += TILE_WIDTH;
        break;
      case 'up':
        newY -= TILE_HEIGHT;
        break;
      case 'down':
        newY += TILE_HEIGHT;
        break;
    }

    if (tryMove(newX, newY)) {
      hero.x = newX;
      hero.y = newY;
    }
  }

  function tryMove(newX, newY) {
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
           obj1.x + TILE_WIDTH * 0.75 > obj2.x && 
           obj2.x + TILE_WIDTH * 0.75 > obj1.x;
  }

  function dive() {
    createjs.Sound.play('splashSound');
    resetHero();
  }

  function nextLevel() {
    createjs.Sound.play('doorSound');
    setLevel(++level);
    console.log('level ' + level);

    if (level % 3 === 0) {
      createBug();
    }
  }

  function gameOver() {
    console.log('lost on lvl ' + level);
    createjs.Sound.play('screamSound');
    setLevel(1);
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
    for (var i = 0; i < bugs.length; i++) {
      var bug = bugs[i];
      bug.x += bug.speed * delta / 10;
      if (bug.x > stage.canvas.width) {
        setBug(bug);
      }
    }
  }

  function checkHit() {
    for (var i = 0; i < bugs.length; i++) {
      if (checkCollision(bugs[i])) {
        gameOver();
      }
    }
  }
})();
