'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCode, FaClipboard, FaDownload, FaSpinner, FaFlask, FaMagic, FaRobot, FaTerminal, FaFileAlt } from 'react-icons/fa';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Language = {
  value: string;
  label: string;
};

type Model = {
  name: string;
};

type Tab = 'code' | 'tests' | 'improve';

export default function NlpToCodeGenerator() {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [model, setModel] = useState('codegemma:latest');
  const [generatedCode, setGeneratedCode] = useState('');
  const [testCode, setTestCode] = useState('');
  const [requirements, setRequirements] = useState('');
  const [improvedCode, setImprovedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('code');

  // Language options
  const languages: Language[] = [
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
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/nlptocode/models`);
        if (response.data.success && response.data.models) {
          setAvailableModels(response.data.models);
          
          // Set default model if codegemma is available
          const codeGemma = response.data.models.find((m: Model) => 
            m.name.toLowerCase().includes('codegemma'));
          
          if (codeGemma) {
            setModel(codeGemma.name);
          } else if (response.data.models.length > 0) {
            setModel(response.data.models[0].name);
          }
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        toast.error('Failed to fetch available AI models');
      }
    };
    
    fetchModels();
  }, []);

  const handleGenerateCode = async () => {
    if (!description.trim()) {
      toast.error('Please enter a description of what code you want to generate');
      return;
    }
    
    setLoading(true);
    setGeneratedCode('');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/nlptocode/generate`,
        { description, language, model }
      );
      
      if (response.data.success && response.data.code) {
        setGeneratedCode(response.data.code);
        toast.success('Code generated successfully');
      } else {
        toast.error('Failed to generate code');
      }
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error('Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTests = async () => {
    if (!generatedCode.trim()) {
      toast.error('Please generate code first before generating tests');
      return;
    }
    
    setLoading(true);
    setTestCode('');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/nlptocode/tests`,
        { code: generatedCode, language, model }
      );
      
      if (response.data.success && response.data.testCode) {
        setTestCode(response.data.testCode);
        toast.success('Test cases generated successfully');
      } else {
        toast.error('Failed to generate test cases');
      }
    } catch (error) {
      console.error('Error generating tests:', error);
      toast.error('Failed to generate test cases');
    } finally {
      setLoading(false);
    }
  };

  const handleImproveCode = async () => {
    if (!generatedCode.trim()) {
      toast.error('Please generate code first before requesting improvements');
      return;
    }
    
    if (!requirements.trim()) {
      toast.error('Please specify improvement requirements');
      return;
    }
    
    setLoading(true);
    setImprovedCode('');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/nlptocode/improve`,
        { 
          code: generatedCode, 
          language, 
          requirements, 
          model 
        }
      );
      
      if (response.data.success && response.data.improvedCode) {
        setImprovedCode(response.data.improvedCode);
        toast.success('Code improved successfully');
      } else {
        toast.error('Failed to improve code');
      }
    } catch (error) {
      console.error('Error improving code:', error);
      toast.error('Failed to improve code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleDownload = (text: string, fileType: string) => {
    if (!text) return;
    
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    
    // Determine file extension based on language
    let extension = '.js';
    switch (language) {
      case 'python': extension = '.py'; break;
      case 'java': extension = '.java'; break;
      case 'cpp': extension = '.cpp'; break;
      case 'csharp': extension = '.cs'; break;
      case 'go': extension = '.go'; break;
      case 'rust': extension = '.rs'; break;
      case 'php': extension = '.php'; break;
      case 'ruby': extension = '.rb'; break;
      case 'typescript': extension = '.ts'; break;
    }
    
    element.download = `${fileType}${extension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded ${fileType} file`);
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 p-6">
      <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-xl p-6 mt-13 shadow-2xl mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-lg">
            <FaRobot className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              NLP to Code Generator
            </h1>
            <p className="text-gray-300 font-medium">
              Generate code from natural language descriptions using the CodeGemma AI model
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <FaTerminal className="text-cyan-400 text-lg" />
            <h2 className="text-xl font-semibold text-white">Describe Your Code</h2>
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
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the code you want to generate in natural language..."
                className="w-full h-64 p-4 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200 font-mono text-sm resize-none"
              />
            </div>
            
            <button
              onClick={handleGenerateCode}
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
                  <span>Generate Code</span>
                </>
              )}
            </button>
            
            {activeTab === 'improve' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Improvement Requirements
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Describe how you want to improve the code (e.g., optimize for performance, add better error handling)..."
                  className="w-full h-32 p-4 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200 font-mono text-sm resize-none"
                />
                <button
                  onClick={handleImproveCode}
                  disabled={loading || !generatedCode}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white p-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaMagic />}
                  Improve Code
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-xl p-6 shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'code'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FaCode />
                <span>Generated Code</span>
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'tests'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FaFlask />
                <span>Test Cases</span>
              </button>
              <button
                onClick={() => setActiveTab('improve')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'improve'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FaMagic />
                <span>Improved Code</span>
              </button>
            </div>
            
            <div className="flex gap-2">
              {activeTab === 'code' && generatedCode && (
                <>
                  <button
                    onClick={() => handleCopyToClipboard(generatedCode)}
                    className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-gray-800"
                    title="Copy to clipboard"
                  >
                    <FaClipboard />
                  </button>
                  <button
                    onClick={() => handleDownload(generatedCode, 'generated-code')}
                    className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-gray-800"
                    title="Download code"
                  >
                    <FaDownload />
                  </button>
                </>
              )}
              {activeTab === 'tests' && testCode && (
                <>
                  <button
                    onClick={() => handleCopyToClipboard(testCode)}
                    className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-gray-800"
                    title="Copy to clipboard"
                  >
                    <FaClipboard />
                  </button>
                  <button
                    onClick={() => handleDownload(testCode, 'test-code')}
                    className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-gray-800"
                    title="Download test code"
                  >
                    <FaDownload />
                  </button>
                </>
              )}
              {activeTab === 'improve' && improvedCode && (
                <>
                  <button
                    onClick={() => handleCopyToClipboard(improvedCode)}
                    className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-gray-800"
                    title="Copy to clipboard"
                  >
                    <FaClipboard />
                  </button>
                  <button
                    onClick={() => handleDownload(improvedCode, 'improved-code')}
                    className="p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-gray-800"
                    title="Download improved code"
                  >
                    <FaDownload />
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto bg-gray-800/80 rounded-lg border border-gray-700 shadow-inner">
            {activeTab === 'code' && (
              <>
                {generatedCode ? (
                  <SyntaxHighlighter 
                    language={language} 
                    style={vscDarkPlus}
                    className="rounded-lg h-full"
                  >
                    {generatedCode}
                  </SyntaxHighlighter>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 p-6">
                    <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center">
                      <FaCode className="text-gray-500 text-2xl" />
                    </div>
                    <p className="text-center">Enter a description and generate code to see results here</p>
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'tests' && (
              <>
                {testCode ? (
                  <SyntaxHighlighter 
                    language={language} 
                    style={vscDarkPlus}
                    className="rounded-lg h-full"
                  >
                    {testCode}
                  </SyntaxHighlighter>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 p-6">
                    <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center">
                      <FaFlask className="text-gray-500 text-2xl" />
                    </div>
                    <p className="text-center">No test cases generated yet</p>
                    <button
                      onClick={handleGenerateTests}
                      disabled={loading || !generatedCode}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <FaSpinner className="animate-spin" /> : <FaFlask />}
                      Generate Test Cases
                    </button>
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'improve' && (
              <>
                {improvedCode ? (
                  <SyntaxHighlighter 
                    language={language} 
                    style={vscDarkPlus}
                    className="rounded-lg h-full"
                  >
                    {improvedCode}
                  </SyntaxHighlighter>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 p-6">
                    <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center">
                      <FaMagic className="text-gray-500 text-2xl" />
                    </div>
                    <p className="text-center">
                      {generatedCode 
                        ? "Enter improvement requirements and click 'Improve Code'" 
                        : "Generate code first before requesting improvements"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center text-gray-400 text-sm">
        <p>Powered by CodeGemma AI &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}