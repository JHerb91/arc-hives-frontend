import { useState } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !content) {
      alert('Title and content are required.');
      return;
    }

    setLoading(true);

    // Calculate SHA-256 hash of the content
    const sha256 = CryptoJS.SHA256(content).toString(CryptoJS.enc.Hex);

    try {
      const res = await axios.post('https://arc-hives-backend.onrender.com/upload', {
        title,
        content,
        sha256
      });

      if (res.data.success) {
        setHash(sha256);
        alert('Upload successful!');
        setTitle('');
        setContent('');
      } else if (res.data.duplicate) {
        alert('Article already exists. Upload skipped.');
      } else {
        alert('Upload failed.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed.');
    } finally {
      setLoading(false);
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
      <textarea
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={10}
        cols={50}
      /><br /><br />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {hash && <p>Your SHA-256 hash: {hash}</p>}
    </div>
  );
}
