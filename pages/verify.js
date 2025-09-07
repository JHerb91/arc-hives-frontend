import { useState } from 'react';
import axios from 'axios';

export default function Verify() {
  const [sha256, setSha256] = useState('');
  const [result, setResult] = useState('');

  const verifyArticle = async () => {
    try {
      const res = await axios.post('https://arc-hives-backend.onrender.com/verify-article', {
        sha256
      });
      if (res.data.success) {
        setResult(JSON.stringify(res.data.certificate, null, 2));
      } else {
        setResult('Verification failed.');
      }
    } catch (err) {
      setResult('Error: ' + err.response?.data?.error || err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Verify Your Article</h1>
      <input
        type="text"
        placeholder="Paste your SHA-256 hash"
        value={sha256}
        onChange={(e) => setSha256(e.target.value)}
        style={{ width: '100%' }}
      />
      <br /><br />
      <button onClick={verifyArticle}>Verify</button>
      <pre>{result}</pre>
    </div>
  );
}
