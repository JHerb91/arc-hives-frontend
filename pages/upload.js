import { useState } from 'react';
import axios from 'axios';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hash, setHash] = useState('');
  const [message, setMessage] = useState('');
  const [duplicate, setDuplicate] = useState(false);

  const handleSubmit = async () => {
    setMessage('');
    setHash('');
    setDuplicate(false);

    try {
      const res = await axios.post('https://arc-hives-backend.onrender.com/upload', {
        title,
        sha256: content // or however you generate SHA-256 on frontend
      });

      if (res.data.duplicate) {
        setMessage('Article already exists.');
        setDuplicate(true);
      } else if (res.data.success) {
        setMessage('Upload successful!');
        setHash(res.data.hash); // only show hash for new uploads
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('Upload failed.');
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
      {hash && !duplicate && <p>Your SHA-256 hash: {hash}</p>}
    </div>
  );
}
