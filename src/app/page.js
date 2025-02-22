"use client"
import { useState } from "react";
import * as excel from "./excel.js"
import styles from "./TimeTable.module.css"

export default function EditableTimeTable() {
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState([]);
  const [totalWeight, setTotalWeight] = useState("--");
  const [heavyWeight, setHeavyWeight] = useState("--");
  const [expressWeight, setExpressWeight] = useState("--");
  const [showButton, setShowButton] = useState(false);

  // Local Sort Plan
  const [flightData, setFlightData] = useState([
    { id: 1, name: "Aircraft Arrival", schedule: "6:02", actual: "6:29", variance: "+27" },
    { id: 2, name: "Sort Start", schedule: "6:26", actual: "6:43", variance: "+17" },
    { id: 3, name: "Sort End", schedule: "6:46", actual: "7:10", variance: "+24" },
  ]);

  // Outbound Truck Routes
  const [destinationData, setDestinationData] = useState([
    { id: 1, destination: "OXD02", schedule: "06:35", actual: "07:05", variance: "+30" },
    { id: 2, destination: "CVG10", schedule: "07:25", actual: "07:25", variance: "+0" },
    { id: 3, destination: "CVG03", schedule: "06:45", actual: "07:05", variance: "+20" },
    { id: 4, destination: "FFT02", schedule: "07:15", actual: "07:22", variance: "+7" },
    { id: 5, destination: "CVG06", schedule: "06:55", actual: "07:00", variance: "+5" },
    { id: 6, destination: "OXD04", schedule: "07:00", actual: "07:22", variance: "+22" },
    { id: 7, destination: "LUK01", schedule: "07:10", actual: "07:05", variance: "+0" },
    { id: 8, destination: "CVG02", schedule: "07:05", actual: "07:25", variance: "+20" },
    { id: 9, destination: "Docs LUK77/CVG77/OXD77/FFT77", schedule: "06:30", actual: "07:05", variance: "+35" },
    { id: 10, destination: "CVG78 (DNCA)", schedule: "07:00", actual: "07:20", variance: "+20" },
    { id: 11, destination: "FFT41 (PDJA)", schedule: "07:20", actual: "07:20", variance: "+0" },
  ]);

  // Function to handle input change and recalculate variance
  const handleInputChange = (id, field, value, isFlightTable) => {
    if (isFlightTable) {
      setFlightData((prevData) =>
        prevData.map((row) => {
          if (row.id === id) {
            const updatedRow = { ...row, [field]: value };
            updatedRow.variance = calculateVariance(updatedRow.schedule, updatedRow.actual);
            return updatedRow;
          }
          return row;
        })
      );
    } else {
      setDestinationData((prevData) =>
        prevData.map((row) => {
          if (row.id === id) {
            const updatedRow = { ...row, [field]: value };
            updatedRow.variance = calculateVariance(updatedRow.schedule, updatedRow.actual);
            return updatedRow;
          }
          return row;
        })
      );
    }
  };

  // Show the file selected
  const handleFileSelect = (file, processedData, total, heavy, express) => {
    setFileName(file.name);
    setData(processedData);
    setTotalWeight(total);
    setHeavyWeight(heavy);
    setExpressWeight(express);
  };

  // Function to calculate the variance (time difference)
  const calculateVariance = (schedule, actual) => {
    if (!isValidTime(schedule) || !isValidTime(actual)) return "--";

    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const scheduleMinutes = timeToMinutes(schedule);
    const actualMinutes = timeToMinutes(actual);
    const diff = actualMinutes - scheduleMinutes;

    return diff === 0 ? "+0" : `${diff >= 0 ? "+" : ""}${diff}`;
  };

  // Validate if input is in HH:MM format
  const isValidTime = (time) => {
    return /^\d{1,2}:\d{2}$/.test(time);
  };

  // Function to copy the Executive Summary
  const copyExecutiveSummary = () => {
    const summaryDiv = document.getElementById("executive-summary");
    if (!summaryDiv) return;
  
    // Clone the div to avoid modifying the original
    const clonedSummary = summaryDiv.cloneNode(true);
  
    // Replace all input fields with their values
    clonedSummary.querySelectorAll("input").forEach((input) => {
      const span = document.createElement("span");
      span.textContent = input.value || "--"; // Default value
      input.replaceWith(span);
    });
  
    // Apply inline styles to all tables and cells for clipboard compatibility
    clonedSummary.querySelectorAll("table").forEach((table) => {
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.border = "1px solid black"; // Ensure visible border
    });
  
    clonedSummary.querySelectorAll("th, td").forEach((cell) => {
      cell.style.border = "1px solid black"; // Ensure visible border
      cell.style.padding = "8px";
      cell.style.textAlign = "center";
    });
  
    // Convert to clipboard-friendly format
    const htmlContent = clonedSummary.innerHTML;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const clipboardItem = new ClipboardItem({ "text/html": blob });
  
    navigator.clipboard.write([clipboardItem])
      .then(() => alert("Executive Summary copied to clipboard!"))
      .catch((err) => console.error("Failed to copy:", err));
  };

  // Function to trigger the file download
  const downloadExampleFile = () => {
    const userConfirmed = confirm("Do you want to download an example file?");
    if (userConfirmed) {
      const link = document.createElement("a");
      link.href = "/WBManifestTable_1706092976921.xlsx"; // Path to file in /public
      link.download = "WBManifestTable_1706092976921.xlsx"; // Name of downloaded file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      {/* Select and Copy Buttons */}
      <div className={styles.container}>
        <div className={styles.leftButtons}>
          <button className={styles.button} onClick={() => excel.fileSelector(handleFileSelect)}>
            Select File
          </button>

          <button className={styles.copyButton} onClick={copyExecutiveSummary}>
            Copy Executive Summary
          </button>

          {fileName && <p className={styles.selectedFile}>Selected File: {fileName}</p>}
        </div>
        {/* Secret Invisible Click Area */}
        <div className={styles.rightButtons}>
          <div className={styles.secretArea} onClick={() => setShowButton(true)}>
            {showButton && (
              <button onClick={downloadExampleFile} className={styles.downloadButton}>
                📥
              </button>
            )}
          </div>
        </div>
      </div>

      <div id="executive-summary">
        <h1 className={styles.heading}>Executive Summary</h1>

        {/* Local Sort Plan */}
        <div className={styles.section}>
          <h2 className={styles.subHeading}>Local Sort Plan</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Flight 1460</th>
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
                    <input
                      type="text"
                      className={styles.input}
                      value={row.schedule}
                      onChange={(e) => handleInputChange(row.id, "schedule", e.target.value, true)}
                    />
                  </td>
                  <td className={styles.td}>
                    <input
                      type="text"
                      className={styles.input}
                      value={row.actual}
                      onChange={(e) => handleInputChange(row.id, "actual", e.target.value, true)}
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
                <td className={styles.td}></td>
                <td className={styles.td}></td>
                <td className={styles.td}>
                  <p>Plan= 6550lbs</p>
                  <p>Actual=</p>
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
                  <td className={styles.td}>{row.destination}</td>
                  <td className={styles.td}>
                    <input
                      type="text"
                      className={styles.input}
                      value={row.schedule}
                      onChange={(e) => handleInputChange(row.id, "schedule", e.target.value, false)}
                    />
                  </td>
                  <td className={styles.td}>
                    <input
                      type="text"
                      className={styles.input}
                      value={row.actual}
                      onChange={(e) => handleInputChange(row.id, "actual", e.target.value, false)}
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