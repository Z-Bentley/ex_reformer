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
  const [actualPounds, setActualPounds] = useState("");

  // Show the file selected
  const handleFileSelect = (file, processedData, total, heavy, express, pounds) => {
    setFileName(file.name);
    setData(processedData);
    setTotalWeight(total);
    setHeavyWeight(heavy);
    setExpressWeight(express);
    setActualPounds(pounds)
  };

  // Function to copy the Executive Summary
  const copyExecutiveSummary = () => {
    const summaryDiv = document.getElementById("executive-summary");
    if (!summaryDiv) return;

    const clonedSummary = summaryDiv.cloneNode(true);

    // Remove elements marked with ID 'doNotCopy'
    clonedSummary.querySelectorAll("#doNotCopy").forEach((el) => el.remove());

    // Replace all input fields with their values
    clonedSummary.querySelectorAll("input").forEach((input) => {
      const span = document.createElement("span");
      span.textContent = input.value || "--";
      input.replaceWith(span);
    });

    // Replace all textarea fields with their values
    clonedSummary.querySelectorAll("textarea").forEach((textarea) => {
      const span = document.createElement("span");
      span.textContent = textarea.value || "--";
      textarea.replaceWith(span);
    });

    // 🔹 Make the Sort End Variance cell green in the COPIED version
    const sortEndCell = clonedSummary.querySelector('[data-sort-end-variance="true"]');
    if (sortEndCell) {
      sortEndCell.style.backgroundColor = "#c6efce"; // light green (Excel-style)
      sortEndCell.style.color = "#006100";           // dark green text (optional)
      sortEndCell.style.fontWeight = "bold";         // optional
    }

    // Apply inline styles for clipboard formatting
    clonedSummary.querySelectorAll("table").forEach((table) => {
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.border = "1px solid black";
    });

    clonedSummary.querySelectorAll("th, td").forEach((cell) => {
      cell.style.border = "1px solid black";
      cell.style.padding = "8px";
      cell.style.textAlign = "center";
    });

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
          actualPounds={actualPounds}
        />
      </div>
    </div>
  );
}