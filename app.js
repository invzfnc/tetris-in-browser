// implementation mainly follows this guideline
// https://tetris.fandom.com/wiki/Tetris_Guideline

// gives a very good idea on how to make the game work on a basic level
// https://gist.github.com/straker/3c98304f8a6a9174efd8292800891ea1

document.addEventListener("DOMContentLoaded", () => {

let playfield = document.getElementById("playfield");
let ctx_playfield = playfield.getContext("2d");

let grids = document.getElementById("grids");
let ctx_grids = grids.getContext("2d");

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
for (let row = 0; row < gridRows; row++) {
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
    "I": "cyan",
    "J": "blue",
    "L": "orange",
    "O": "yellow",
    "S": "green",
    "T": "purple",
    "Z": "red"
}

// how to draw grids on canva: https://stackoverflow.com/a/64802566
// how the playfield should be: https://tetris.fandom.com/wiki/Playfield
function drawGrid() {
    ctx_grids.strokeStyle = "rgb(100, 100, 100)";

    for (let x = 0; x <= grids.width; x += gridSize) {
        for (let y = 0; y <= grids.height; y += gridSize)
            ctx_grids.strokeRect(x, y, gridSize, gridSize);
    }
}

// draws playfieldMatrix on screen (wip)
function drawPlayfield() {
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridColumns; col++) {
            if (playfieldMatrix[row][col]) {
                console.log("has value");
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
                (active_tetromino.y + row) * gridSize, gridSize, gridSize);
            }
        }
    }
}

// initialize values of active_tetromino
function initializeTetromino(name) {
    active_tetromino.name = name;
    active_tetromino.color = tetromino_colors[name];
    active_tetromino.matrix = tetromino_matrix[name];
    // tetromino spawn position
    // https://harddrop.com/wiki/Spawn_Location
    active_tetromino.x = name== "O" ? 4 : 3;
    active_tetromino.y = 0;
}

// requestAnimationFrame for game loop
// https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
// https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame

// why requestAnimationFrame over conventional "while" game loop
// http://nokarma.org/2011/02/02/javascript-game-development-the-game-loop/index.html

let animation; // holds request id
let previousTimeStamp; // to compare with timeStamp

// stores properties of current tetromino
let active_tetromino = {
    "name": null,
    "matrix": null,
    "color": null,
    "x": null,
    "y": null,
}

initializeTetromino("I");

function gameloop(timeStamp) {
    if (previousTimeStamp == undefined) { // first frame
        previousTimeStamp = timeStamp;
    }
    const elapsed = timeStamp - previousTimeStamp;

    if (elapsed > 500) { // execute once every x milliseconds (alter falling speed here)
        ctx_playfield.clearRect(0, 0, playfield.width, playfield.height); // clear previous frame
        drawPlayfield(); // draw playfield matrix
        drawTetromino(); // draw active tetromino
        active_tetromino.y++; // fall

        if (active_tetromino.y == 19) { // position check
            cancelAnimationFrame(animation); // stop animation
            return; // end recursion
        }

        previousTimeStamp = timeStamp; // point reset
    }

    animation = requestAnimationFrame(gameloop);
}

drawGrid();
animation = requestAnimationFrame(gameloop);

})