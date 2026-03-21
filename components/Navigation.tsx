'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/map', label: 'Map' },
  { href: '/insights', label: 'Insights' },
  { href: '/referral', label: 'Referral Model' },
  { href: '/upload', label: 'Upload' },
  { href: '/methodology', label: 'Methodology' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-sky-500 rounded-lg group-hover:bg-sky-400 transition-colors">
              <Wind className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-base font-bold leading-tight">Farm to FeNO</div>
              <div className="text-xs text-slate-400 leading-tight hidden sm:block">
                Ohio Rural Airway Equity Map
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-700 bg-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
