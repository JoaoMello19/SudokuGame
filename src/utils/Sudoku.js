import {
    getPairs,
    populate,
    randomInt,
    swapColumn,
    swapRow,
    swapSquareH,
    swapSquareV,
} from "./utils";

export function generateSudoku(difficulty = 0) {
    // Gerar o tabuleiro inicial
    let board = populate();

    // Realizar alterações aleatórias
    const changes = Array.from({ length: 50 }, () => [
        randomInt(0, 3),
        randomInt(0, 8),
    ]);

    for (const [change, n] of changes) {
        switch (change) {
            case 0:
                board = swapRow(board, n);
                break;
            case 1:
                board = swapColumn(board, n);
                break;
            case 2:
                board = swapSquareV(board, n, n + 1);
                break;
            case 3:
                board = swapSquareH(board, n, n + 1);
                break;
            default:
                throw new Error("Invalid change type");
        }
    }

    if (difficulty) {
        const pairs = getPairs(difficulty);
        for (const [row, col] of pairs) {
            board[row][col] = 0;
        }
    }

    return board;
}

export function checkSudoku(board) {
    function checkRow(row) {
        const values = new Set();
        for (let i = 0; i < 9; i++) {
            const value = board[row][i];
            if (value && values.has(value)) return false;
            values.add(value);
        }
        return true;
    }

    function checkCol(col) {
        const values = new Set();
        for (let i = 0; i < 9; i++) {
            const value = board[i][col];
            if (value && values.has(value)) return false;
            values.add(value);
        }
        return true;
    }

    function checkBox(box) {
        const values = new Set();
        const startRow = Math.floor(box / 3) * 3;
        const startCol = (box % 3) * 3;

        for (let i = startRow; i < startRow + 3; i++) {
            for (let j = startCol; j < startCol + 3; j++) {
                const value = board[i][j];
                if (value && values.has(value)) return false;
                values.add(value);
            }
        }
        return true;
    }
}

export class Sudoku {
    board;
    enabled;

    constructor(difficulty = 0) {
        this.board = generateSudoku(difficulty);
        this.enabled = this.board.map((row) =>
            row.map((value) => value === 0)
        );
    }

    get transposed() {
        return this.board[0].map((_, colIndex) =>
            this.board.map((row) => row[colIndex])
        );
    }

    getValue(row, col) {
        return this.board[row][col];
    }

    setValue(row, col, value) {
        this.board[row][col] = value;
    }

    getErrors(row, col) {
        let repeats = [];

        for (let i = 0; i < 9; i++)
            if (
                this.board[row][i] &&
                i !== col &&
                this.board[row][i] === this.board[row][col]
            )
                repeats.push([row, i]);

        for (let i = 0; i < 9; i++)
            if (
                this.board[i][col] &&
                i !== row &&
                this.board[i][col] === this.board[row][col]
            )
                repeats.push([i, col]);

        const firstRow = Math.floor(row / 3) * 3;
        const firstCol = Math.floor(col / 3) * 3;
        for (let i = firstRow; i < firstRow + 3; i++)
            for (let j = firstCol; j < firstCol + 3; j++)
                if (
                    this.board[i][j] &&
                    i !== row &&
                    j !== col &&
                    this.board[i][j] === this.board[row][col]
                )
                    repeats.push([i, j]);

        return repeats;
    }

    isCompleted() {
        const checkArray = (row) => row.length !== Set(row).length;

        if (this.board.some((row) => row.some((elem) => !elem))) return false;

        if (this.board.some(checkArray)) return false;
        if (this.transposed.some(checkArray)) return false;
        // TODO: verificar necessidade de identificar no quadrado também

        return true;
    }
}

// Funções para resolver

export class SudokuSolver {}
export class IterativeSudoku extends SudokuSolver {}
export class RecursiveSudoku extends SudokuSolver {}
