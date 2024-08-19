// implementation mainly follows this guideline
// https://tetris.fandom.com/wiki/Tetris_Guideline

// gives a very good idea on how to make the game work on a basic level
// https://gist.github.com/straker/3c98304f8a6a9174efd8292800891ea1

document.addEventListener("DOMContentLoaded", () => {

let playfield = document.getElementById("playfield");
let ctx = playfield.getContext("2d");

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
function drawGrid(width, height) {
    playfield.width = width * gridSize;
    playfield.height = height * gridSize;

    ctx.strokeStyle = "grey";

    for (let x = 0; x <= playfield.width; x += gridSize) {
        for (let y = 0; y <= playfield.height; y += gridSize)
            ctx.strokeRect(x, y, gridSize, gridSize);
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
function drawTetromino(tetromino) {
    ctx.fillStyle = tetromino.color;
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {
                ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
            }
        }
    }
}

// 10*24 grids with each of them sized 35
const gridSize = 35;
drawGrid(10, 24);

drawTetromino(getTetrominoByName("L"));

})