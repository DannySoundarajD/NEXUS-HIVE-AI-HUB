'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../src/app/firebase/config';
import { Loader2 } from 'lucide-react';

// List of public paths that don't require authentication
const publicPaths = ['/login', '/signup', '/reset-password'];

const AuthProtection = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Check if current path is public or requires auth
      const isPublicPath = publicPaths.includes(pathname);
      
      if (!user && !isPublicPath) {
        // No user is signed in and trying to access protected route
        router.push('/login');
      } else if (user && isPublicPath) {
        // User is signed in but on a public route like login/signup
        router.push('/dashboard');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // If we're on a public path or user is authenticated for a protected path
  return <>{children}</>;
};

export default AuthProtection;