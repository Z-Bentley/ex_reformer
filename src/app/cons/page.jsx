"use client"
import { useState } from "react";
import * as excel from "./../excel.js"
// import styles from "./styles/base.module.css"
import styles from "./../styles/default.module.css";
import Link from "next/link";

export default function Cons() {
    const [fileName, setFileName] = useState("");
    const [data, setData] = useState([]);

    // Show the file selected
    const handleFileSelect = (file, processedData) => {
        setFileName(file.name);
        setData(processedData);
    };

    return (
        <div>
            sup
        </div>
    )
}
