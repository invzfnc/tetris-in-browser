// implementation mainly follows this guideline
// https://tetris.fandom.com/wiki/Tetris_Guideline

// gives a very good idea on how to make the game work on a basic level
// https://gist.github.com/straker/3c98304f8a6a9174efd8292800891ea1

document.addEventListener("DOMContentLoaded", () => {

let playfield = document.getElementById("playfield");
let ctxPlayfield = playfield.getContext("2d");

let grids = document.getElementById("grids");
let ctxGrids = grids.getContext("2d");

// displayed/drawn grids
// 10*20 grids with each of them sized 35
const gridSize = 35;
const gridRows = 20;
const gridColumns = 10;

// sets width and height of both canvas
grids.width = gridColumns * gridSize;
grids.height = gridRows * gridSize;

playfield.width = gridColumns * gridSize;
playfield.height = gridRows * gridSize;

// 2D array/matrix to store playfield state
let playfieldMatrix = [];

// populate the empty state
// extra row for vanish space
// playfield guidelines: https://tetris.fandom.com/wiki/Playfield
for (let row = 0; row < gridRows + 1; row++) {
    playfieldMatrix[row] = [];
    
    for (let col = 0; col < gridColumns ; col++) {
        playfieldMatrix[row][col] = 0;
    }
}

// https://tetris.fandom.com/wiki/SRS
// tetromino shape matrix
const tetrominoMatrix = {
    "I": [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],

    "J": [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],

    "L": [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],

    "O": [
        [1, 1],
        [1, 1]
    ],

    "S": [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],

    "T": [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],

    "Z": [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
}

// tetromino colors
const tetrominoColors = {
    "I": "#80DEEA",
    "J": "#64B5F6",
    "L": "#FFB74D",
    "O": "#FFF59D",
    "S": "#4DB6AC",
    "T": "#CE93D8",
    "Z": "#F57C6E"
}

// stores properties of current tetromino
let activeTetromino = {
    "name": null,
    "matrix": null,
    "color": null,
    "x": null,
    "y": null,
    "lock": false,
    "lockDelay": false,
    "lockDelayCooldown": false
}

// 7-bag randomizer
let tetrominoSequence = [];

class Timer {
    constructor() {
        this.timeStamp = 0;
        this.totalTimeElapsed = 0
    }

    get timeElapsed() {
        let timeElapsed = Date.now() - this.timeStamp;
        this.totalTimeElapsed += timeElapsed;
        this.timeStamp = Date.now();
        return this.totalTimeElapsed / 1000;
    }

    start() {
        this.timeStamp = Date.now();
    }

    stop() {
        this.timeStamp = 0;
    }

    reset() {
        this.timeStamp = 0;
        this.totalTimeElapsed = 0;
    }
}

// initialize values of activeTetromino
function initializeTetromino(name) {
    activeTetromino.name = name;
    activeTetromino.color = tetrominoColors[name];
    activeTetromino.matrix = tetrominoMatrix[name];
    // tetromino spawn position
    // https://harddrop.com/wiki/Spawn_Location
    activeTetromino.x = name == "O" ? 4 : 3;
    activeTetromino.y = 0;
    activeTetromino.lock = false;
    activeTetromino.lockDelay = false;
    activeTetromino.lockDelayCooldown = false;
}

// random number generator
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// The maximum is exclusive and the minimum is inclusive
function randint(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); 
}

// guideline on generating "random" tetrominos
// https://tetris.wiki/Random_Generator
function generateSequence() {
    const tetrominos = Object.keys(tetrominoMatrix);

    while (tetrominos.length) {
        let index = randint(0, tetrominos.length);
        tetrominoSequence.push(tetrominos[index]);
        tetrominos.splice(index, 1);
    }
}

// pop and return name of next tetromino in sequence
function getNextTetromino() {
    if (tetrominoSequence.length == 0) {
        generateSequence();
    }
    return tetrominoSequence.pop();
}

// collision and boundary check
function isValidMove(y = activeTetromino.y, 
                     x = activeTetromino.x, 
                     matrix = activeTetromino.matrix) {
    for (let row = 0; row < activeTetromino.matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            // if piece is empty
            if (!matrix[row][col])
                continue;

            // out of bound (horizontally)
            if (x + col < 0 || x + col >= gridColumns) return false;

            // out of bound (bottom)
            if (y + row >= playfieldMatrix.length) return false;

            // collision with other tetrominos
            if (playfieldMatrix[y + row][x + col]) return false;
        }
    }
    return true;
}

// put/store active tetromino matrix into playfield matrix
function placeTetromino() {
    const x = activeTetromino.x;
    const y = activeTetromino.y;

    for (let row = 0; row < activeTetromino.matrix.length; row++) {
        for (let col = 0; col < activeTetromino.matrix[row].length; col++) {
            // if piece is empty
            if (!activeTetromino.matrix[row][col])
                continue;

            // check if placement has any part offscreen
            if (y + row <= 1) gameOver = true;

            playfieldMatrix[y + row][x + col] = activeTetromino.name;
        }
    }

    // lock tetromino after placement
    activeTetromino.lock = true;
    
    // disable hold queue lock
    holdQueueLock = false;

    checkLineClears();
}

// check for line clears and clears the row
// https://stackoverflow.com/a/36622150
function checkLineClears() {
    for (let row = 0; row < playfieldMatrix.length; row++) {
        if (!playfieldMatrix[row].includes(0)) {
            linesCleared++;

            let currentLevel = Math.floor(linesCleared / 5) + 1;
            if (currentLevel != level) { // increment
                level = currentLevel;
                fallingSpeed *= speedIncreaseConstant;
            }

            document.getElementById("linesCleared").textContent = linesCleared;
            document.getElementById("level").textContent = level;

            playfieldMatrix.splice(row, 1);
            playfieldMatrix.splice(0, 0, Array(10).fill(0));
        }
    }
}

// rotate square matrix clockwise 90 degrees
// https://stackoverflow.com/a/58668351
function rotate(matrix) {
    return matrix[0].map((val, index) => matrix.map(row => row[index]).reverse());
}

// how to draw grids on canva: https://stackoverflow.com/a/64802566
function drawGrid() {
    ctxGrids.strokeStyle = "rgb(100, 100, 100)";

    for (let x = 0; x <= grids.width; x += gridSize) {
        for (let y = 0; y <= grids.height; y += gridSize)
            ctxGrids.strokeRect(x, y, gridSize, gridSize);
    }
}

// put active tetromino into hold queue
function hold() {
    if (holdQueueLock) return; // do nothing if lock is on

    if (holdQueue) {
        // swapping two variables
        // https://stackoverflow.com/a/25910841
        [holdQueue, activeTetromino.name] = [activeTetromino.name, holdQueue];
        initializeTetromino(activeTetromino.name);
    }
    else {
        holdQueue = activeTetromino.name;
        initializeTetromino(getNextTetromino());
    }

    holdQueueLock = true;
}

// draws playfieldMatrix on screen
function drawPlayfield() {
    for (let row = 1; row < playfieldMatrix.length; row++) {
        for (let col = 0; col < playfieldMatrix[0].length; col++) {
            let grid = playfieldMatrix[row][col];
            if (grid) {
                ctxPlayfield.fillStyle = tetrominoColors[grid];
                ctxPlayfield.fillRect(col * gridSize, (row - 1) * gridSize,
                                       gridSize, gridSize)
            }
        }
    }
}

// draws activeTetromino on screen
function drawTetromino() {
    ctxPlayfield.fillStyle = activeTetromino.color;
    for (let row = 0; row < activeTetromino.matrix.length; row++) {
        for (let col = 0; col < activeTetromino.matrix[row].length; col++) {
            if (activeTetromino.matrix[row][col]) {
                ctxPlayfield.fillRect((activeTetromino.x + col) * gridSize, 
                (activeTetromino.y + row - 1) * gridSize, gridSize, gridSize);
            }
        }
    }
}

// draws placement preview on screen
function drawPlacementPreview() {
    ctxPlayfield.fillStyle = "#303030";
    let y = activeTetromino.y;
    while (isValidMove(y)) {
        y++;
    }
    for (let row = 0; row < activeTetromino.matrix.length; row++) {
        for (let col = 0; col < activeTetromino.matrix[row].length; col++) {
            if (activeTetromino.matrix[row][col]) {
                ctxPlayfield.fillRect((activeTetromino.x + col) * gridSize,
            (y + row - 2) * gridSize, gridSize, gridSize);
            }
        }
    }
}

// requestAnimationFrame for game loop
// https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
// https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame

// why requestAnimationFrame over conventional "while" game loop
// http://nokarma.org/2011/02/02/javascript-game-development-the-game-loop/index.html

let animation; // holds request id
let currentTimeStamp; // current timestamp
let previousTimeStamp; // to compare with timeStamp
let gameOver = false; // if game ends

let holdQueue = undefined; // stores held tetromino
let holdQueueLock = false; // locks hold function if true

const lockDelayMaxDuration = 300; // lock delay time in milliseconds
const lockDelayMaxCount = 5; // maximum moves before "locked"
const speedIncreaseConstant = 0.7;
const initialSpeed = 400; // tetromino falls every x millisecond
let fallingSpeed = initialSpeed;
let delayMoveCount = 0; // move count during delay
let elapsed = 0;

let linesCleared = 0;
let level = 1;
let timer = new Timer();
timer.start();

function gameloop(timeStamp) {
    currentTimeStamp = timeStamp;

    if (gameOver) {
        alert("Game over!");
        cancelAnimationFrame(animation); // stop animation
        return; // end recursion
    }

    if (previousTimeStamp == undefined) { // first frame
        previousTimeStamp = timeStamp;
        initializeTetromino(getNextTetromino());
        drawTetromino(); // draw active tetromino
    }
    
    elapsed = timeStamp - previousTimeStamp;
    ctxPlayfield.clearRect(0, 0, playfield.width, playfield.height); // clear previous frame
    drawPlacementPreview(); // draw placement preview
    drawPlayfield(); // draw playfield matrix
    drawTetromino(); // draw active tetromino

    if (!activeTetromino.lockDelay && elapsed > fallingSpeed) {
        activeTetromino.lockDelayCooldown = false;
        if (isValidMove(activeTetromino.y + 1))
            activeTetromino.y++;
        else {
            placeTetromino();
            initializeTetromino(getNextTetromino());
        }
        previousTimeStamp = timeStamp;
    }

    // lock delay
    // https://tetris.wiki/Lock_delay
    // https://harddrop.com/wiki/lock_delay
    if (activeTetromino.lockDelay) {
        if (elapsed >= lockDelayMaxDuration || delayMoveCount >= lockDelayMaxCount) {
            // reset state
            elapsed = fallingSpeed;
            delayMoveCount = 0;
            activeTetromino.lockDelay = false;
            activeTetromino.lockDelayCooldown = true;
        }
    }

    document.getElementById("timeElapsed").textContent = timer.timeElapsed;

    animation = requestAnimationFrame(gameloop);
}

// https://stackoverflow.com/a/43418287
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
window.addEventListener("keydown",
    (event) => {
        if (gameOver) return;

        // do nothing if the event was already processed
        if (event.defaultPrevented) return;

        // do nothing if tetromino is already in "locked" state
        if (activeTetromino.lock) return;

        if (!activeTetromino.lockDelayCooldown) {
            if (event.key == "ArrowDown" ||
                event.key == "ArrowLeft" ||
                event.key == "ArrowRight" ||
                event.key == "ArrowUp") {
                activeTetromino.lockDelay = true; 
                elapsed = 0;
                delayMoveCount++;
            previousTimeStamp = currentTimeStamp;
            }
        }

        switch (event.key) {
            // drop
            case "ArrowDown":
                if (isValidMove(activeTetromino.y + 1)) {
                    activeTetromino.y++;
                }
                break;
            // move left
            case "ArrowLeft":
                if (isValidMove(activeTetromino.y, activeTetromino.x - 1)) {
                    activeTetromino.x--;
                }
                break;
            // move right
            case "ArrowRight":
                if (isValidMove(activeTetromino.y, activeTetromino.x + 1)) {
                    activeTetromino.x++;
                }
                break;
            // rotate
            case "ArrowUp":
                if (event.repeat) return;
                transformed = rotate(activeTetromino.matrix);
                if (isValidMove(activeTetromino.y,
                                activeTetromino.x,
                                transformed)) {
                    activeTetromino.matrix = transformed;
                }
                break;
            // hard drop
            case " ":
                while (isValidMove(activeTetromino.y + 1)) {
                    activeTetromino.y++;
                }
                activeTetromino.lock = true;
                break;
            // hold
            case "c":
                hold();
                break;
        }

    }
)

drawGrid();
animation = requestAnimationFrame(gameloop);

})