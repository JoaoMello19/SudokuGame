import { useState } from "react";

function Cell({ row, col, value, isInput, isWrong, onChange }) {
    const colors = {
        red: "#F55",
        grey: "#EEE",
        black: "#000",
        white: "#FFF",
        lightRed: "#FBB",
    };

    if (!isInput)
        return (
            <td
                style={{
                    color: isWrong ? colors.red : colors.black,
                    backgroundColor: isWrong ? colors.lightRed : colors.white,
                }}
            >
                {value}
            </td>
        );

    return (
        <td>
            <input
                type="text"
                value={value || ""}
                onChange={onChange(row, col)}
                style={{ backgroundColor: isWrong ? colors.red : colors.grey }}
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

            sudoku.setValue(row, col, value ? parseInt(value) : 0);

            setErrors(Array.from({ length: 9 }, () => Array(9).fill(false)));
            // checa o resto (primeiro se completou, depois de esta errado)
            sudoku.getErrors(row, col).forEach((coords) => {
                const [errRow, errCol] = coords;
                setErrors((prev) => {
                    const newErrors = [...prev];
                    newErrors[errRow][errCol] = true;
                    return newErrors;
                });
            });

            setUpdate((prev) => !prev);
        };
    }

    return (
        <table>
            <tbody>
                {sudoku.board.map((row, idx1) => (
                    <tr key={idx1}>
                        {row.map((value, idx2) => {
                            return (
                                <Cell
                                    key={[idx1, idx2]}
                                    row={idx1}
                                    col={idx2}
                                    value={value}
                                    isInput={sudoku.enabled[idx1][idx2]}
                                    isWrong={errors[idx1][idx2]}
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
