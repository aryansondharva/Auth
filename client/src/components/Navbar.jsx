import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Moon, Sun, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-zinc-100 font-bold text-xl transition-colors">
              AuthSystem
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-zinc-400 hover:text-zinc-100 transition-colors ${
                    location.pathname === '/dashboard' ? 'text-zinc-100' : ''
                  }`}
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2 text-zinc-400">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.name}</span>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className={`text-zinc-400 hover:text-zinc-100 transition-colors ${
                    location.pathname === '/signin' ? 'text-zinc-100' : ''
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className={`text-zinc-400 hover:text-zinc-100 transition-colors ${
                    location.pathname === '/signup' ? 'text-zinc-100' : ''
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="text-zinc-400 hover:text-zinc-100 transition-colors p-2 rounded-lg hover:bg-zinc-800/50"
              aria-label="Toggle theme"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Logout button */}
            {isAuthenticated && (
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-100 transition-colors p-2 rounded-lg hover:bg-zinc-800/50"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
