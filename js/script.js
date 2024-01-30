let gameInterval;
let paused = true;
let started = false;

let birthRule = [3];
let survivalRule = [2, 3];

const gridSize = 100; // Where grid = gridSize x gridSize
let grid = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(false));
const totalCells = gridSize * gridSize;

let currentSpeed = 200;

document.addEventListener('DOMContentLoaded', () => {
    createGrid();

    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('resetButton').addEventListener('click', resetGame);

    document.querySelectorAll('.toggle').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });

    document.getElementById('submitSelections').addEventListener('click', function() {
        // Update survivalRule array
        var selectedSNumbers = [];
        document.querySelectorAll('#toggleSButtons .toggle.active').forEach(activeButton => {
            selectedSNumbers.push(parseInt(activeButton.textContent));
        });
        survivalRule = selectedSNumbers;

        // Update birthRule array
        var selectedBNumbers = [];
        document.querySelectorAll('#toggleBButtons .toggle.active').forEach(activeButton => {
            selectedBNumbers.push(parseInt(activeButton.textContent));
        });
        birthRule = selectedBNumbers;
        changeSpeed();
    });

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
    started = false;
}

function createGrid() {
    const gameContainer = document.getElementById('gameContainer');
    for (let i = 0; i < totalCells; i++) {
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

        if (paused && started) {
            const neighbors = countLiveNeighbors(x, y);
            if (!survivalRule.includes(neighbors) && grid[x][y]) {
                event.target.classList.add('has-lived');
            }
        }

        updateGridDisplay();
    }
}

function changeSpeed() {
    let speedPercentage = parseInt(document.getElementById('speedInput').value);
    if (isNaN(speedPercentage) || speedPercentage <= 0) {
        return;
    }

    const baseSpeed = 200; // Base speed in milliseconds (higher = slower)
    currentSpeed = baseSpeed / (speedPercentage / 100);

    if (!paused) {
        clearInterval(gameInterval);
        gameInterval = setInterval(nextGeneration, currentSpeed);
    }

}

function startGame() {
    const startButton = document.getElementById('startButton');
    started = true;

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

                if (!cell.classList.contains('has-lived')) {
                    setColorBasedOnIndex(cell, cellIndex, gridSize);
                }
            } else {
                // Cell is not alive
                if (cell.classList.contains('active') && started) {
                    cell.classList.add('has-lived');
                }
                cell.classList.remove('active');
            }
        }
    }
}

function setColorBasedOnIndex(cell, cellIndex, gridSize) {
    let x = cellIndex % gridSize;
    let y = Math.floor(cellIndex / gridSize);

    /*
    let redValue = Math.floor((Math.sin(Math.PI * x / gridSize) + 1) / 2 * 255);
    let greenValue = Math.floor((Math.sin(Math.PI * y / gridSize) + 1) / 2 * 255);
    let blueValue = Math.floor((Math.sin(Math.PI * (x + y) / gridSize) + 1) / 2 * 255);
    */

    let redValue = Math.floor((x / gridSize) * 255);
    let greenValue = Math.floor((Math.cos(Math.PI * y / gridSize) + 1) / 2 * 255);
    let blueValue = Math.floor((Math.sin(Math.PI * x / gridSize) + 1) / 2 * 255);

    cell.style.backgroundColor = `rgb(${redValue}, ${greenValue}, ${blueValue})`;
}
