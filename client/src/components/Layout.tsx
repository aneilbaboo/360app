import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = isAuthenticated
    ? [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Create Review', href: '/reviews/create' },
        { name: 'Notifications', href: '/notifications' },
      ]
    : [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                  <span className="text-xl font-bold text-white">360</span>
                </div>
                <span className="hidden text-xl font-semibold text-gray-900 sm:block">
                  Review Platform
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <div className="hidden md:flex md:items-center md:space-x-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary-600',
                      isActive(item.href)
                        ? 'text-primary-600'
                        : 'text-gray-700'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/notifications"
                    className="hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:block"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                  </Link>
                  <div className="hidden items-center space-x-3 md:flex">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="hidden flex-col lg:flex">
                      <span className="text-sm font-medium text-gray-900">
                        {user?.email}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      aria-label="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
                    aria-label="Toggle menu"
                  >
                    {mobileMenuOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="btn-secondary">
                    Log In
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          {isAuthenticated && mobileMenuOpen && (
            <div className="border-t border-gray-200 py-4 md:hidden">
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block rounded-lg px-3 py-2 text-base font-medium',
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} 360 Review Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Import cn utility
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default Layout;
