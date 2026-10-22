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
        }
    }
    return results;
}

export function tableSelector(callback){
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";

    input.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            readTable(file, callback);
        }
    });

    input.click();
}

async function readTable(file, callback){
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const processedData = processTable(jsonData);

            callback(
                file,
                processedData,
            );
        } catch (err) {
            console.error("Error processing Excel file:", err);
            callback(file, []);
        }
    };
    reader.readAsArrayBuffer(file);
}

// Process data from the Excel sheet into a structured JSON format
function processTable(jsonData) {
    if (!jsonData || jsonData.length === 0) {
        console.warn("No data found in the sheet!");
        return [];
    }

    const results = [];
    for (let i = 8; i < jsonData.length; i++) { // Skip header, row 1 = 0
        const row = jsonData[i];

        if (row[1] && row[3]) { // Adjust column indexes as needed
            results.push({ 
                Position: row[0], 
                Uld: row[1], 
                Weight: row[3], 
                Destination: row[4],
                Service_CD: row[6],
                Load_CD: row[7],
                Pkg_Dests: row[8]
            });
        }
    }
    return results;
}

// 1. File selector trigger
export function positionSelector(callback) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";

    input.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            readPosition(file, callback);
        }
    });

    input.click();
}

// 2. File reader function
async function readPosition(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Pass jsonData to the dynamic header processor
            const processedData = processPosition(jsonData);

            callback(
                file,
                processedData
            );
        } catch (err) {
            console.error("Error processing Excel file:", err);
            callback(file, []);
        }
    };
    reader.readAsArrayBuffer(file);
}

// 3. Dynamic header processor
// function processPosition(jsonData) {
//     if (!jsonData || jsonData.length === 0) {
//         console.warn("No data found in sheet!");
//         return [];
//     }

//     let headerRowIndex = -1;
//     let headerMap = {};

//     // Helper to normalize strings for comparison (lowercase, trimmed)
//     const normalize = (str) => String(str || "").toLowerCase().trim().replace(/\s+/g, " ");

//     // Target headers to search for
//     const targetHeaders = ["tracking no", "recip co", "recip addr", "service"];

//     // 1. Scan the first 15 rows to locate where the header row is
//     for (let i = 0; i < Math.min(jsonData.length, 15); i++) {
//         const row = jsonData[i];
//         if (!Array.isArray(row)) continue;

//         const rowNormalized = row.map(cell => normalize(cell));
//         // Check if this row contains any of our target header names
//         const matches = targetHeaders.filter(h => rowNormalized.includes(h));

//         if (matches.length >= 2) { // Found row with at least 2 matching headers
//             headerRowIndex = i;
//             row.forEach((cell, colIdx) => {
//                 if (cell !== undefined && cell !== null) {
//                     headerMap[normalize(cell)] = colIdx;
//                 }
//             });
//             break;
//         }
//     }

//     if (headerRowIndex === -1) {
//         console.warn("Could not find header row matching target column names!");
//         return [];
//     }

//     // Helper to safely fetch column value by header name
//     const getValue = (row, headerName) => {
//         const colIdx = headerMap[normalize(headerName)];
//         return (colIdx !== undefined && row[colIdx] !== undefined) ? row[colIdx] : "";
//     };

//     const results = [];

//     // 2. Loop through data rows starting immediately after headerRowIndex
//     for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
//         const row = jsonData[i];
//         if (!row || row.length === 0) continue;

//         const trackingNo = getValue(row, "Tracking No");
//         const recipCo = getValue(row, "Recip Co");

//         // Include row if it has content in trackingNo OR recipCo
//         if (trackingNo || recipCo) {
//             results.push({
//                 Tracking_No: trackingNo,
//                 Recip_Co: recipCo,
//                 Recip_Addr: getValue(row, "Recip Addr"),
//                 Recip_City: getValue(row, "Recip City"),
//                 Recip_Postal: getValue(row, "Recip Postal"),
//                 Service: getValue(row, "Service"),
//                 Commit_Date: getValue(row, "Commit Date"),
//                 Commit_Time: getValue(row, "Commit Time"),
//                 Special_Handling_Codes: getValue(row, "Special Handling Codes")
//             });
//         }
//     }

//     return results;
// }

// Helper function to convert Excel decimal time into a readable string (e.g., 12:00 PM)
function formatExcelTime(value) {
    if (value === undefined || value === null || value === "") return "";
    
    // If it's already a text string, return it as-is
    if (typeof value === "string") return value;

    // Excel time is a decimal fraction of a day (e.g., 0.5 = 12:00 PM)
    // Use modulo 1 (%) in case it's a full date+time serial number (e.g., 45123.5)
    const timeFraction = value % 1; 
    const totalSeconds = Math.round(timeFraction * 86400);
    
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = String(minutes).padStart(2, "0");
    
    return `${hour12}:${formattedMinutes} ${period}`;
}

// 3. Dynamic header processor
function processPosition(jsonData) {
    if (!jsonData || jsonData.length === 0) {
        console.warn("No data found in sheet!");
        return [];
    }

    let headerRowIndex = -1;
    let headerMap = {};

    const normalize = (str) => String(str || "").toLowerCase().trim().replace(/\s+/g, " ");
    const targetHeaders = ["tracking no", "recip co", "recip addr", "service"];

    // Scan the first 15 rows to locate the header row
    for (let i = 0; i < Math.min(jsonData.length, 15); i++) {
        const row = jsonData[i];
        if (!Array.isArray(row)) continue;

        const rowNormalized = row.map(cell => normalize(cell));
        const matches = targetHeaders.filter(h => rowNormalized.includes(h));

        if (matches.length >= 2) {
            headerRowIndex = i;
            row.forEach((cell, colIdx) => {
                if (cell !== undefined && cell !== null) {
                    headerMap[normalize(cell)] = colIdx;
                }
            });
            break;
        }
    }

    if (headerRowIndex === -1) {
        console.warn("Could not find header row matching target column names!");
        return [];
    }

    const getValue = (row, headerName) => {
        const colIdx = headerMap[normalize(headerName)];
        return (colIdx !== undefined && row[colIdx] !== undefined) ? row[colIdx] : "";
    };

    const results = [];

    // Loop through data rows starting immediately after headerRowIndex
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const trackingNo = getValue(row, "Tracking No");
        const recipCo = getValue(row, "Recip Co");

        if (trackingNo || recipCo) {
            results.push({
                Tracking_No: trackingNo,
                Recip_Co: recipCo,
                Recip_Addr: getValue(row, "Recip Addr"),
                Recip_City: getValue(row, "Recip City"),
                Recip_Postal: getValue(row, "Recip Postal"),
                Service: getValue(row, "Service"),
                Commit_Date: getValue(row, "Commit Date"),
                Commit_Time: formatExcelTime(getValue(row, "Commit Time")), // <--- Converted here!
                Special_Handling_Codes: getValue(row, "Special Handling Codes")
            });
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
const MINUTES_PER_DAY = 24 * 60;
const MIDNIGHT_ROLLOVER_THRESHOLD = 12 * 60;

function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

function minutesToTime(totalMinutes) {
    const normalizedMinutes = 
        ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

    const hours = Math.floor(normalizedMinutes / 60);
    const minutes = normalizedMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatTimeInput(value) {
    const digits = String(value).replace(/\D/g, "").slice(0, 4);

    if (digits.length <= 2) {
        return digits;
    }

    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

// Validate if input is in HH:MM format
function isValidTime(time) {
    return /^([01]?\d|2[0-3]):[0-5]\d$/.test(String(time).trim());
}

// Function to calculate the variance (time difference)
export function calculateVariance(schedule, actual) {
    if (!isValidTime(schedule) || !isValidTime(actual)) {
        return "--";
    }

    const scheduleMinutes = timeToMinutes(schedule);
    const actualMinutes = timeToMinutes(actual);

    let difference = actualMinutes - scheduleMinutes;

    if (difference < -MIDNIGHT_ROLLOVER_THRESHOLD) {
        difference += MINUTES_PER_DAY;
    }

    return difference === 0
        ? "+0"
        : `${difference >= 0 ? "+" : ""}${difference}`;
}

// Set the scheduled Sort Start and Sort End to the Aircraft Arrival
export function setSortTimes(time) {
    if (!isValidTime(time)) {
        return ["", ""];
    }

    const aircraftArrivalMinutes = timeToMinutes(time);
    const sortStartMinutes = aircraftArrivalMinutes + 20;
    const sortEndMinutes = sortStartMinutes + 20;

    return [
        minutesToTime(sortStartMinutes),
        minutesToTime(sortEndMinutes),
    ];
}