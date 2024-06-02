// Board.js
import { DIRECTIONS } from './Constants.js';
import Cell from './Cell.js';
import { fisherYatesSampling } from './Utils.js';

export default class Board {
    #difficulty;
    #rows;
    #cols;
    #mines;
    #flags;
    #board;
    #minesArray;
    #opened;
    #foundMine;

    constructor(difficulty) {
        this.#difficulty = difficulty.name;
        this.#rows = difficulty.rows;
        this.#cols = difficulty.cols;
        this.#mines = difficulty.mines;
        this.#flags = 0;
        this.#opened = 0;
        this.#foundMine = false;
        this.#minesArray = [];
        this.#board = this.#buildBoard();
    }

    get difficulty() {
        return this.#difficulty;
    }

    get rows() {
        return this.#rows;
    }

    get cols() {
        return this.#cols;
    }

    get mines() {
        return this.#mines;
    }

    get opened() {
        return this.#opened;
    }

    get flags() {
        return this.#flags;
    }

    get foundMine() {
        return this.#foundMine;
    }

    get allOpened() {
        return this.#opened === this.#rows * this.#cols - this.#mines;
    }

    #buildBoard() {
        return Array.from({ length: this.#rows }, () => Array.from({ length: this.#cols }, () => new Cell()));
    }

    getCell(row, col) {
        if (!this.isValidPosition(row, col)) {
            throw new RangeError(`Invalid cell position: row: ${ row }, col: ${ col }`);
        }
        return this.#board[row][col];
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.#rows && col >= 0 && col < this.#cols;
    }

    #getAdjacentCells(row, col) {
        return DIRECTIONS.map(([dRow, dCol]) => [row + dRow, col + dCol])
                         .filter(([adjRow, adjCol]) => this.isValidPosition(adjRow, adjCol));
    }

    initMines(row, col) {
        if (!this.isValidPosition(row, col)) {
            throw new RangeError(`Invalid cell position: row: ${ row }, col: ${ col }`);
        }

        if (this.#minesArray.length > 0) { return; }

        const adjacentCells = this.#getAdjacentCells(row, col);
        const excludeCells = new Set([`${ row },${ col }`, ...adjacentCells.map(([r, c]) => `${ r },${ c }`)]);
        const candidateCells = [];

        for (let r = 0; r < this.#rows; r++) {
            for (let c = 0; c < this.#cols; c++) {
                if (!excludeCells.has(`${ r },${ c }`)) { candidateCells.push([r, c]); }
            }
        }

        const mines = fisherYatesSampling(candidateCells, this.#mines);
        mines.forEach(([r, c]) => {
            this.#board[r][c].isMine = true;
            this.#minesArray.push([r, c]);
            this.#getAdjacentCells(r, c)
                .forEach(([adjRow, adjCol]) => {
                    if (!this.#board[adjRow][adjCol].isMine) { this.#board[adjRow][adjCol].adjacentMines++; }
                });
        });
    }

    openCell(row, col) {
        if (!this.isValidPosition(row, col)) {
            throw new RangeError(`Invalid cell position: row: ${ row }, col: ${ col }`);
        }

        const cell = this.#board[row][col];

        if (cell.isOpened || cell.isFlagged || this.#foundMine || this.allOpened) {
            return;
        }

        if (cell.isMine) {
            this.#foundMine = true;
            return;
        }

        cell.isOpened = true;
        this.#opened++;

        if (cell.adjacentMines === 0) {
            this.#getAdjacentCells(row, col)
                .forEach(([adjRow, adjCol]) => this.openCell(adjRow, adjCol));
        }
    }

    toggleFlag(row, col) {
        if (!this.isValidPosition(row, col)) {
            throw new RangeError(`Invalid cell position: row: ${ row }, col: ${ col }`);
        }

        const cell = this.#board[row][col];

        if (cell.isOpened) { return; }

        cell.isFlagged = !cell.isFlagged;
        this.#flags += cell.isFlagged ? 1 : -1;
    }

    revealMines() {
        this.#minesArray.forEach(([row, col]) => { this.#board[row][col].isOpened = true; });
    }
}