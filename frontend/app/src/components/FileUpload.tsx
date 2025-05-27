import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:8000";

type FileInfo = {
  filename: string;
  uuid: string;
};

const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);

  const fetchFiles = async () => {
    const res = await axios.get(`${API_BASE}/documents`);
    setFiles(res.data.files); 
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    await axios.post(`${API_BASE}/documents/upload`, formData);
    setSelectedFile(null);
    fetchFiles();
  };

  const handleDelete = async (uuid: string) => {
    await axios.delete(`${API_BASE}/documents/${uuid}`);
    fetchFiles();
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <h2>📁 Document Manager</h2>
      <input
        type="file"
        accept=".txt,.md"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={!selectedFile} style={{ marginLeft: "1rem" }}>
        Upload
      </button>

      <hr style={{ margin: "2rem 0" }} />

      <h4>Uploaded Files</h4>
      <ul>
        {files.map((f) => (
          <li key={f.uuid}>
            {f.filename}{" "}
            <button onClick={() => handleDelete(f.uuid)} style={{ marginLeft: "1rem" }}>
              ❌ Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileUpload;
