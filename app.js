document.addEventListener('DOMContentLoaded', () => {

const grid = document.querySelector('.grid');
let squares = Array.from(document.querySelectorAll('.grid div'));
const ScoreDisplay = document.querySelector('#score');
const StartBtn = document.querySelector('#start-button');
const width = 10;

// Tetrominoes (0,1,2,3 = rotation position)
const lTetromino = [
    [1, width+1, width*2+1, 2], // 0
    [width, width+1, width+2, width*2+2], // 1
    [1, width+1, width*2+1, width*2], // 2
    [width, width*2, width*2+1, width*2+2] // 3
];

const sTetromino = [
    [width*2,width*2+1,width+1,width+2], // 0
    [0,width,width+1,width*2+1], // 1
    [width*2,width*2+1,width+1,width+2], // 2
    [0,width,width+1,width*2+1] // 3
];

const zTetrimino = [
    [width,width+1,width*2+1,width*2+2], // 0
    [width+1,width*2+1,2,width+2], // 1
    [width,width+1,width*2+1,width*2+2], // 2
    [width+1,width*2+1,2,width+2] // 3
]

const tTetromino = [
    [width,1,width+1,width+2], // 0
    [1,width+1,width+2,width*2+1], // 1
    [width,width+1,width*2+1,width+2], // 2
    [1,width+1,width,width*2+1] // 3
];

const oTetromino = [
    [0,1,width,width+1], // 0
    [0,1,width,width+1], // 1
    [0,1,width,width+1], // 2
    [0,1,width,width+1], // 3
];

const iTetromino = [
    [1,width+1,width*2+1,width*3+1], // 0
    [width, width+1,width+2,width+3], // 1
    [1,width+1,width*2+1,width*3+1], // 2
    [width, width+1,width+2,width+3], // 3
];

const theTetrominoes = [lTetromino, sTetromino, tTetromino, oTetromino, iTetromino, zTetrimino];

let currentPosition = 4;
let currentRotation = 0;

// randomly select a Tetrimino and its first rotation
let randomTetrimino = Math.floor(Math.random()*theTetrominoes.length);
let randomRotation = Math.floor(Math.random()*4);

let current = theTetrominoes[randomTetrimino][randomRotation]; // first parameter = tetrimino, second parameter = rotation


// draw the tetromino
function draw() {
    current.forEach(index => { // applies logic to each item in the array
        squares[currentPosition + index].classList.add('tetromino') // sets the current position, adds tetrimino and colour from .css]
    })
}

// undraw the Tetromino
function undraw() {
    current.forEach(index => {
        squares[currentPosition + index].classList.remove('tetromino') 
    })
}


draw();








})
