import * as XLSX from "xlsx";

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
function readExcel(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const processedData = processData(jsonData);

        // Calculate weights based on processed data
        const totalWeight = calcWeight(processedData);
        const heavyWeight = calcWeight(processedData, "CVGRT");
        const expressWeight = parseInt(totalWeight.replace(/,/g, ""), 10) - parseInt(heavyWeight.replace(/,/g, ""), 10);

        // Send all necessary data back to the callback
        callback(file, processedData, totalWeight, heavyWeight, expressWeight.toLocaleString());
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
function calcWeight(sheet, dest = null) {
    let totalWeight = 0;

    try {
        for (let row of sheet) {
            const destCell = row.Destination; // Column E
            const weightCell = row.Weight; // Column D

            if (weightCell) {
                if (!dest || destCell === dest) {
                    totalWeight += parseInt(weightCell, 10);
                }
            }

            debugWithConsole(destCell, weightCell, totalWeight);
        }
    } catch (error) {
        console.error("Error in calcWeight:", error);
    }

    return totalWeight.toLocaleString(); // Format with commas
}
