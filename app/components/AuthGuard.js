'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AuthGuard({ children }) {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Check role-based access
  let canAccess = false;
  const path = pathname.split('/')[1] || ''; // e.g. 'dashboard', 'billing'

  if (role === 'admin') {
    canAccess = true;
  } else if (role === 'manager') {
    const allowedModules = ['dashboard', 'employees', 'products', 'clients'];
    canAccess = allowedModules.includes(path);
  } else if (role === 'sales_agent') {
    const allowedModules = ['dashboard', 'clients', 'products', 'billing'];
    canAccess = allowedModules.includes(path);
  } else {
    // Fallback if role is unknown but user is loaded
    canAccess = path === 'dashboard' || path === '';
  }

  useEffect(() => {
    if (!authLoading && user && role && !canAccess) {
      // Small timeout to allow render to complete before alerting, though not strictly necessary
      setTimeout(() => {
        alert("You cannot access this module.");
        router.replace('/dashboard');
      }, 0);
    }
  }, [authLoading, user, role, canAccess, router]);

  if (authLoading || !user || !role || !canAccess) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-tech-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return children;
}
