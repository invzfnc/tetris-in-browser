document.addEventListener("DOMContentLoaded", () => {

// Implementation guidelines
// https://tetris.fandom.com/wiki/Tetris_Guideline
// https://tetris.fandom.com/wiki/Playfield

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

// https://stackoverflow.com/a/64802566
function drawGrid(width, height) {
    let playfield = document.getElementById("playfield");
    let ctx = playfield.getContext("2d");

    const gridWidth = playfield.width / width;
    const gridHeight = playfield.height / height;

    ctx.strokeStyle = "grey";

    for (let x = 0; x <= playfield.width; x += gridWidth) {
        for (let y = 0; y <= playfield.height; y += gridHeight)
            ctx.strokeRect(x, y, gridWidth, gridHeight);
    }
}

// 10*24 grids
drawGrid(10, 24);

})