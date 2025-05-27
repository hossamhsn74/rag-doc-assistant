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

      {/* Animations and Styles */}
      <style>{`
        .fdu-root {
          background: #f8fafc;
          border-radius: 18px;
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
          padding: 2rem;
          position: relative;
          min-width: 600px;
          max-width: 600px;
          margin: 0 auto;
        }
        .fdu-dropzone {
          border: 2.5px dashed #94a3b8;
          padding: 2.5rem 1.5rem;
          text-align: center;
          background: #fff;
          border-radius: 14px;
          transition: all 0.25s cubic-bezier(.4,0,.2,1);
          min-width: 320px;
          outline: none;
          position: relative;
          cursor: pointer;
        }
        .fdu-dropzone-active {
          border: 2.5px solid #38bdf8;
          background: linear-gradient(90deg,#e0f2fe 0%,#f0fdfa 100%);
          box-shadow: 0 0 0 4px #bae6fd;
          outline: 2px solid #38bdf8;
        }
        .fdu-dropzone-disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        .fdu-dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .fdu-dropzone-icon {
          margin-bottom: 8px;
        }
        .fdu-dropzone-title {
          font-weight: 600;
          color: #0ea5e9;
          font-size: 18px;
          margin: 0;
        }
        .fdu-dropzone-sub {
          color: #64748b;
          font-size: 14px;
          margin-top: 2px;
        }
        .fdu-uploading {
          color: #0ea5e9;
          margin-top: 12px;
          font-weight: 500;
          font-size: 16px;
          animation: fadeIn 0.5s;
        }
        .fdu-upload-msg {
          margin-top: 10px;
          font-weight: 500;
          font-size: 16px;
          animation: fadeIn 0.5s;
        }
        .fdu-upload-success { color: #22c55e; }
        .fdu-upload-error { color: #ef4444; }
        .fdu-files-row-wrapper {
          position: relative;
          margin: 18px 0 0 0;
          min-height: 48px;
        }
        .fdu-files-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
          margin-right: 110px; /* space for clear button */
        }
        .fdu-file-chip {
          display: flex;
          align-items: center;
          background: #f0fdfa;
          border: 1.5px solid #38bdf8;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-weight: 500;
          color: #0e7490;
          font-size: 15px;
          box-shadow: 0 2px 8px 0 rgba(56,189,248,0.08);
          animation: slideIn 0.4s;
          position: relative;
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .fdu-file-icon {
          margin-right: 8px;
          font-size: 18px;
        }
        .fdu-file-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fdu-file-remove {
          margin-left: 10px;
          background: none;
          border: none;
          color: #ef4444;
          font-weight: 700;
          font-size: 18px;
          cursor: pointer;
          transition: color 0.2s;
          outline: none;
        }
        .fdu-file-remove:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .fdu-clear-all-fixed {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          font-weight: 500;
          font-size: 15px;
          cursor: pointer;
          text-decoration: underline;
          opacity: 1;
          transition: color 0.2s;
          outline: none;
          padding: 0 12px;
          height: 40px;
          display: flex;
          align-items: center;
        }
        .fdu-clear-all-fixed:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .fdu-upload-btn-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
        .fdu-upload-btn {
          background: linear-gradient(90deg,#38bdf8 0%,#0ea5e9 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 2.2rem;
          font-weight: 700;
          font-size: 18px;
          box-shadow: 0 2px 12px 0 rgba(14,165,233,0.12);
          cursor: pointer;
          opacity: 1;
          margin-bottom: 10px;
          margin-top: 10px;
          transition: all 0.2s cubic-bezier(.4,0,.2,1);
          outline: none;
          position: relative;
        }
        .fdu-upload-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .fdu-upload-btn-pop {
          animation: popIn 0.4s;
        }
        .fdu-uploading-flex {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .fdu-loader {
          width: 18px;
          height: 18px;
          border: 3px solid #fff;
          border-top: 3px solid #38bdf8;
          border-radius: 50%;
          display: inline-block;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FileDropUploader;
