import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const API_BASE = "http://localhost:8000";

interface Props {
  onUploadSuccess: () => void;
}

const FileDropUploader: React.FC<Props> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    setSelectedFiles(acceptedFiles);
    setUploadMsg(null);
  }, []);

  const uploadFiles = async () => {
    if (!selectedFiles.length) return;
    setIsUploading(true);
    setUploadMsg(null);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("file", file);
    });
    try {
      await axios.post(`${API_BASE}/documents/upload`, formData);
      setUploadMsg("✅ Upload successful");
      setSelectedFiles([]);
      onUploadSuccess();
    } catch {
      setUploadMsg("❌ Upload failed");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadMsg(null), 2000);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt"], "text/markdown": [".md"] },
    multiple: true,
    maxFiles: 20 // arbitrary limit, adjust as needed
  });

  return (
    <div className="fdu-root">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`fdu-dropzone${isDragActive ? ' fdu-dropzone-active' : ''}${isUploading ? ' fdu-dropzone-disabled' : ''}`}
        aria-disabled={isUploading}
      >
        <input {...getInputProps()} disabled={isUploading} />
        <div className="fdu-dropzone-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="fdu-dropzone-icon">
            <rect width="24" height="24" rx="12" fill="#e0f2fe" />
            <path d="M12 16V8M12 8L8 12M12 8l4 4" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="fdu-dropzone-title">
            {isDragActive ? 'Drop files to add' : 'Drag & drop .txt or .md files'}
          </p>
          <span className="fdu-dropzone-sub">or click to select</span>
        </div>
        {isUploading && <p className="fdu-uploading">Uploading...</p>}
        {uploadMsg && <p className={`fdu-upload-msg${uploadMsg.startsWith('✅') ? ' fdu-upload-success' : ' fdu-upload-error'}`}>{uploadMsg}</p>}
      </div>

      {/* Selected Files Row (now under the dropzone) */}
      {selectedFiles.length > 0 && (
        <div className="fdu-files-row-wrapper">
          <div className="fdu-files-row">
            {selectedFiles.map((file, idx) => (
              <div
                key={file.name + idx}
                className="fdu-file-chip"
                title={file.name}
              >
                <span className="fdu-file-icon">📄</span>
                <span className="fdu-file-name">{file.name}</span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedFiles(files => files.filter((_, i) => i !== idx));
                  }}
                  disabled={isUploading}
                  className="fdu-file-remove"
                  aria-label={`Remove ${file.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => setSelectedFiles([])}
            disabled={isUploading}
            className="fdu-clear-all-fixed"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Upload Button at the bottom right */}
      <div className="fdu-upload-btn-row">
        <button
          onClick={uploadFiles}
          disabled={isUploading || selectedFiles.length === 0}
          className={`fdu-upload-btn${selectedFiles.length > 0 ? ' fdu-upload-btn-pop' : ''}`}
        >
          {isUploading ? (
            <span className="fdu-uploading-flex">
              <span className="fdu-loader"></span>
              Uploading...
            </span>
          ) : 'Upload'}
        </button>
      </div>

    </div>
  );
};

export default FileDropUploader;
