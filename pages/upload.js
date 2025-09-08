import { useState } from 'react';
import axios from 'axios';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hash, setHash] = useState('');
  const [message, setMessage] = useState('');
  const [duplicate, setDuplicate] = useState(false);

  // Function to generate SHA-256 hash from text
  async function generateSHA256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  const handleSubmit = async () => {
    setMessage('');
    setHash('');
    setDuplicate(false);

    if (!title || !content) {
      setMessage('Please enter both title and content.');
      return;
    }

    try {
      // Generate SHA-256 from article content
      const sha256 = await generateSHA256(content);

      const res = await axios.post('https://arc-hives-backend.onrender.com/upload', {
        title,
        sha256
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
        rows={10}
        cols={50}
      /><br /><br />
      <button onClick={handleSubmit}>Upload</button>
      {message && <p>{message}</p>}
      {hash && !duplicate && <p>Your SHA-256 hash: {hash}</p>}
    </div>
  );
}
