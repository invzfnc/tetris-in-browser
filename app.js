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

// https://tetris.fandom.com/wiki/SRS
// tetrominos shape matrix
const tetrominos = {
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

// tetrominos colors
const colors = {
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
    ctx_grids.strokeStyle = "grey";

    for (let x = 0; x <= grids.width; x += gridSize) {
        for (let y = 0; y <= grids.height; y += gridSize)
            ctx_grids.strokeRect(x, y, gridSize, gridSize);
    }
}

// returns a tetromino along with its properties
function getTetrominoByName(name) {
    const tetromino = {
        name: name,
        matrix: tetrominos[name],
        color: colors[name]
    };
    return tetromino;
}

// draws specific tetromino on screen (given input like "I", "Z")
function drawTetromino(tetromino, x, y) {
    tetromino = getTetrominoByName(tetromino);
    ctx_playfield.fillStyle = tetromino.color;
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {
                ctx_playfield.fillRect((x + col) * gridSize, (y + row) * gridSize, gridSize, gridSize);
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
let previousTimeStamp; // to compare with timeStamp
let y = 0; // position of falling tetromino

function fall(timeStamp) {
    if (previousTimeStamp == undefined) { // first time calling
        previousTimeStamp = timeStamp;
    }
    const elapsed = timeStamp - previousTimeStamp;

    if (elapsed > 500) { // execute once every x milliseconds (alter falling speed here)
        console.log(timeStamp); // debug log
        ctx_playfield.clearRect(0, 0, playfield.width, playfield.height); // clear previous frame
        drawTetromino("Z", 1, y++); // draw new frame

        if (y == 19) { // position check
            cancelAnimationFrame(animation); // stop animation
            return; // end recursion
        }

        previousTimeStamp = timeStamp; // point reset
    }

    animation = requestAnimationFrame(fall);
}

drawGrid();
animation = requestAnimationFrame(fall);
// wip

})