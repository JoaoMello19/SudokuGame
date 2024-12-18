import { useState } from "react";

function Cell({ row, col, value, isInput, isWrong, onChange }) {
    if (!isInput)
        return (
            <td style={{ cursor: "default", color: isWrong ? "red" : "black" }}>
                {value}
            </td>
        );

    return (
        <td>
            <input
                type="text"
                value={value || ""}
                onChange={onChange(row, col)}
                style={{ backgroundColor: isWrong ? "#F00" : "#EEE" }}
            />
        </td>
    );
}

export default function Board({ sudoku }) {
    const [errors, setErrors] = useState(
        Array.from({ length: 9 }, () => Array(9).fill(false))
    );

    const [update, setUpdate] = useState(false);

    function onCellChange(row, col) {
        return (evt) => {
            const value = evt.target.value;
            if (value !== "" && !/^[1-9]$/.test(value)) return;

            // checa o resto (primeiro se completou, depois de esta errado)

            sudoku.setValue(row, col, value ? parseInt(value) : "");
            setUpdate((prev) => !prev);
        };
    }

    return (
        <table>
            <tbody>
                {sudoku.board.map((row, idx1) => (
                    <tr key={idx1}>
                        {row.map((value, idx2) => {
                            const isInput = sudoku.enabled[idx1][idx2];
                            const isWrong = errors[idx1][idx2];

                            return (
                                <Cell
                                    key={[idx1, idx2]}
                                    row={idx1}
                                    col={idx2}
                                    value={value}
                                    isInput={isInput}
                                    isWrong={isWrong}
                                    onChange={onCellChange}
                                />
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
