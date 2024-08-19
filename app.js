document.addEventListener("DOMContentLoaded", () => {

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