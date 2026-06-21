"use client";
import { useState, useEffect } from "react";
// import styles from "../styles/base.module.css";
import styles from "../styles/default.module.css";
import * as excel from "../excel";
import { Button } from "@/components/ui/button";
import Unscheduled from "./Unscheduled";

const source1460 = {
    id: 0,
    name: "Flight 1460",
    flight: "/data/flight1460.json", 
    trucks: "/data/truckRoutes1460.json", 
    isOutbound: false
}
const source1451 = {
    id: 1,
    name: "Flight 1451",
    flight: "/data/flight1451.json", 
    trucks: "/data/truckRoutes1451.json", 
    isOutbound: true
}
const source1460Tuesday = {
    id: 2,
    name: "Flight 1460",
    flight: "/data/flight1460.json",
    trucks: "/data/truckRoutes1460Tuesday.json",
    isOutbound: false
}

export default function NormalReformer({ data, totalWeight, heavyWeight, expressWeight, actualPounds }) {
    const [sourceInfo, setSourceInfo] = useState(source1460);
    const [scheduledTime, setScheduledTime] = useState("06:00");
    const [sortStartTime, setSortStartTime] = useState("");
    const [sortEndTime, setSortEndTime] = useState("");
    const [flightData, setFlightData] = useState([]);
    const [destinationData, setDestinationData] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [rootCausePounds, setRootCausePounds] = useState("");
    const [editableTotalWeight, setEditableTotalWeight] = useState(totalWeight || "");
    const [editableHeavyWeight, setEditableHeavyWeight] = useState(heavyWeight || "");
    const [editableExpressWeight, setEditableExpressWeight] = useState(expressWeight || "");
    const [flowRate, setFlowRate] = useState("");
    const [actualPieces, setActualPieces] = useState("");
    
    function toggleSourceInfo(id) {
        const newSource =
            id === 0 ? source1460 :
            id === 1 ? source1451 :
            source1460Tuesday;

        setSourceInfo(newSource);
    }

    // Load Flight Data from JSON
    useEffect(() => {
        fetch(sourceInfo.flight)
            .then((response) => response.json())
            .then((json) => {
                setFlightData(json);

                const newScheduledTime = json?.[0]?.schedule || "06:00";
                setScheduledTime(newScheduledTime);

                const [startTime, endTime] = excel.setSortTimes(newScheduledTime);
                setSortStartTime(startTime);
                setSortEndTime(endTime);
            })
            .catch((error) => console.error("Error loading flight data:", error));
    }, [sourceInfo]);

    // Load Truck Routes Data from JSON (sorted by schedule time)
    useEffect(() => {
        const toMinutes = (t) => {
            if (!t) return Number.POSITIVE_INFINITY;
            const [h, m] = String(t).trim().split(":").map(Number);
            if (Number.isNaN(h) || Number.isNaN(m)) return Number.POSITIVE_INFINITY;
            return h * 60 + m;
        };

        fetch(sourceInfo.trucks)
            .then((response) => response.json())
            .then((json) => {
                const sorted = [...json].sort((a, b) => toMinutes(a.schedule) - toMinutes(b.schedule));
                setDestinationData(sorted);
            })
            .catch((error) => console.error("Error loading truck routes:", error));
    }, [sourceInfo]);

    // Function to update times when aircraft arrival time changes
    useEffect(() => {
        if (!scheduledTime) return;
    
        const [startTime, endTime] = excel.setSortTimes(scheduledTime);
        
        setSortStartTime(startTime);
        setSortEndTime(endTime);
    
        setFlightData((prevData) =>
            prevData.map((row) => {
                if (row.id === 1) return { ...row, schedule: startTime };
                if (row.id === 2) return { ...row, schedule: endTime };
                return row;
            })
        );
    }, [scheduledTime]);    

    // Update flight data when scheduledTime, sortStartTime, or sortEndTime changes
    useEffect(() => {
        if (flightData.length > 0) {
            setFlightData((prevData) =>
                prevData.map((row) => {
                    if (row.id === 0) return { ...row, schedule: scheduledTime }; // Aircraft Arrival
                    if (row.id === 1) return { ...row, schedule: sortStartTime }; // Sort Start
                    if (row.id === 2) return { ...row, schedule: sortEndTime }; // Sort End
                    return row;
                })
            );
        }
    }, [scheduledTime, sortStartTime, sortEndTime]);

    useEffect(() => {
        // whenever the parent passes a new actualPounds, update local state
        setRootCausePounds(actualPounds || "");
    }, [actualPounds]);

    // When parent recalculates weights (new file), sync local editable fields
    useEffect(() => {
        setEditableTotalWeight(totalWeight || 0);
    }, [totalWeight]);

    useEffect(() => {
        setEditableHeavyWeight(heavyWeight || 0);
    }, [heavyWeight]);

    useEffect(() => {
        setEditableExpressWeight(expressWeight || 0);
    }, [expressWeight]);

    // Flow Rate
    useEffect(() => {
        const sortStartActual = flightData.find((row) => row.id === 1)?.actual;
        const sortEndActual = flightData.find((row) => row.id === 2)?.actual;

        getFlowRate(actualPieces, sortStartActual, sortEndActual);
    }, [actualPieces, flightData]);

    // Recalculate Express = Total - Heavy whenever either editable value changes
    useEffect(() => {
        const total = parseInt(String(editableTotalWeight).replace(/,/g, ""), 10) || 0;
        const heavy = parseInt(String(editableHeavyWeight).replace(/,/g, ""), 10) || 0;
        const express = Math.max(0, total - heavy);
        setEditableExpressWeight(express.toLocaleString());
    }, [editableTotalWeight, editableHeavyWeight]);

    // Handle input change for Aircraft Arrival time
    const toMinutes = (t) => {
        if (!t) return Number.POSITIVE_INFINITY;
        const [h, m] = String(t).trim().split(":").map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return Number.POSITIVE_INFINITY;
        return h * 60 + m;
    };

    const handleInputChange = (id, field, value) => {
        setDestinationData((prevData) => {
            const updated = prevData.map((row) => {
                if (row.id === id) {
                    const updatedRow = { ...row, [field]: value };
                    if (field === "actual" || field === "schedule") {
                        updatedRow.variance = excel.calculateVariance(updatedRow.schedule, updatedRow.actual);
                    }
                    return updatedRow;
                }
                return row;
            });

            // Always keep rows ordered by schedule
            return [...updated].sort((a, b) => toMinutes(a.schedule) - toMinutes(b.schedule));
        });
    };
    
    const handleFlightEdit = (id, field, value) => {
        setFlightData((prevData) =>
            prevData.map((row) => {
                if (row.id === id) {
                    const updatedRow = { ...row, [field]: value };
    
                    if (field === "schedule" || field === "actual") {
                        updatedRow.variance = excel.calculateVariance(
                            field === "schedule" ? value : row.schedule, 
                            field === "actual" ? value : row.actual
                        );
                    }
                    return updatedRow;
                }
                return row;
            })
        );
    };    
    
    // Root Cause Late Codes
    const handleInputText = (event) => {
        setInputValue(event.target.value)
    }

    // Root Cause Actual Pounds
    const handleActualPoundsChange = (event) => {
        setRootCausePounds(event.target.value);
    };

    // Add New Route
    const addNewRoute = () => {
        const newId = destinationData.length > 0 ? Math.max(...destinationData.map(r => r.id)) + 1 : 1;
        const newRoute = { id: newId, destination: "", schedule: "07:00", actual: "07:30", variance: "+30" };
        setDestinationData((prev) => [...prev, newRoute]);
    };

    // Remove Route
    const deleteRoute = (id) => {
        setDestinationData((prev) => prev.filter((row) => row.id !== id));
    };

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked)
    }

    const parseVarianceToMinutes = (varianceStr) => {
        if (!varianceStr) return 0;
        // Handle things like "+05", "-10", "05", etc.
        const cleaned = String(varianceStr).trim().replace("+", "");
        const minutes = parseInt(cleaned, 10);
        return isNaN(minutes) ? 0 : minutes;
    };

    // Compute "minutes made up" = Sort End variance - Aircraft Arrival variance
    // const aircraftRow = flightData.find((r) => r.id === 0); // Aircraft Arrival
    // const sortEndRow = flightData.find((r) => r.id === 2);  // Sort End

    // const aircraftVarianceMinutes = parseVarianceToMinutes(aircraftRow?.variance);
    // const sortEndVarianceMinutes = parseVarianceToMinutes(sortEndRow?.variance);

    // const madeUpMinutes = sortEndVarianceMinutes - aircraftVarianceMinutes;

    // Updating Flowrate as the excel is added and times are updated
    const getFlowRate = (pieceCount, startTime, endTime) => {
        if (!startTime || !endTime) {
            setFlowRate("");
            return;
        }

        const [sh, sm] = String(startTime).split(":").map(Number);
        const [eh, em] = String(endTime).split(":").map(Number);

        if ([sh, sm, eh, em].some(Number.isNaN)) {
            setFlowRate("");
            return;
        }

        const minutes = (eh * 60 + em) - (sh * 60 + sm);
        const pieces = Number(String(pieceCount).replace(/,/g, ""));

        if (minutes <= 0 || Number.isNaN(pieces) || pieces <= 0) {
            setFlowRate("");
            return;
        }

        const rate = pieces / (minutes / 60);

        setFlowRate(Math.round(rate).toLocaleString());
    };

    return (
        <div>
            {/* Flight buttons */}
            <div className="">
                <div className="flex justify-center">
                    <button onClick={() => toggleSourceInfo(0)} className={styles.button1460}>
                        Flight 1460
                    </button>
                    <button onClick={() => toggleSourceInfo(1)} className={styles.button1451}>
                        Flight 1451
                    </button>
                    
                    {/* Temp remove in case Tue is the same as rest of week again */}
                    {/* <button onClick={() => toggleSourceInfo(2)} className={styles.button1460}>
                        Flight 1460 (Tue)
                    </button> */}
                </div>
                {/* Toggle Button */}
                <div className="px-3 justify-end">
                    <div>
                        <label className={styles.toggleLabel}>
                            <div className={styles.toggleWrapper}>
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={handleCheckboxChange}
                                    className={styles.toggleInput}
                                />
                                <div
                                    className={`${styles.toggleTrack} ${
                                        isChecked ? styles.toggleTrackActive : ""
                                    }`}
                                />
                                <div
                                    className={`${styles.toggleThumb} ${
                                        isChecked ? styles.toggleThumbActive : ""
                                    }`}
                                />
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            <div id="executive-summary" className="p-3">
                <h1 className={styles.heading}>Executive Summary</h1>
                <div className={styles.flowRateContainer}>Planned Flow Rate: 2,100</div>
                <div className={styles.flowRateContainer}>
                    <span className={styles.flowRateLabel}>Flow Rate: </span>
                    <span className={styles.flowRateValue}>{flowRate || "--"}</span>
                </div>

                {/* Local Sort Plan */}
                <div className={styles.section}>
                    <h2 className={styles.subHeading}>Local Sort Plan</h2>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>{sourceInfo.name}</th>
                                <th className={styles.th}>Schedule</th>
                                <th className={styles.th}>Actual</th>
                                <th className={styles.th}>Variance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flightData.map((row) => (
                                <tr key={row.id}>
                                    <td className={styles.td}>
                                        <div className="font-bold">
                                           {row.name} 
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        {row.id === 0 ? (
                                            <input
                                                type="text"
                                                className={styles.input}
                                                value={scheduledTime}
                                                onChange={(e) => {
                                                    const newTime = e.target.value;
                                                    setScheduledTime(newTime);
                                                    handleFlightEdit(row.id, "schedule", newTime);
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
                                            value={row.actual}
                                            onChange={(e) => handleFlightEdit(row.id, "actual", e.target.value)}
                                        />
                                    </td>
                                    <td className={`${styles.td} ${styles.textCenter}`} data-sort-end-variance={row.id === 2 ? "true" : "false"}>
                                        <div>{row.variance}</div>
                                        {/* {row.id === 2 && !isNaN(madeUpMinutes) && (
                                            <div className={`${styles.textCenter}`}>
                                                {madeUpMinutes} minutes made up
                                            </div>
                                        )} */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Root Cause of Delay */}
                <div className={styles.section}>
                    <h2 className={styles.subHeading}>Root Cause of Delay</h2>
                    <table className={styles.table}>
                        <tbody>
                        <tr>
                            <td className={styles.td}>
                                <input type="text" className={styles.input} />
                            </td>
                            <td className={styles.td}>Late Aircraft</td>
                            <td className={styles.td}>
                                <input type="text" className={styles.input} />
                            </td>
                            <td className={styles.td}>Excess Minisort</td>
                            <td className={styles.td}>
                                <input type="text" className={styles.input} />
                            </td>
                            <td className={styles.td}>Weather</td>
                        </tr>
                        <tr>
                            <td className={styles.td}>
                                <input type="text" className={styles.input} />
                            </td>
                            <td className={styles.td}>Late Truck</td>
                            <td className={styles.td}></td>
                            <td className={styles.td}></td>
                            <td className={styles.td}>
                                <input type="text" className={styles.input} />
                            </td>
                            <td className={styles.td}>Other</td>
                        </tr>
                        <tr>
                            <td className={styles.td}></td>
                            <td className={styles.td}>
                                <textarea
                                    className={styles.input}
                                    id="delay-codes"
                                    value={inputValue}
                                    onChange={handleInputText}
                                />
                            </td>
                            <td className={styles.td}></td>

                            {/* Actual Pounds Calc */}
                            <td className={styles.td}>
                                <p>Plan= 6,700lbs</p>
                                <p>Actual: 
                                    <input 
                                        type="text" 
                                        className={styles.input}
                                        value={rootCausePounds}
                                        onChange={handleActualPoundsChange}
                                    />
                                </p>
                                <p>Plan= 672 pieces</p>
                                <p>
                                    Actual:
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={actualPieces}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/,/g, "").replace(/[^\d]/g, "");
                                            setActualPieces(raw ? Number(raw).toLocaleString() : "");
                                        }}
                                    />
                                </p>
                            </td>
                            <td className={styles.td}></td>
                            <td className={styles.td}></td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                {/* Outbound Truck Routes */}
                <div className={styles.section}>
                    <div className="flex justify-between p-1">
                        <h2 className={styles.subHeading}>Outbound Truck Routes</h2>
                        <Button id="doNotCopy" onClick={addNewRoute}>Add New Route</Button>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Destination</th>
                                <th className={styles.th}>Schedule</th>
                                <th className={styles.th}>Actual</th>
                                <th className={styles.th}>Variance</th>
                                <th id="doNotCopy" className={styles.th}>Delete</th>
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
                                                value={row.destination} // Controlled via React state
                                                onChange={(e) => handleInputChange(row.id, "destination", e.target.value)} 
                                            />  
                                        </div>
                                    </td>
                                    <td className={styles.td}>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={row.schedule}
                                            onChange={(e) => handleInputChange(row.id, "schedule", e.target.value)}
                                        />
                                    </td>
                                    <td className={styles.td}>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={row.actual}
                                            onChange={(e) => handleInputChange(row.id, "actual", e.target.value)}
                                        />
                                    </td>
                                    <td className={`${styles.td} ${styles.textCenter}`}>{row.variance}</td>
                                    <td className="flex justify-center" id="doNotCopy">
                                        <Button variant="destructive" onClick={() => deleteRoute(row.id)}>X</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Unscheduled Routes */}
                {isChecked && <div className={styles.section}><Unscheduled/></div>}

                {/* Other Summary Comments */}
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
                                        onChange={(e) => setEditableTotalWeight(e.target.value)}
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
                                        onChange={(e) => setEditableHeavyWeight(e.target.value)}
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
            </div>
        </div>
    );
}
