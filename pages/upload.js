import { useState } from 'react';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [link, setLink] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Uploading...');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('authors', authors);
    formData.append('link', link);
    if (file) {
      formData.append('file', file);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setMessage('Upload successful!');
      } else {
        const errorText = await res.text();
        setMessage(`Upload failed: ${errorText}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('Upload failed due to network error.');
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
            required
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Original Publication Link</label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
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
