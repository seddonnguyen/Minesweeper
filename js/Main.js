// Main.js
import Difficulty from './Difficulty.js';
import Board from './Board.js';
import { drawImage } from './DrawImage.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const context = canvas.getContext('2d');
    const playButton = document.getElementById('playButton');
    const difficultySelect = document.getElementById('difficulty');
    const gameScreen = document.getElementById('gameScreen');
    const startScreen = document.getElementById('startScreen');
    const gameStatus = document.getElementById('gameStatus');
    const gameOverModal = document.getElementById('gameOverModal');
    const closeGameOverModal = document.getElementById('closeGameOverModal');
    const gameOverHeader = document.getElementById('gameOverHeader');
    const gameOverMessage = document.getElementById('gameOverMessage');
    const gameOverTime = document.getElementById('gameOverTime');
    const newGameButton = document.getElementById('newGameButton');
    const restartButton = document.getElementById('restartButton');
    const newLevelButton = document.getElementById('newLevelButton');
    const mineImg = new Image();
    const flagImg = new Image();
    const invalidImg = new Image();

    mineImg.src = './images/mine.svg';
    flagImg.src = './images/flag.svg';
    invalidImg.src = './images/invalid.svg';

    let board;
    let cellSize;
    let startTime;
    let timerInterval;
    let elapsedTimeString;

    // Setup Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sounds = {};

    const loadSound = (url) => {
        return fetch(url)
            .then(response => response.arrayBuffer())
            .then(data => audioContext.decodeAudioData(data));
    };

    const playSound = (buffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
    };

    const initSounds = async () => {
        sounds.explosion = await loadSound('sounds/explosion.mp3');
        sounds.victory = await loadSound('sounds/victory.mp3');
        sounds.flag = await loadSound('sounds/flag.mp3');
        sounds.open = await loadSound('sounds/open.mp3');
        sounds.select = await loadSound('sounds/select.mp3');
        sounds.close = await loadSound('sounds/close.mp3');
    };

    initSounds();

    playButton.addEventListener('click', () => {
        playSound(sounds.select);
        startGame();
    });

    closeGameOverModal.addEventListener('click', () => {
        playSound(sounds.close);
        gameOverModal.classList.add('hidden');
    });

    newGameButton.addEventListener('click', () => {
        playSound(sounds.select);
        gameOverModal.classList.add('hidden');
        startScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
    });

    restartButton.addEventListener('click', () => {
        playSound(sounds.select);
        startGame();
    });

    newLevelButton.addEventListener('click', () => {
        playSound(sounds.select);
        gameScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    });

    function startGame() {
        const difficultyLevel = parseInt(difficultySelect.value);
        const difficulties = {
            1: Difficulty.BEGINNER,
            2: Difficulty.INTERMEDIATE,
            3: Difficulty.EXPERT
        };
        const difficulty = difficulties[difficultyLevel];

        board = new Board(difficulty);

        const availableWidth = window.innerWidth - 40;
        const availableHeight = window.innerHeight - 200;
        const maxCellWidth = Math.max(availableWidth / board.cols, 25);
        const maxCellHeight = Math.max(availableHeight / board.rows, 25);
        cellSize = Math.min(maxCellWidth, maxCellHeight);

        canvas.width = cellSize * board.cols;
        canvas.height = cellSize * board.rows;
        startTime = new Date().getTime();

        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        gameOverModal.classList.add('hidden');
        updateGameStatus();
        drawBoard();
        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('contextmenu', handleCanvasRightClick);
        startTimer();
    }

    function handleCanvasClick(event) {
        const {
                  offsetX,
                  offsetY
              } = event;
        const row = Math.floor(offsetY / cellSize);
        const col = Math.floor(offsetX / cellSize);

        if (board && board.isValidPosition(row, col)) {
            if (board.getCell(row, col).isOpened || board.getCell(row, col).isFlagged) { return; }
            playSound(sounds.open);

            if (board.opened === 0) { board.initMines(row, col); }

            board.openCell(row, col);
            updateGameStatus();
            drawBoard();

            if (board.foundMine) {
                endGame();
                board.revealMines();
                drawBoard();
                playSound(sounds.explosion);
                setTimeout(() => displayGameOverModal("Game Over!", "You hit a mine."), 500);
            } else if (board.allOpened) {
                endGame();
                playSound(sounds.victory);
                setTimeout(() => displayGameOverModal("Congratulations!", "You've cleared the minefield."), 500);
            }
        }
    }

    function handleCanvasRightClick(event) {
        event.preventDefault();
        if (board.opened === 0) { return; }
        const {
                  offsetX,
                  offsetY
              } = event;
        const row = Math.floor(offsetY / cellSize);
        const col = Math.floor(offsetX / cellSize);

        if (board && board.isValidPosition(row, col) && !board.getCell(row, col).isOpened) {
            playSound(sounds.flag);
            board.toggleFlag(row, col);
            updateGameStatus();
            drawBoard();
        }
    }

    function drawBoard() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = `${ cellSize / 2 }px 'Roboto'`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        for (let row = 0; row < board.rows; row++) {
            for (let col = 0; col < board.cols; col++) {
                const cell = board.getCell(row, col);
                const x = col * cellSize;
                const y = row * cellSize;

                context.strokeStyle = '#f9a826';
                context.lineWidth = 2;
                context.strokeRect(x, y, cellSize, cellSize);

                if (cell.isOpened) {
                    context.fillStyle = '#333'; // Background color for opened cells
                    context.fillRect(x, y, cellSize, cellSize);
                    if (cell.isMine) {
                        drawImage(context, mineImg, x + 2, y + 2, cellSize - 4);
                    } else if (cell.adjacentMines > 0) {
                        context.fillStyle = getNumberColor(cell.adjacentMines);
                        context.fillText(cell.adjacentMines, x + cellSize / 2, y + cellSize / 2);
                    }
                } else if (cell.isFlagged) {
                    let img = flagImg;
                    if (board.foundMine && !cell.isMine) {
                        img = invalidImg;
                    }
                    context.fillStyle = '#333'
                    context.fillRect(x, y, cellSize, cellSize);
                    drawImage(context, img, x + 2, y + 2, cellSize - 4);
                } else {
                    context.fillStyle = '#444'; // Background color for unopened cells
                    context.fillRect(x, y, cellSize, cellSize);
                }
            }
        }
    }

    function getNumberColor(number) {
        switch (number) {
            case 1:
                return '#1abc9c';  // Turquoise
            case 2:
                return '#3498db';  // Light Blue
            case 3:
                return '#e74c3c';  // Red
            case 4:
                return '#9b59b6';  // Purple
            case 5:
                return '#f39c12';  // Orange
            case 6:
                return '#2ecc71';  // Green
            case 7:
                return '#e67e22';  // Carrot
            case 8:
                return '#e84393';  // Pink
            default:
                return '#ecf0f1';  // Light Gray
        }
    }

    function updateGameStatus() {
        elapsedTimeString = getElapsedTime();
        gameStatus.innerHTML = `
            <div>Cells Opened: ${ board.opened }</div>
            <div>Flags Placed: ${ board.flags }</div>
            <div>Mines Remaining: ${ board.mines - board.flags }</div>
            <div>Elapsed Time: ${ elapsedTimeString }</div>
        `;
    }

    function getElapsedTime() {
        const timeDiff = new Date().getTime() - startTime;
        const totalSeconds = Math.floor(timeDiff / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${ minutes.toString()
                          .padStart(2, '0') }:${ seconds.toString()
                                                        .padStart(2, '0') }`;
    }

    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(updateGameStatus, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function displayGameOverModal(header, message) {
        gameOverHeader.textContent = header;
        gameOverMessage.textContent = message;
        gameOverTime.textContent = `Time: ${ elapsedTimeString }`;
        gameOverModal.classList.remove('hidden');
    }

    function endGame() {
        stopTimer();
        canvas.removeEventListener('click', handleCanvasClick);
        canvas.removeEventListener('contextmenu', handleCanvasRightClick);
    }
});