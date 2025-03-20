'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCode, FaSpinner, FaSearch, FaRocket, FaBug, FaLightbulb, FaBrain, FaTerminal } from 'react-icons/fa';
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
  const [selectedModel, setSelectedModel] = useState<string>('codegemma:7b');

  const models = [
    { id: 'codegemma:7b', name: 'CodeGemma 7B' },
    { id: 'llama3:latest', name: 'llama3:latest' },
    { id: 'gemma:latest', name: 'gemma:latest' },
    { id: 'mistral:7b', name: 'Mistral 7B' },
  ];

  const handleCodeAnalysis = async () => {
    if (!code.trim()) {
      toast.error('Please enter code to analyze');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      let endpoint = '';
      let requestData: any = { code, language, model: selectedModel };

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
    <div className="flex flex-col min-h-screen  bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 text-white">
      {/* Fixed top navigation bar */}
      <div className="fixed top-0 left-0 w-full z-10 bg-gray-900 bg-opacity-90 backdrop-blur-md border-b border-indigo-900 shadow-lg h-[120px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between pt-[70px]">
          <div className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center justify-center shadow-lg">
              <FaCode className="text-gray-900" />
            </div>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              NEXUS HIVE
            </span>
          </div>
          {/* Removed the model selector from here */}
        </div>
      </div>

      {/* Main content area - with increased padding to avoid fixed header */}
      <div className="flex-1 pt-35 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto w-full">
        {/* Title header - now positioned below the fixed navbar */}
        <div className="py-4 mb-6 border-b border-gray-700 animate-fadeIn">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
            Code Assistant
          </h1>
          <p className="text-gray-300 mt-1">Analyze, optimize, and debug your code with advanced AI models</p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel - Code Input */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Language selection and model selection - now side by side */}
            <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4 border border-gray-700 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:border-indigo-700">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Language selector */}
                <div className="flex items-center space-x-1 bg-gray-700 bg-opacity-70 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-gray-600">
                  <FaTerminal className="text-cyan-400" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent focus:outline-none text-white"
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang} value={lang} className="bg-gray-700 text-white">
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Model selector - moved here */}
                <div className="flex items-center space-x-2 bg-gray-700 bg-opacity-70 rounded-lg mx-10 px-3 py-2 transition-all duration-300 hover:bg-gray-600">
                  <FaBrain className="text-indigo-400" />
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-transparent focus:outline-none text-white"
                  >
                    {models.map((model) => (
                      <option key={model.id} value={model.id} className="bg-gray-700 text-white">
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAnalysisType('analyze')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                    analysisType === 'analyze'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transform scale-105'
                      : 'bg-gray-700 bg-opacity-70 text-gray-300 hover:bg-gray-600 hover:scale-105'
                  }`}
                >
                  <FaSearch size={14} />
                  Analyze
                </button>
                <button
                  onClick={() => setAnalysisType('optimize')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                    analysisType === 'optimize'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transform scale-105'
                      : 'bg-gray-700 bg-opacity-70 text-gray-300 hover:bg-gray-600 hover:scale-105'
                  }`}
                >
                  <FaRocket size={14} />
                  Optimize
                </button>
                <button
                  onClick={() => setAnalysisType('debug')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ${
                    analysisType === 'debug'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transform scale-105'
                      : 'bg-gray-700 bg-opacity-70 text-gray-300 hover:bg-gray-600 hover:scale-105'
                  }`}
                >
                  <FaBug size={14} />
                  Debug
                </button>
              </div>
            </div>

            {/* Code input */}
            <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 shadow-lg flex flex-col flex-1 transition-all duration-300 hover:shadow-xl hover:border-indigo-700">
              <div className="p-4 border-b border-gray-700">
                <h2 className="font-medium flex items-center">
                  <FaCode className="mr-2 text-cyan-400" />
                  Code Input
                </h2>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`Enter your ${language} code here...`}
                className="flex-1 p-4 bg-gray-900 bg-opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white font-mono resize-none min-h-96 transition-all duration-300"
              />
            </div>

            {/* Conditional inputs based on analysis type */}
            {analysisType === 'optimize' && (
              <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4 border border-gray-700 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:border-indigo-700 animate-fadeIn">
                <label className="text-sm text-gray-300 mb-2 block">Optimization Goal</label>
                <input
                  type="text"
                  value={optimizationGoal}
                  onChange={(e) => setOptimizationGoal(e.target.value)}
                  placeholder="e.g., performance, readability, memory usage"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-900 bg-opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white transition-all duration-300 hover:border-indigo-500"
                />
              </div>
            )}

            {analysisType === 'debug' && (
              <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4 border border-gray-700 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:border-indigo-700 animate-fadeIn">
                <label className="text-sm text-gray-300 mb-2 block">Error Message (optional)</label>
                <input
                  type="text"
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  placeholder="Paste error message here"
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-900 bg-opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-white transition-all duration-300 hover:border-indigo-500"
                />
              </div>
            )}

            {/* Action button */}
            <button
              onClick={handleCodeAnalysis}
              disabled={loading || !code.trim()}
              className={`p-4 rounded-lg transition-all duration-300 flex items-center gap-2 justify-center ${
                loading || !code.trim() 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
              }`}
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

          {/* Right panel - Results */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 shadow-lg flex flex-col flex-1 transition-all duration-300 hover:shadow-xl hover:border-indigo-700">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h2 className="font-medium flex items-center">
                  <FaLightbulb className="mr-2 text-yellow-400" />
                  AI Insights
                </h2>
                <div className="text-sm text-gray-400">
                  {result && `Using ${selectedModel}`}
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-4 min-h-96">
                {result ? (
                  <div className="prose prose-invert max-w-none animate-fadeIn">
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={tomorrow}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-lg border border-gray-700 my-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-indigo-600"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={`${className} bg-gray-900 px-1 py-0.5 rounded text-sm`} {...props}>
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
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center opacity-50 transition-all duration-500 hover:scale-110 hover:opacity-70">
                      {
                        {
                          'analyze': <FaSearch size={32} />,
                          'optimize': <FaRocket size={32} />,
                          'debug': <FaBug size={32} />
                        }[analysisType]
                      }
                    </div>

                    <div className="text-center">
                      <p className="text-xl mb-2">Ready to {analysisType} your code</p>
                      <p className="text-gray-500">Enter your code and click the button to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

