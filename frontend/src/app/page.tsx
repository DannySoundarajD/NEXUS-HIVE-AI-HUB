"use client";

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera } from '@react-three/drei';
import { 
  Code2, 
  Code, 
  MessageSquare,
  FileCode,
  Zap, 
  ChevronDown,
  ExternalLink,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

// 3D model component with balanced scaling and natural rotation
const Model = ({ path, position = [0, 0, 0] }) => {
  const { scene } = useGLTF(`/models/${path}`);
  const groupRef = useRef();
  
  // Auto-rotate model at a gentle pace
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position}
    >
      <primitive object={scene} />
    </group>
  );
};

// Improved camera controller with balanced initial position
const CameraController = ({ modelType }) => {
  const { camera, gl } = useThree();
  const controls = useRef();
  
  useEffect(() => {
    if (controls.current) {
      // Set appropriate camera position based on model type
      switch(modelType) {
        case 'robot':
          camera.position.set(0, 3, 3);
          break;
        case 'desktop':
          camera.position.set(0, 5, 15);
          break;
        case 'document':
          camera.position.set(3, 3, 3);
          break;
        case 'gpu':
          camera.position.set(0, 6, 0);
          break;
        default:
          camera.position.set(0, 0, 4);
      }
      controls.current.update();
    }
  }, [camera, modelType]);

  return <OrbitControls ref={controls} enablePan={true} enableZoom={true} />;
};

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

  // AI tools available in Nexus Hive with balanced model settings
  const aiTools = [
    {
      id: 'chat-assistant',
      name: 'AI Chat Assistant',
      description: 'Our Mixtral-8x7B-powered conversational agent provides real-time assistance with coding queries, software best practices, and general AI-powered research. It understands context, provides intelligent responses, and can generate code snippets, explanations, and debugging solutions instantly.',
      icon: <MessageSquare className="h-12 w-12 text-blue-500" />,
      path: '/chat',
      modelPath: 'ultron (2).glb',  // Updated path here
      modelType: 'robot',
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
      modelPath: 'desktop.glb',
      modelType: 'desktop',
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
      modelPath: 'document.glb',
      modelType: 'document',
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
      modelPath: 'gpu.glb',
      modelType: 'gpu',
      color: 'rose',
      bgClass: 'bg-gradient-to-r from-rose-600 to-pink-600',
      hoverBgClass: 'hover:from-rose-700 hover:to-pink-700',
      textClass: 'text-rose-600',
      darkTextClass: 'dark:text-rose-400'
    }
  ];

  // Set up intersection observer for animations
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

  // Improved 3D model viewer with full-screen capability
  const Model3DViewer = ({ modelPath, modelType }) => {
    return (
      <div className="w-full h-full">
        <Canvas className="w-full h-full" shadows>
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <Model 
              path={modelPath}
            />
            <CameraController modelType={modelType} />
          </Suspense>
        </Canvas>
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
            <div className={`w-full md:w-1/2 h-96 md:h-screen ${index % 2 === 0 ? 'order-2 md:order-2' : 'order-2 md:order-1'}`}>
              <div className={`transform transition-all duration-1000 delay-300 h-full ${visibleSections[tool.id] ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                <Model3DViewer 
                  modelPath={tool.modelPath} 
                  modelType={tool.modelType}
                />
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