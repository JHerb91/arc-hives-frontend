import { useState } from "react";
import axios from "axios";

export default function Upload() {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [publicationLink, setPublicationLink] = useState("");
  const [file, setFile] = useState(null);
  const [bibliography, setBibliography] = useState([""]);
  const [message, setMessage] = useState("");
  const [hash, setHash] = useState("");

  const handleBibliographyChange = (index, value) => {
    const newBib = [...bibliography];
    newBib[index] = value;
    setBibliography(newBib);
  };

  const addBibliographyField = () => {
    setBibliography([...bibliography, ""]);
  };

  const handleSubmit = async () => {
    if (!title || !file) {
      setMessage("Please provide a title and upload a file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("authors", authors);
    formData.append("publicationLink", publicationLink);
    formData.append("file", file);
    bibliography.forEach((src, i) => {
      if (src.trim()) formData.append(`bibliography[${i}]`, src);
    });

    try {
      const res = await axios.post(
        "https://arc-hives-backend.onrender.com/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.duplicate) {
        setMessage("Article already exists. Upload skipped.");
        setHash("");
      } else if (res.data.success) {
        setMessage("Upload successful!");
        setHash(res.data.article.sha256 || "");
        setTitle("");
        setAuthors("");
        setPublicationLink("");
        setFile(null);
        setBibliography([""]);
      } else {
        setMessage("Upload failed. " + (res.data.message || ""));
        setHash("");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("Server error during upload.");
      setHash("");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Upload Article</h1>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <br />

      <input
        placeholder="Authors"
        value={authors}
        onChange={(e) => setAuthors(e.target.value)}
      />
      <br />
      <br />

      <input
        placeholder="Publication Link"
        value={publicationLink}
        onChange={(e) => setPublicationLink(e.target.value)}
      />
      <br />
      <br />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        accept=".pdf,.doc,.docx,.txt"
      />
      <br />
      <br />

      <h3>Bibliography Sources</h3>
      {bibliography.map((src, i) => (
        <div key={i}>
          <input
            placeholder={`Source ${i + 1}`}
            value={src}
            onChange={(e) => handleBibliographyChange(i, e.target.value)}
          />
        </div>
      ))}
      <button onClick={addBibliographyField}>+ Add Source</button>
      <br />
      <br />

      <button onClick={handleSubmit}>Upload</button>
      {message && <p>{message}</p>}
      {hash && (
        <p>
          Your SHA-256 hash: <code>{hash}</code>
        </p>
      )}
    </div>
  );
}
