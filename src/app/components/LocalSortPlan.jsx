"use client";

import styles from "../styles/default.module.css";
import * as excel from "../excel";

export default function LocalSortPlan({
    activeId,
    flightData,
    scheduledTime,
    onScheduledTimeChange,
    onFlightEdit,
}) {
    return (
        <div className={styles.section}>
            <h2 className={styles.subHeading}>Local Sort Plan</h2>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>Flight {activeId}</th>
                        <th className={styles.th}>Schedule</th>
                        <th className={styles.th}>Actual</th>
                        <th className={styles.th}>Variance</th>
                    </tr>
                </thead>

                <tbody>
                    {flightData.map((row) => (
                        <tr key={row.id}>
                            <td className={styles.td}>
                                <div className="font-bold">{row.name}</div>
                            </td>

                            <td className={styles.td}>
                                {row.id === 0 ? (
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={scheduledTime}
                                        onChange={(event) => {
                                            const newTime = excel.formatTimeInput(event.target.value);
                                            onScheduledTimeChange(newTime);
                                            onFlightEdit(row.id, "schedule", newTime);
                                        }}
                                    />
                                ) : (
                                    <span>{row.schedule}</span>
                                )}
                            </td>

                            <td className={styles.td}>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={row.actual || ""}
                                    onChange={(event) =>
                                        onFlightEdit(row.id, "actual", event.target.value)
                                    }
                                />
                            </td>

                            <td
                                className={`${styles.td} ${styles.textCenter}`}
                                data-sort-end-variance={row.id === 2 ? "true" : "false"}
                            >
                                <div>{row.variance}</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}