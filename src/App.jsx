import { useEffect, useState } from "react";
import { generateSudoku, Sudoku } from "./utils/Sudoku";
import Board from "./components/Board";
import "./App.css";

export default function App() {
    return (
        <main>
            <h1>Sudoku</h1>
            <Board sudoku={new Sudoku(2)} />
        </main>
    );
}
