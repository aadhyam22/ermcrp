"use client";

import { CRMProvider } from '../context/CRMContext';

export default function ClientProvider({ children }) {
  return <CRMProvider>{children}</CRMProvider>;
}
