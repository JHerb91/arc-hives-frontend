import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Articles() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get('https://arc-hives-backend.onrender.com/articles');
        setArticles(res.data.articles || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>All Articles</h1>
      {articles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        articles.map((a) => (
          <div key={a.id} style={{ marginBottom: 15 }}>
            <Link href={`/article?id=${a.id}`}>
              <a style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{a.title}</a>
            </Link>
            <p>Points: {a.points}</p>
          </div>
        ))
      )}
    </div>
  );
}
