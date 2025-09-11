import { useState } from 'react';
import axios from 'axios';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [originalLink, setOriginalLink] = useState('');
  const [file, setFile] = useState(null);
  const [bibliography, setBibliography] = useState(['']);
  const [message, setMessage] = useState('');

  const handleBibChange = (index, value) => {
    const newBib = [...bibliography];
    newBib[index] = value;
    setBibliography(newBib);
  };

  const addBibField = () => {
    setBibliography([...bibliography, '']);
  };

  const handleSubmit = async () => {
  if (!title || !file) {
    setMessage('Please provide a title and select a file.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('authors', authors);
    formData.append('original_link', originalLink);
    formData.append('file', file);
    // Send bibliography as JSON string
    formData.append('bibliography', JSON.stringify(bibliography));

    const res = await axios.post(
      'https://arc-hives-backend.onrender.com/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    if (res.data.success) {
      setMessage('Upload successful!');
      setTitle('');
      setAuthors('');
      setOriginalLink('');
      setFile(null);
      setBibliography(['']);
    } else {
      setMessage('Upload failed: ' + (res.data.error || 'Unknown error'));
    }
  } catch (err) {
    console.error('Upload error:', err);
    setMessage('Server error during upload.');
  }
};


  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1>Upload Article</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label><br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', marginBottom: 10 }}
          />
        </div>
        <div>
          <label>Authors (comma separated)</label><br />
          <input
            type="text"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
          />
        </div>
        <div>
          <label>Original Publication Link (optional)</label><br />
          <input
            type="url"
            value={originalLink}
            onChange={(e) => setOriginalLink(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
          />
        </div>
        <div>
          <label>Upload File</label><br />
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            required
            style={{ width: '100%', marginBottom: 10 }}
          />
        </div>
        <div>
          <label>Bibliography</label><br />
          {bibliography.map((b, idx) => (
            <input
              key={idx}
              placeholder={`Source #${idx + 1}`}
              value={b}
              onChange={(e) => handleBibChange(idx, e.target.value)}
              style={{ display: 'block', width: '100%', marginBottom: 5 }}
            />
          ))}
          <button type="button" onClick={addBibField} style={{ marginBottom: 10 }}>
            Add another source
          </button>
        </div>
        <button type="submit">Upload</button>
      </form>
      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}
