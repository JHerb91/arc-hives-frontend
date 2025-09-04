import { useState } from 'react';
import axios from 'axios';

export default function TestComment() {
  const [response, setResponse] = useState('');

  const sendComment = async () => {
    try {
      const res = await axios.post('https://arc-hives-backend.onrender.com/add-comment', {
        article_id: 1,
        comment: 'This is a test comment.',
        citations_count: 1,
        has_identifying_info: true
      });
      setResponse(JSON.stringify(res.data));
    } catch (err) {
      setResponse('Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Test Comment</h1>
      <button onClick={sendComment}>Send Test Comment</button>
      <pre>{response}</pre>
    </div>
  );
}
