import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Article() {
  const router = useRouter();
  const { id } = router.query;

  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      try {
        const res = await axios.get(`https://arc-hives-backend.onrender.com/article?id=${id}`);
setArticle(res.data); // use res.data directly
setComments([]); // no comments yet, or fetch separately later

        setComments(res.data.comments || []);
      } catch (err) {
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!article) return <p>Article not found.</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{article.title}</h1>
      {article.content && (
        <div style={{ marginTop: 20 }}>
          <h3>Content</h3>
          <p>{article.content}</p>
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <h3>Comments</h3>
        {comments.length === 0 && <p>No comments yet.</p>}
        <ul>
          {comments.map((c, i) => {
            const body =
              c.comment ??
              c.content ??
              c.text ??
              c.body ??
              '';

            const commenter =
              c.commenter_name ??
              c.commenter ??
              c.name ??
              (c.anonymous ? 'Anonymous' : 'Anonymous');

            const createdAt =
              c.created_at ??
              c.createdAt ??
              c.createdAtTimestamp ??
              c.created;

            const createdDisplay = createdAt
              ? new Date(createdAt).toLocaleString()
              : '';

            const citations = c.citations_count ?? c.citations ?? 0;
            const points = c.points ?? c.point ?? 0;

            return (
              <li key={i} style={{ marginBottom: 20 }}>
                <p>{body}</p>
                <small>
                  By {commenter} {createdDisplay && `on ${createdDisplay}`}
                </small>
                <br />
                <small>
                  Citations: {citations} | Points: {points}
                </small>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
