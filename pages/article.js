// pages/article.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const BACKEND = 'https://arc-hives-backend.onrender.com';

export default function ArticlePage() {
  const router = useRouter();
  const { id } = router.query;

  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    const fetchArticleAndComments = async () => {
      setLoading(true);
      setError('');
      try {
        // --- Fetch article ---
        const aRes = await fetch(`${BACKEND}/article?id=${encodeURIComponent(id)}`);
        if (!aRes.ok) {
          // surface friendly error for 404, etc.
          const text = await aRes.text();
          throw new Error(`Failed to fetch article (status ${aRes.status}): ${text}`);
        }
        const aJson = await aRes.json();
        // Accept either { article: {...} } or {...}
        const articleObj = aJson.article ?? aJson;
        if (!articleObj || Object.keys(articleObj).length === 0) {
          throw new Error('Article not found or empty response.');
        }
        if (!cancelled) setArticle(articleObj);

        // --- Fetch comments ---
        // Try preferred endpoint first, then fallback if 404
        const tryEndpoints = [
          `${BACKEND}/articles/${encodeURIComponent(id)}/comments`,
          `${BACKEND}/comments/${encodeURIComponent(id)}`,
          `${BACKEND}/articles/${encodeURIComponent(id)}/comments/`, // harmless attempt
        ];

        let commentsData = null;
        for (const endpoint of tryEndpoints) {
          try {
            const cRes = await fetch(endpoint);
            if (!cRes.ok) {
              // if 404 try next, otherwise treat as no comments (but continue)
              if (cRes.status === 404) continue;
              const txt = await cRes.text().catch(() => '');
              // if it returns an empty body but ok, continue
              if (cRes.status >= 400) {
                // don't throw here; try next endpoint
                continue;
              }
            }
            const cJson = await cRes.json().catch(() => null);
            // Accept either { comments: [...] } or [...]
            if (Array.isArray(cJson)) {
              commentsData = cJson;
            } else if (cJson && Array.isArray(cJson.comments)) {
              commentsData = cJson.comments;
            } else if (cJson && cJson.data && Array.isArray(cJson.data)) {
              // sometimes Supabase wrappers return { data: [...] }
              commentsData = cJson.data;
            } else if (cJson === null) {
              commentsData = [];
            } else if (typeof cJson === 'object' && cJson !== null && Object.keys(cJson).length === 0) {
              commentsData = [];
            } else {
              // if it's a single object or unknown shape, try to coerce
              commentsData = Array.isArray(cJson) ? cJson : [];
            }
            break; // stop trying endpoints
          } catch (e) {
            // try next endpoint
            continue;
          }
        }

        if (!cancelled) setComments(commentsData || []);
      } catch (err) {
        console.error('Fetch error:', err);
        if (!cancelled) setError(err.message || 'Error fetching article or comments.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchArticleAndComments();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;
  if (!article) return <div style={{ padding: 20 }}>Article not found.</div>;

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>{article.title}</h1>
      {article.points !== undefined && (
        <div style={{ marginBottom: 12, color: '#333' }}>
          <strong>Points:</strong> {article.points}
        </div>
      )}
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: 24 }}>
        {article.content}
      </div>

      <hr style={{ margin: '24px 0' }} />

      <h2 style={{ marginBottom: 12 }}>Comments ({comments.length})</h2>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {comments.map((c) => {
            // support multiple possible field names for comment body
            const body = c.comment ?? c.content ?? c.text ?? c.body ?? '';
            const commenter =
              c.commenter_name ?? c.commenter ?? c.name ?? (c.anonymous ? 'Anonymous' : 'Anonymous');
            const createdAt = c.created_at ?? c.createdAt ?? c.createdAtTimestamp ?? c.created || null;
            const createdDisplay = createdAt ? new Date(createdAt).toLocaleString() : '';
            const citations = c.citations_count ?? c.citations ?? 0;
            const points = c.points ?? c.point ?? 0;

            return (
              <div
                key={c.id ?? Math.random()}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  padding: 12,
                  background: '#fff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600 }}>{commenter}</div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>{createdDisplay}</div>
                </div>

                <div style={{ marginBottom: 8, whiteSpace: 'pre-wrap' }}>{body}</div>

                <div style={{ fontSize: '0.85rem', color: '#444', display: 'flex', gap: 12 }}>
                  <div>Cit: {citations}</div>
                  <div>Pts: {Number(points).toFixed(2)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
