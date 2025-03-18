'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import AppLayout from './layout';

export default function Page({ children }) {
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const pathname = window.location.pathname;
      const isAuthPage = pathname === '/login' || pathname === '/signup';
      
      if (user) {
        // User is signed in, redirect to dashboard if on auth page
        if (isAuthPage) {
          router.push('/dashboard');
        }
      } else {
        // No user is signed in, redirect to login unless already on auth page
        if (!isAuthPage) {
          router.push('/login');
        }
      }
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, [router]);
  
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}