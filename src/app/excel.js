import * as XLSX from "xlsx";
import tareConfig from "./tare_weight.json"

// Debugging helper function
function debugWithConsole(...infoToSend) {
    const debugging = true;
    if (debugging) {
        console.log(...infoToSend);
    }
}

// Function to open file selector and process the selected file
export function fileSelector(callback) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";

    input.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            readExcel(file, callback);
        }
    });

    input.click();
}

// Reads the Excel file and processes its data
async function readExcel(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const processedData = processData(jsonData);

            const totalWeight = calcWeight(processedData);
            const heavyWeight = calcWeight(processedData, "CVGRT");

            const expressWeight =
                parseInt(totalWeight.replace(/,/g, ""), 10) -
                parseInt(heavyWeight.replace(/,/g, ""), 10);

            const actualPounds = calcActualPounds(processedData);

            callback(
                file,
                processedData,
                totalWeight,
                heavyWeight,
                expressWeight.toLocaleString(),
                actualPounds
            );
        } catch (err) {
            console.error("Error processing Excel file:", err);
            callback(file, [], "0", "0", "0", "0");
        }
    };
    reader.readAsArrayBuffer(file);
}

// Process data from the Excel sheet into a structured JSON format
function processData(jsonData) {
    if (!jsonData || jsonData.length === 0) {
        console.warn("No data found in the sheet!");
        return [];
    }

    const results = [];
    for (let i = 4; i < jsonData.length; i++) { // Skip header, row 1 = 0
        const row = jsonData[i];

        if (row[1] && row[3]) { // Adjust column indexes as needed
            results.push({ Uld: row[1], Weight: row[3], Destination: row[4] });
            debugWithConsole(row[1], row[3]);
        }
    }
    return results;
}

// Calculate total or filtered weight from the processed data
function calcWeight(sheet, destFilter = null) {
    let totalWeight = 0;

    try {
        for (let row of sheet) {
            const destCell = row.Destination; // Column E
            const weightCell = row.Weight;    // Column D

            if (!weightCell) continue;

            let include = true;

            if (destFilter) {
                if (typeof destFilter === "string") {
                    include = destCell === destFilter;
                } else if (typeof destFilter === "function") {
                    include = destFilter(destCell);
                }
            }

            if (include) {
                totalWeight += parseInt(weightCell, 10) || 0;
            }

            // debugWithConsole(destCell, weightCell, totalWeight);
        }
    } catch (error) {
        console.error("Error in calcWeight:", error);
    }

    return totalWeight.toLocaleString(); // Format with commas
}

function calcActualPounds(sheet) {
    let totalActual = 0;
    const tareEntries = tareConfig?.uld || {};

    for (const row of sheet) {
        const dest = row.Destination;
        const gross = parseInt(row.Weight, 10) || 0;
        const uld = row.Uld;

        if (!gross || !uld) continue;
        if (dest !== "CVGR") continue; // Only CVGR counts

        const prefix = uld.substring(0, 3).toUpperCase();

        const tare = tareEntries[prefix]?.tare_weight
            ? parseInt(tareEntries[prefix].tare_weight, 10)
            : 0;

        const net = Math.max(0, gross - tare);
        totalActual += net;
    }

    return totalActual.toLocaleString();
}

// ****** Manageable Time ******
function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`;
}

// Validate if input is in HH:MM format
function isValidTime(time) {
    return /^\d{1,2}:\d{2}$/.test(time);
};

// Function to calculate the variance (time difference)
export function calculateVariance(schedule, actual) {
    if (!isValidTime(schedule) || !isValidTime(actual)) return "--";

    const scheduleMinutes = timeToMinutes(schedule);
    const actualMinutes = timeToMinutes(actual);
    const diff = actualMinutes - scheduleMinutes;

    return diff === 0 ? "+0" : `${diff >= 0 ? "+" : ""}${diff}`;
};

// Set the scheduled Sort Start and Sort End to the Aircraft Arrival
export function setSortTimes(time) {
    const aircraftArrivalMin = timeToMinutes(time);
    const sortStartMinutes = aircraftArrivalMin + 20;
    const sortEndMinutes = sortStartMinutes + 20;

    const startTime = minutesToTime(sortStartMinutes);
    const sortEnd = minutesToTime(sortEndMinutes)

    // debugWithConsole(time, aircraftArrivalMin, sortStartMinutes, sortEndMinutes, startTime, sortEnd)
    return [startTime, sortEnd];
}