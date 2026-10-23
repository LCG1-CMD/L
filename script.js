const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const leftScoreEl = document.getElementById('leftScore');
const rightScoreEl = document.getElementById('rightScore');

const leftPaddle = {
  width: 14,
  height: 110,
  x: 22,
  y: canvas.height / 2 - 55,
  speed: 7,
};

const rightPaddle = {
  width: 14,
  height: 110,
  x: canvas.width - 22 - 14,
  y: canvas.height / 2 - 55,
  speed: 5.5,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 12,
  speedX: 6,
  speedY: 5,
};

const keys = {
  up: false,
  down: false,
};

let mouseY = null;
let leftScore = 0;
let rightScore = 0;

function resetBall(direction = Math.random() < 0.5 ? -1 : 1) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  const angle = (Math.random() * 1.2 - 0.6);
  ball.speedX = direction * (6 + Math.random() * 1.5);
  ball.speedY = angle * 7;
}

function updateScores() {
  leftScoreEl.textContent = leftScore;
  rightScoreEl.textContent = rightScore;
}

function updateLeftPaddle() {
  if (keys.up && !keys.down) {
    leftPaddle.y -= leftPaddle.speed;
  } else if (keys.down && !keys.up) {
    leftPaddle.y += leftPaddle.speed;
  } else if (mouseY !== null) {
    const targetY = mouseY - leftPaddle.height / 2;
    leftPaddle.y += (targetY - leftPaddle.y) * 0.18;
  }

  leftPaddle.y = Math.max(0, Math.min(leftPaddle.y, canvas.height - leftPaddle.height));
}

function updateRightPaddle() {
  const targetY = ball.y - rightPaddle.height / 2;
  const difference = targetY - rightPaddle.y;
  rightPaddle.y += Math.sign(difference) * rightPaddle.speed;
  rightPaddle.y = Math.max(0, Math.min(rightPaddle.y, canvas.height - rightPaddle.height));
}

function handleWallCollision() {
  if (ball.y - ball.size <= 0) {
    ball.y = ball.size;
    ball.speedY *= -1;
  }

  if (ball.y + ball.size >= canvas.height) {
    ball.y = canvas.height - ball.size;
    ball.speedY *= -1;
  }
}

function handlePaddleCollision() {
  const leftRect = {
    left: leftPaddle.x,
    right: leftPaddle.x + leftPaddle.width,
    top: leftPaddle.y,
    bottom: leftPaddle.y + leftPaddle.height,
  };

  const rightRect = {
    left: rightPaddle.x,
    right: rightPaddle.x + rightPaddle.width,
    top: rightPaddle.y,
    bottom: rightPaddle.y + rightPaddle.height,
  };

  if (
    ball.x - ball.size <= leftRect.right &&
    ball.x + ball.size >= leftRect.left &&
    ball.y + ball.size >= leftRect.top &&
    ball.y - ball.size <= leftRect.bottom &&
    ball.speedX < 0
  ) {
    ball.x = leftRect.right + ball.size;
    const hitPoint = (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
    ball.speedY = hitPoint * 7;
    ball.speedX = Math.abs(ball.speedX) + 0.4;
  }

  if (
    ball.x + ball.size >= rightRect.left &&
    ball.x - ball.size <= rightRect.right &&
    ball.y + ball.size >= rightRect.top &&
    ball.y - ball.size <= rightRect.bottom &&
    ball.speedX > 0
  ) {
    ball.x = rightRect.left - ball.size;
    const hitPoint = (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
    ball.speedY = hitPoint * 7;
    ball.speedX = -(Math.abs(ball.speedX) + 0.4);
  }
}

function updateBall() {
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  handleWallCollision();
  handlePaddleCollision();

  if (ball.x < -ball.size) {
    rightScore += 1;
    updateScores();
    resetBall(1);
  }

  if (ball.x > canvas.width + ball.size) {
    leftScore += 1;
    updateScores();
    resetBall(-1);
  }
}

function drawMiddleLine() {
  ctx.beginPath();
  ctx.setLineDash([12, 12]);
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(paddle) {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = '#fbbf24';
  ctx.fill();
}

function gameLoop() {
  updateLeftPaddle();
  updateRightPaddle();
  updateBall();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMiddleLine();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall();

  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    keys.up = true;
  }

  if (event.key === 'ArrowDown') {
    keys.down = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowUp') {
    keys.up = false;
  }

  if (event.key === 'ArrowDown') {
    keys.down = false;
  }
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const offsetY = event.clientY - rect.top;
  mouseY = offsetY * (canvas.height / rect.height);
});

updateScores();
resetBall(Math.random() < 0.5 ? -1 : 1);
requestAnimationFrame(gameLoop);
