// components/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaRobot,
  FaFileAlt,
  FaCode,
  FaGlobe,
  FaMicrophone,
  FaBars,
  FaTimes,
  FaBook,
  FaMagic
} from 'react-icons/fa';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: 'AI Chatbot', path: '/chat', icon: <FaRobot size={20} /> },
    { name: 'Code Assistant', path: '/code', icon: <FaCode size={20} /> },
    { name: 'Code Documentation', path: '/docgen', icon: <FaBook size={20} /> },
    { name: 'NLP to Code', path: '/nlptocode', icon: <FaMagic size={20} /> }
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>
      
      {/* Sidebar */}
      <aside className={`
        fixed md:static z-40 h-full bg-blue-700 text-white transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64 left-0' : '-left-64 md:left-0 md:w-64'}
      `}>
        <div className="p-5">
          {/* Logo/Title with link to home */}
          <Link href="/" passHref>
            <div className="text-xl font-bold mb-10 cursor-pointer hover:text-blue-300 transition-colors">
              NexusHive AI
            </div>
          </Link>
          <nav>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path} passHref>
                    <div
                      className={`
                        flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer
                        ${pathname === item.path ? 'bg-blue-900' : 'hover:bg-blue-800'}
                      `}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
      
      {/* Overlay to close sidebar on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;