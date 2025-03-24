// app/page.js
"use client";

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, PerspectiveCamera, Environment } from '@react-three/drei';
import Spline from '@splinetool/react-spline/next';
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
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Determine if this is the ultron model
  const isUltronModel = path === 'ultron (2).glb';

  useEffect(() => {
    if (scene) {
      // Apply the appropriate scaling based on the model type
      if (isUltronModel) {
        // Increase height of ultron model by scaling it up
        scene.scale.set(2, 2, 2);
        // Adjust position to ensure it's properly centered after scaling
        scene.position.set(0, -1.5, 0);
      } else if (path === 'desktop.glb') {
        scene.scale.set(1.2, 1.2, 1.2);
      } else if (path === 'document.glb') {
        scene.scale.set(1.0, 1.0, 1.0);
      } else if (path === 'gpu.glb') {
        scene.scale.set(1.1, 1.1, 1.1);
      }
      
      // Mark model as loaded to trigger fade-in animation
      setModelLoaded(true);
    }
  }, [scene, isUltronModel, path]);
  
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
      // Apply fade-in animation when model is loaded
      opacity={modelLoaded ? 1 : 0}
      style={{
        transition: 'opacity 0.5s ease-in-out'
      }}
    >
      {/* Enhanced lighting specifically for ultron model */}
      {isUltronModel && (
        <>
          {/* Increased intensity of key light */}
          <spotLight 
            position={[5, 0, 5]} 
            angle={0.6} 
            penumbra={0.8} 
            intensity={3.5} 
            color="#6495ED" 
            castShadow 
          />
          {/* Increased intensity of fill light */}
          <pointLight 
            position={[-3, 2, -1]} 
            intensity={2} 
            color="#60a5fa" 
          />
          {/* Added rim light for better edge definition */}
          <pointLight 
            position={[0, -2, 2]} 
            intensity={1.5} 
            color="#a78bfa" 
          />
          {/* Added additional front light to illuminate the face */}
          <spotLight 
            position={[0, 3, 5]} 
            angle={0.5} 
            penumbra={0.5} 
            intensity={2.8} 
            color="#ffffff" 
          />
          {/* Additional ambient light just for the ultron model */}
          <ambientLight intensity={0.8} color="#e0e7ff" />
        </>
      )}
      <primitive object={scene} />
    </group>
  );
};

// Improved camera controller with consistent positioning
const CameraController = ({ modelType }) => {
  const { camera, gl } = useThree();
  const controls = useRef();
  const cameraPositionRef = useRef();
  
  // Store the appropriate camera positions for each model type
  const cameraPositions = {
    'robot': [0, 1.0, 5.5],    // Adjusted for taller ultron model
    'desktop': [0, 5, 15],
    'document': [3, 3, 3],
    'gpu': [0, 6, 0],
    'default': [0, 0, 4]
  };
  
  useEffect(() => {
    if (controls.current) {
      // Get camera position based on model type
      const position = cameraPositions[modelType] || cameraPositions.default;
      
      // Store initial camera position for smooth transitions
      if (!cameraPositionRef.current) {
        cameraPositionRef.current = [...position];
        camera.position.set(...position);
      } else {
        // For subsequent updates, animate the camera transition
        const startPos = [camera.position.x, camera.position.y, camera.position.z];
        const endPos = position;
        
        // Simple animation function
        const animateCamera = (startTime) => {
          const elapsedTime = Date.now() - startTime;
          const duration = 1000; // 1 second transition
          
          if (elapsedTime < duration) {
            const t = elapsedTime / duration;
            const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // ease in-out quad
            
            // Interpolate position
            camera.position.set(
              startPos[0] + (endPos[0] - startPos[0]) * easeT,
              startPos[1] + (endPos[1] - startPos[1]) * easeT,
              startPos[2] + (endPos[2] - startPos[2]) * easeT
            );
            
            requestAnimationFrame(() => animateCamera(startTime));
          } else {
            // Ensure final position is exactly what we want
            camera.position.set(...endPos);
          }
          controls.current.update();
        };
        
        animateCamera(Date.now());
      }
    }
  }, [camera, modelType]);

  return <OrbitControls ref={controls} enablePan={true} enableZoom={true} />;
};

// Improved 3D model viewer with preloading and smooth transitions
const Model3DViewer = ({ modelPath, modelType }) => {
  const isUltronModel = modelPath === 'ultron (2).glb';
  const [isModelLoading, setIsModelLoading] = useState(true);
  
  // Preload models to ensure they're ready before display
  useEffect(() => {
    // Preload the model
    const preloadModel = async () => {
      try {
        await useGLTF.preload(`/models/${modelPath}`);
        setIsModelLoading(false);
      } catch (error) {
        console.error(`Error preloading model ${modelPath}:`, error);
        setIsModelLoading(false);
      }
    };
    
    preloadModel();
    
    // Cleanup preloaded models when component unmounts
    return () => {
      // Using clear instead of dispose for model cleanup
      if (typeof useGLTF.clear === 'function') {
        useGLTF.clear(`/models/${modelPath}`);
      } else {
        // Fallback if clear is not available
        console.log(`Unmounting model: ${modelPath}`);
      }
    };
  }, [modelPath]);
  
  return (
    <div className="w-full h-full relative">
      {isModelLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <Canvas 
        className={`w-full h-full transition-opacity duration-500 ${isModelLoading ? 'opacity-0' : 'opacity-100'}`} 
        shadows
      >
        <Suspense fallback={null}>
          {/* Base lighting for all models */}
          <ambientLight intensity={isUltronModel ? 0.7 : 0.7} />
          
          {/* Base spotlight for all models - adjusted intensity */}
          <spotLight 
            position={[10, 10, 10]} 
            angle={0.15} 
            penumbra={1} 
            intensity={isUltronModel ? 1.8 : 0.8} 
          />
          
          {/* Base pointlight for all models */}
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {/* Add very light fog for ultron model - reduced density */}
          {isUltronModel && <fog attach="fog" color="#101035" near={20} far={50} />}
          
          {/* Add subtle environment lighting */}
          {isUltronModel && <Environment preset="city" />}
          
          <Model path={modelPath} />
          <CameraController modelType={modelType} />
        </Suspense>
      </Canvas>
    </div>
  );
};

// Main NexusHiveAbout component
const NexusHiveAbout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const [visibleSections, setVisibleSections] = useState({});
  const sectionsRef = useRef({});
  const scrollRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const [buttonState, setButtonState] = useState({}); // Track button click animations

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

  // Set button animation
  const animateButton = (id) => {
    setButtonState(prev => ({...prev, [id]: true}));
    setTimeout(() => {
      setButtonState(prev => ({...prev, [id]: false}));
    }, 700);
  };

  // AI tools available in Nexus Hive with balanced model settings
  const aiTools = [
    {
      id: 'chat-assistant',
      name: 'AI Chat Assistant',
      description: 'Our Mixtral-8x7B-powered conversational agent provides real-time assistance with coding queries, software best practices, and general AI-powered research. It understands context, provides intelligent responses, and can generate code snippets, explanations, and debugging solutions instantly.',
      icon: <MessageSquare className="h-12 w-12 text-blue-500" />,
      path: '/chat',
      modelPath: 'ultron (2).glb',
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
            onClick={() => {
              scrollToSection('hero');
              animateButton('dot-hero');
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${getActiveDotClass('hero')} ${buttonState['dot-hero'] ? 'animate-ping-once' : ''}`}
            aria-label="Go to top"
          />
          {aiTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => {
                scrollToSection(tool.id);
                animateButton(`dot-${tool.id}`);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${getActiveDotClass(tool.id)} ${buttonState[`dot-${tool.id}`] ? 'animate-ping-once' : ''}`}
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
            <div className="flex justify-center gap-4 mb-8">
              <a 
                href="/codechallenge" 
                className="relative px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium transition-all duration-300 group overflow-hidden"
                onClick={() => animateButton('code-challenge')}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="absolute -inset-full h-full w-full block transform -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 group-hover:animate-shine"></span>
                <span className="absolute inset-0 w-full h-full flex items-center justify-center">
                  <span className="absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105 rounded-lg"></span>
                </span>
                <span className="relative flex items-center justify-center">
                  <Zap className={`mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${buttonState['code-challenge'] ? 'animate-ping-quick' : ''}`} />
                  <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">Code Challenges</span>
                </span>
                <span className="absolute inset-0 rounded-lg shadow-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </a>
            </div>
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
                  className={`relative inline-flex items-center px-6 py-3 rounded-lg overflow-hidden group`}
                  onClick={() => animateButton(`explore-${tool.id}`)}
                >
                  {/* Background layers */}
                  <span className={`absolute inset-0 ${tool.bgClass} transition-all duration-300 transform group-hover:scale-105`}></span>
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse-slow"></span>
                    <span className="absolute -inset-full h-full w-full block transform -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover:animate-shine-slow"></span>
                  </span>
                  
                  {/* Border glow effect */}
                  <span className="absolute inset-0 rounded-lg border border-transparent group-hover:border-white group-hover:opacity-30 transition-all duration-300"></span>
                  
                  {/* Particles effect on hover */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100">
                    <span className="particle absolute w-1 h-1 rounded-full bg-white top-0 left-5"></span>
                    <span className="particle absolute w-1 h-1 rounded-full bg-white top-3 right-10 delay-150"></span>
                    <span className="particle absolute w-1 h-1 rounded-full bg-white bottom-5 left-10 delay-300"></span>
                    <span className="particle absolute w-1 h-1 rounded-full bg-white bottom-2 right-5 delay-500"></span>
                  </span>
                  
                  {/* Content */}
                  <span className="relative flex items-center justify-center text-white font-medium z-10">
                    <span>Explore {tool.name}</span>
                    <ExternalLink className={`ml-2 h-5 w-5 transition-all duration-300 group-hover:translate-x-1 ${buttonState[`explore-${tool.id}`] ? 'animate-bounce-once' : ''}`} />
                  </span>
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
        
        /* New button animations */
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(150%) skewX(-12deg); }
        }
        
        @keyframes shine-slow {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(150%) skewX(-12deg); }
        }
        
        .animate-shine {
          animation: shine 1s infinite;
        }
        
        .animate-shine-slow {
          animation: shine-slow 3s infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        /* Glow effects */
        .shadow-glow {
          box-shadow: 0 0 15px 2px rgba(129, 140, 248, 0.7),
                    0 0 30px 5px rgba(129, 140, 248, 0.5),
                    0 0 45px 7px rgba(129, 140, 248, 0.3);
        }
        
        /* Particle animations */
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-20px) scale(0); opacity: 0; }
        }
        
        .particle {
          animation: float-up 2s infinite;
          animation-play-state: paused;
        }
        
        .group:hover .particle {
          animation-play-state: running;
        }
        
        .delay-150 {
          animation-delay: 0.15s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
        
        /* Button click animations */
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(2); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-ping-once {
          animation: ping-once 0.7s ease-out;
        }
        
        @keyframes ping-quick {
          0% { transform: scale(1); }
          50% { transform: scale(1.5); }
          100% { transform: scale(1); }
        }
        
        .animate-ping-quick {
          animation: ping-quick 0.4s ease-out;
        }
        
        @keyframes bounce-once {
          0% { transform: translateX(0); }
          25% { transform: translateX(5px); }
          50% { transform: translateX(0); }
          75% { transform: translateX(2px); }
          100% { transform: translateX(0); }
        }
        
        .animate-bounce-once {
          animation: bounce-once 0.7s ease-out;
        }
      `}</style>
    </div>
  );
};

// Function for Spline home page (can be used as an alternative home)
function Home() {
  return (
    <main>
      <Spline
        scene="https://prod.spline.design/s1t2YvrMKhyF3rLM/scene.splinecode" 
      />
    </main>
  );
}

// Export NexusHiveAbout as the default component for the home page
export default NexusHiveAbout;