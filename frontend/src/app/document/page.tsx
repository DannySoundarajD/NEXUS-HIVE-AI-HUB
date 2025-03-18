'use client';

import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FaFileAlt, FaUpload, FaSearch, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function DocumentAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload a PDF or TXT file.');
      return;
    }

    setFile(selectedFile);
  };

  // Upload document
  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file to upload');

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/document/upload`,
        formData
      );

      setDocumentId(response.data.documentId);
      setFilename(file.name);
      toast.success('Document uploaded successfully');

      // Automatically analyze document after upload
      await handleAnalyze(response.data.documentId);
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  // Analyze document
  const handleAnalyze = async (docId?: string) => {
    const docToAnalyze = docId || documentId;
    if (!docToAnalyze) return toast.error('No document available to analyze');

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/document/analyze`,
        { documentId: docToAnalyze }
      );

      setAnalysis(response.data.analysis);
      toast.success('Document analysis completed');
    } catch (error) {
      toast.error('Failed to analyze document');
    } finally {
      setLoading(false);
    }
  };

  // Ask a question
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentId) return toast.error('Upload a document first');
    if (!question.trim()) return toast.error('Enter a question');

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/document/question`,
        { documentId, question }
      );

      setAnswer(response.data.answer);
    } catch (error) {
      toast.error('Failed to get an answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 p-4 shadow-md mb-4 rounded-lg">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FaFileAlt className="text-blue-500" />
          Document Analyzer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload and analyze documents, then ask questions about them.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Upload Document</h2>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                accept=".pdf,.txt"
                disabled={loading}
              />
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 flex items-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                Upload
              </button>
            </div>

            {documentId && filename && (
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="font-semibold">Current Document:</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{filename}</p>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Ask a Question</h2>
            <form onSubmit={handleAskQuestion} className="flex flex-col gap-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about the document..."
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !documentId}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 flex items-center gap-2 justify-center"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                Ask Question
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-4">Results</h2>
          <div className="flex-1 overflow-auto">
            {analysis && (
              <div className="mb-6">
                <h3 className="font-semibold text-blue-500 mb-2">Document Analysis:</h3>
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            )}

            {answer && (
              <div>
                <h3 className="font-semibold text-green-500 mb-2">Answer:</h3>
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            )}

            {!analysis && !answer && (
              <div className="flex items-center justify-center h-full text-gray-500">
                Upload a document and analyze it or ask questions to see results here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}