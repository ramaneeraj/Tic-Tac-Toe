const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const friendModeBtn = document.getElementById("friendMode");
const computerModeBtn = document.getElementById("computerMode");
const restartBtn = document.getElementById("restartBtn");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameMode = "";
let gameOver = false;

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Mode Buttons
friendModeBtn.addEventListener("click", () => setMode("friend"));
computerModeBtn.addEventListener("click", () => setMode("computer"));

function setMode(mode) {
    gameMode = mode;
    friendModeBtn.classList.toggle("active", mode === "friend");
    computerModeBtn.classList.toggle("active", mode === "computer");
    resetGame();
    statusText.textContent = mode === "friend" ? "Player X's Turn" : "Your Turn (X)";
}

// Cell Click Events
cells.forEach(cell => {
    cell.addEventListener("click", handleCellClick);
});

function handleCellClick(event) {
    if (gameOver) return;

    if (gameMode === "") {
        statusText.textContent = "Please select a mode first!";
        return;
    }

    const clickedCell = event.target;
    const index = +clickedCell.dataset.index;

    if (board[index] !== "") return;

    // Human Move
    makeMove(index, currentPlayer);

    const result = checkWinner(board);

    if (result) {
        statusText.textContent =
            gameMode === "friend" ? `Player ${result.winner} Wins!` : (result.winner === "X" ? "You Win!" : "Computer Wins!");
        highlightWin(result.line);
        gameOver = true;
        return;
    }

    if (!board.includes("")) {
        statusText.textContent = "It's a Draw!";
        gameOver = true;
        return;
    }

    // Friend Mode
    if (gameMode === "friend") {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusText.textContent = `Player ${currentPlayer}'s Turn`;
    }

    // Computer Mode
    else if (gameMode === "computer") {
        currentPlayer = "O";
        statusText.textContent = "Computer Thinking...";

        // Disable clicks while computer thinks
        cells.forEach(c => c.style.pointerEvents = "none");

        setTimeout(computerMove, 500);
    }
}

// Place a mark on the board and update the UI
function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add("taken", player.toLowerCase());
}

// Highlight winning cells
function highlightWin(line) {
    line.forEach(i => cells[i].classList.add("win"));
}

// Computer Move — uses Minimax for optimal play
function computerMove() {
    if (gameOver) {
        cells.forEach(c => c.style.pointerEvents = "");
        return;
    }

    const move = bestMove([...board]);
    makeMove(move, "O");

    const result = checkWinner(board);

    if (result) {
        statusText.textContent = "Computer Wins!";
        highlightWin(result.line);
        gameOver = true;
    } else if (!board.includes("")) {
        statusText.textContent = "It's a Draw!";
        gameOver = true;
    } else {
        currentPlayer = "X";
        statusText.textContent = "Your Turn (X)";
    }

    cells.forEach(c => c.style.pointerEvents = "");
}

// Find the best move for "O" using Minimax
function bestMove(b) {
    let bestScore = -Infinity;
    let move = -1;

    for (let i = 0; i < 9; i++) {
        if (b[i] === "") {
            b[i] = "O";
            const score = minimax(b, false);
            b[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    return move;
}

// Minimax algorithm
function minimax(b, isMaximizing) {
    const result = checkWinner(b);
    if (result) return result.winner === "O" ? 10 : -10;
    if (!b.includes("")) return 0;

    let best = isMaximizing ? -Infinity : Infinity;

    for (let i = 0; i < 9; i++) {
        if (b[i] === "") {
            b[i] = isMaximizing ? "O" : "X";
            const score = minimax(b, !isMaximizing);
            b[i] = "";
            best = isMaximizing ? Math.max(best, score) : Math.min(best, score);
        }
    }

    return best;
}

// Winner Check — returns { winner, line } or null
function checkWinner(b) {
    for (const combo of winningCombinations) {
        const [a, c, d] = combo;
        if (b[a] !== "" && b[a] === b[c] && b[a] === b[d]) {
            return { winner: b[a], line: combo };
        }
    }
    return null;
}

// Reset Game State
function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameOver = false;

    cells.forEach(cell => {
        cell.textContent = "";
        cell.className = "cell";
        cell.style.pointerEvents = "";
    });
}

// Restart Button
restartBtn.addEventListener("click", () => {
    resetGame();

    if (gameMode === "friend") {
        statusText.textContent = "Player X's Turn";
    } else if (gameMode === "computer") {
        statusText.textContent = "Your Turn (X)";
    } else {
        statusText.textContent = "Select a mode to start";
    }
});