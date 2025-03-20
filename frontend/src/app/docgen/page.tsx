'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCode, FaClipboard, FaDownload, FaSpinner, FaRobot, FaTerminal, FaFileAlt } from 'react-icons/fa';
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
        // Add two additional models to the list returned from the API
        const modelsFromApi = response.data.models || [];
        const enhancedModels = [
          ...modelsFromApi,
          { name: 'llama3:latest', description: "Llama 3 Code Model" },
          { name: 'mistral:7b', description: "mistral:7b" }
        ];
        setAvailableModels(enhancedModels);
        
        // Set default model if codegemma is available
        const codeGemma = enhancedModels.find(m => m.name.toLowerCase() === 'codegemma');
        if (codeGemma) {
          setModel(codeGemma.name);
        } else if (enhancedModels.length > 0) {
          setModel(enhancedModels[0].name);
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
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 p-15 ">
      <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-xl p-6 shadow-2xl mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg">
            <FaRobot className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              NEXUS HIVE
            </h1>
            <p className="text-gray-300 font-medium">
              Advanced Code Documentation Generator
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <FaTerminal className="text-cyan-400 text-lg" />
            <h2 className="text-xl font-semibold text-white">Source Code</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Programming Language
                </label>
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200 appearance-none"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Engine
                </label>
                <div className="relative">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200 appearance-none"
                  >
                    {availableModels.map((m) => (
                      <option key={m.name} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute top-3 right-3 bg-gray-800/80 px-2 py-1 rounded text-xs text-gray-400 font-mono">
                {language}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="w-full h-96 p-4 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200 font-mono text-sm resize-none"
              />
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FaCode />
                  <span>Generate Documentation</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-xl p-6 shadow-2xl flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FaFileAlt className="text-cyan-400 text-lg" />
              <h2 className="text-xl font-semibold text-white">Documentation</h2>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCopyToClipboard}
                disabled={!documentation}
                className="p-2 text-gray-400 hover:text-cyan-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                title="Copy to clipboard"
              >
                <FaClipboard />
              </button>
              <button
                onClick={handleDownload}
                disabled={!documentation}
                className="p-2 text-gray-400 hover:text-cyan-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                title="Download markdown"
              >
                <FaDownload />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto bg-gray-800/80 rounded-lg p-4 border border-gray-700 shadow-inner">
            {documentation ? (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{documentation}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <FaFileAlt className="text-gray-500 text-2xl" />
                </div>
                <p className="text-center">Enter your code and generate documentation to see results here</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center text-gray-400 text-sm">
        <p>Powered by NEXUS HIVE AI Engine &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}