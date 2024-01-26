let gameInterval;
let paused = true;
const birthRule = [3]; // Cells are born if they have exactly 3 neighbors
const survivalRule = [2, 3]; // Cells survive with 2 or 3 neighbors, else they die

const gridSize = 40; // Where grid = gridSize x gridSize
let grid = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(false));

let currentSpeed = 200;
const speeds = [200, 400, 2000]; // Speeds in milliseconds (normal, 0.5x, 0.1x)
let speedIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    createGrid();

    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('resetButton').addEventListener('click', resetGame);
    document.getElementById('speedButton').addEventListener('click', changeSpeed);

    const gameContainer = document.getElementById('gameContainer');
    let mouseIsDown = false;

    // Allow for holding click to add cells
    gameContainer.addEventListener('mousedown', event => {
        event.preventDefault();
        if (event.target.classList.contains('cell')) {
            mouseIsDown = true;
            handleCellClick(event);
        }
    });

    // Stop adding cells if the cursor leaves the game container
    document.addEventListener('mouseup', () => {
        mouseIsDown = false;
    });

    gameContainer.addEventListener('mouseleave', () => {
        mouseIsDown = false;
    });

    gameContainer.addEventListener('mousemove', event => {
        if (mouseIsDown && event.target.classList.contains('cell')) {
            handleCellClick(event);
        }
    });
});

function resetGame() {
    clearInterval(gameInterval); // Stops the game
    grid = grid.map(row => row.map(() => false)); // Reset all cells to false
    const gameContainer = document.getElementById('gameContainer');
    updateGridDisplay();

    for (const cell of gameContainer.children) {
        cell.classList.remove('has-lived');
    }

    document.getElementById('startButton').textContent = 'Start';
    paused = true;
}

function createGrid() {
    const gameContainer = document.getElementById('gameContainer');
    for (let i = 0; i < 1600; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        gameContainer.appendChild(cell);
    }
}

function setGameSize(width, height) {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.style.setProperty('--game-width', width + 'px');
    gameContainer.style.setProperty('--game-height', height + 'px');
    gameContainer.style.setProperty('--cell-size', `${width / gridSize}px`);
}

function handleCellClick(event) {
    if (event.target.classList.contains('cell')) {
        const cellIndex = Array.prototype.indexOf.call(gameContainer.children, event.target);
        const x = Math.floor(cellIndex / gridSize);
        const y = cellIndex % gridSize;

        grid[x][y] = !grid[x][y];

        if (paused) {
            const neighbors = countLiveNeighbors(x, y);
            if (!survivalRule.includes(neighbors) && grid[x][y]) {
                event.target.classList.add('has-lived');
            }
        }

        updateGridDisplay();
    }
}

function changeSpeed() {
    speedIndex = (speedIndex + 1) % speeds.length;
    currentSpeed = speeds[speedIndex];

    if (!paused) {
        clearInterval(gameInterval);
        gameInterval = setInterval(nextGeneration, currentSpeed);
    }

    let buttonText;
    switch (currentSpeed) {
        case 200: // Currently at 100% speed, next will be 50%
            buttonText = '50% Speed';
            break;
        case 400: // Currently at 50% speed, next will be 10%
            buttonText = '10% Speed';
            break;
        case 2000: // Currently at 10% speed, next will be 100%
            buttonText = '100% Speed';
            break;
        default:
            buttonText = 'Change Speed';
    }

    document.getElementById('speedButton').textContent = buttonText;
}

function startGame() {
    const startButton = document.getElementById('startButton');

    if (paused) {
        startButton.textContent = 'Pause';
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        gameInterval = setInterval(nextGeneration, currentSpeed);
        paused = false;
    } else {
        startButton.textContent = 'Start';
        clearInterval(gameInterval);
        paused = true;
    }
}

function nextGeneration() {
    const newGrid = grid.map(arr => [...arr]);

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const neighbors = countLiveNeighbors(x, y);
            const cellAlive = grid[x][y];

            if (cellAlive) {
                if (!survivalRule.includes(neighbors)) {
                    newGrid[x][y] = false; // Cell dies
                }
            } else {
                if (birthRule.includes(neighbors)) {
                    newGrid[x][y] = true; // Cell is born
                }
            }
        }
    }

    grid = newGrid;
    updateGridDisplay();
}

function countLiveNeighbors(x, y) {
    let count = 0;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue; // Skip the cell itself

            const nx = x + i;
            const ny = y + j;

            // Check boundaries
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
                count += grid[nx][ny] ? 1 : 0;
            }
        }
    }

    return count;
}

function updateGridDisplay() {
    const gameContainer = document.getElementById('gameContainer');
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const cellIndex = x * gridSize + y;
            const cell = gameContainer.children[cellIndex];

            cell.style.backgroundColor = '';

            if (grid[x][y]) {
                // Cell is alive
                cell.classList.add('active');
                cell.classList.remove('has-lived');

                // Apply gradient color only to active cells that are not 'has-lived'
                if (!cell.classList.contains('has-lived')) {
                    setColorBasedOnIndex(cell, cellIndex, gridSize);
                }
            } else {
                // Cell is not alive
                if (cell.classList.contains('active')) {
                    cell.classList.add('has-lived');
                }
                cell.classList.remove('active');
            }
        }
    }
}

function setColorBasedOnIndex(cell, cellIndex, gridSize) {
    const totalCells = gridSize * gridSize;

    // Calculate a value between 0 and 255 based on the cell's position
    let redValue = Math.floor((cellIndex / totalCells) * 255);
    cell.style.backgroundColor = `rgb(${redValue}, 100, 150)`;
}
