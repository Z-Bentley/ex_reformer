"use client";

import { Button } from "@/components/ui/button";
import styles from "../styles/default.module.css";
import * as excel from "../excel";

export default function OutboundTruckRoutes({
    destinationData,
    onAddRoute,
    onDeleteRoute,
    onRouteChange,
}) {
    return (
        <div className={styles.section}>
            <div className="flex justify-between p-1">
                <h2 className={styles.subHeading}>Outbound Truck Routes</h2>

                <Button id="doNotCopy" onClick={onAddRoute}>
                    Add New Route
                </Button>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>Destination</th>
                        <th className={styles.th}>Schedule</th>
                        <th className={styles.th}>Actual</th>
                        <th className={styles.th}>Variance</th>
                        <th id="doNotCopy" className={styles.th}>
                            Delete
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {destinationData.map((row) => (
                        <tr key={row.id}>
                            <td className={styles.td}>
                                <div className="font-bold">
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={row.destination || ""}
                                        onChange={(event) =>
                                            onRouteChange(row.id, "destination", event.target.value)
                                        }
                                    />
                                </div>
                            </td>

                            <td className={styles.td}>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={row.schedule || ""}
                                    onChange={(event) =>
                                        onRouteChange(row.id, "schedule", excel.formatTimeInput(event.target.value))
                                    }
                                />
                            </td>

                            <td className={styles.td}>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={row.actual || ""}
                                    onChange={(event) =>
                                        onRouteChange(row.id, "actual", excel.formatTimeInput(event.target.value))
                                    }
                                />
                            </td>

                            <td className={`${styles.td} ${styles.textCenter}`}>
                                {row.variance}
                            </td>

                            <td className="flex justify-center" id="doNotCopy">
                                <Button
                                    variant="destructive"
                                    onClick={() => onDeleteRoute(row.id)}
                                >
                                    X
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}