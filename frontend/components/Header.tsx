'use client';

import React from 'react';
import Link from 'next/link';
import { WalletButton } from './WalletButton';
import { Map as MapIcon, PlusSquare, LayoutDashboard, Trophy } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const NavLink = ({ href, icon: Icon, children, active }: { href: string; icon: any; children: React.ReactNode; active: boolean }) => (
  <Link
    href={href}
    className={clsx(
      "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
      active ? "bg-accent/10 text-accent" : "text-gray-400 hover:text-white hover:bg-white/5"
    )}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline text-sm font-medium">{children}</span>
  </Link>
);

export const Header = () => {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 h-16">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <MapIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">CrowdRadar</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink href="/" icon={MapIcon} active={pathname === '/'}>Map</NavLink>
          <NavLink href="/report" icon={PlusSquare} active={pathname === '/report'}>Report</NavLink>
          <NavLink href="/dashboard" icon={LayoutDashboard} active={pathname === '/dashboard'}>Dashboard</NavLink>
          <NavLink href="/leaderboard" icon={Trophy} active={pathname === '/leaderboard'}>Rank</NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <WalletButton />
        </div>
      </div>
    </header>
  );
};
