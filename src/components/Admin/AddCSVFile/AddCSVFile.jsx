import React, { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../../constants/api";
import { Upload, File, Info, Download } from "lucide-react";
import { toast } from "react-toastify";
import { useSidebar } from "../../../context/SidebarContext";

const AddCSVFileComponent = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { isSidebarOpen, setIsSidebarOpen, isopen, setIsopen } = useSidebar();




    const files = [
        "/formatCsvFiles/F1.csv",
        "/formatCsvFiles/F2.csv",
        "/formatCsvFiles/F3.csv",
        "/formatCsvFiles/F4.csv",
    ]; // Correct path inside the public folder

    const handleDownloadAll = () => {
        files.forEach((file) => {
            const link = document.createElement("a");
            link.href = file; // Updated path
            link.download = file.split("/").pop(); // Extracts just the filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setFileName(selectedFile ? selectedFile.name : "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a file before uploading.");
            return;
        }
        setIsLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(`${BACKEND_URL}/upload/csv-file`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setIsLoading(false);
            toast.success("File uploaded successfully.");
            setFile(null);
            setFileName("");
            document.getElementById("fileInput").value = ""; // Reset input field
        } catch (error) {
            console.error("Error uploading file:", error);
            if (error.response && error.response.data && error.response.data.errors) {
                error.response.data.errors.forEach(err => toast.error(err));
            } else {
                toast.error("Error uploading file.");
            }
            setFile(null);
            setFileName("");
            document.getElementById("fileInput").value = ""; // Reset input field
            setIsLoading(false);
        }
    };

    return (
        <>
            <div>
                <button
                    onClick={handleDownloadAll}
                    className="w-full flex items-center justify-center gap-2 bg-[#6A00FF] hover:bg-[#6A00FF]/40 text-white py-2 rounded-md font-medium transition mb-4"
                >
                    <Download className="w-5 h-5" />
                    Download All CSV Files
                </button>
            </div>
            <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
                <div className="w-full max-w-md bg-white shadow-md rounded-lg p-3 sm:p-6 border border-gray-200">
                    {/* Header */}
                    <h2 className="text-xl font-semibold text-center flex items-center justify-center gap-2 mb-4">
                        <Upload className="w-6 h-6 text-blue-500" />
                        Upload CSV File
                    </h2>

                    {/* Information Section */}
                    <div className="mb-4 p-3 bg- border border-blue-200 rounded-md text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                            <Info className="w-5 h-5 text-[blue] mt-0.5" />
                            <div>
                                <p>Please make sure all files match the expected format.</p>
                                <p>Ensure you upload all files in sequence: <strong>F1, F2, F3, F4</strong>.</p>
                                <p>You can download sample files from the button at the top.</p>
                                <p>If you encounter any errors during import, please reach out to <strong>support</strong>.</p>
                            </div>
                        </div>
                    </div>

                    {/* File Upload Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <label className="font-medium">Choose a CSV File</label>
                        <div className={`relative flex items-center ${isSidebarOpen ? "-z-50" : "z-auto"} `}>
                            {/* Hidden File Input */}
                            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="fileInput" />
                            {/* Styled Label */}
                            <label
                                htmlFor="fileInput"
                                className="flex items-center justify-center w-full cursor-pointer border border-gray-300 rounded-md p-3 bg-gray-100 hover:bg-gray-200 transition"
                            >
                                <File className="w-5 h-5 text-gray-600 mr-2" />
                                {fileName || "Select File"}
                            </label>
                        </div>

                        {/* Submit Button */}
                        {
                            isLoading ? (
                                <button type="submit" disabled className="w-full flex items-center justify-center gap-2 [#6A00FF]/70 hover:bg-red/30 text-white py-2 rounded-md font-medium transition">
                                    <span className="spinner-border spinner-border-sm text-white mr-2" role="status" aria-hidden="true" />
                                    Uploading...
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="w-full bg-[#6A00FF]/70 hover:[#6A00FF]]/30 text-white py-2 rounded-md font-medium transition"
                                >
                                    Upload File
                                </button>
                            )
                        }
                    </form>
                </div>
            </div>
        </>


    );
};

export default AddCSVFileComponent;
