// verify.js
import React, { useState } from 'react';
import axios from 'axios';

export default function Verify() {
  const [sha256, setSha256] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!sha256) {
      alert('Please enter a SHA-256 hash');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('https://arc-hives-backend.onrender.com/verify-article', { sha256 });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Error verifying article');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!sha256) return;

    try {
      const pdfRes = await axios.post(
        'https://arc-hives-backend.onrender.com/verify-article-pdf',
        { sha256 },
        { responseType: 'blob' } // important for PDF
      );

      const url = window.URL.createObjectURL(new Blob([pdfRes.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${result.certificate.article_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert('Error generating PDF certificate.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Verify Your Article</h2>
      <input
        type="text"
        placeholder="Enter SHA-256 hash"
        value={sha256}
        onChange={(e) => setSha256(e.target.value)}
        style={{ width: '400px', padding: '5px', marginRight: '10px' }}
      />
      <button onClick={handleVerify}>Verify</button>

      {loading && <p>Loading...</p>}

      {result && result.success && (
        <div style={{ marginTop: '20px' }}>
          <p><strong>Article Title:</strong> {result.certificate.title}</p>
          <p><strong>Article ID:</strong> {result.certificate.article_id}</p>
          <p><strong>Certificate ID:</strong> {result.certificate.certificate_id}</p>
          <p><strong>Verified At:</strong> {result.certificate.verified_at}</p>
          <p>{result.certificate.message}</p>

          <button onClick={handleDownloadPDF} style={{ marginTop: '10px' }}>
            Download PDF Certificate
          </button>
        </div>
      )}

      {result && result.error && (
        <p style={{ color: 'red' }}>Error: {result.error}</p>
      )}
    </div>
  );
}
