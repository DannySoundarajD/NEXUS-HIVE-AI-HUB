'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaLink, FaSearch, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function WebpageSummarizer() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/webpage/summarize`,
        { url }
      );
      setSummary(response.data.summary || 'No summary available.');
      toast.success('Webpage summarized successfully');
    } catch (error) {
      console.error('Error summarizing webpage:', error);
      toast.error('Failed to summarize webpage');
      setSummary('Error fetching summary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 p-4 shadow-md mb-4 rounded-lg">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FaLink className="text-blue-500" />
          Webpage Summarizer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter a webpage URL to generate a concise summary.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Enter Webpage URL</h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter webpage URL..."
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 flex items-center gap-2 justify-center"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              Summarize Webpage
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="flex-1 overflow-auto">
            {summary ? (
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Enter a webpage URL and summarize it to see results here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
