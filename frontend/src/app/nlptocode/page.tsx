'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCode, FaClipboard, FaDownload, FaSpinner, FaFlask, FaMagic } from 'react-icons/fa';
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
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 p-4 shadow-md mb-4 rounded-lg">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FaCode className="text-blue-500" />
          NLP to Code Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate code from natural language descriptions using the CodeGemma AI model.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Describe Your Code</h2>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the code you want to generate in natural language..."
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white h-145"
            />
            
            <button
              onClick={handleGenerateCode}
              disabled={loading}
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 flex items-center gap-2 justify-center"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaCode />}
              Generate Code
            </button>
            
            {activeTab === 'improve' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Improvement Requirements
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Describe how you want to improve the code (e.g., optimize for performance, add better error handling)..."
                  className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white h-24 w-full"
                />
                <button
                  onClick={handleImproveCode}
                  disabled={loading || !generatedCode}
                  className="mt-2 bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400 flex items-center gap-2 justify-center w-full"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaMagic />}
                  Improve Code
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 rounded-t-lg ${
                  activeTab === 'code'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Generated Code
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`px-3 py-1 rounded-t-lg ${
                  activeTab === 'tests'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Test Cases
              </button>
              <button
                onClick={() => setActiveTab('improve')}
                className={`px-3 py-1 rounded-t-lg ${
                  activeTab === 'improve'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Improved Code
              </button>
            </div>
            <div className="flex gap-2">
              {activeTab === 'code' && generatedCode && (
                <>
                  <button
                    onClick={() => handleCopyToClipboard(generatedCode)}
                    className="p-2 text-gray-500 hover:text-blue-500"
                    title="Copy to clipboard"
                  >
                    <FaClipboard />
                  </button>
                  <button
                    onClick={() => handleDownload(generatedCode, 'generated-code')}
                    className="p-2 text-gray-500 hover:text-blue-500"
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
                    className="p-2 text-gray-500 hover:text-blue-500"
                    title="Copy to clipboard"
                  >
                    <FaClipboard />
                  </button>
                  <button
                    onClick={() => handleDownload(testCode, 'test-code')}
                    className="p-2 text-gray-500 hover:text-blue-500"
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
                    className="p-2 text-gray-500 hover:text-blue-500"
                    title="Copy to clipboard"
                  >
                    <FaClipboard />
                  </button>
                  <button
                    onClick={() => handleDownload(improvedCode, 'improved-code')}
                    className="p-2 text-gray-500 hover:text-blue-500"
                    title="Download improved code"
                  >
                    <FaDownload />
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
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
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Enter a description and generate code to see results here
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
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-gray-500 mb-4">No test cases generated yet</p>
                    <button
                      onClick={handleGenerateTests}
                      disabled={loading || !generatedCode}
                      className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 flex items-center gap-2"
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
                  <div className="flex items-center justify-center h-full text-gray-500">
                    {generatedCode ? 
                      "Enter improvement requirements and click 'Improve Code'" : 
                      "Generate code first before requesting improvements"}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}