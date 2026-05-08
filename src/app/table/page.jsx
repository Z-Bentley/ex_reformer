"use client"
import React, { useState } from 'react'
import * as excel from "../excel.js"
import styles from "../styles/default.module.css"

export default function Table() {
    const [fileName, setFileName] = useState("");
    const [data, setData] = useState([]);
    const [showButton, setShowButton] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);

    const handleFileSelect = (file, processedData) => {
        setFileName(file.name);
        setData(processedData);
    };

    const toggleRow = (index) => {
        setSelectedRows((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
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
                    <button className={styles.button} onClick={() => excel.tableSelector(handleFileSelect)}>
                        Select File
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

            {/* Table or no Table, You must Choose */}
            <div className='p-4'>                
                {!fileName && (
                    <div className={styles.noFile}>
                        <h2>Choose an Excel File</h2>
                        <p>.xlsx or .xls</p>
                    </div>
                )}
                {fileName && (
                    <div className={styles.section}>
                        <h2 className={styles.subHeading}>Excel Data</h2>
                        <div  className={styles.tableWrapper}>
                            <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Select</th>
                                    <th className={styles.th}>Position</th>
                                    <th className={styles.th}>ULD</th>
                                    <th className={styles.th}>Weight</th>
                                    <th className={styles.th}>Destination</th>
                                    <th className={styles.th}>Service</th>
                                    <th className={styles.th}>Load</th>
                                    <th className={styles.th}>Pkg Dests</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, index) => (
                                    <tr
                                key={index}
                                className={selectedRows.includes(index) ? styles.selectedRow : ""}
                            >
                                        <td className={styles.td}>
                                            <button
                                                className={styles.selectButton}
                                                onClick={() => toggleRow(index)}
                                            >
                                                {selectedRows.includes(index) ? "✓" : "Select"}
                                            </button>
                                        </td>

                                        <td className={styles.td}>{row.Position}</td>
                                        <td className={styles.td}>{row.Uld}</td>
                                        <td className={styles.td}>{row.Weight}</td>
                                        <td className={styles.td}>{row.Destination}</td>
                                        <td className={styles.td}>{row.Service_CD}</td>
                                        <td className={styles.td}>{row.Load_CD}</td>
                                        <td className={styles.td}>{row.Pkg_Dests}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
