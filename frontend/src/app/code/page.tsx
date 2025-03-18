// app/code/page.tsx
'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaCode, FaSpinner, FaSearch, FaRocket, FaBug } from 'react-icons/fa';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

type AnalysisType = 'analyze' | 'optimize' | 'debug';

export default function CodeAssistant() {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [result, setResult] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('analyze');
  const [loading, setLoading] = useState<boolean>(false);
  const [optimizationGoal, setOptimizationGoal] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleCodeAnalysis = async () => {
    if (!code.trim()) {
      toast.error('Please enter code to analyze');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      let endpoint = '';
      let requestData: any = { code, language };

      switch (analysisType) {
        case 'analyze':
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/code/analyze`;
          break;
        case 'optimize':
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/code/optimize`;
          requestData.optimizationGoal = optimizationGoal;
          break;
        case 'debug':
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/code/debug`;
          requestData.error = errorMessage;
          break;
      }

      const response = await axios.post(endpoint, requestData);
      
      const resultKey = {
        'analyze': 'analysis',
        'optimize': 'optimization',
        'debug': 'debugging'
      }[analysisType];
      
      setResult(response.data[resultKey]);
    } catch (error) {
      console.error(`Error ${analysisType}ing code:`, error);
      toast.error(`Failed to ${analysisType} code`);
    } finally {
      setLoading(false);
    }
  };

  const languageOptions = [
    'javascript', 'typescript', 'python', 'java', 'c', 'c++', 'c#',
    'go', 'ruby', 'php', 'swift', 'kotlin', 'rust', 'html', 'css', 'sql'
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 p-4 shadow-md mb-4 rounded-lg">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FaCode className="text-blue-500" />
          Code Assistant
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze, optimize, and debug your code with AI assistance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {languageOptions.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>

            <div className="flex-1" />

            <div className="flex gap-2">
              <button
                onClick={() => setAnalysisType('analyze')}
                className={`p-2 rounded-lg flex items-center gap-1 ${
                  analysisType === 'analyze'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <FaSearch size={14} />
                Analyze
              </button>
              <button
                onClick={() => setAnalysisType('optimize')}
                className={`p-2 rounded-lg flex items-center gap-1 ${
                  analysisType === 'optimize'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <FaRocket size={14} />
                Optimize
              </button>
              <button
                onClick={() => setAnalysisType('debug')}
                className={`p-2 rounded-lg flex items-center gap-1 ${
                  analysisType === 'debug'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <FaBug size={14} />
                Debug
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Enter your ${language} code here...`}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono resize-none mb-4"
          />

          {analysisType === 'optimize' && (
            <input
              type="text"
              value={optimizationGoal}
              onChange={(e) => setOptimizationGoal(e.target.value)}
              placeholder="Optimization goal (e.g., performance, readability, memory usage)"
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
            />
          )}

          {analysisType === 'debug' && (
            <input
              type="text"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="Error message (optional)"
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
            />
          )}

          <button
            onClick={handleCodeAnalysis}
            disabled={loading || !code.trim()}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 flex items-center gap-2 justify-center"
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              {
                'analyze': <FaSearch />,
                'optimize': <FaRocket />,
                'debug': <FaBug />
              }[analysisType]
            )}
            {loading
              ? 'Processing...'
              : `${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} Code`}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md overflow-auto">
          <h2 className="text-lg font-semibold mb-4">Results</h2>
          {result ? (
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Enter code and click {
                analysisType.charAt(0).toUpperCase() + analysisType.slice(1)
              } to see results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}