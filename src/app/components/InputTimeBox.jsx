"use client"

import React, { useState } from 'react'
import styles from "../styles/default.module.css";
import * as excel from "../excel";

export default function InputTimeBox() {
    const [timeValue, setTimeValue] = useState("")

    const handleTimeChange = (event) => {
        const newTime = excel.formatTimeInput(event.target.value);
        setTimeValue(newTime)
    }

    return (
        <div>
            <input
                type="text"
                className={styles.input}
                value={timeValue}
                onChange={handleTimeChange}
            />
        </div>
    )
}
