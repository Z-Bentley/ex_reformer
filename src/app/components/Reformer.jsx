"use client";
import { useState, useEffect } from "react";
import styles from "../TimeTable.module.css";
import * as excel from "../excel";

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

export default function NormalReformer({ data, totalWeight, heavyWeight, expressWeight }) {
    const [sourceInfo, setSourceInfo] = useState(source1460);
    const [scheduledTime, setScheduledTime] = useState("05:58");
    const [sortStartTime, setSortStartTime] = useState("");
    const [sortEndTime, setSortEndTime] = useState("");
    const [flightData, setFlightData] = useState([]);
    const [destinationData, setDestinationData] = useState([]);
    const [inputValue, setInputValue] = useState("");
    
    function toggleSourceInfo(id) {
        const newSource = id === 0 ? source1460 : source1451;
        setSourceInfo(newSource);
    
        fetch(newSource.flight)
            .then((response) => response.json())
            .then((json) => {
                setFlightData(json);
                const newScheduledTime = json[0].schedule;
                setScheduledTime(newScheduledTime);

                const [startTime, endTime] = excel.setSortTimes(newScheduledTime);
                setSortStartTime(startTime);
                setSortEndTime(endTime);
            })
            .catch((error) => console.error("Error loading new flight data:", error));
    }
    

    // Load Flight Data from JSON
    useEffect(() => {
        fetch(sourceInfo.flight)
            .then((response) => response.json())
            .then((json) => setFlightData(json))
            .catch((error) => console.error("Error loading flight data:", error));
    }, [sourceInfo]);

    // Load Truck Routes Data from JSON
    useEffect(() => {
        fetch(sourceInfo.trucks)
            .then((response) => response.json())
            .then((json) => setDestinationData(json))
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

    // Handle input change for Aircraft Arrival time
    const handleInputChange = (id, field, value) => {
        setDestinationData((prevData) =>
            prevData.map((row) => {
                if (row.id === id) {
                    const updatedRow = { ...row, [field]: value };
    
                    if (field === "actual" || field === "schedule") {
                        updatedRow.variance = excel.calculateVariance(updatedRow.schedule, updatedRow.actual);
                    }
                    return updatedRow;
                }
                return row;
            })
        );
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

    return (
        <div>
            {/* Flight buttons */}
            <div className="flex justify-center">
                <button 
                    onClick={() => toggleSourceInfo(0)}
                    className="px-4 py-2 m-2 bg-blue-500 text-white rounded"
                >
                    Flight 1460
                </button>
                <button 
                    onClick={() => toggleSourceInfo(1)}
                    className="px-4 py-2 m-2 bg-green-500 text-white rounded"
                >
                    Flight 1451
                </button>
            </div>

            <div id="executive-summary">
                <h1 className={styles.heading}>Executive Summary</h1>
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
                                    <td className={styles.td}>{row.name}</td>
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
                                    <td className={`${styles.td} ${styles.textCenter}`}>{row.variance}</td>
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
                            <td className={styles.td}>
                                <p>Plan= 6550lbs</p>
                                <p>Actual:</p>
                                <p>Plan= 655 pieces</p>
                                <p>Actual:</p>
                            </td>
                            <td className={styles.td}></td>
                            <td className={styles.td}></td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                {/* Outbound Truck Routes */}
                <div className={styles.section}>
                    <h2 className={styles.subHeading}>Outbound Truck Routes</h2>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Destination</th>
                                <th className={styles.th}>Schedule</th>
                                <th className={styles.th}>Actual</th>
                                <th className={styles.th}>Variance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {destinationData.map((row) => (
                                <tr key={row.id}>
                                    <td className={styles.td}>
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={row.destination} // Controlled via React state
                                            onChange={(e) => handleInputChange(row.id, "destination", e.target.value)} 
                                        />
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Other Summary Comments */}
                <div className={styles.section}>
                    <h2 className={styles.subHeading}>Other Summary Comments</h2>
                    <p>Total Payload = {totalWeight}</p>
                    <p>Heavyweight = {heavyWeight}</p>
                    <p>Express = {expressWeight}</p>
                </div>
            </div>
        </div>
    );
}
