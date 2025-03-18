'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar'; // Adjust the path as needed

const ClientSideLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {!isAuthPage && <Sidebar />}
      <main className={`${!isAuthPage ? 'flex-1' : 'w-full'}`}>
        {children}
      </main>
    </div>
  );
};

export default ClientSideLayout;