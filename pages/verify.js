// pages/verify.js
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
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.response?.data?.error || err.message });
    }
  };

  const downloadCertificate = () => {
    if (!result.success) return;

    const blob = new Blob([JSON.stringify(result.certificate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate_${result.certificate.article_id}.json`;
    link.click();
    URL.revokeObjectURL(url);
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

      {result && (
        <>
          <pre>{JSON.stringify(result, null, 2)}</pre>
          {result.success && (
            <button onClick={downloadCertificate} style={{ marginTop: 10 }}>
              Download Certificate
            </button>
          )}
        </>
      )}
    </div>
  );
}
