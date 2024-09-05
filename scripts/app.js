// implementation mainly follows this guideline
// https://tetris.fandom.com/wiki/Tetris_Guideline

// gives a very good idea on how to make the game work on a basic level
// https://gist.github.com/straker/3c98304f8a6a9174efd8292800891ea1

document.addEventListener("DOMContentLoaded", () => {

let playfield = document.getElementById("playfield");
let ctx_playfield = playfield.getContext("2d");

let grids = document.getElementById("grids");
let ctx_grids = grids.getContext("2d");

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
const tetromino_matrix = {
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
const tetromino_colors = {
    "I": "#80DEEA",
    "J": "#64B5F6",
    "L": "#FFB74D",
    "O": "#FFF59D",
    "S": "#4DB6AC",
    "T": "#CE93D8",
    "Z": "#F57C6E"
}

// stores properties of current tetromino
let active_tetromino = {
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

// initialize values of active_tetromino
function initializeTetromino(name) {
    active_tetromino.name = name;
    active_tetromino.color = tetromino_colors[name];
    active_tetromino.matrix = tetromino_matrix[name];
    // tetromino spawn position
    // https://harddrop.com/wiki/Spawn_Location
    active_tetromino.x = name == "O" ? 4 : 3;
    active_tetromino.y = 0;
    active_tetromino.lock = false;
    active_tetromino.lockDelay = false;
    active_tetromino.lockDelayCooldown = false;
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
    const tetrominos = Object.keys(tetromino_matrix);

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
function isValidMove(y = active_tetromino.y, 
                     x = active_tetromino.x, 
                     matrix = active_tetromino.matrix) {
    for (let row = 0; row < active_tetromino.matrix.length; row++) {
        for (let col = 0; col < active_tetromino.matrix[row].length; col++) {
            // if piece is empty
            if (!active_tetromino.matrix[row][col])
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
    const x = active_tetromino.x;
    const y = active_tetromino.y;

    for (let row = 0; row < active_tetromino.matrix.length; row++) {
        for (let col = 0; col < active_tetromino.matrix[row].length; col++) {
            // if piece is empty
            if (!active_tetromino.matrix[row][col])
                continue;

            // check if placement has any part offscreen
            if (y + row <= 1) gameOver = true;

            playfieldMatrix[y + row][x + col] = active_tetromino.name;
        }
    }

    // lock tetromino after placement
    active_tetromino.lock = true;

    checkLineClears();
}

// check for line clears and clears the row
// https://stackoverflow.com/a/36622150
function checkLineClears() {
    for (let row = 0; row < playfieldMatrix.length; row++) {
        if (!playfieldMatrix[row].includes(0)) {
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
    ctx_grids.strokeStyle = "rgb(100, 100, 100)";

    for (let x = 0; x <= grids.width; x += gridSize) {
        for (let y = 0; y <= grids.height; y += gridSize)
            ctx_grids.strokeRect(x, y, gridSize, gridSize);
    }
}

// draws playfieldMatrix on screen
function drawPlayfield() {
    for (let row = 1; row < playfieldMatrix.length; row++) {
        for (let col = 0; col < playfieldMatrix[0].length; col++) {
            let grid = playfieldMatrix[row][col];
            if (grid) {
                ctx_playfield.fillStyle = tetromino_colors[grid];
                ctx_playfield.fillRect(col * gridSize, (row - 1) * gridSize,
                                       gridSize, gridSize)
            }
        }
    }
}

// draws active_tetromino on screen
function drawTetromino() {
    ctx_playfield.fillStyle = active_tetromino.color;
    for (let row = 0; row < active_tetromino.matrix.length; row++) {
        for (let col = 0; col < active_tetromino.matrix[row].length; col++) {
            if (active_tetromino.matrix[row][col]) {
                ctx_playfield.fillRect((active_tetromino.x + col) * gridSize, 
                (active_tetromino.y + row - 1) * gridSize, gridSize, gridSize);
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

const lockDelayMaxDuration = 300; // lock delay time in milliseconds
const lockDelayMaxCount = 5; // maximum moves before "locked"
const fallingSpeed = 500; // tetromino falls every x millisecond
let delayMoveCount = 0; // move count during delay
let elapsed = 0;

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
    ctx_playfield.clearRect(0, 0, playfield.width, playfield.height); // clear previous frame
    drawPlayfield(); // draw playfield matrix
    drawTetromino(); // draw active tetromino

    if (!active_tetromino.lockDelay && elapsed > fallingSpeed) {
        active_tetromino.lockDelayCooldown = false;
        if (isValidMove(active_tetromino.y + 1))
            active_tetromino.y++;
        else {
            placeTetromino();
            initializeTetromino(getNextTetromino());
        }
        previousTimeStamp = timeStamp;
    }

    // lock delay
    // https://tetris.wiki/Lock_delay
    // https://harddrop.com/wiki/lock_delay
    if (active_tetromino.lockDelay) {
        if (elapsed >= lockDelayMaxDuration || delayMoveCount >= lockDelayMaxCount) {
            // reset state
            elapsed = fallingSpeed;
            delayMoveCount = 0;
            active_tetromino.lockDelay = false;
            active_tetromino.lockDelayCooldown = true;
        }
    }

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
        if (active_tetromino.lock) return;

        if (!active_tetromino.lockDelayCooldown) {
            if (event.key == "ArrowDown" ||
                event.key == "ArrowLeft" ||
                event.key == "ArrowRight") {
                active_tetromino.lockDelay = true; 
                elapsed = 0;
                delayMoveCount++;
            previousTimeStamp = currentTimeStamp;
            }
        }

        switch (event.key) {
            // drop
            case "ArrowDown":
                if (isValidMove(active_tetromino.y + 1)) {
                    active_tetromino.y++;
                }
                break;
            // move left
            case "ArrowLeft":
                if (isValidMove(active_tetromino.y, active_tetromino.x - 1)) {
                    active_tetromino.x--;
                }
                break;
            // move right
            case "ArrowRight":
                if (isValidMove(active_tetromino.y, active_tetromino.x + 1)) {
                    active_tetromino.x++;
                }
                break;
            // rotate
            case "ArrowUp":
                transformed = rotate(active_tetromino.matrix);
                if (isValidMove(active_tetromino.y,
                                active_tetromino.x,
                                transformed)) {
                    active_tetromino.matrix = transformed;
                }
                break;
            // hard drop
            case " ":
                while (isValidMove(active_tetromino.y + 1)) {
                    active_tetromino.y++;
                }
                active_tetromino.lock = true;
                break;
        }

    }
)

drawGrid();
animation = requestAnimationFrame(gameloop);

})