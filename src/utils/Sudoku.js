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

export class Sudoku {
    #board;
    #enabled;

    constructor(param) {
        if (Number.isInteger(param)) {
            this.#board = generateSudoku(param);
        } else {
            this.#board = param;
        }

        this.#enabled = this.#board.map((row) =>
            row.map((value) => value === 0)
        );
    }

    get board() {
        return this.copy();
    }

    get enabled() {
        return this.#enabled;
    }

    get transposed() {
        return this.#board[0].map((_, colIndex) =>
            this.#board.map((row) => row[colIndex])
        );
    }

    get length() {
        return this.#board.length;
    }

    get range() {
        return Array.from({ length: this.length }, (_, i) => i);
    }

    get coords() {
        return this.range.flatMap((row) => this.range.map((col) => [row, col]));
    }

    show() {
        this.#board.forEach((row) => {
            console.log(row.join(" "));
        });
        console.log();
    }

    copy = () => this.#board.map((row) => row.map((value) => value));
    getValue = (row, col) => this.#board[row][col];
    setValue = (row, col, value) => (this.#board[row][col] = value);
    isEmpty = (row, col) => this.#board[row][col] === 0;
    getRow = (row) => this.#board[row];
    getColumn = (col) => this.transposed[col];

    getRegion(row, col) {
        const firstRow = Math.floor(row / 3) * 3;
        const firstCol = Math.floor(col / 3) * 3;
        return this.#board
            .slice(firstRow, firstRow + 3)
            .flatMap((row) => row.slice(firstCol, firstCol + 3));
    }

    isSolved() {
        return this.coords.every(
            ([row, col]) =>
                this.#board[row][col] !== 0 &&
                this.getErrors(row, col).length === 0
        );
    }

    getErrors(row, col) {
        let repeats = new Set();

        for (let i = 0; i < 9; i++)
            if (
                this.#board[row][i] &&
                this.#board[row][i] === this.#board[row][col]
            )
                repeats.add([row, i]);

        for (let i = 0; i < 9; i++)
            if (
                this.#board[i][col] &&
                this.#board[i][col] === this.#board[row][col]
            )
                repeats.add([i, col]);

        const firstRow = Math.floor(row / 3) * 3;
        const firstCol = Math.floor(col / 3) * 3;
        for (let i = firstRow; i < firstRow + 3; i++)
            for (let j = firstCol; j < firstCol + 3; j++)
                if (
                    this.#board[i][j] &&
                    this.#board[i][j] === this.#board[row][col]
                )
                    repeats.add([i, j]);

        return repeats.length > 1 ? repeats : [];
    }

    getMissing(row, col) {
        const difference = (A, B) =>
            Array.from(new Set([...A].filter((x) => !B.has(x))));

        let diff = new Set(this.range);
        diff = difference(diff, this.getRow(row));
        diff = difference(diff, this.getColumn(col));
        diff = difference(diff, this.getRegion(row, col));

        return Array.from(diff);
    }
}

// Funções para resolver

export class SudokuSolver extends Sudoku {
    constructor(sudoku) {
        super(sudoku.board);
    }
}

export class IterativeSudoku extends SudokuSolver {
    getMissingMatrix() {
        const missings = this.board.map((row) => row.map(() => 0));
        this.coords.forEach(([row, col]) => {
            if (this.isEmpty(row, col))
                missings[row][col] = this.getMissing(row, col);
            else missings[row][col] = this.getValue(row, col);
        });
        return missings;
    }

    solver1() {
        let flag = false;
        this.coords.forEach(([row, col]) => {
            const missings = this.getMissing(row, col);
            if (this.isEmpty(row, col) && missings.length == 1) {
                this.setValue(row, col, missings[0]);
                flag = true;
            }
        });
        return flag;
    }

    getUniques(values) {
        const counts = values.flat(1).reduce((acc, value) => {
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts)
            .filter(([_, count]) => count === 1)
            .map(([value]) => parseInt(value, 10)); // Converte para número, se necessário
    }

    #solver2({ arr, sliceF, coordF }) {
        const changes = [];
        this.coords.forEach(([row, col]) => {
            const slice = sliceF(arr, row, col);
            const uniques = this.getUniques(slice);

            uniques.forEach((value) => {
                const [_row, _col] = coordF(row, col, idx);
                for (let idx = 0; idx < slice.length; idx++) {
                    const miss = slice[idx];
                    const [_row, _col] = coordF(row, col, idx);
                    if (
                        miss.some((v) => v === value) &&
                        arr[_row][_col].length > 1
                    ) {
                        arr[_row][_col] = value;
                        changes.push([_row, _col]);
                        break;
                    }
                }
            });
        });

        return changes;
    }

    solver2() {
        const zip = (arr1, arr2) => arr1.map((val, idx) => [val, arr2[idx]]);
        const models = [
            {
                arr: zip(this.range, Array(this.length).fill(-1)),
                sliceF: (arr, row, _) => arr[row],
                coordF: (row, _, idx) => [row, idx],
            },
            {
                arr: zip(Array(this.length).fill(-1), this.range),
                sliceF: (arr, _, col) => arr.map((_row) => _row[col]),
                coordF: (_, col, idx) => [idx, col],
            },
            {
                arr: this.range.map((n) => [
                    Math.floor(n / 3) * 3,
                    (n % 3) * 3,
                ]),
                sliceF: (arr, row, col) => {
                    arr.slice(row, row + 3)
                        .map((_row) => _row.slice(col, col + 3))
                        .flat(1);
                },
                coordF: (row, col, idx) => [
                    row + Math.floor(idx / 3),
                    col + (idx % 3),
                ],
            },
        ];

        const missings = this.getMissingMatrix();

        let flag = false;
        models.forEach((model) => {
            const changes = this.#solver2(model);
            flag = flag || changes.length > 0;
            changes.forEach(([row, col]) => {
                this.setValue(row, col, missings[row][col][0]);
            });
        });
    }

    solve() {
        let flag = true;
        while (!this.isSolved() && flag) {
            flag = false;
            while (this.solver1()) flag = true;
            while (this.solver2()) flag = true;
        }
        return this.isSolved();
    }
}

export class RecursiveSudoku extends SudokuSolver {
    solve() {
        this.coords.forEach((row, col) => {
            if (this.isEmpty(row, col)) {
                this.getMissing(row, col).forEach((miss) => {
                    this.setValue(row, col, miss);
                    if (this.solve()) return true;
                });
                this.setValue(row, col, 0);
                return false;
            }
        });

        return this.isSolved();
    }
}
