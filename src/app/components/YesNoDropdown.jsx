import React, { useState } from 'react';
import styles from "../styles/default.module.css";

export default function YesNoDropdown({ onChange }) {
    const [choice, setChoice] = useState('no');

    const handleChange = (event) => {
        const selectedValue = event.target.value; // 'yes' or 'no'
        setChoice(selectedValue);

        if (onChange) {
            onChange(selectedValue === 'yes');
        }
    };

    return (
        <div className={styles.choiceContainer}>
            <select
                id='doNotCopy'
                value={choice}
                onChange={handleChange}
                className={styles.choiceSelect}
            >
                <option value="" disabled>
                    -- Select an option --
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
            </select>

            {choice && (
                <p className={styles.choiceResult}>
                    <strong>{choice.toUpperCase()}</strong>
                </p>
            )}
        </div>
    );
}