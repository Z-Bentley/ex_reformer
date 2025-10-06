import React from 'react'
import styles from "../styles/base.module.css"

export default function Unscheduled() {
    const route = "Route: "
    const routeName = "IF290"
    const arrivalTime = "07:00"
    const sortDown = "8:00"

    function onChange() {
        const message = 'Chicken'
        console.log(message)
    }

    return (
        <div>
            <div className={styles.subHeading}>
                {route} 
                <input
                    type="text"
                    className={styles.input}
                    value={routeName}
                    onChange={onChange}
                />
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>Arrival</th>
                        <th className={styles.th}>Piece Count</th>
                        <th className={styles.th}>Sort Down</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className={styles.td}>
                            <input
                                type="text"
                                className={styles.input}
                                value={arrivalTime}
                                onChange={onChange}
                            />
                        </td>
                        <td className={styles.td}>
                            <input
                                type="text"
                                className={styles.input}
                                // value=''
                            />
                        </td>
                        <td className={styles.td}>
                            <input
                                type="text"
                                className={styles.input}
                                value={sortDown}
                                onChange={onChange}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
