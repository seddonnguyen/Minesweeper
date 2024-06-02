class Difficulty {
    constructor(name, rows, cols, mines) {
        this._name = name;
        this._rows = rows;
        this._cols = cols;
        this._mines = mines;
    }

    get name() {
        return this._name;
    }

    get rows() {
        return this._rows;
    }

    get cols() {
        return this._cols;
    }

    get mines() {
        return this._mines;
    }
}

Difficulty.BEGINNER = Object.freeze(new Difficulty("Beginner", 8, 8, 10));
Difficulty.INTERMEDIATE = Object.freeze(new Difficulty("Intermediate", 16, 16, 40));
Difficulty.EXPERT = Object.freeze(new Difficulty("Expert", 30, 16, 99));

export default Difficulty;