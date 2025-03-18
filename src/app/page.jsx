"use client"
import { useState } from "react";
import * as excel from "./excel.js"
import styles from "./styles/base.module.css"
import Reformer from "./components/Reformer.jsx";

export default function EditableTimeTable() {
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState([]);
  const [totalWeight, setTotalWeight] = useState("--");
  const [heavyWeight, setHeavyWeight] = useState("--");
  const [expressWeight, setExpressWeight] = useState("--");
  const [showButton, setShowButton] = useState(false);

  // Show the file selected
  const handleFileSelect = (file, processedData, total, heavy, express) => {
    setFileName(file.name);
    setData(processedData);
    setTotalWeight(total);
    setHeavyWeight(heavy);
    setExpressWeight(express);
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

    clonedSummary.querySelectorAll("textarea").forEach((textarea) => {
      const span = document.createElement("span");
      span.textContent = textarea.value || "--"; // ✅ Copies text from textarea
      textarea.replaceWith(span);
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
      link.href = "../data/Workbench_Example.xlsx"; // Path to file in /public
      link.download = "Workbench_Example.xlsx"; // Name of downloaded file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={styles.main}>
      {/* Select and Copy Buttons */}
      <div className={styles.container}>
        <div className={styles.leftButtons}>
          {/* Select File */}
          <button className={styles.button} onClick={() => excel.fileSelector(handleFileSelect)}>
            Select File
          </button>

          {/* Copy Summary */}
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

      <div>
        {/* id='executive-summary' in Reformer*/}
        <Reformer
          data={data}
          totalWeight={totalWeight}
          heavyWeight={heavyWeight}
          expressWeight={expressWeight}
        />
      </div>
    </div>
  );
}