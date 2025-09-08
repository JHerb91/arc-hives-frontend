import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ArticlePage() {
  const router = useRouter();
  const { id } = router.query;

  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchArticleAndComments() {
      try {
        // Fetch article
        const articleRes = await fetch(
          `https://arc-hives-backend.onrender.com/article?id=${id}`
        );
        const articleData = await articleRes.json();

        // Fetch comments
        const commentsRes = await fetch(
          `https://arc-hives-backend.onrender.com/articles/${id}/comments`
        );
        const commentsData = await commentsRes.json();

        setArticle(articleData);
        setComments(commentsData);
      } catch (err) {
        console.error("Error fetching article:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchArticleAndComments();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!article) return <p>Article not found.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
      <p className="mb-8">{article.content}</p>

      <h2 className="text-xl font-semibold mb-2">Comments</h2>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li
              key={c.id}
              className="border rounded-lg p-3 shadow-sm bg-gray-50"
            >
              <p>{c.text}</p>
              <span className="text-xs text-gray-500">
                {new Date(c.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
