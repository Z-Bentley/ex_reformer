"use client";
import { useState } from "react";
import * as excel from "./../excel.js";
import styles from "./../styles/default.module.css";
import Link from "next/link";

export default function Cons() {
    const [fileName, setFileName] = useState("");
    const [data, setData] = useState([]);
    const [showButton, setShowButton] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [tableHeading, setTableHeading] = useState("");

    // Callback when file is selected and parsed
    const handleFileSelect = (file, processedData) => {
        // Remove the file extension (e.g., .xlsx, .xls)
        const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
        
        setFileName(nameWithoutExtension);
        setData(processedData);
        setSelectedRows([]); // Reset selected rows for a new file
        setTableHeading(nameWithoutExtension)
    };

    // Toggle row selection on click
    const toggleRowSelection = (index) => {
        if (selectedRows.includes(index)) {
            setSelectedRows(selectedRows.filter((i) => i !== index));
        } else {
            setSelectedRows([...selectedRows, index]);
        }
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

    // Inside your Cons component:
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={styles.main}>
            {/* Header */}
            <div className={styles.container}>
                <div className={styles.leftButtons}>
                    {/* Select File */}
                    <button 
                        className={styles.button} 
                        onClick={() => excel.positionSelector(handleFileSelect)}
                    >
                        Select File
                    </button>

                    {fileName && <p className={styles.selectedFile}>Selected File: {fileName}</p>}
                </div>

                {/* Navigation and Secret Download Area */}
                <div className={styles.rightButtons}>
                    <div>
                        <Link href="/" className={styles.tableLink}>
                            Home
                        </Link>
                    </div>
                    <div>
                        <Link href="/table" className={styles.tableLink}>
                            Table
                        </Link>
                    </div>
                    <div>
                        <Link href="/cons" className={styles.tableLink}>
                            Cons by Opar
                        </Link>
                    </div>
                    <div className={styles.secretArea} onClick={() => setShowButton(true)}>
                        {showButton && (
                            <button onClick={downloadExampleFile} className={styles.downloadButton}>
                                📥
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {fileName && (
                <button className={styles.button} onClick={handlePrint}>
                    🖨️ Print Table
                </button>
            )}

            {/* Content Area */}
            <div className="p-4">                
                {!fileName && (
                    <div className={styles.noFile}>
                        <h2>Choose an Excel File</h2>
                        <p>.xlsx or .xls</p>
                    </div>
                )}
                {fileName && (
                    <div className={styles.section}>
                        <h2 className={styles.subHeading}>
                            <input
                                type="text"
                                className={styles.input}
                                value={tableHeading}
                                onChange={(e) => setTableHeading(e.target.value)}
                            />
                        </h2>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>Tracking No</th>
                                        <th className={styles.th}>Recip Co</th>
                                        <th className={styles.th}>Recip Addr</th>
                                        <th className={styles.th}>Recip City</th>
                                        <th className={styles.th}>Service</th>
                                        <th className={styles.th}>Commit Date</th>
                                        <th className={styles.th}>Commit Time</th>
                                        <th className={styles.th}>Special Handling Codes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row, index) => (
                                        <tr
                                            key={index}
                                            onClick={() => toggleRowSelection(index)}
                                            className={selectedRows.includes(index) ? styles.selectedRow : ""}
                                        >
                                            <td className={styles.td}>{row.Tracking_No}</td>
                                            <td className={styles.td}>{row.Recip_Co}</td>
                                            <td className={styles.td}>{row.Recip_Addr}</td>
                                            <td className={styles.td}>{row.Recip_City}</td>
                                            <td className={styles.td}>{row.Service}</td>
                                            <td className={styles.td}>{row.Commit_Date}</td>
                                            <td className={styles.td}>{row.Commit_Time}</td>
                                            <td className={styles.td}>{row.Special_Handling_Codes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}