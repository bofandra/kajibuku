import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import ThinkBlock from './components/ThinkBlock.tsx';

function renderAnswer(answer: string) {
  const parts = answer.split(/<\/?think>/g);
  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <ThinkBlock key={idx}>{part}</ThinkBlock>
    ) : (
      <span key={idx}>{part}</span>
    )
  );
}

export default function PDFChat() {
    const [pdfs, setPdfs] = useState({});
    const [selectedIds, setSelectedIds] = useState([]);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const placeholder = '[[THINK_BLOCK]]';
    const rawParts = answer.split(/<\/?think>/g);

    const processed = rawParts
    .map((part, idx) => (idx % 2 === 1 ? `${placeholder}${part}${placeholder}` : part))
    .join('');

    const blocks = processed.split(placeholder);


  const API = process.env.REACT_APP_API_BASE || '';

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const res = await axios.get(`${API}/documents`);
    setPdfs(res.data);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    await axios.post(`${API}/upload`, formData);
    setUploading(false);
    fetchDocuments();
  };

  const handleAsk = async () => {
    setAnswer('');
    const res = await axios.post(`${API}/ask`, {
      question,
      pdf_ids: selectedIds,
    });
    setAnswer(res.data.answer);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">PDF Chat Interface</h1>

      <div className="flex items-center space-x-2">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border border-gray-300 rounded-xl px-3 py-2"
        />
        <button
          onClick={handleFileUpload}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(pdfs).map(([id, meta]) => (
          <div key={id} className="border rounded shadow p-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(id)}
                onChange={() => {
                  setSelectedIds((prev) =>
                    prev.includes(id)
                      ? prev.filter((x) => x !== id)
                      : [...prev, id]
                  );
                }}
              />
              <span>{meta.title}</span>
            </label>
          </div>
        ))}
      </div>

      <textarea
        rows={3}
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="border border-gray-300 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
      />
      <button
        onClick={handleAsk}
        disabled={!question || selectedIds.length === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 disabled:opacity-50"
      >
        Ask
      </button>

      {blocks.map((block, i) =>
        i % 2 === 1 ? (
            <ThinkBlock key={i}>{block}</ThinkBlock>
        ) : (
            <ReactMarkdown key={i}>{block}</ReactMarkdown>
        )
        )}

    </div>
  );
}
