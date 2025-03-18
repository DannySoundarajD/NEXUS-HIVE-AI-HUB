'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCode, FaClipboard, FaDownload, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

export default function DocumentGenerator() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [model, setModel] = useState('codegemma');
  const [documentation, setDocumentation] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);

  // Language options
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
  ];

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/docgen/models`);
        setAvailableModels(response.data.models || []);
        
        // Set default model if codegemma is available
        const codeGemma = response.data.models.find(m => m.name.toLowerCase() === 'codegemma');
        if (codeGemma) {
          setModel(codeGemma.name);
        } else if (response.data.models.length > 0) {
          setModel(response.data.models[0].name);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        toast.error('Failed to fetch available AI models');
      }
    };
    
    fetchModels();
  }, []);

  const handleGenerate = async () => {
    if (!code.trim()) {
      toast.error('Please enter code to generate documentation');
      return;
    }
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/docgen/generate`,
        { code, language, model }
      );
      setDocumentation(response.data.documentation || 'No documentation available.');
      toast.success('Documentation generated successfully');
    } catch (error) {
      console.error('Error generating documentation:', error);
      toast.error('Failed to generate documentation');
      setDocumentation('Error generating documentation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!documentation) return;
    navigator.clipboard.writeText(documentation);
    toast.success('Documentation copied to clipboard');
  };

  const handleDownload = () => {
    if (!documentation) return;
    
    const element = document.createElement('a');
    const file = new Blob([documentation], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `documentation-${language}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 p-4 shadow-md mb-4 rounded-lg">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FaCode className="text-blue-500" />
          Code Documentation Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate comprehensive documentation for your code using the CodeGemma AI model.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Enter Your Code</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  AI Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {availableModels.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white h-145 font-mono"
            />
            
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 flex items-center gap-2 justify-center"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaCode />}
              Generate Documentation
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Documentation</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopyToClipboard}
                disabled={!documentation}
                className="p-2 text-gray-500 hover:text-blue-500 disabled:text-gray-300"
                title="Copy to clipboard"
              >
                <FaClipboard />
              </button>
              <button
                onClick={handleDownload}
                disabled={!documentation}
                className="p-2 text-gray-500 hover:text-blue-500 disabled:text-gray-300"
                title="Download markdown"
              >
                <FaDownload />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {documentation ? (
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{documentation}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Enter your code and generate documentation to see results here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}