import { useState } from 'react';
import './App.css'
import Chat from './components/Chat';
import FileDropUploader from './components/FileDropUploader';
import FileUpload from './components/FileUpload';
import FileManagerModal from './components/FileManagerModal';


function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div style={{ padding: "1rem" }}>
        <FileDropUploader onUploadSuccess={() => setRefreshKey(prev => prev + 1)} />
{/* 
        <button onClick={() => setModalOpen(true)} style={{ marginTop: "1rem" }}>
          📄 View Uploaded Files
        </button>

        <FileManagerModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          refreshKey={refreshKey}
        /> */}

        {/* <FileUpload /> */}
        <Chat />
      </div>
    </>
  )
}

export default App
