"use client";
import React, { useEffect } from 'react';
export default function Modal({ isOpen, onClose, title, children }) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void-navy/50 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-login flex flex-col overflow-hidden max-h-full">
        <div className="flex justify-between items-center p-4 border-b border-surface-variant bg-surface-ice">
          <h3 className="font-headline font-semibold text-[20px] text-primary">{title}</h3>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
