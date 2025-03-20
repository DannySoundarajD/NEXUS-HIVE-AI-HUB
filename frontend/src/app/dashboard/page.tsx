"use client";

import React, { useEffect, useRef, useState } from 'react';
import { 
  Code2, 
  Code, 
  Terminal, 
  FileCode, 
  GitBranch, 
  GitPullRequest, 
  Zap, 
  Layers,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

const NexusHiveAbout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef([]);

  // AI tools available in Nexus Hive with full details
  const aiTools = [
    {
      id: 'code-generator',
      name: 'Code Generator',
      description: 'Transform natural language into production-ready code with our advanced AI. Save time and reduce development cycles by letting our AI understand your requirements and generate optimized, clean code across multiple languages and frameworks.',
      icon: <Code2 className="h-12 w-12 text-indigo-500" />,
      path: '/tools/code-generator',
      color: 'indigo'
    },
    {
      id: 'code-analyzer',
      name: 'Code Analyzer',
      description: 'Our AI-powered code analyzer deeply examines your codebase to identify bugs, security vulnerabilities, and performance bottlenecks. Get detailed reports with actionable insights to improve code quality and maintain best practices across your projects.',
      icon: <Code className="h-12 w-12 text-emerald-500" />,
      path: '/tools/code-analyzer',
      color: 'emerald'
    },
    {
      id: 'test-generator',
      name: 'Test Generator',
      description: 'Automatically generate comprehensive unit, integration, and end-to-end tests with our AI. Increase code coverage and catch edge cases you might miss, all while reducing the time spent writing boilerplate test code.',
      icon: <Terminal className="h-12 w-12 text-amber-500" />,
      path: '/tools/test-generator',
      color: 'amber'
    },
    {
      id: 'bug-fixer',
      name: 'Bug Fixer',
      description: 'Let our AI tackle your most frustrating bugs. Upload error logs or describe the issue, and watch as our system diagnoses the problem and suggests precise fixes. Reduce debugging time and get back to building features that matter.',
      icon: <Zap className="h-12 w-12 text-rose-500" />,
      path: '/tools/bug-fixer',
      color: 'rose'
    },
    {
      id: 'documentation',
      name: 'Documentation Generator',
      description: 'Transform your codebase into clear, comprehensive documentation automatically. Our AI analyzes your code structure, comments, and function signatures to create professional documentation with diagrams, examples, and API references.',
      icon: <FileCode className="h-12 w-12 text-blue-500" />,
      path: '/tools/documentation',
      color: 'blue'
    },
  ];

  // Simulation of loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Set up intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-id');
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [id]: true }));
          }
        });
      },
      { threshold: 0.3 }
    );

    // Register all section refs with the observer
    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  // 3D placeholder component
  const Tool3DPlaceholder = ({ color, name }) => {
    // Convert color name to hex code for more reliable styling
    const colorMap = {
      indigo: '#6366f1',
      emerald: '#10b981',
      amber: '#f59e0b',
      rose: '#f43f5e',
      blue: '#3b82f6'
    };
    
    const hexColor = colorMap[color] || colorMap.indigo;
    const lightColor = `${hexColor}33`; // Adding transparency for lighter version
    
    return (
      <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
        <svg 
          viewBox="0 0 400 300" 
          className="w-full h-full"
          style={{ background: `linear-gradient(135deg, ${lightColor}, transparent)` }}
        >
          {/* Base Platform */}
          <rect x="100" y="200" width="200" height="20" rx="2" fill={hexColor} opacity="0.7" />
          
          {/* Main 3D Object - varies based on tool type */}
          {name === 'Code Generator' && (
            <>
              <polygon points="200,80 120,180 280,180" fill={hexColor} opacity="0.9" />
              <polygon points="200,80 120,180 200,180" fill={hexColor} opacity="0.6" />
              <line x1="200" y1="80" x2="200" y2="180" stroke="white" strokeWidth="2" opacity="0.5" />
              <line x1="200" y1="180" x2="120" y2="180" stroke="white" strokeWidth="2" opacity="0.5" />
              <line x1="200" y1="180" x2="280" y2="180" stroke="white" strokeWidth="2" opacity="0.5" />
            </>
          )}
          
          {name === 'Code Analyzer' && (
            <>
              <rect x="150" y="100" width="100" height="100" fill={hexColor} opacity="0.7" />
              <circle cx="200" cy="150" r="40" fill={hexColor} opacity="0.9" />
              <path d="M180,140 L220,160 M180,160 L220,140" stroke="white" strokeWidth="3" opacity="0.8" />
            </>
          )}
          
          {name === 'Test Generator' && (
            <>
              <circle cx="200" cy="150" r="60" fill={hexColor} opacity="0.5" />
              <circle cx="200" cy="150" r="40" fill={hexColor} opacity="0.7" />
              <circle cx="200" cy="150" r="20" fill={hexColor} opacity="0.9" />
              <path d="M200,90 L200,210" stroke="white" strokeWidth="2" opacity="0.5" />
              <path d="M140,150 L260,150" stroke="white" strokeWidth="2" opacity="0.5" />
            </>
          )}
          
          {name === 'Bug Fixer' && (
            <>
              <path d="M200,100 L240,150 L200,200 L160,150 Z" fill={hexColor} opacity="0.7" />
              <path d="M190,130 L210,130 L210,170 L190,170 Z" fill="white" opacity="0.8" />
              <circle cx="200" cy="130" r="5" fill="white" />
            </>
          )}
          
          {name === 'Documentation Generator' && (
            <>
              <rect x="150" y="110" width="100" height="80" fill={hexColor} opacity="0.8" />
              <line x1="165" y1="130" x2="235" y2="130" stroke="white" strokeWidth="2" />
              <line x1="165" y1="150" x2="235" y2="150" stroke="white" strokeWidth="2" />
              <line x1="165" y1="170" x2="235" y2="170" stroke="white" strokeWidth="2" />
            </>
          )}
          
          {/* Animated elements */}
          <circle cx="200" cy="100" r="5" fill="white" opacity="0.8">
            <animate attributeName="cy" values="100;110;100" dur="2s" repeatCount="indefinite" />
          </circle>
          
          <text x="200" y="230" textAnchor="middle" fill="#666" fontSize="12">Click to interact</text>
          <text x="200" y="250" textAnchor="middle" fill="#999" fontSize="10">(3D model will load here)</text>
          
          {/* Orbiting particle effect */}
          <circle cx="200" cy="150" r="3" fill="white">
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              from="0 200 150" 
              to="360 200 150" 
              dur="4s" 
              repeatCount="indefinite" 
            />
          </circle>
          
          <circle cx="200" cy="150" r="2" fill="white">
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              from="180 200 150" 
              to="540 200 150" 
              dur="3s" 
              repeatCount="indefinite" 
            />
          </circle>
        </svg>
        
        {/* Interactive overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-20">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white">3D Model Loading Zone</p>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">Loading Nexus Hive...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-16 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in">Nexus Hive</h1>
        <h2 className="text-3xl md:text-4xl font-semibold text-indigo-600 dark:text-indigo-400 mb-8 animate-fade-in-delay">AI Development Hub</h2>
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mb-12 animate-fade-in-delay-2">
          A comprehensive suite of AI-powered tools designed to revolutionize your development workflow. 
          From code generation to architecture design, Nexus Hive empowers developers to build better software, faster.
        </p>
        <div className="animate-bounce mt-16">
          <ChevronDown className="h-10 w-10 text-indigo-500" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Scroll to explore our tools</p>
        </div>
      </section>

      {/* Project Sections */}
      <div>
        {aiTools.map((tool, index) => (
          <section 
            key={tool.id}
            ref={el => sectionRefs.current[index] = el}
            data-id={tool.id}
            className={`min-h-screen flex flex-col md:flex-row items-center ${index % 2 === 0 ? '' : 'md:flex-row-reverse'} py-16 px-6 md:px-16 border-b border-gray-200 dark:border-gray-700`}
          >
            <div className={`w-full md:w-1/2 mb-12 md:mb-0 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} ${visibleSections[tool.id] ? 'animate-slide-in' : 'opacity-0'}`}>
              <div className="flex items-center mb-6">
                {tool.icon}
                <h2 className={`text-3xl font-bold ml-4 text-${tool.color}-600 dark:text-${tool.color}-400`}>{tool.name}</h2>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                {tool.description}
              </p>
              <a 
                href={tool.path} 
                className={`inline-flex items-center px-6 py-3 rounded-lg bg-${tool.color}-600 hover:bg-${tool.color}-700 text-white font-medium transition-colors duration-200`}
              >
                Explore {tool.name}
                <ExternalLink className="ml-2 h-5 w-5" />
              </a>
            </div>
            <div className={`w-full md:w-1/2 ${visibleSections[tool.id] ? 'animate-fade-in-delay' : 'opacity-0'}`}>
              <Tool3DPlaceholder color={tool.color} name={tool.name} />
            </div>
          </section>
        ))}
      </div>

      {/* Contact/CTA Section */}
      <section className="py-20 px-6 text-center bg-gradient-to-t from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Ready to Transform Your Development Workflow?</h2>
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
          Join thousands of developers who are already leveraging the power of Nexus Hive to build better software.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200">
            Get Started
          </button>
          <button className="px-8 py-4 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg font-medium transition-colors duration-200">
            Schedule a Demo
          </button>
        </div>
      </section>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        .animate-fade-in-delay {
          opacity: 0;
          animation: fadeIn 1s ease-out 0.3s forwards;
        }
        .animate-fade-in-delay-2 {
          opacity: 0;
          animation: fadeIn 1s ease-out 0.6s forwards;
        }
        .animate-slide-in {
          animation: slideIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default NexusHiveAbout;