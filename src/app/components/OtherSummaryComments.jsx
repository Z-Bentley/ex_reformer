"use client";

import styles from "../styles/default.module.css";

export default function OtherSummaryComments({
    editableTotalWeight,
    editableHeavyWeight,
    editableExpressWeight,
    onTotalWeightChange,
    onHeavyWeightChange,
}) {
    return (
        <div className={styles.section}>
            <h2 className={styles.subHeading}>Other Summary Comments</h2>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>Category</th>
                        <th className={styles.th}>Value (lbs)</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td className={styles.td}>Total Payload</td>
                        <td className={styles.td}>
                            <input
                                type="text"
                                className={styles.input}
                                value={editableTotalWeight}
                                onChange={(event) => onTotalWeightChange(event.target.value)}
                            />
                        </td>
                    </tr>

                    <tr>
                        <td className={styles.td}>Heavyweight</td>
                        <td className={styles.td}>
                            <input
                                type="text"
                                className={styles.input}
                                value={editableHeavyWeight}
                                onChange={(event) => onHeavyWeightChange(event.target.value)}
                            />
                        </td>
                    </tr>

                    <tr>
                        <td className={styles.td}>Express</td>
                        <td className={`${styles.td} ${styles.textCenter}`}>
                            {editableExpressWeight}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}