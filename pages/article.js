import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Article() {
  const router = useRouter();
  const { id } = router.query; // article id from URL
  const [article, setArticle] = useState(null);

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

  if (!article) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
      <p>Points: {article.points}</p>
    </div>
  );
}
