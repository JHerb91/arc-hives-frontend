// pages/article.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Article() {
  const router = useRouter();
  const { id } = router.query; // article id from URL
  const [article, setArticle] = useState(null);

  // Comment form state
  const [commentText, setCommentText] = useState('');
  const [citationsCount, setCitationsCount] = useState(0);
  const [hasIdentifyingInfo, setHasIdentifyingInfo] = useState(false);
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      try {
        const res = await axios.get(`https://arc-hives-backend.onrender.com/article/${id}`);
        setArticle(res.data.article);
      } catch (err) {
        console.error(err);
      }
    };

    fetchArticle();
  }, [id]);

  const submitComment = async () => {
    try {
      const res = await axios.post('https://arc-hives-backend.onrender.com/add-comment', {
        article_id: id,
        comment: commentText,
        citations_count: citationsCount,
        has_identifying_info: hasIdentifyingInfo
      });
      setResponse(JSON.stringify(res.data, null, 2));
      setCommentText('');
      setCitationsCount(0);
      setHasIdentifyingInfo(false);
    } catch (err) {
      setResponse('Error: ' + err.message);
    }
  };

  if (!article) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
      <p>Points: {article.points}</p>

      <hr style={{ margin: '20px 0' }} />

      <h2>Leave a Comment</h2>
      <textarea
        placeholder="Your comment"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        rows={4}
        style={{ width: '100%' }}
      />
      <br /><br />
      <input
        type="number"
        placeholder="Number of citations"
        value={citationsCount}
        onChange={(e) => setCitationsCount(Number(e.target.value))}
      />
      <br /><br />
      <label>
        <input
          type="checkbox"
          checked={hasIdentifyingInfo}
          onChange={(e) => setHasIdentifyingInfo(e.target.checked)}
        />
        Include identifying info
      </label>
      <br /><br />
      <button onClick={submitComment}>Submit Comment</button>

      <pre>{response}</pre>
    </div>
  );
}
