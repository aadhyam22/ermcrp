'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function TopBar({ title = 'ERP CRM Platform' }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
        <button className="p-2 text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full cursor-pointer relative">
          <span className="">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface-ice" />
        </button>

        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="h-10 w-10 rounded-full border border-outline-variant/20 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-tech-blue flex items-center justify-center text-white text-[12px] font-bold"
          >
            AD
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant/20 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[14px] text-error hover:bg-error/5 transition-colors text-left"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}