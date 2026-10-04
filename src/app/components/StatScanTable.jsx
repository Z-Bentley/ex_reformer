import React from 'react'
import styles from "../styles/default.module.css";

export default function StatScanTable({
    onInputChange
}) {
    return (
        <div className={styles.section}>
            <h2 className={styles.subHeading}>Scans</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>Stat Scan</th>
                        <th className={styles.th}>Cons Number</th>
                        <th className={styles.th}>Explanation</th> 
                    </tr>
                    
                </thead>
                <tbody>
                    <tr>
                        <td className={styles.td}>
                            <input
                                type="text"
                                className={styles.input}
                                onChange={(event) =>
                                    onInputChange(event.target.value)
                                }
                            />
                        </td>
                        <td className={styles.td}>
                            <input
                                type="text"
                                className={styles.input}
                                onChange={(event) =>
                                    onInputChange(event.target.value)
                                }
                            />
                        </td>
                        <td className={styles.td}>
                            <input
                                type="text"
                                className={styles.input}
                                onChange={(event) =>
                                    onInputChange(event.target.value)
                                }
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
