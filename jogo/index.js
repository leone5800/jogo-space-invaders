// Constantes para as teclas de seta esquerda, seta direita e barra de espaço
const KEY_CODE_LEFT = 37;
const KEY_CODE_RIGHT = 39;
const KEY_CODE_SPACE = 32;


// Constantes para as dimensões do jogo e do jogador
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_WIDTH = 20;
const PLAYER_MAX_SPEED = 600.0;

// Constantes para o laser do jogador e inimigos
const LASER_MAX_SPEED = 300.0;
const LASER_COOLDOWN = 0.5;

// Constantes para a criação de inimigos
const ENEMIES_PER_ROW = 10;
const ENEMY_HORIZONTAL_PADDING = 80;
const ENEMY_VERTICAL_PADDING = 70;
const ENEMY_VERTICAL_SPACING = 80;
const ENEMY_COOLDOWN = 5.0;

// Estado do jogo
const GAME_STATE = {
  lastTime: Date.now(), // Tempo do último frame
  leftPressed: false, // Indica se a tecla de seta esquerda está pressionada
  rightPressed: false, // Indica se a tecla de seta direita está pressionada
  spacePressed: false, // Indica se a barra de espaço está pressionada
  playerX: 0, // Posição horizontal do jogador
  playerY: 0, // Posição vertical do jogador
  playerCooldown: 0, // Tempo de recarga do laser do jogador
  lasers: [], // Lasers ativos do jogador
  enemies: [], // Inimigos ativos
  enemyLasers: [], // Lasers ativos dos inimigos
  gameOver: false // Indica se o jogo acabou
};

// Função para mover o jogador
function movePlayer(step) {
  GAME_STATE.playerX += step;
  GAME_STATE.playerX = clamp(GAME_STATE.playerX, 0, GAME_WIDTH - PLAYER_WIDTH);
  const player = document.querySelector(".player");
  setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
}

// Função para verificar se dois retângulos se intersectam
function rectsIntersect(r1, r2) {
  // Verifica se os retângulos não se intersectam verticalmente e horizontalmente
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

// Função para definir a posição de um elemento
function setPosition(el, x, y) {
  el.style.transform = `translate(${x}px, ${y}px)`;
}

// Função para limitar um valor entre dois outros
function clamp(v, min, max) {
  if (v < min) {
    return min;
  } else if (v > max) {
    return max;
  } else {
    return v;
  }
}

// Função para gerar um número aleatório entre dois valores
function rand(min, max) {
  if (min === undefined) min = 0;
  if (max === undefined) max = 1;
  return min + Math.random() * (max - min);
}

// Função para criar o jogador
function createPlayer($container) {
  // Posiciona o jogador no centro horizontal e um pouco acima do final vertical
  GAME_STATE.playerX = GAME_WIDTH / 2;
  GAME_STATE.playerY = GAME_HEIGHT - 50;
  const $player = document.createElement("img");
  // Carrega a imagem do jogador
  $player.src = "../img/player-blue-1.png";
  // Adiciona a classe CSS do jogador
  $player.className = "player";
  // Adiciona o jogador ao container do jogo
  $container.appendChild($player);
  // Define a posição do jogador
  setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
}

// Função para mover o jogador
function movePlayer(step, distance) {
  for (let i = 0; i < distance; i++) {
    GAME_STATE.playerX += step;
    GAME_STATE.playerX = clamp(GAME_STATE.playerX, 0, GAME_WIDTH - PLAYER_WIDTH);
    const player = document.querySelector(".player");
    setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
  }
}

// Função paradestruir o jogador
function destroyPlayer($container, player) {
  // Remove o jogador do container do jogo
  $container.removeChild(player);
  // Indica que o jogo acabou
  GAME_STATE.gameOver = true;
  // Toca um som de derrota
  const audio = new Audio("../sonzinho/sfx-lose.ogg");
  audio.play();
}

// Função para atualizar o jogador
function updatePlayer(dt, $container) {
  // Verifica se o jogador está pressionando as teclas de seta esquerda ou direita
  if (GAME_STATE.leftPressed) {
    GAME_STATE.playerX -= dt * PLAYER_MAX_SPEED;
  }
  if (GAME_STATE.rightPressed) {
    GAME_STATE.playerX += dt * PLAYER_MAX_SPEED;
  }

  // Limita a posição horizontal do jogador
  GAME_STATE.playerX = clamp(
    GAME_STATE.playerX,
    PLAYER_WIDTH,
    GAME_WIDTH - PLAYER_WIDTH
  );

  // Verifica se o jogador está pressionando a barra de espaço e se o laser não está em cooldown
  if (GAME_STATE.spacePressed && GAME_STATE.playerCooldown <= 0) {
    // Cria um novo laser do jogador
    createLaser($container, GAME_STATE.playerX, GAME_STATE.playerY);
    // Inicia o cooldown do laser do jogador
    GAME_STATE.playerCooldown = LASER_COOLDOWN;
  }
  // Decrementa o cooldown do laser do jogador
  if (GAME_STATE.playerCooldown > 0) {
    GAME_STATE.playerCooldown -= dt;
  }

  // Atualiza a posição do jogador
  const player = document.querySelector(".player");
  setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
}

// Função para criar um laser do jogador
function createLaser($container, x, y) {
  const $element = document.createElement("img");
  $element.src = "../img/laser-red-1.png";
  $element.className = "laser";
  $container.appendChild($element);
  const laser = { x, y, $element };
  GAME_STATE.lasers.push(laser);
  // Toca um som de laser
  const audio = new Audio("../sonzinho/sfx-laser1.ogg");
  audio.play();
  setPosition($element, x, y);
}


// Função para atualizar os lasers do jogador
function updateLasers(dt, $container) {
  const lasers = GAME_STATE.lasers;
  for (let i = 0; i < lasers.length; i++) {
    const laser = lasers[i];
    // Move o laser para cima
    laser.y -= dt * LASER_MAX_SPEED;
    // Verifica se o laser saiu da tela
    if (laser.y < 0) {
      // Destroi o laser
      destroyLaser($container, laser);
    }
    // Atualiza a posição do laser
    setPosition(laser.$element, laser.x, laser.y);
    // Verifica se o laser colidiu com algum inimigo
    const r1 = laser.$element.getBoundingClientRect();
    const enemies = GAME_STATE.enemies;
    for (let j = 0; j < enemies.length; j++) {
      const enemy = enemies[j];
      if (enemy.isDead) continue;
      const r2 = enemy.$element.getBoundingClientRect();
      if (rectsIntersect(r1, r2)) {
        // Inimigo foi atingido
        destroyEnemy($container, enemy);
        destroyLaser($container, laser);
        break;
      }
    }
  }
  // Remove os lasers que foram destruídos
  GAME_STATE.lasers = GAME_STATE.lasers.filter(e => !e.isDead);
}

// Função para destruir um laser do jogador
function destroyLaser($container, laser) {
  $container.removeChild(laser.$element);
  laser.isDead = true;
}

// Função para criar um inimigo
function createEnemy($container, x, y) {
  const $element = document.createElement("img");
  $element.src = "../img/enemy-black-2.png";
  $element.className = "enemy";
  $container.appendChild($element);
  const enemy = {
    x,
    y,
    cooldown: rand(0.5, ENEMY_COOLDOWN),
    $element
  };
  GAME_STATE.enemies.push(enemy);
  setPosition($element, x, y);
}

// Função para atualizar os inimigos
function updateEnemies(dt, $container) {
  const dx = Math.sin(GAME_STATE.lastTime / 1000.0) * 50;
  const dy = Math.cos(GAME_STATE.lastTime / 1000.0) * 10;

  const enemies = GAME_STATE.enemies;
  for (let i = 0; i < enemies.length;i++) {
    const enemy = enemies[i];
    const x = enemy.x + dx;
    const y = enemy.y + dy;
    setPosition(enemy.$element, x, y);
    enemy.cooldown -= dt;
    if (enemy.cooldown <= 0) {
      // Cria um novo laser do inimigo
      createEnemyLaser($container, x, y);
      enemy.cooldown = ENEMY_COOLDOWN;
    }
  }
  // Remove os inimigos que foram destruídos
  GAME_STATE.enemies = GAME_STATE.enemies.filter(e => !e.isDead);
}
function movePlayer(step) {
  GAME_STATE.playerX += step;
  GAME_STATE.playerX = clamp(GAME_STATE.playerX, 0, GAME_WIDTH - PLAYER_WIDTH);
  const player = document.querySelector(".player");
  setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
}

// Função para destruir um inimigo
function destroyEnemy($container, enemy) {
  $container.removeChild(enemy.$element);
  enemy.isDead = true;
}
const shootButton = document.getElementById("shoot-button");

  shootButton.addEventListener("click", () => {
    createLaser(document.querySelector(".game"), GAME_STATE.playerX, GAME_STATE.playerY);
  });
  

// Função para criar um laser do inimigo
function createEnemyLaser($container, x, y) {
  const $element = document.createElement("img");
  $element.src = "../img/laser-red-1.png";
  $element.className = "enemy-laser";
  $container.appendChild($element);
  const laser = { x, y, $element };
  GAME_STATE.enemyLasers.push(laser);
  setPosition($element, x, y);
}

// Função para atualizar os lasers dos inimigos
function updateEnemyLasers(dt, $container) {
  const lasers = GAME_STATE.enemyLasers;
  for (let i = 0; i < lasers.length; i++) {
    const laser = lasers[i];
    // Move o laser para baixo
    laser.y += dt * LASER_MAX_SPEED;
    // Verifica se o laser saiu da tela
    if (laser.y > GAME_HEIGHT) {
      // Destroi o laser
      destroyLaser($container, laser);
    }
    // Atualiza a posição do laser
    setPosition(laser.$element, laser.x, laser.y);
    // Verifica se o laser colidiu com o jogador
    const r1 = laser.$element.getBoundingClientRect();
    const player = document.querySelector(".player");
    const r2 = player.getBoundingClientRect();
    if (rectsIntersect(r1, r2)) {
      // Jogador foi atingido
      destroyPlayer($container, player);
      break;
    }
  }
  // Remove os lasers que foram destruídos
  GAME_STATE.enemyLasers = GAME_STATE.enemyLasers.filter(e => !e.isDead);
}

// Função para inicializar o jogo
function init() {
  const $container = document.querySelector(".game");
  createPlayer($container);

  const enemySpacing =
    (GAME_WIDTH - ENEMY_HORIZONTAL_PADDING * 2) / (ENEMIES_PER_ROW - 1);
  for (let j = 0; j < 3; j++) {
    const y = ENEMY_VERTICAL_PADDING + j * ENEMY_VERTICAL_SPACING;
    for (let i = 0; i < ENEMIES_PER_ROW; i++) {
      const x = i * enemySpacing + ENEMY_HORIZONTAL_PADDING;
      createEnemy($container, x, y);
    }
  }
}

// Função para verificar se o jogador venceu
function playerHasWon() {
  return GAME_STATE.enemies.length === 0;
}

// Função para atualizar o jogo
function update(e) {
  const currentTime = Date.now();
  const dt = (currentTime - GAME_STATE.lastTime) / 1000.0;

  if (GAME_STATE.gameOver) {
    document.querySelector(".game-over").style.display = "block";
    return;
  }

  if (playerHasWon()) {
    document.querySelector(".congratulations").style.display = "block";
    return;
  }

  const $container = document.querySelector(".game");
  updatePlayer(dt, $container);
  updateLasers(dt, $container);
  updateEnemies(dt, $container);
  updateEnemyLasers(dt, $container);

  GAME_STATE.lastTime = currentTime;
  window.requestAnimationFrame(update);
}

// Função para lidar com as teclas pressionadas
function onKeyDown(e) {
  if (e.keyCode === KEY_CODE_LEFT) {
    GAME_STATE.leftPressed = true;
  } else if (e.keyCode === KEY_CODE_RIGHT) {
    GAME_STATE.rightPressed = true;
  } else if (e.keyCode === KEY_CODE_SPACE) {
    GAME_STATE.spacePressed = true;
  }
}

// Função para lidar com as teclas soltas
function onKeyUp(e) {
  if (e.keyCode === KEY_CODE_LEFT) {
    GAME_STATE.leftPressed = false;
  } else if (e.keyCode === KEY_CODE_RIGHT) {
    GAME_STATE.rightPressed = false;
  } else if (e.keyCode === KEY_CODE_SPACE) {
    GAME_STATE.spacePressed = false;
  }
}

// Inicializa o jogo
init();
// Adiciona os eventosde teclado
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
// Inicia a animação do jogo
window.requestAnimationFrame(update);