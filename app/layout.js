import './globals.css';

import ClientProvider from './components/ClientProvider';

export const metadata = {
  title: 'ERP CRM Platform',
  description: 'ERP platform to manage clients, employees, orders, billing, and inventory.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" webcrx="">
      <head>
      </head>
      <body className="bg-surface text-on-surface antialiased">
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
