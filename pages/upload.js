import { useState } from 'react';
import axios from 'axios';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hash, setHash] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setMessage('');
    setHash('');

    try {
      const res = await axios.post('https://arc-hives-backend.onrender.com/upload', {
        title,
        content,
        sha256: crypto.subtle.digest('SHA-256', new TextEncoder().encode(content + title)).then(buf => {
          return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        })
      });

      // Wait for the SHA-256 promise to resolve
      const sha256Hash = await res.data.sha256 || '';

      if (res.data.success) {
        setHash(sha256Hash);
        setMessage('Upload successful!');
      } else if (res.data.duplicate) {
        setMessage('Article already exists. Upload not saved.');
      } else {
        setMessage('Upload failed.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('Upload failed due to server error.');
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
      /><br /><br />
      <button onClick={handleSubmit}>Upload</button>
      {message && <p>{message}</p>}
      {hash && <p>Your SHA-256 hash: {hash}</p>}
    </div>
  );
}
