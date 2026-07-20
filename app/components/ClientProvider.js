"use client";

import { AuthProvider } from '../context/AuthContext';
import { CRMProvider } from '../context/CRMContext';

export default function ClientProvider({ children }) {
  return (
    <AuthProvider>
      <CRMProvider>{children}</CRMProvider>
    </AuthProvider>
  );
}
