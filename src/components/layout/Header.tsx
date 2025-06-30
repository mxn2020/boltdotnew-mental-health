import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, Shield, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function Header() {
  const { user, isAnonymous, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isAuthenticated = user || isAnonymous;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-teal-600" />
            <span className="text-xl font-semibold text-gray-900">
              MindfulSpace
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/checkin" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Check-in
                </Link>
                <Link 
                  to="/tools" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Coping Tools
                </Link>
                <Link 
                  to="/support" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Peer Support
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/resources" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Resources
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  About
                </Link>
              </>
            )}
            
            {/* Crisis Support - Always Visible */}
            <Link 
              to="/crisis" 
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="font-medium">Crisis Support</span>
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {isAnonymous && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Shield className="h-4 w-4" />
                    <span>Anonymous Mode</span>
                  </div>
                )}
                <Link to="/settings">
                  <Button variant="ghost" size="sm">
                    Settings
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-3">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/checkin" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Check-in
                  </Link>
                  <Link 
                    to="/tools" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Coping Tools
                  </Link>
                  <Link 
                    to="/support" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Peer Support
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/resources" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Resources
                  </Link>
                  <Link 
                    to="/about" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                </>
              )}
              
              <Link 
                to="/crisis" 
                className="block px-3 py-2 text-red-600 hover:text-red-700 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Crisis Support
              </Link>
              
              <div className="border-t border-gray-200 pt-3 mt-3">
                {isAuthenticated ? (
                  <>
                    {isAnonymous && (
                      <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500">
                        <Shield className="h-4 w-4" />
                        <span>Anonymous Mode</span>
                      </div>
                    )}
                    <Link 
                      to="/settings" 
                      className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900"
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="block px-3 py-2 text-gray-600 hover:text-gray-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      className="block px-3 py-2 text-teal-600 hover:text-teal-700 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}