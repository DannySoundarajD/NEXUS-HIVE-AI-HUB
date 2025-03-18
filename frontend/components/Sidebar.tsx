'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../src/app/firebase/config';
import { 
  BarChart, 
  Code2, 
  Code, 
  Terminal, 
  FileCode, 
  GitBranch, 
  GitPullRequest, 
  Zap, 
  Layers, 
  Activity, 
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Database,
  Bot,
  Braces,
  FileText,
  MessageSquare,
  BookOpen,
  Cpu,
  Home,
  PanelLeft,
  User
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // Default to open for better UX
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      
      // Auto-close sidebar on mobile when page loads or window resizes to mobile size
      if (isMobileView) {
        setIsOpen(false);
      } else {
        setIsOpen(true); // Ensure sidebar is open on desktop
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // AI tools available in Nexus Hive
  const aiTools = [
    {
      id: 'chatBot',
      name: 'Chat Bot',
      path: '/chat',
      icon: <MessageSquare className="h-5 w-5 text-indigo-500" />,
    },
    {
      id: 'codeAssistant',
      name: 'Code Assistant',
      path: '/code',
      icon: <Braces className="h-5 w-5 text-emerald-500" />,
    },
    {
      id: 'codeDocumentisier',
      name: 'Code Documentisier',
      path: '/docgen',
      icon: <FileText className="h-5 w-5 text-amber-500" />,
    },
    {
      id: 'nlpToProgramme',
      name: 'NLP To Programme',
      path: '/nlptocode',
      icon: <Cpu className="h-5 w-5 text-purple-500" />,
    },
  ];

  return (
    <>
      {/* Toggle button - fixed position that adjusts based on sidebar state */}
      <button
        className={`fixed top-4 ${isOpen ? 'left-64' : 'left-4'} z-50 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full shadow-md transition-all duration-300`}
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <PanelLeft size={20} /> : <ChevronRight size={20} />}
      </button>
      
      {/* Sidebar with fixed position */}
      <aside 
        className={`
          fixed top-0 left-0 h-full z-40 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : isMobile ? '-left-full' : 'w-0 overflow-hidden'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Scrollable content area with padding to accommodate the toggle button */}
          <div className="p-4 pt-14 pl-6 flex flex-col h-full overflow-y-auto">
            {/* Logo */}
            <div className="mb-6 mt-2">
              <Link href="/dashboard" onClick={() => isMobile && setIsOpen(false)}>
                <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer whitespace-nowrap">
                  NEXUS HIVE AI
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm whitespace-nowrap">
                  Intelligent Coding Assistant
                </p>
              </Link>
            </div>
            
            {/* Main Navigation */}
            <nav className="space-y-1 mb-6">
              <Link href="/dashboard">
                <div 
                  className={`flex items-center w-full px-3 py-2 rounded-md cursor-pointer ${
                    pathname === '/dashboard' 
                      ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <Home className="h-5 w-5 min-w-5" />
                  <span className="ml-3 truncate">Dashboard</span>
                </div>
              </Link>
              
              <Link href="/profile">
                <div 
                  className={`flex items-center w-full px-3 py-2 rounded-md cursor-pointer ${
                    pathname === '/profile' 
                      ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <User className="h-5 w-5 min-w-5 text-blue-500" />
                  <span className="ml-3 truncate">Profile</span>
                </div>
              </Link>
              
              
            </nav>
            
            {/* AI Tools Section */}
            <div>
              <h2 className="text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 mb-2 ml-3 whitespace-nowrap">
                AI TOOLS
              </h2>
              <div className="space-y-1">
                {aiTools.map((tool) => (
                  <Link key={tool.id} href={tool.path}>
                    <div 
                      className={`flex items-center w-full px-3 py-2 rounded-md cursor-pointer ${
                        pathname === tool.path
                          ? 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => isMobile && setIsOpen(false)}
                    >
                      {tool.icon}
                      <span className="ml-2 text-sm truncate">{tool.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Logout Button - Pushed to bottom with mt-auto */}
            <div className="mt-auto pt-6">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="h-5 w-5 min-w-5" />
                <span className="ml-3">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile - only shown when sidebar is open on mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;