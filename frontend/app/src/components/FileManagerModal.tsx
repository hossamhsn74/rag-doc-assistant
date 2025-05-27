import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";

const API_BASE = "http://localhost:8000";

interface Props {
    open: boolean;
    onClose: () => void;
    refreshKey: number;
    richStyle?: boolean;
}
interface FileEntry {
    filename: string;
    uuid: string;
}


const FileManagerModal: React.FC<Props> = ({ open, onClose, refreshKey, richStyle }) => {
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [loading, setLoading] = useState<string | null>(null); // uuid of file being deleted

    const fetchFiles = async () => {
        const res = await axios.get(`${API_BASE}/documents`);
        setFiles(res.data.files);
    };

    const handleDelete = async (uuid: string) => {
        setLoading(uuid);
        await axios.delete(`${API_BASE}/documents/${encodeURIComponent(uuid)}`);
        await fetchFiles();
        setLoading(null);
    };

    useEffect(() => {
        if (open) fetchFiles();
    }, [open, refreshKey]);

    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className={richStyle ? "fm-modal-overlay-rich" : undefined} style={!richStyle ? styles.overlay : undefined} />
                <Dialog.Content className={richStyle ? "fm-modal-rich" : undefined} style={!richStyle ? styles.modal : undefined}>
                    <div className="fm-modal-header-rich">
                        <Dialog.Title className={richStyle ? "fm-modal-title-rich" : undefined} style={!richStyle ? styles.title : undefined}>Uploaded Files</Dialog.Title>
                        <button className="chat-upload-close-fixed" onClick={onClose} title="Close">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="12" fill="#f87171" />
                                <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                    {files.length === 0 ? (
                        <p className={richStyle ? "fm-modal-empty-rich" : undefined}>No files uploaded.</p>
                    ) : (
                            <ul className={richStyle ? "fm-modal-list-rich" : undefined} style={!richStyle ? styles.list : undefined}>
                            {files.map((file) => (
                                <li key={file.uuid} className={richStyle ? "fm-modal-list-item-rich" : undefined} style={!richStyle ? styles.listItem : undefined}>
                                    <span className="fm-modal-file-icon">📄</span>
                                    <span className="fm-modal-file-name">{file.filename}</span>
                                    <button
                                        onClick={() => handleDelete(file.uuid)}
                                        disabled={!!loading}
                                        className={richStyle ? "fm-modal-delete-btn-rich" : undefined}
                                        style={!richStyle ? styles.deleteButton : undefined}
                                        title="Delete file"
                                    >
                                        {loading === file.uuid ? (
                                            <span className="fm-modal-loader"></span>
                                        ) : (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="12" fill="#f87171" />
                                                <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        )}
                                    </button>
                                </li>
                            ))}
                            </ul>
                    )}
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
