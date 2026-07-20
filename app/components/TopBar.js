'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/app/context/AuthContext';

export default function TopBar({ title = 'ERP CRM Platform' }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, role } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditProfile = () => {
    setIsMenuOpen(false);
    router.push('/profile');
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (confirmed) {
      try {
        await signOut(auth);
        router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  return (
    <header className="flex justify-between items-center w-full px-4 md:px-6 h-16 sticky top-0 z-50 bg-surface-ice border-b border-outline-variant/10 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <h1 className="font-headline font-bold text-void-navy text-[18px]">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="p-2 rounded-full border border-outline-variant/20 cursor-pointer hover:bg-surface-variant/50 transition-colors text-void-navy flex items-center justify-center"
            title="Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/20 rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-3 border-b border-outline-variant/10">
                <p className="text-[14px] font-semibold text-void-navy truncate">
                  {user?.displayName || user?.email || 'User'}
                </p>
                <p className="text-[12px] text-gray-500 capitalize">
                  {role || 'Role'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 mt-1 text-[14px] text-error hover:bg-error/5 transition-colors text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}