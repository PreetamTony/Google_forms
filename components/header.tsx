'use client';

import Link from 'next/link';
import { useAuth } from './firebase-provider';
import { ModeToggle } from './mode-toggle';

interface HeaderProps {
  formIcon?: string;
}

export default function Header({ formIcon }: HeaderProps) {
  const { user, signOut, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex justify-between h-20 items-center px-4">
        {/* Left Side - Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            {formIcon && (
              <img 
                src={formIcon} 
                alt="Form Icon" 
                className="h-8 w-8" 
              />
            )}
            <span className="text-xl font-bold">Form Builder</span>
          </Link>
        </div>

        {/* Right Side - Controls */}
        <div className="flex items-center gap-6">
          <ModeToggle />
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-base">{user.email}</span>
                  <Link href="/dashboard" className="text-base hover:underline">
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-base px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href="/login"
                    className="text-base hover:underline"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="text-base px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
