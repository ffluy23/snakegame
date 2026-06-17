const canvas  = document.getElementById("game");
const ctx     = canvas.getContext("2d");
const scoreEl = document.getElementById("score");

const box = 20;

(function initCanvasSize() {
  const reserved = 240; // score bar + dpad + margins
  const maxDim   = Math.min(window.innerWidth - 16, window.innerHeight - reserved);
  const size     = maxDim < 400
    ? Math.max(Math.floor(maxDim / box) * box, box * 10)
    : 400;
  canvas.width  = size;
  canvas.height = size;
}());

const cols = canvas.width  / box;
const rows = canvas.height / box;

let snake, food, dx, dy, score, gameOver;

function initGame() {
  snake    = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
  food     = randomFood();
  dx       = 1;
  dy       = 0;
  score    = 0;
  gameOver = false;
  scoreEl.textContent = 0;
}

initGame();

const KEY_DIR = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0] };

document.addEventListener("keydown", e => {
  if (KEY_DIR[e.key]) {
    e.preventDefault();
    if (gameOver) { initGame(); return; }
    const [ndx, ndy] = KEY_DIR[e.key];
    tryDir(ndx, ndy);
  }
  if ((e.key === " " || e.key === "Enter") && gameOver) initGame();
});

const BTN_DIR = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };

Object.entries(BTN_DIR).forEach(([id, [ndx, ndy]]) => {
  const el = document.getElementById("btn-" + id);
  if (!el) return;
  const handle = e => {
    e.preventDefault();
    if (gameOver) { initGame(); return; }
    tryDir(ndx, ndy);
  };
  el.addEventListener("touchstart", handle, { passive: false });
  el.addEventListener("mousedown",  handle);
});

let swipeX = 0, swipeY = 0;

canvas.addEventListener("touchstart", e => {
  swipeX = e.touches[0].clientX;
  swipeY = e.touches[0].clientY;
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("touchend", e => {
  if (gameOver) { initGame(); return; }
  const ddx = e.changedTouches[0].clientX - swipeX;
  const ddy = e.changedTouches[0].clientY - swipeY;
  if (Math.abs(ddx) > Math.abs(ddy)) tryDir(ddx > 0 ? 1 : -1, 0);
  else tryDir(0, ddy > 0 ? 1 : -1);
  e.preventDefault();
}, { passive: false });

canvas.addEventListener("click", () => { if (gameOver) initGame(); });

function tryDir(ndx, ndy) {
  if (ndx !== 0 && ndx === -dx) return;
  if (ndy !== 0 && ndy === -dy) return;
  dx = ndx;
  dy = ndy;
}

function gameLoop() {
  if (gameOver) { drawGameOver(); return; }
  moveSnake();
  if (checkCollision()) {
    gameOver = true;
    drawGame();
    drawGameOver();
    return;
  }
  drawGame();
}

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    food = randomFood();
  } else {
    snake.pop();
  }
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#FF5FA2";
  ctx.fillRect(food.x * box, food.y * box, box, box);

  ctx.fillStyle = "#50FA7B";
  snake.forEach(part => ctx.fillRect(part.x * box, part.y * box, box, box));
}

function drawGameOver() {
  ctx.fillStyle = "rgba(7, 11, 31, 0.82)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.fillStyle = "#EEF2FF";
  ctx.font      = `bold ${Math.floor(canvas.width * 0.07)}px 'Mona12', sans-serif`;
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 14);

  ctx.font      = `${Math.floor(canvas.width * 0.035)}px 'Mona12', sans-serif`;
  ctx.fillStyle = "#AAB3D8";
  ctx.fillText("탭하거나 Enter 키로 재시작", canvas.width / 2, canvas.height / 2 + 18);
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * cols),
    y: Math.floor(Math.random() * rows)
  };
}

function checkCollision() {
  const head = snake[0];
  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) return true;
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) return true;
  }
  return false;
}

setInterval(gameLoop, 120);
