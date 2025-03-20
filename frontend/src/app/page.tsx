"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { 
  Code2, 
  Code, 
  MessageSquare,
  FileCode,
  Zap, 
  ChevronDown,
  ExternalLink
} from 'lucide-react';

const NexusHiveAbout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const [visibleSections, setVisibleSections] = useState({});
  const sectionsRef = useRef({});
  const scrollRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Handle authentication - Modified to ensure content loads even if auth fails
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        const isAuthPage = pathname === '/login' || pathname === '/signup';
        
        if (user) {
          // User is signed in, redirect to dashboard if on auth page
          if (isAuthPage) {
            router.push('/dashboard');
          }
        } else {
          // No user is signed in, but we'll still show the about page content
          console.log("User not authenticated, but showing about page content");
        }
        
        // Always set loading to false after a timeout
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      });
      
      // Clean up subscription
      return () => unsubscribe();
    } catch (error) {
      console.error("Auth error:", error);
      // If auth fails, still show content
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [router, pathname]);

  // AI tools available in Nexus Hive with full details
  const aiTools = [
    {
      id: 'chat-assistant',
      name: 'AI Chat Assistant',
      description: 'Our Mixtral-8x7B-powered conversational agent provides real-time assistance with coding queries, software best practices, and general AI-powered research. It understands context, provides intelligent responses, and can generate code snippets, explanations, and debugging solutions instantly.',
      icon: <MessageSquare className="h-12 w-12 text-blue-500" />,
      path: '/chat',
      color: 'blue',
      bgClass: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      hoverBgClass: 'hover:from-blue-700 hover:to-indigo-700',
      textClass: 'text-blue-600',
      darkTextClass: 'dark:text-blue-400'
    },
    {
      id: 'code-assistant',
      name: 'AI Code Assistant',
      description: 'This intelligent coding assistant analyzes, debugs, and improves code across 10+ programming languages. It detects syntax errors, suggests performance optimizations, and identifies security vulnerabilities while recommending best practices to enhance software quality and reduce debugging time.',
      icon: <Code className="h-12 w-12 text-emerald-500" />,
      path: '/code',
      color: 'emerald',
      bgClass: 'bg-gradient-to-r from-emerald-600 to-teal-600',
      hoverBgClass: 'hover:from-emerald-700 hover:to-teal-700',
      textClass: 'text-emerald-600',
      darkTextClass: 'dark:text-emerald-400'
    },
    {
      id: 'document-generator',
      name: 'AI Code Document Generator',
      description: 'Automate your documentation process with our AI tool that analyzes code structure, functions, and dependencies to generate comprehensive documentation. Create function descriptions, usage examples, and parameter details in Markdown format that integrates seamlessly with repositories, wikis, or technical reports.',
      icon: <FileCode className="h-12 w-12 text-amber-500" />,
      path: '/docgen',
      color: 'amber',
      bgClass: 'bg-gradient-to-r from-amber-600 to-orange-600',
      hoverBgClass: 'hover:from-amber-700 hover:to-orange-700',
      textClass: 'text-amber-600',
      darkTextClass: 'dark:text-amber-400'
    },
    {
      id: 'nlp-to-code',
      name: 'AI NLP-to-Code Converter',
      description: 'Transform natural language prompts into functional code in your desired programming language. Our AI tool generates code that follows best practices and can be downloaded in suitable file formats like .js, .py, .cpp, or .java. Perfect for beginners, rapid prototyping, and AI-assisted development.',
      icon: <Code2 className="h-12 w-12 text-rose-500" />,
      path: '/nlptocode',
      color: 'rose',
      bgClass: 'bg-gradient-to-r from-rose-600 to-pink-600',
      hoverBgClass: 'hover:from-rose-700 hover:to-pink-700',
      textClass: 'text-rose-600',
      darkTextClass: 'dark:text-rose-400'
    }
  ];

  // Set up intersection observer for animations - Modified to reset animations when elements leave viewport
  useEffect(() => {
    if (isLoading) return;
    
    // Setup smooth scrolling container
    scrollRef.current = document.getElementById('scroll-container');
    
    // Start with only the hero section visible
    setVisibleSections({ hero: true });
    
    // Detect which section is currently visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-section');
          
          if (entry.isIntersecting) {
            // Mark section as visible when it enters viewport
            setVisibleSections(prev => ({ ...prev, [id]: true }));
            setActiveSection(id);
          } else {
            // Reset visibility when element leaves viewport to enable re-animation
            setVisibleSections(prev => ({ ...prev, [id]: false }));
          }
        });
      },
      { 
        threshold: 0.3, // Trigger when 30% of the section is visible
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    // Observe all sections
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => {
      observer.observe(section);
      const id = section.getAttribute('data-section');
      sectionsRef.current[id] = section;
    });

    return () => {
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, [isLoading]);

  // Handle smooth scrolling to sections
  const scrollToSection = (sectionId) => {
    const section = sectionsRef.current[sectionId];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 3D placeholder component
  const Tool3DPlaceholder = ({ color, name }) => {
    // Convert color name to hex code for more reliable styling
    const colorMap = {
      blue: '#3b82f6',
      emerald: '#10b981',
      amber: '#f59e0b',
      rose: '#f43f5e'
    };
    
    const hexColor = colorMap[color] || colorMap.blue;
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
          {name === 'AI Chat Assistant' && (
            <>
              <rect x="160" y="100" width="80" height="100" rx="10" fill={hexColor} opacity="0.7" />
              <circle cx="200" cy="125" r="15" fill="white" opacity="0.8" />
              <rect x="170" y="150" width="60" height="10" rx="5" fill="white" opacity="0.8" />
              <rect x="170" y="170" width="40" height="10" rx="5" fill="white" opacity="0.8" />
            </>
          )}
          
          {name === 'AI Code Assistant' && (
            <>
              <rect x="150" y="100" width="100" height="100" fill={hexColor} opacity="0.7" />
              <line x1="165" y1="120" x2="235" y2="120" stroke="white" strokeWidth="2" />
              <line x1="165" y1="140" x2="215" y2="140" stroke="white" strokeWidth="2" />
              <line x1="165" y1="160" x2="225" y2="160" stroke="white" strokeWidth="2" />
              <line x1="165" y1="180" x2="195" y2="180" stroke="white" strokeWidth="2" />
            </>
          )}
          
          {name === 'AI Code Document Generator' && (
            <>
              <rect x="150" y="110" width="100" height="80" fill={hexColor} opacity="0.8" />
              <line x1="165" y1="130" x2="235" y2="130" stroke="white" strokeWidth="2" />
              <line x1="165" y1="150" x2="235" y2="150" stroke="white" strokeWidth="2" />
              <line x1="165" y1="170" x2="235" y2="170" stroke="white" strokeWidth="2" />
              <rect x="130" y="100" width="20" height="90" fill={hexColor} opacity="0.6" />
              <rect x="110" y="100" width="20" height="90" fill={hexColor} opacity="0.4" />
            </>
          )}
          
          {name === 'AI NLP-to-Code Converter' && (
            <>
              <path d="M150,120 L250,120 L230,180 L170,180 Z" fill={hexColor} opacity="0.7" />
              <text x="180" y="140" fill="white" fontSize="20">ABC</text>
              <text x="190" y="170" fill="white" fontSize="15">{ }</text>
              <line x1="150" y1="120" x2="230" y2="180" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="250" y1="120" x2="170" y2="180" stroke="white" strokeWidth="1" opacity="0.5" />
            </>
          )}
          
          {/* Animated elements */}
          <circle cx="200" cy="100" r="5" fill="white" opacity="0.8">
            <animate attributeName="cy" values="100;110;100" dur="2s" repeatCount="indefinite" />
          </circle>
          
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
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="mt-4 text-xl font-medium text-white">Loading Nexus Hive...</h2>
      </div>
    );
  }

  // Get the appropriate active dot color
  const getActiveDotClass = (sectionId) => {
    if (sectionId === activeSection) {
      return "bg-indigo-600 scale-150";
    }
    return "bg-gray-400 hover:bg-gray-600"; 
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900">
      {/* Navigation Dots */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 hidden md:block">
        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => scrollToSection('hero')}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${getActiveDotClass('hero')}`}
            aria-label="Go to top"
          />
          {aiTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => scrollToSection(tool.id)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${getActiveDotClass(tool.id)}`}
              aria-label={`View ${tool.name}`}
            />
          ))}
          <button 
            onClick={() => scrollToSection('cta')}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${getActiveDotClass('cta')}`}
            aria-label="Go to call to action"
          />
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div 
        id="scroll-container" 
        className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth"
      >
        {/* Hero Section */}
        <section 
          data-section="hero"
          className="min-h-screen flex flex-col items-center justify-center text-center px-4 py-16 snap-start snap-always"
        >
          <div className={`transform transition-all duration-1000 ${visibleSections.hero ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-6">Nexus Hive</h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-8">AI Development Hub</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              NexusHive AI is an innovative AI-powered development platform designed to streamline coding workflows and enhance software development efficiency. It integrates four powerful AI-driven tools, each tailored to assist developers in different aspects of coding, debugging, documentation, and AI-powered code generation. By supporting 10+ programming languages, NexusHive AI ensures that developers can seamlessly work across multiple technologies with smart assistance.
            </p>
            <div className="animate-bounce mt-16 cursor-pointer" onClick={() => scrollToSection(aiTools[0].id)}>
              <ChevronDown className="h-10 w-10 text-indigo-400 mx-auto" />
              <p className="text-sm text-gray-400 mt-2">Scroll to explore our tools</p>
            </div>
          </div>
        </section>

        {/* Tool Sections */}
        {aiTools.map((tool, index) => (
          <section 
            key={tool.id}
            data-section={tool.id}
            className="min-h-screen flex flex-col md:flex-row items-center py-16 px-6 md:px-16 border-b border-purple-800 snap-start snap-always"
          >
            <div className={`w-full md:w-1/2 mb-12 md:mb-0 ${index % 2 === 0 ? 'md:pr-12 order-1 md:order-1' : 'md:pl-12 order-1 md:order-2'}`}>
              <div className={`transform transition-all duration-1000 ${visibleSections[tool.id] ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                <div className="flex items-center mb-6">
                  {tool.icon}
                  <h2 className="text-3xl font-bold ml-4 text-white">{tool.name}</h2>
                </div>
                <p className="text-lg text-gray-300 mb-8">
                  {tool.description}
                </p>
                <a 
                  href={tool.path} 
                  className={`inline-flex items-center px-6 py-3 rounded-lg ${tool.bgClass} ${tool.hoverBgClass} text-white font-medium transition-colors duration-200`}
                >
                  Explore {tool.name}
                  <ExternalLink className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>
            <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'order-2 md:order-2' : 'order-2 md:order-1'}`}>
              <div className={`transform transition-all duration-1000 delay-300 ${visibleSections[tool.id] ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                <Tool3DPlaceholder color={tool.color} name={tool.name} />
              </div>
            </div>
          </section>
        ))}

        
      </div>

      <style jsx>{`
        /* For elements that start visible */
        [data-section] {
          transition: opacity 1s ease-out, transform 1s ease-out;
        }
        
        /* Floating animation for visual elements */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        /* Snap scrolling for modern browsers */
        .snap-y {
          scroll-snap-type: y mandatory;
        }
        
        .snap-start {
          scroll-snap-align: start;
        }
        
        .snap-always {
          scroll-snap-stop: always;
        }
      `}</style>
    </div>
  );
};

export default NexusHiveAbout;