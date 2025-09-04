import { useState } from 'react';
import axios from 'axios';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hash, setHash] = useState('');

  const handleSubmit = async () => {
    const res = await axios.post('https://arc-hives-backend.onrender.com/upload-article', { title, content });
    setHash(res.data.hash);
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
