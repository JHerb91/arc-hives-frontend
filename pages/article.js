// pages/article.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const BACKEND = 'https://arc-hives-backend.onrender.com';

// 👇 your Supabase project ref (no protocol)
const SUPABASE_PROJECT_REF = 'ebghnxurosvklsdoryfg';
const SUPABASE_PUBLIC_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public`;

export default function ArticlePage() {
  const router = useRouter();
  const { id } = router.query;

  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [form, setForm] = useState({
    commenter_name: '',
    comment: '',
    citations_count: 0,
    has_identifying_info: false,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchAll = async () => {
      setLoading(true);
      setMessage('');
      try {
        const aRes = await axios.get(`${BACKEND}/article?id=${encodeURIComponent(id)}`);
        setArticle(aRes.data);

        const cRes = await axios.get(`${BACKEND}/articles/${encodeURIComponent(id)}/comments`);
        let cData = [];
        if (Array.isArray(cRes.data)) cData = cRes.data;
        else if (Array.isArray(cRes.data.comments)) cData = cRes.data.comments;
        else if (Array.isArray(cRes.data.data)) cData = cRes.data.data;
        setComments(cData || []);
      } catch (err) {
        console.error('Error fetching article/comments:', err);
        setMessage('Error loading article or comments.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!id) return setMessage('No article selected');
    if (!form.comment || form.comment.trim().length < 3)
      return setMessage('Comment is too short.');

    setCommenting(true);
    try {
      const payload = {
        article_id: id,
        commenter_name: form.commenter_name || 'Anonymous',
        comment: form.comment,
        citations_count: Number(form.citations_count) || 0,
        has_identifying_info: !!form.has_identifying_info,
      };

      const res = await axios.post(`${BACKEND}/add-comment`, payload);

      if (res.data && res.data.success) {
        const newComment = res.data.comment;
        if (!newComment.created_at) newComment.created_at = new Date().toISOString();
        setComments((prev) => [...prev, newComment]);

        if (typeof res.data.points === 'number') {
          setArticle((prev) => ({
            ...prev,
            points: Number((prev?.points || 0) + res.data.points).toFixed(2),
          }));
        }
        setForm({ commenter_name: '', comment: '', citations_count: 0, has_identifying_info: false });
        setMessage('Comment posted.');
      } else {
        console.warn('Add-comment returned unexpected response:', res.data);
        setMessage('Failed to post comment.');
      }
    } catch (err) {
      console.error('Error posting comment:', err.response?.data || err);
      setMessage('Error posting comment. See console.');
    } finally {
      setCommenting(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!article) return <div style={{ padding: 20 }}>Article not found.</div>;

  // ✅ Build a full public URL for the stored file
  const publicUrl = article.file_url ? `${SUPABASE_PUBLIC_URL}/${article.file_url}` : null;
  const isPDF = article.file_url?.toLowerCase().endsWith('.pdf');
  const isWord =
    article.file_url?.toLowerCase().endsWith('.docx') ||
    article.file_url?.toLowerCase().endsWith('.doc');

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>{article.title}</h1>

      {article.points !== undefined && (
        <div style={{ marginBottom: 12 }}>
          <strong>Points:</strong> {article.points}
        </div>
      )}

      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, marginBottom: 24 }}>
        {article.content}
      </div>

      {publicUrl && (
        <div style={{ marginBottom: 24 }}>
          <h3>Article File</h3>

          {isPDF && (
            <iframe
              src={publicUrl}
              width="100%"
              height="800"
              style={{ border: 'none' }}
              title="Article PDF"
            />
          )}

          <div style={{ marginTop: 16 }}>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              Open Document
            </a>
          </div>
        </div>
      )}

      <hr style={{ margin: '24px 0' }} />

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Post a comment</h2>

        <form onSubmit={handleSubmitComment} style={{ display: 'grid', gap: 8 }}>
          <input
            placeholder="Your name (optional)"
            value={form.commenter_name}
            onChange={(e) => handleChange('commenter_name', e.target.value)}
            style={{ padding: 8 }}
          />
          <textarea
            placeholder="Your comment"
            value={form.comment}
            onChange={(e) => handleChange('comment', e.target.value)}
            rows={4}
            style={{ padding: 8 }}
          />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label>
              Citations:
              <input
                type="number"
                min="0"
                value={form.citations_count}
                onChange={(e) => handleChange('citations_count', e.target.value)}
                style={{ width: 80, marginLeft: 8 }}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={form.has_identifying_info}
                onChange={(e) => handleChange('has_identifying_info', e.target.checked)}
              />
              I include identifying info
            </label>
            <div style={{ marginLeft: 'auto' }}>
              <button type="submit" disabled={commenting}>
                {commenting ? 'Posting…' : 'Post comment'}
              </button>
            </div>
          </div>
        </form>

        {message && <p style={{ marginTop: 8 }}>{message}</p>}
      </section>

      <section>
        <h2>Comments ({comments.length})</h2>
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {comments.map((c) => {
              const body = c.comment ?? c.content ?? c.text ?? '';
              const commenter = c.commenter_name ?? c.commenter ?? 'Anonymous';
              const createdAt = c.created_at ?? c.createdAt ?? null;
              const createdDisplay = createdAt ? new Date(createdAt).toLocaleString() : '';
              const citations = c.citations_count ?? c.citations ?? 0;
              const points = c.points ?? 0;

              return (
                <div
                  key={c.id ?? `${createdAt}-${Math.random()}`}
                  style={{ border: '1px solid #e6e6e6', padding: 12, borderRadius: 8 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <strong>{commenter}</strong>
                    <small style={{ color: '#666' }}>{createdDisplay}</small>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>{body}</div>
                  <div style={{ fontSize: '0.9rem', color: '#333' }}>
                    Citations: {citations} — Points: {Number(points).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
