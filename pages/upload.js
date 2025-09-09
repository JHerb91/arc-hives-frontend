import { useState } from 'react';
import axios from 'axios';

export default function Upload() {
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
      bibliography.forEach((b, i) => {
        formData.append('bibliography', b);
      });

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
    <div style={{ padding: 20 }}>
      <h1>Upload Article</h1>
      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      /><br /><br />
      <input
        placeholder="Authors (comma separated)"
        value={authors}
        onChange={e => setAuthors(e.target.value)}
      /><br /><br />
      <input
        placeholder="Original publication link (optional)"
        value={originalLink}
        onChange={e => setOriginalLink(e.target.value)}
      /><br /><br />
      <input
        type="file"
        onChange={e => setFile(e.target.files[0])}
      /><br /><br />

      <h3>Bibliography</h3>
      {bibliography.map((b, idx) => (
        <input
          key={idx}
          placeholder={`Source #${idx + 1}`}
          value={b}
          onChange={e => handleBibChange(idx, e.target.value)}
          style={{ display: 'block', marginBottom: '5px' }}
        />
      ))}
      <button onClick={addBibField}>Add another source</button><br /><br />

      <button onClick={handleSubmit}>Upload</button>
      {message && <p>{message}</p>}
    </div>
  );
}
