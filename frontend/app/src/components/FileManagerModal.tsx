import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";

const API_BASE = "http://localhost:8000";

interface Props {
    open: boolean;
    onClose: () => void;
    refreshKey: number; // used to re-fetch list when upload occurs
}
interface FileEntry {
    filename: string;
    uuid: string;
}


const FileManagerModal: React.FC<Props> = ({ open, onClose, refreshKey }) => {
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchFiles = async () => {
        const res = await axios.get(`${API_BASE}/documents`);
        setFiles(res.data.files);
    };


    const handleDelete = async (uuid: string) => {
        setLoading(true);
        await axios.delete(`${API_BASE}/documents/${encodeURIComponent(uuid)}`);
        await fetchFiles();
        setLoading(false);
    };

    useEffect(() => {
        if (open) fetchFiles();
    }, [open, refreshKey]);

    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay style={styles.overlay} />
                <Dialog.Content style={styles.modal}>
                    <Dialog.Title style={styles.title}>📁 Uploaded Files</Dialog.Title>

                    {files.length === 0 ? (
                        <p>No files uploaded.</p>
                    ) : (
                        <ul style={styles.list}>
                            {files.map((file) => (
                                <li key={file.uuid} style={styles.listItem}>
                                    {file.filename}
                                    <button
                                        onClick={() => handleDelete(file.uuid)}
                                        disabled={loading}
                                        style={styles.deleteButton}
                                    >
                                        ❌
                                    </button>
                                </li>
                            ))}
                        </ul>

                    )}

                    <Dialog.Close asChild>
                        <button style={styles.close}>Close</button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default FileManagerModal;

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        inset: 0,
    },
    modal: {
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "10px",
        maxWidth: "500px",
        margin: "auto",
        position: "fixed",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
    },
    title: {
        fontSize: "1.25rem",
        marginBottom: "1rem",
    },
    list: {
        listStyle: "none",
        padding: 0,
        marginBottom: "1.5rem",
    },
    listItem: {
        display: "flex",
        justifyContent: "space-between",
        padding: "0.5rem 0",
        borderBottom: "1px solid #ccc",
    },
    deleteButton: {
        background: "transparent",
        border: "none",
        color: "red",
        cursor: "pointer",
    },
    close: {
        marginTop: "1rem",
        padding: "0.5rem 1rem",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
};
