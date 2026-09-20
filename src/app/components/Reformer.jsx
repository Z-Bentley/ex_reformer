"use client";

import { useState, useEffect } from "react";
import styles from "../styles/default.module.css";
import * as excel from "../excel";

import Unscheduled from "./Unscheduled";
import LocalSortPlan from "./LocalSortPlan";
import RootCauseOfDelay from "./RootCauseOfDelay";
import OutboundTruckRoutes from "./OutboundTruckRoutes";
import OtherSummaryComments from "./OtherSummaryComments";

import flight1460 from "../../../public/data/flight1460.json";
import flight1451 from "../../../public/data/flight1451.json";
import flight2260 from "../../../public/data/flight2260.json";

const datasets = {
    1460: {
        flight: flight1460
    },
    1451: {
        flight: flight1451
    },
    2260: {
        flight: flight2260
    }
};

export default function Reformer({ data, totalWeight, heavyWeight, expressWeight, actualPounds }) {
    const [activeId, setActiveId] = useState(1460);

    const currentDataset = datasets[activeId];
    const initialSortPlan = currentDataset.flight.sortPlan || currentDataset.flight;

    const [flightData, setFlightData] = useState(initialSortPlan);

    const [plannedPieceCount, setPlannedPieceCount] = useState(currentDataset.flight.plannedPieceCount || "672");
    const [plannedPounds, setPlannedPounds] = useState(currentDataset.flight.plannedPounds)
    const [plannedFlowRate, setPlannedFlowRate] = useState(currentDataset.flight.plannedFlowRate || "2100");

    const [scheduledTime, setScheduledTime] = useState("06:00");
    const [sortStartTime, setSortStartTime] = useState("");
    const [sortEndTime, setSortEndTime] = useState("");

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
        if (id === 1) {
            setActiveId(1451);
        } else if (id === 2) {
            setActiveId(2260);
        } else {
            setActiveId(1460);
        }
    }

    // Load Truck Routes Data from JSON
    useEffect(() => {
        const dataset = datasets[activeId];
        const sortPlan = dataset.flight.sortPlan || dataset.flight;

        setFlightData(sortPlan);
        setPlannedPieceCount(dataset.flight.plannedPieceCount || "");
        setPlannedPounds(dataset.flight.plannedPounds || "")
        setPlannedFlowRate(dataset.flight.plannedFlowRate || "");

        const newScheduledTime = sortPlan?.[0]?.schedule || "06:00";
        setScheduledTime(newScheduledTime);

        const [startTime, endTime] = excel.setSortTimes(newScheduledTime);
        setSortStartTime(startTime);
        setSortEndTime(endTime);

        // Sort and load the local truck array instantly
        // const sortedTrucks = [...dataset.flight.truckRoutes].sort((a, b) => toMinutes(a.schedule) - toMinutes(b.schedule));
        setDestinationData(dataset.flight.truckRoutes || "");

    }, [activeId]);

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
            // return [...updated].sort((a, b) => toMinutes(a.schedule) - toMinutes(b.schedule));
            return updated;
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

    // Sections turned Components
    const localSortPlan = (
        <LocalSortPlan
            activeId={activeId}
            flightData={flightData}
            scheduledTime={scheduledTime}
            onScheduledTimeChange={setScheduledTime}
            onFlightEdit={handleFlightEdit}
        />
    )

    const rootCauseOfDelay = (
        <RootCauseOfDelay
            inputValue={inputValue}
            onInputValueChange={setInputValue}
            rootCausePounds={rootCausePounds}
            onRootCausePoundsChange={setRootCausePounds}
            plannedPieceCount={plannedPieceCount}
            plannedPounds={plannedPounds}
            actualPieces={actualPieces}
            onActualPiecesChange={setActualPieces}
        />
    )

    const outboundTruckRoutes = (
        <OutboundTruckRoutes
            destinationData={destinationData}
            onAddRoute={addNewRoute}
            onDeleteRoute={deleteRoute}
            onRouteChange={handleInputChange}
        />
    )

    const summaryComments = (
        <OtherSummaryComments
            editableTotalWeight={editableTotalWeight}
            editableHeavyWeight={editableHeavyWeight}
            editableExpressWeight={editableExpressWeight}
            onTotalWeightChange={setEditableTotalWeight}
            onHeavyWeightChange={setEditableHeavyWeight}
        />
    )

    const flowRateSection = (
        <>
            <div className={styles.flowRateContainer}>
                Planned Flow Rate: {plannedFlowRate}
            </div>
            <div className={styles.flowRateContainer}>
                <span className={styles.flowRateLabel}>Flow Rate: </span>
                <span className={styles.flowRateValue}>{flowRate || "--"}</span>
            </div>
        </>
    )

    const unscheduledRoutes = isChecked ? (
        <div className={styles.section}><Unscheduled/></div>
    ) : null;

    // Flight Layouts
    const flight1460Layout = (
        <>
            {flowRateSection}
            {localSortPlan}
            {rootCauseOfDelay}
            {outboundTruckRoutes}
            {unscheduledRoutes}
            {summaryComments}
        </>
    )

    const flight1451Layout = (
        <>
            {flowRateSection}
            {localSortPlan}
            {rootCauseOfDelay}
            {outboundTruckRoutes}
            {unscheduledRoutes}
            {summaryComments}
        </>
    )

    const flight2260Layout = (
        <>
            {localSortPlan}
            {rootCauseOfDelay}
            {outboundTruckRoutes}
            {unscheduledRoutes}
            {summaryComments}
        </>
    )

    return (
        <div>
            {/* Flight buttons */}
            <div>
                <div className="flex justify-center">
                    <button onClick={() => toggleSourceInfo(0)} className={styles.button1460}>
                        Flight 1460
                    </button>
                    <button onClick={() => toggleSourceInfo(1)} className={styles.button1451}>
                        Flight 1451
                    </button>
                    <button onClick={() => toggleSourceInfo(2)} className={styles.button2260}>
                        Flight 2260
                    </button>
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
                {activeId === 1460 && flight1460Layout}
                {activeId === 1451 && flight1451Layout}
                {activeId === 2260 && flight2260Layout}
            </div>
        </div>
    );
}
