// Cell.js
export default class Cell {
    static UNOPENED = "X";
    static FLAGGED = "F";
    static MINE = "M";
    static NO_ADJACENT = " ";
    static ADJACENT = "{0}";

    #isMine;
    #isFlagged;
    #isOpened;
    #adjacentMines;
    #currentState;
    #defaultState;

    constructor() {
        this.#isMine = false;
        this.#isFlagged = false;
        this.#isOpened = false;
        this.#adjacentMines = 0;
        this.#currentState = Cell.UNOPENED;
        this.#defaultState = Cell.NO_ADJACENT;
    }

    get isMine() { return this.#isMine; }

    set isMine(value) {
        this.#isMine = value;
        this.#defaultState = this.#isMine ? Cell.MINE : Cell.NO_ADJACENT;
        this.#adjacentMines = 0;
        this.#isOpened = false;
        this.#isFlagged = false;
        this.#updateState();
    }

    get isFlagged() { return this.#isFlagged; }

    set isFlagged(value) {
        if (this.#isOpened) { return; }
        this.#isFlagged = value;
        this.#updateState();
    }

    get isOpened() { return this.#isOpened; }

    set isOpened(value) {
        this.#isOpened = value;
        this.#updateState();
    }

    get adjacentMines() { return this.#adjacentMines; }

    set adjacentMines(value) {
        if (this.#isMine || value < 0) { return; }
        this.#adjacentMines = value;
        this.#defaultState = this.#adjacentMines > 0 ? Cell.#formatAdjacent(Cell.ADJACENT, value) : Cell.NO_ADJACENT;
        if (this.#isOpened) { this.#updateState(); }
    }

    get currentState() { return this.#currentState; }

    get defaultState() { return this.#defaultState; }

    static #formatAdjacent = (template, ...args) => template.replace(/{(\d+)}/g, (match, index) => args[index]);

    #updateState() {
        if (this.#isOpened) {
            this.#currentState = this.#defaultState;
        } else if (this.#isFlagged) {
            this.#currentState = Cell.FLAGGED;
        } else {
            this.#currentState = Cell.UNOPENED;
        }
    }
}