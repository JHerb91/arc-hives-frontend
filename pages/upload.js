import { useState } from 'react';
import axios from 'axios';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [originalLink, setOriginalLink] = useState('');
  const [file, setFile] = useState(null);
  const [bibliography, setBibliography] = useState(['']);
  const [message, setMessage] = useState('');

  const handleBibChange = (index, value) => {
    const newBib = [...bibliography];
    newBib[index] = value;
    setBibliography(newBib);
  };

  const addBibField = () => {
    setBibliography([...bibliography, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      setMessage('Please provide a title and select a file.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('authors', authors);
      formData.append('original_link', originalLink);
      formData.append('file', file);
      bibliography.forEach((b) => {
        formData.append('bibliography', b);
      });

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (res.data.success) {
        setMessage('Upload successful!');
        setTitle('');
        setAuthors('');
        setOriginalLink('');
        setFile(null);
        setBibliography(['']);
      } else {
        setMessage('Upload failed: ' + (res.data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('Server error during upload.');
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Article</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Authors</label>
          <input
            type="text"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            placeholder="Separate multiple authors with commas"
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Original Publication Link</label>
          <input
            type="url"
            value={originalLink}
            onChange={(e) => setOriginalLink(e.target.value)}
            placeholder="https://example.com"
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Upload File</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            required
            className="w-full"
          />
        </div>
        <div>
          <label className="block font-semibold">Bibliography</label>
          {bibliography.map((b, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Source #${idx + 1}`}
              value={b}
              onChange={(e) => handleBibChange(idx, e.target.value)}
              className="w-full border rounded p-2 mb-2"
            />
          ))}
          <button
            type="button"
            onClick={addBibField}
            className="px-3 py-1 bg-gray-500 text-white rounded"
          >
            Add another source
          </button>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Upload
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}
