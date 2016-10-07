const TILE_WIDTH = 100;
const TILE_HEIGHT = 83;
const TILE_OFFSET_Y = 9;

const stage = new createjs.Stage('game-canvas');
const queue = new createjs.LoadQueue();

queue.addEventListener('complete', startGame);
queue.loadManifest([
  { id: 'hero', src: 'img/char-boy.png' },
  { id: 'bug', src: 'img/bug.png' },
  { id: 'key', src: 'img/key.png' },
  { id: 'door', src: 'img/door.png' },
  { id: 'grass', src: 'img/tile-grass.png' },
  { id: 'stone', src: 'img/tile-stone.png' },
  { id: 'water', src: 'img/tile-water.png' },
]);

function startGame() {
  for (let i = 0; i < 6; i++) {
    let type = 'stone';
    if (i === 0) {
      type = 'water';
    } else if (i === 5) {
      type = 'grass';
    }

    createLevel(type, i);
  }

  const hero = new createjs.Bitmap(queue.getResult('hero'));
  hero.y = TILE_HEIGHT * 5;
  stage.addChild(hero);

  const bug = new createjs.Bitmap(queue.getResult('bug'));
  bug.y = TILE_HEIGHT * 2;
  bug.x = TILE_WIDTH;
  stage.addChild(bug);

  const key = new createjs.Bitmap(queue.getResult('key'));
  key.y = TILE_HEIGHT;
  key.x = TILE_WIDTH * 2;
  stage.addChild(key);

  const door = new createjs.Bitmap(queue.getResult('door'));
  door.x = TILE_WIDTH * 4;
  stage.addChild(door);

  stage.update();
}

function createLevel(type, i) {
  for (let j = 0; j < 7; j++) {
    createTile(type, i, j);
  }
}

function createTile(type, i, j) {
  const tile = new createjs.Bitmap(queue.getResult(type));
  tile.x = TILE_WIDTH * j;
  tile.y = TILE_HEIGHT * i - TILE_OFFSET_Y;
  stage.addChild(tile);
}
