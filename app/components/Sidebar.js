'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/employees', label: 'Employees' },
  { href: '/clients', label: 'Clients' },
  { href: '/products', label: 'Products' },
  { href: '/billing', label: 'Billing' }
];



export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 shrink-0 sticky top-0 left-0 bg-surface-ice border-r border-outline-variant/10 z-40 py-2 px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-4 mb-4">
        <div className="w-20 h-10 rounded-lg bg-void-navy flex items-center justify-center text-surface-ice shadow-md shrink-0">
          <span className=" fill" style={{ fontVariationSettings: "'FILL' 1" }}>ERP CRM</span>
        </div>
        <div>
          <h2 className="font-headline font-bold text-tech-blue leading-tight text-[16px]">ERP CRM Platfrom</h2>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 cursor-pointer select-none group
                ${isActive
                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:translate-x-1'
                }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-colors ${isActive ? '' : 'group-hover:text-tech-blue'}`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant/10 pt-4 flex flex-col gap-0.5">
        <div className="px-3 py-2 flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-energetic-green pulse-dot" />
          <span className="font-label text-[11px] text-industrial-gray uppercase tracking-wider">System Status: Online</span>
        </div>
      </div>
    </aside>
  );
}
