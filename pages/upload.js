import { useState } from 'react';
import axios from 'axios';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hash, setHash] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await axios.post('https://arc-hives-backend.onrender.com/upload', {
        title,
        sha256: content ? await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content))
          .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''))
          : '',
      });

      setHash(res.data.article.sha256);

      if (res.data.duplicate) {
        setMessage('Article already exists. Returning existing record.');
      } else {
        setMessage('Upload successful!');
      }

    } catch (err) {
      console.error(err);
      setMessage('Upload failed. See console for details.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Upload Article</h1>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} /><br /><br />
      <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} /><br /><br />
      <button onClick={handleSubmit}>Upload</button>
      {hash && <p>Your SHA-256 hash: {hash}</p>}
      {message && <p>{message}</p>}
    </div>
  );
}
