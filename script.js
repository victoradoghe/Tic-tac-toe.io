const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('reset-button');
const twoPlayerModeButton = document.getElementById('two-player-mode');
const aiModeButton = document.getElementById('ai-mode');
const difficultySelection = document.querySelector('.difficulty-selection');
const playerSelection = document.querySelector('.player-selection');
const chooseXButton = document.getElementById('choose-x');
const chooseOButton = document.getElementById('choose-o');
const easyButton = document.getElementById('easy');
const hardButton = document.getElementById('hard');
const difficultButton = document.getElementById('difficult');

let currentPlayer = 'X';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];
let isAIMode = false;
let aiDifficulty = 'easy';
let playerSymbol = 'X';
let aiSymbol = 'O';

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Event Listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);
twoPlayerModeButton.addEventListener('click', () => setMode(false));
aiModeButton.addEventListener('click', () => setMode(true));
chooseXButton.addEventListener('click', () => setPlayerSymbol('X'));
chooseOButton.addEventListener('click', () => setPlayerSymbol('O'));
easyButton.addEventListener('click', () => setDifficulty('easy'));
hardButton.addEventListener('click', () => setDifficulty('hard'));
difficultButton.addEventListener('click', () => setDifficulty('difficult'));

// Handle Cell Click
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add('winning-cell');

    if (checkForWinner()) {
        return;
    }

    if (isAIMode && gameActive) {
        currentPlayer = aiSymbol;
        setTimeout(() => makeAIMove(), 500); // Delay AI move for better UX
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }

    statusText.textContent = `It's ${currentPlayer}'s turn`;
}

// Check for Winner
function checkForWinner() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') {
            continue;
        }
        if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
            if (isAIMode) {
                if (gameState[a] === aiSymbol) {
                    alert('Bot wins! Better luck next time!');
                } else {
                    alert('You win! Congratulations!');
                }
            } else {
                alert(`Player ${gameState[a]} wins!`);
            }
            gameActive = false;
            highlightWinningCells([a, b, c]);
            return true;
        }
    }

    if (!gameState.includes('')) {
        alert('It\'s a draw!');
        gameActive = false;
        return true;
    }

    return false;
}

// Highlight Winning Cells
function highlightWinningCells(cells) {
    cells.forEach(index => {
        document.querySelector(`.cell[data-index="${index}"]`).classList.add('winning-cell');
    });
}

// Reset Game
function resetGame() {
    gameState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    statusText.textContent = `It's ${currentPlayer}'s turn`;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('winning-cell');
    });
}

// Set Game Mode
function setMode(isAI) {
    isAIMode = isAI;
    difficultySelection.classList.toggle('hidden', !isAI);
    playerSelection.classList.toggle('hidden', !isAI);
    resetGame();
}

// Set Player Symbol
function setPlayerSymbol(symbol) {
    playerSymbol = symbol;
    aiSymbol = symbol === 'X' ? 'O' : 'X';
    resetGame();
}

// Set AI Difficulty
function setDifficulty(difficulty) {
    aiDifficulty = difficulty;
    resetGame();
}

// AI Move Logic
function makeAIMove() {
    let move;
    if (aiDifficulty === 'easy') {
        move = getRandomMove();
    } else if (aiDifficulty === 'hard') {
        move = getBestMove();
    } else if (aiDifficulty === 'difficult') {
        move = getBestMove(true); // Use minimax with depth
    }

    if (move !== undefined) {
        gameState[move] = aiSymbol;
        cells[move].textContent = aiSymbol;
        cells[move].classList.add('winning-cell');
        checkForWinner();
        currentPlayer = playerSymbol;
        statusText.textContent = `It's ${currentPlayer}'s turn`;
    }
}

// Get Random Move (Easy AI)
function getRandomMove() {
    const emptyCells = gameState.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Get Best Move (Hard/Difficult AI)
function getBestMove(useMinimax = false) {
    if (useMinimax) {
        return minimax(gameState, aiSymbol).index;
    } else {
        // Block player's winning move or take center/corners
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (gameState[a] === playerSymbol && gameState[b] === playerSymbol && gameState[c] === '') return c;
            if (gameState[a] === playerSymbol && gameState[c] === playerSymbol && gameState[b] === '') return b;
            if (gameState[b] === playerSymbol && gameState[c] === playerSymbol && gameState[a] === '') return a;
        }
        if (gameState[4] === '') return 4; // Take center
        const corners = [0, 2, 6, 8];
        const emptyCorners = corners.filter(idx => gameState[idx] === '');
        if (emptyCorners.length > 0) return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
        return getRandomMove();
    }
}

// Minimax Algorithm (Difficult AI)
function minimax(board, player) {
    const availableMoves = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);

    if (checkWin(board, playerSymbol)) return { score: -10 };
    if (checkWin(board, aiSymbol)) return { score: 10 };
    if (availableMoves.length === 0) return { score: 0 };

    const moves = [];
    for (let move of availableMoves) {
        const newBoard = [...board];
        newBoard[move] = player;
        const result = minimax(newBoard, player === aiSymbol ? playerSymbol : aiSymbol);
        moves.push({ index: move, score: result.score });
    }

    let bestMove;
    if (player === aiSymbol) {
        let bestScore = -Infinity;
        for (let move of moves) {
            if (move.score > bestScore) {
                bestScore = move.score;
                bestMove = move;
            }
        }
    } else {
        let bestScore = Infinity;
        for (let move of moves) {
            if (move.score < bestScore) {
                bestScore = move.score;
                bestMove = move;
            }
        }
    }

    return bestMove;
}

// Check Win for Minimax
function checkWin(board, player) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] === player && board[b] === player && board[c] === player) {
            return true;
        }
    }
    return false;
}