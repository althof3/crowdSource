'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Map as MapIcon, Plus, Landmark, Trophy } from 'lucide-react';
import { WalletButton } from './WalletButton';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  { href: '/', label: 'Peta', icon: MapIcon, active: (p) => p === '/' },
  { href: '/report', label: 'Laporkan', icon: Plus, active: (p) => p.startsWith('/report') },
  { href: '/dashboard', label: 'Author', icon: Landmark, active: (p) => p.startsWith('/dashboard') },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy, active: (p) => p.startsWith('/leaderboard') },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const network = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet').toLowerCase();
  const networkLabel = network.charAt(0).toUpperCase() + network.slice(1);

  return (
    <div className="h-screen bg-background text-white">
      <div className="mx-auto h-full w-full">
        <div className="flex h-full bg-background/40 shadow-2xl">
          <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-white/10 bg-background/60 px-3 py-4">
              <div className="px-3 pb-4">
                <div className="text-base font-semibold tracking-tight">CrowdRadar</div>
                <div className="text-[11px] text-slate-400">Indonesia · {networkLabel}</div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.active(pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-accent/20 text-accent'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto border-t border-white/10 px-3 py-6">
                <WalletButton />
              </div>
          </aside>

          <main className="h-full flex-1 overflow-y-auto p-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
