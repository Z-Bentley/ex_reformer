import React, { useState } from 'react'
import styles from "../styles/base.module.css"

export default function Unscheduled() {
    const [routeLabel, setRouteLabel] = useState("Route: ")
    const [routeName, setRouteName] = useState("IF290")
    const [sortStart, setSortStart] = useState("7:00")
    const [pieceCount, setPieceCount] = useState("")
    const [sortDown, setSortDown] = useState("8:00")

    // CHICKEN
    function sendChicken() {
        const message = 'Chicken'
        console.log(message)
    }

    // Handle the Route Name Change
    const handleRouteChange = (event) => {
        setRouteName(event.target.value)
        sendChicken()
    }

    // Handle the Sort Start Change
    const handleStartChange = (event) => {
        setSortStart(event.target.value)
        sendChicken()
    }

    // Handle the Piece Count Input
    const handlePieceCount = (event) => {
        setPieceCount(event.target.value)
        sendChicken()
    }

    // Handle the Sort Down Change
    const handleSortDownChange = (event) => {
        setSortDown(event.target.value)
        sendChicken()
    }

    return (
        <div>
            <div className={styles.subHeading}>
                {routeLabel} 
                <input
                    type="text"
                    className={styles.input}
                    value={routeName}
                    onChange={handleRouteChange}
                />
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>Sort Start</th>
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
                                value={sortStart}
                                onChange={handleStartChange}
                            />
                        </td>
                        <td className={styles.td}>
                            <input
                                type="text"
                                className={styles.input}
                                value={pieceCount}
                                onChange={handlePieceCount}
                            />
                        </td>
                        <td className={styles.td}>
                            <input
                                type="text"
                                className={styles.input}
                                value={sortDown}
                                onChange={handleSortDownChange}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
