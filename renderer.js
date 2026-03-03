const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

let board = Array(9).fill(null);
let gameOver = false;
let pvpMode = false;
let currentPlayer = 'X';
let scores = { X: 0, O: 0, draws: 0 };

const cells = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const scoreDraws = document.getElementById('score-draws');
const pvpToggle = document.getElementById('pvp-toggle');
const labelX = document.getElementById('label-x');
const labelO = document.getElementById('label-o');

initStarfield();

cells.forEach(cell => cell.addEventListener('click', onCellClick));
resetBtn.addEventListener('click', resetGame);

pvpToggle.addEventListener('change', () => {
  pvpMode = pvpToggle.checked;
  labelX.textContent = pvpMode ? 'Player X' : 'You (X)';
  labelO.textContent = pvpMode ? 'Player O' : 'CPU (O)';
  scores = { X: 0, O: 0, draws: 0 };
  updateScoreboard();
  resetGame();
});

function onCellClick(e) {
  const index = parseInt(e.target.dataset.index);
  if (gameOver || board[index]) return;

  if (pvpMode) {
    placeMove(index, currentPlayer);
    const result = checkResult();
    if (result) { handleResult(result); return; }
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusEl.textContent = `Player ${currentPlayer}'s turn`;
  } else {
    placeMove(index, 'X');
    const result = checkResult();
    if (result) { handleResult(result); return; }
    statusEl.textContent = 'CPU thinking...';
    setTimeout(() => {
      const cpuIndex = getBestMove();
      placeMove(cpuIndex, 'O');
      const result2 = checkResult();
      if (result2) { handleResult(result2); }
      else { statusEl.textContent = 'Your turn'; }
    }, 300);
  }
}

function placeMove(index, player) {
  board[index] = player;
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add('filled', player === 'X' ? 'x-cell' : 'o-cell');
}

function checkResult() {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  if (board.every(cell => cell !== null)) return { winner: null };
  return null;
}

function handleResult(result) {
  gameOver = true;
  if (result.winner) {
    scores[result.winner]++;
    updateScoreboard();
    highlightWinners(result.combo);
    if (pvpMode) {
      statusEl.textContent = `Player ${result.winner} wins!`;
    } else {
      statusEl.textContent = result.winner === 'X' ? 'You win!' : 'CPU wins!';
    }
  } else {
    scores.draws++;
    updateScoreboard();
    statusEl.textContent = "It's a draw!";
    cells.forEach(cell => cell.classList.add('draw-cell'));
  }
  setTimeout(resetGame, 2000);
}

function highlightWinners(combo) {
  combo.forEach(i => cells[i].classList.add('winner'));
}

function updateScoreboard() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraws.textContent = scores.draws;
}

function resetGame() {
  board = Array(9).fill(null);
  gameOver = false;
  currentPlayer = 'X';
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
  });
  statusEl.textContent = pvpMode ? "Player X's turn" : 'Your turn';
}

// --- AI: minimax ---

function getBestMove() {
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) { bestScore = score; bestMove = i; }
    }
  }
  return bestMove;
}

function minimax(boardState, depth, isMaximizing) {
  const result = checkResultForMinimax(boardState);
  if (result !== null) return result;
  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!boardState[i]) {
        boardState[i] = 'O';
        best = Math.max(best, minimax(boardState, depth + 1, false));
        boardState[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!boardState[i]) {
        boardState[i] = 'X';
        best = Math.min(best, minimax(boardState, depth + 1, true));
        boardState[i] = null;
      }
    }
    return best;
  }
}

function checkResultForMinimax(boardState) {
  for (const [a, b, c] of WINNING_COMBOS) {
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return boardState[a] === 'O' ? 10 : -10;
    }
  }
  if (boardState.every(cell => cell !== null)) return 0;
  return null;
}

// --- Starfield ---

function initStarfield() {
  const canvas = document.getElementById('starfield');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  // Small dim stars
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 1.2 + 0.2;
    const opacity = Math.random() * 0.65 + 0.15;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.fill();
  }

  // Brighter larger stars
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 1.8 + 1.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180, 220, 255, 0.9)`;
    ctx.fill();
    // Soft glow around bright stars
    const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    grd.addColorStop(0, 'rgba(180, 220, 255, 0.2)');
    grd.addColorStop(1, 'rgba(180, 220, 255, 0)');
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
  }
}
