import { useState } from 'react';
import axios from 'axios';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hash, setHash] = useState('');

  // Function to compute SHA-256 from content
  const computeSHA256 = async (text) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSubmit = async () => {
    const sha256 = await computeSHA256(content);
    const res = await axios.post('https://arc-hives-backend.onrender.com/upload', { title, sha256 });
    setHash(res.data.article.sha256);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Upload Article</h1>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} /><br /><br />
      <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} /><br /><br />
      <button onClick={handleSubmit}>Upload</button>
      {hash && <p>Your SHA-256 hash: {hash}</p>}
    </div>
  );
}
