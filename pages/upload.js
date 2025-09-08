import { useState } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hash, setHash] = useState('');

  const handleSubmit = async () => {
    if (!title || !content) {
      alert('Please enter both a title and content.');
      return;
    }

    const sha256Hash = CryptoJS.SHA256(content).toString();

    try {
      const res = await axios.post(
        'https://arc-hives-backend.onrender.com/upload',
        { title, content, sha256: sha256Hash }
      );

      if (res.data.success) {
        setHash(res.data.article.sha256);
        alert('Upload successful!');
      } else if (res.data.duplicate) {
        setHash(''); // don’t reveal hash on duplicate
        alert('Article already exists. Hash not revealed for security.');
      } else {
        setHash('');
        alert('Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setHash('');
      alert('Upload failed. Please check the console for details.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Upload Article</h1>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      /><br /><br />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        cols={50}
      /><br /><br />
      <button onClick={handleSubmit}>Upload</button>
      {hash && (
        <p>
          Your SHA-256 hash: <strong>{hash}</strong>
        </p>
      )}
    </div>
  );
}
