import React, { useState } from 'react'
import styles from "../styles/default.module.css";

export default function Comments() {
    const [scanText, setScanText] = useState(`Stat scans if needed:
30+ minute weather delay=Stat 84
30+ minute maintenance delay=Stat 85
Freight left in field=Stat 21, Stat 22`)
    const [explanation, setExplanation] = useState('')
    const [exceptions, setExceptions] = useState('')

    return (
        <div className={styles.section}>
            <div>
                Explanation of root causes for the delay: 
            </div>
            <div>
                <textarea
                    className={styles.input}
                    value={explanation}
                    onChange={(event) => setExplanation(event.target.value)}
                />
            </div>
            <div>
                Other Exceptions:
                <textarea
                    className={styles.input}
                    value={exceptions}
                    onChange={(event) => setExceptions(event.target.value)}
                />
            </div>
            <div>
                <textarea
                    className={styles.input}
                    value={scanText}
                    onChange={(event) => setScanText(event.target.value)}
                />
            </div>
        </div>
    )
}
