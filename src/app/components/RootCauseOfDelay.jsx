"use client";

import styles from "../styles/default.module.css";

export default function RootCauseOfDelay({
    inputValue,
    onInputValueChange,
    rootCausePounds,
    onRootCausePoundsChange,
    plannedPieceCount,
    plannedPounds,
    actualPieces,
    onActualPiecesChange,
}) {
    return (
        <div className={styles.section}>
            <h2 className={styles.subHeading}>Root Cause of Delay</h2>

            <table className={styles.table}>
                <tbody>
                    <tr>
                        <td className={styles.td}>
                            <input type="text" className={styles.input} />
                        </td>
                        <td className={styles.td}>Late Aircraft</td>

                        <td className={styles.td}>
                            <input type="text" className={styles.input} />
                        </td>
                        <td className={styles.td}>Excess Minisort</td>

                        <td className={styles.td}>
                            <input type="text" className={styles.input} />
                        </td>
                        <td className={styles.td}>Weather</td>
                    </tr>

                    <tr>
                        <td className={styles.td}>
                            <input type="text" className={styles.input} />
                        </td>
                        <td className={styles.td}>Late Truck</td>

                        <td className={styles.td} />
                        <td className={styles.td} />

                        <td className={styles.td}>
                            <input type="text" className={styles.input} />
                        </td>
                        <td className={styles.td}>Other</td>
                    </tr>

                    <tr>
                        <td className={styles.td} />

                        <td className={styles.td}>
                            <textarea
                                id="delay-codes"
                                className={styles.input}
                                value={inputValue}
                                onChange={(event) => onInputValueChange(event.target.value)}
                            />
                        </td>

                        <td className={styles.td} />

                        <td className={styles.td}>
                            <p>Plan = {plannedPounds}</p>

                            <p>
                                Actual:{" "}
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={rootCausePounds}
                                    onChange={(event) =>
                                        onRootCausePoundsChange(event.target.value)
                                    }
                                />
                            </p>

                            <p>Plan = {plannedPieceCount} pieces</p>

                            <p>
                                Actual:{" "}
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={actualPieces}
                                    onChange={(event) => {
                                        const rawValue = event.target.value
                                            .replace(/,/g, "")
                                            .replace(/[^\d]/g, "");

                                        onActualPiecesChange(
                                            rawValue ? Number(rawValue).toLocaleString() : ""
                                        );
                                    }}
                                />
                            </p>
                        </td>

                        <td className={styles.td} />
                        <td className={styles.td} />
                    </tr>
                </tbody>
            </table>
        </div>
    );
}