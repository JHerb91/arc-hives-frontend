// pages/article.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const BACKEND = 'https://arc-hives-backend.onrender.com';

// your Supabase project ref (no protocol)
const SUPABASE_PROJECT_ID = 'ebghnxurosvklsdoryfg';
const SUPABASE_PUBLIC_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public`;

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
    citations: '',
    has_identifying_info: false,
    spend_direction: 'up',
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
        console.log('Article from backend:', aRes.data);


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

  // Calculate points based on comment content
  const calculatePoints = () => {
    const commentLength = form.comment.length || 0;
    const citationsArray = form.citations ? form.citations.split('\n').filter(c => c.trim()) : [];
    const citationsCount = citationsArray.length;
    const identifying = form.has_identifying_info ? 5 : 0;
    
    return Number(((commentLength / 100) + (citationsCount * 2) + identifying).toFixed(2));
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!id) return setMessage('No article selected');
    if (!form.comment || form.comment.trim().length < 3)
      return setMessage('Comment is too short.');

    setCommenting(true);
    try {
      const citationsArray = form.citations ? form.citations.split('\n').filter(c => c.trim()) : [];
      const calculatedPoints = calculatePoints();
      
      const payload = {
        article_id: id,
        commenter_name: form.commenter_name || 'Anonymous',
        comment: form.comment,
        citations: citationsArray,
        has_identifying_info: !!form.has_identifying_info,
        spend_points: calculatedPoints,
        spend_direction: form.spend_direction,
      };

      const res = await axios.post(`${BACKEND}/add-comment`, payload);

      if (res.data && res.data.success) {
        const newComment = res.data.comment;
        if (!newComment.created_at) newComment.created_at = new Date().toISOString();
        setComments((prev) => [...prev, newComment]);

        if (typeof res.data.points === 'number') {
          setArticle((prev) => ({
            ...prev,
            points: Number(
              (Number(prev?.points || 0)) + Number(res.data.points || 0) + Number(res.data.spend_applied || 0)
            ).toFixed(2),
          }));
        }
        setForm({
          commenter_name: '',
          comment: '',
          citations: '',
          has_identifying_info: false,
          spend_direction: 'up',
        });
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
const publicUrl = article.file_url
  ? article.file_url.startsWith('http')
    ? article.file_url
    : `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/articles/${encodeURIComponent(
        article.file_url.replace(/^articles\//, '')
      )}`
  : null;

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
          <div>
            <label>
              Citations (one per line, MLA or APA format):
              <textarea
                placeholder="Smith, John. 'Article Title.' Journal Name, vol. 1, no. 1, 2023, pp. 1-10.&#10;Doe, Jane. 'Another Source.' Book Title, Publisher, 2023."
                value={form.citations}
                onChange={(e) => handleChange('citations', e.target.value)}
                rows={3}
                style={{ width: '100%', padding: 8, marginTop: 4 }}
              />
            </label>
          </div>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={form.has_identifying_info}
                onChange={(e) => handleChange('has_identifying_info', e.target.checked)}
              />
              Include identifying info
            </label>
            <div style={{ marginLeft: 'auto' }}>
              <button type="submit" disabled={commenting}>
                {commenting ? 'Posting…' : 'Post comment'}
              </button>
            </div>
          </div>

          <fieldset style={{ marginTop: 12, padding: 12 }}>
            <legend>Rank adjustment (calculated from your comment)</legend>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <strong>Calculated Points: {calculatePoints()}</strong>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: 4 }}>
                  Based on: {form.comment.length} chars + {form.citations ? form.citations.split('\n').filter(c => c.trim()).length : 0} citations + {form.has_identifying_info ? '5' : '0'} identifying info
                </div>
              </div>
              <label>
                Direction
                <select
                  value={form.spend_direction}
                  onChange={(e) => handleChange('spend_direction', e.target.value)}
                  style={{ marginLeft: 8 }}
                >
                  <option value="up">Up (+{calculatePoints()})</option>
                  <option value="down">Down (-{calculatePoints()})</option>
                </select>
              </label>
            </div>
          </fieldset>
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
              const citationsArray = Array.isArray(c.citations) ? c.citations : [];
              const citationsCount = c.citations_count ?? citationsArray.length ?? 0;
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
                  
                  {citationsArray.length > 0 && (
                    <div style={{ marginBottom: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                      <strong>Citations:</strong>
                      <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                        {citationsArray.map((citation, idx) => (
                          <li key={idx} style={{ fontSize: '0.9rem', marginBottom: 2 }}>
                            {citation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div style={{ fontSize: '0.9rem', color: '#333' }}>
                    Citations: {citationsCount} — Points: {Number(points).toFixed(2)}
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
