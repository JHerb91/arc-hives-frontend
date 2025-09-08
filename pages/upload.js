import { useState } from 'react';
import axios from 'axios';
import crypto from 'crypto';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hash, setHash] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!title || !content) {
      setMessage('Please enter both title and content.');
      return;
    }

    // Generate SHA-256 hash of content
    const sha256 = crypto.createHash('sha256').update(content).digest('hex');

    try {
      const res = await axios.post('https://arc-hives-backend.onrender.com/upload', {
        title,
        content,
        sha256
      });

      if (res.data.duplicate) {
        setMessage('Article already exists. Upload skipped.');
        setHash(''); // Do not show hash for duplicates
      } else if (res.data.success) {
        setMessage('Upload successful!');
        setHash(res.data.article.sha256);
        setTitle('');
        setContent('');
      } else {
        setMessage('Upload failed. ' + (res.data.message || ''));
        setHash('');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('Server error during upload.');
      setHash('');
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
      {hash && (
        <p>Your SHA-256 hash: <code>{hash}</code></p>
      )}
    </div>
  );
}
