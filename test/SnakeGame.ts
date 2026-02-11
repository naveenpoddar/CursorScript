import { Window } from "skia-canvas";

const SIZE = 600;
const GRID = 20;

// 1. Create the native window
const win = new Window(SIZE, SIZE);
win.title = "Bun + Skia Snake";

// 2. Game State
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 1;
let dy = 0;
let score = 0;
let gameOver = false;

// 3. Input Handling
win.on("keydown", ({ key }) => {
  if (key === "ArrowUp" && dy === 0) {
    dx = 0;
    dy = -1;
  }
  if (key === "ArrowDown" && dy === 0) {
    dx = 0;
    dy = 1;
  }
  if (key === "ArrowLeft" && dx === 0) {
    dx = -1;
    dy = 0;
  }
  if (key === "ArrowRight" && dx === 0) {
    dx = 1;
    dy = 0;
  }
  if (key === "r" && gameOver) reset();
});

function reset() {
  snake = [{ x: 10, y: 10 }];
  dx = 1;
  dy = 0;
  score = 0;
  gameOver = false;
}

function spawnFood() {
  food = {
    x: Math.floor(Math.random() * (SIZE / GRID)),
    y: Math.floor(Math.random() * (SIZE / GRID)),
  };
}

// 4. The Game Loop (runs at window refresh rate)
win.on("draw", (e) => {
  const ctx = e.target.canvas.getContext("2d");

  // Only update game logic every 5 frames to control speed
  if (e.frame % 5 === 0 && !gameOver) {
    const head = { x: snake[0]!.x + dx, y: snake[0]!.y + dy };

    // Collision: Walls
    if (
      head.x < 0 ||
      head.x >= SIZE / GRID ||
      head.y < 0 ||
      head.y >= SIZE / GRID
    ) {
      gameOver = true;
    }

    // Collision: Self
    if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
      gameOver = true;
    }

    snake.unshift(head);

    // Eating Food
    if (head.x === food.x && head.y === food.y) {
      score++;
      spawnFood();
    } else {
      snake.pop();
    }
  }

  // --- RENDERING ---
  ctx.fillStyle = "#1a1a1a"; // Background
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Draw Food
  ctx.fillStyle = "#ff4757";
  ctx.fillRect(food.x * GRID, food.y * GRID, GRID - 2, GRID - 2);

  // Draw Snake
  ctx.fillStyle = "#2ed573";
  snake.forEach((seg, i) => {
    // Make the head a slightly different green
    ctx.fillStyle = i === 0 ? "#7bed9f" : "#2ed573";
    ctx.fillRect(seg.x * GRID, seg.y * GRID, GRID - 2, GRID - 2);
  });

  // UI
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 30);

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", SIZE / 2, SIZE / 2);
    ctx.fillStyle = "white";
    ctx.fillText("Press 'R' to Restart", SIZE / 2, SIZE / 2 + 40);
  }
});
