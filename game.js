const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const TILE_SIZE = 40;
const GRID = 10;

const TILE = {
  PATH: 0,
  WALL: 1,
  SWORD: 2,
  GOAL: 3,
  ENEMY: 4,
  TRAP: 5,
  SAKE: 6
};

let map = [];
let player = { x: 0, y: 0 };
let swords = 0;
let hearts = 3;
let gameOver = false;

// Load images
const images = {
  zoro: new Image(),
  wall: new Image(),
  sword: new Image(),
  goal: new Image(),
  enemy: new Image(),
  trap: new Image(),
  sake: new Image(),
  heart: new Image()
};

let loadedImages = 0;
const totalImages = Object.keys(images).length;

function checkImagesLoaded() {
  loadedImages++;
  if (loadedImages === totalImages) {
    generateMap();
    draw();
  }
}

// Assign image sources (make sure these files are in the "assets" folder)
images.zoro.src = "zoro.png";
images.wall.src = "wall.png";
images.sword.src = "sword.png";
images.goal.src = "goal.png";
images.enemy.src = "enemy.png";
images.trap.src = "trap.png";
images.sake.src = "sake.png";
images.heart.src = "heart.png";

// Wait for all images to load
for (let key in images) {
  images[key].onload = checkImagesLoaded;
}

function generateMap() {
  map = [];
  for (let y = 0; y < GRID; y++) {
    const row = [];
    for (let x = 0; x < GRID; x++) {
      const rand = Math.random();
      if (rand < 0.4) row.push(TILE.WALL);
      else if (rand < 0.45) row.push(TILE.SWORD);
      else if (rand < 0.5) row.push(TILE.ENEMY);
      else if (rand < 0.55) row.push(TILE.TRAP);
      else if (rand < 0.6) row.push(TILE.SAKE);
      else row.push(TILE.PATH);
    }
    map.push(row);
  }

  player = { x: 0, y: 0 };
  map[0][0] = TILE.PATH;

  // Place goal
  let gx, gy;
  do {
    gx = Math.floor(Math.random() * GRID);
    gy = Math.floor(Math.random() * GRID);
  } while ((gx === 0 && gy === 0) || map[gy][gx] === TILE.WALL);
  map[gy][gx] = TILE.GOAL;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const tile = map[y][x];
      let img = null;
      switch (tile) {
        case TILE.WALL: img = images.wall; break;
        case TILE.SWORD: img = images.sword; break;
        case TILE.GOAL: img = images.goal; break;
        case TILE.ENEMY: img = images.enemy; break;
        case TILE.TRAP: img = images.trap; break;
        case TILE.SAKE: img = images.sake; break;
      }
      if (img) ctx.drawImage(img, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  // Draw Zoro
  ctx.drawImage(images.zoro, player.x * TILE_SIZE, player.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

  // Draw hearts
  for (let i = 0; i < hearts; i++) {
    ctx.drawImage(images.heart, i * 30, canvas.height - 35, 30, 30);
  }

  // Sword count
  ctx.fillStyle = "#0f0";
  ctx.font = "16px monospace";
  ctx.fillText(`⚔️: ${swords}`, 10, canvas.height - 10);
}

function moveZoro(dir) {
  if (gameOver) return;

  let dx = 0, dy = 0;
  if (dir === "up") dy = -1;
  if (dir === "down") dy = 1;
  if (dir === "left") dx = -1;
  if (dir === "right") dx = 1;

  const nx = player.x + dx;
  const ny = player.y + dy;

  if (nx >= 0 && ny >= 0 && nx < GRID && ny < GRID) {
    const tile = map[ny][nx];

    if (tile === TILE.WALL) return;

    player.x = nx;
    player.y = ny;

    // Zoro randomly loses direction
    if (Math.random() < 0.3) {
      const randomDirs = ["up", "down", "left", "right"];
      setTimeout(() => moveZoro(randomDirs[Math.floor(Math.random() * 4)]), 200);
    }

    if (tile === TILE.SWORD) {
      swords++;
      map[ny][nx] = TILE.PATH;
      alert("⚔️ Zoro found a sword!");
    }

    if (tile === TILE.SAKE) {
      if (hearts < 3) {
        hearts++;
        map[ny][nx] = TILE.PATH;
        alert("🍶 Sake found! +1 heart");
      }
    }

    if (tile === TILE.ENEMY) {
      hearts--;
      map[ny][nx] = TILE.PATH;
      alert("💥 Enemy hit! Hearts left: " + hearts);
      if (hearts <= 0) {
        alert("💀 Zoro has fallen!");
        gameOver = true;
      }
    }

    if (tile === TILE.TRAP) {
      alert("⚠️ Trap! Zoro got lost!");
      player = { x: 0, y: 0 };
    }

    if (tile === TILE.GOAL) {
      alert("🏁 Zoro reached the goal!");
      gameOver = true;
    }

    draw();
  }
}

// Arrow key movement
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") moveZoro("up");
  if (e.key === "ArrowDown") moveZoro("down");
  if (e.key === "ArrowLeft") moveZoro("left");
  if (e.key === "ArrowRight") moveZoro("right");
});
