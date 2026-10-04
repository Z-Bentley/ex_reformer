"use client";

import styles from "../styles/default.module.css";
import YesNoDropdown from "./YesNoDropdown";
import * as excel from "../excel";
import { useState } from "react";
import InputTimeBox from "./InputTimeBox";

export default function FlightSummary({
    inputValue,
    onInputValueChange,
    onRouteChange
}) {
    const [hasTruckDelays, setHasTruckDelays] = useState(false)
    const [isFlightDelay, setIsFlightDelay] = useState(false)

    return (
        <div className={styles.section}>
            <h2 className={styles.subHeading}>Flight Summary</h2>
            <table className={styles.table}>
                <tbody>
                   <tr>
                        <td className={styles.td}>Final Payload</td>
                        <td className={styles.td}>
                                <input type="text" className={styles.input} />
                        </td>
                    </tr>
                    <tr>
                        <td className={styles.td}>Any Flight Delays?</td>
                        <td className={styles.td}>
                            <YesNoDropdown
                                onChange={(boolValue) => setIsFlightDelay(boolValue)}
                            />
                        </td>
                    </tr> 

                    {isFlightDelay && (
                        <DelayCodes
                            inputValue={inputValue}
                            onInputValueChange={onInputValueChange}
                        />
                    )}

                    <tr>
                        <td className={styles.td}>Any Aircraft Strikes?</td>
                        <td className={styles.td}><YesNoDropdown/></td>
                    </tr> 
                    <tr>
                        <td className={styles.td}>Any Freight Left Behind/Rollover?</td>
                        <td className={styles.td}><YesNoDropdown/></td>
                    </tr> 
                    <tr>
                        <td className={styles.td}>Any Truck Route Delays?</td>
                        <td className={styles.td}>
                            <YesNoDropdown
                                onChange={(boolValue) => setHasTruckDelays(boolValue)}
                            />
                        </td>
                    </tr> 
                    
                    {hasTruckDelays && (
                        <RouteDelays
                            onRouteChange={onRouteChange}
                        />
                    )}

                    <tr>
                        <td className={styles.td}>Any Unapproved Shuttles?</td>
                        <td className={styles.td}><YesNoDropdown/></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

function RouteDelays({ onRouteChange }){
    const [explanation, setExplanation] = useState('')
    return (
        <>
            <tr>
                <td className={styles.td}>Route:</td>
                <td className={styles.td}>
                    <input
                        type="text"
                        className={styles.input}
                        onChange={(event) =>
                            onRouteChange(event.target.value)
                        }
                    />
                </td>
                <td className={styles.td}>Explanation</td>
                <td className={styles.td}>
                    <textarea
                        id="delay-codes"
                        className={styles.input}
                        value={explanation}
                        onChange={(event) => setExplanation(event.target.value)}
                    />
                </td>
            </tr>
            <tr>
                <td className={styles.td}>
                    Scheduled Time
                </td>
                <td className={styles.td}>
                    <InputTimeBox/>
                </td>
                <td className={styles.td}>
                    Actual Time
                </td>
                <td className={styles.td}>
                    <InputTimeBox/>
                </td>
            </tr>
        </>
    )
}

function DelayCodes ({ inputValue, onInputValueChange }) {
    return (
        <>
            <tr>
                <td className={styles.td}>Codes</td>
                <td className={styles.td}>
                    <textarea
                        id="delay-codes"
                        className={styles.input}
                        value={inputValue}
                        onChange={(event) => onInputValueChange(event.target.value)}
                    />
                </td>
                <td className={styles.td}>
                    Time
                </td>
                <td className={styles.td}>
                    <InputTimeBox/>
                </td>
            </tr>
        </>
    )
}