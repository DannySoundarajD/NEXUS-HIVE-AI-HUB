'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../src/app/firebase/config';
import { LogOut, User, Bot, Sparkles } from 'lucide-react';

const Navbar = () => {
  const pathname = usePathname();
  const [isHovering, setIsHovering] = useState(false);
  
  const handleLogout = async () => {
    try {
      // Log out the current user
      await signOut(auth);
      
      // Clear any user session data from local storage
      localStorage.removeItem('userSession');
      sessionStorage.removeItem('userSession');
      
      // Force redirect to login page
      window.location.href = '/login'; // Using window.location instead of router for a full page reload
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-3">
      <div className="flex justify-between items-center">
        {/* Enhanced logo with multiple animations */}
        <Link href="/">
          <div 
            className="group relative w-64 h-10 cursor-pointer overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Gradient text that splits and fades */}
            <div className="flex space-x-1">
              {["NEXUS", "HIVE", "AI", "HUB"].map((word, index) => (
                <h1 
                  key={index}
                  className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-500"
                  style={{
                    transform: isHovering ? `translateY(${index % 2 === 0 ? '-100%' : '100%'})` : 'translateY(0)',
                    opacity: isHovering ? 0 : 1,
                    transitionDelay: `${index * 50}ms`
                  }}
                >
                  {word}
                </h1>
              ))}
            </div>
            
            {/* Bot icon that grows and rotates with gradient background */}
            <div 
              className="absolute top-0 left-0 transition-all duration-500 flex items-center"
              style={{
                opacity: isHovering ? 1 : 0,
                transform: isHovering ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)'
              }}
            >
              <div className="bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full p-2">
                <Bot className="h-6 w-6 text-white" />
              </div>
              
              {/* Sparkles that appear around the icon */}
              <Sparkles 
                className="h-6 w-6 text-yellow-300 absolute -top-2 -right-2 transition-all duration-300"
                style={{
                  opacity: isHovering ? 1 : 0,
                  transform: isHovering ? 'scale(1)' : 'scale(0)',
                  animationName: isHovering ? 'pulse' : 'none',
                  animationDuration: '2s',
                  animationIterationCount: 'infinite'
                }}
              />
            </div>
          </div>
        </Link>
        
        {/* Enhanced right side navigation buttons with gradient hover effects */}
        <div className="flex items-center space-x-4">
          <Link href="/profile">
            <div 
              className={`p-2 rounded-full cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 ${
                pathname === '/profile' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                  : 'text-gray-200 hover:text-white'
              }`}
            >
              <div className="relative">
                <User className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
                {pathname === '/profile' && (
                  <span className="absolute -bottom-1 left-1/2 w-4 h-1 bg-white rounded-full transform -translate-x-1/2"></span>
                )}
              </div>
            </div>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="p-2 rounded-full text-gray-200 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 hover:text-white hover:rotate-12 group"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
          </button>
        </div>
      </div>
      
      {/* Add a subtle animated gradient line under the navbar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
      
      {/* Add global keyframes for the animation */}
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 0.7; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.7; transform: scale(0.95); }
        }
        
        /* Assuming the page has this background gradient */
        body {
          background: linear-gradient(to bottom right, #312e81, #581c87, #111827);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;