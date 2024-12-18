/* FUNÇÕES INTERNAS */

// Transpor matriz
const transpose = (board) => {
    board = board[0].map((_, colIndex) => board.map((row) => row[colIndex]));
    return board;
};

// Rotacionar elementos de um array
function rotate(array, steps) {
    const len = array.length;
    steps = ((steps % len) + len) % len; // Ajusta passos negativos
    array.push(...array.splice(0, len - steps));
}

// Embaralhar um array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomInt(0, i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/* FUNÇÕES EXTERNAS */

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Popular a grade inicial do Sudoku
export function populate() {
    const range = Array.from({ length: 9 }, (_, i) => i);
    const values = shuffle(range.map((n) => n + 1));
    const board = [];

    for (let row of range) {
        const numbers = [...values];
        rotate(numbers, (row % 3) * -3);
        rotate(numbers, -Math.floor(row / 3));
        board.push(numbers);
    }
    return board;
}

// Trocar duas linhas no mesmo quadrado
export function swapRow(board, n) {
    const k = Math.floor(n / 3); // Identifica o quadrado
    const n1 = 3 * k + (n % 3); // Linha 1
    const n2 = 3 * k + ((n + 1) % 3); // Linha 2
    const arr = board[n1];
    board[n1] = board[n2];
    board[n2] = arr;
    return board;
}

// Trocar duas colunas no mesmo quadrado
export function swapColumn(board, n) {
    const transposed = transpose(board);
    swapRow(transposed, n);
    return transpose(transposed);
}

// Trocar dois quadrados horizontalmente
export function swapSquareH(board, n1, n2) {
    const transposed = transpose(board);
    return transpose(swapSquareV(transposed, n1, n2));
}

// Trocar dois quadrados verticalmente
export function swapSquareV(board, n1, n2) {
    n1 %= 3;
    n2 %= 3;
    const rows = [board.slice(0, 3), board.slice(3, 6), board.slice(6)];
    [rows[n1], rows[n2]] = [rows[n2], rows[n1]];
    return rows.flat();
}

export function getPairs(N) {
    const pairs = new Set();
    const totalPairs = N * 10;

    while (pairs.size < totalPairs) {
        const row = Math.floor(Math.random() * 9); // Gera de 0 a 8
        const col = Math.floor(Math.random() * 9); // Gera de 0 a 8

        // Adiciona o par ao Set (automático: apenas valores únicos)
        pairs.add(`${row},${col}`);
    }

    // Converte o Set em um array de pares (desfazendo o formato string)
    return Array.from(pairs).map((pair) => {
        const [row, col] = pair.split(",").map(Number);
        return [row, col];
    });
}
