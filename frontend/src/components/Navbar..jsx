import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

function Navbar() {
  const { isAuthenticated, userRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`bg-white border-b border-gray-200 sticky top-0 z-[9999] transition-all duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img
                src="/images/logoo.png"
                alt="ForestFire Watch Logo"
                className="h-24 w-auto object-contain md:h-28 lg:h-32"
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/live-map"
              className="px-4 py-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 font-medium"
            >
              Live Map
            </Link>

            <Link
              to="/predict"
              className="px-4 py-2 rounded-lg text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 font-medium"
            >
              Predict
            </Link>

            <Link
              to="/alerts"
              className="px-4 py-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
            >
              Alerts
            </Link>

            <Link
              to="/stats"
              className="px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
            >
              Statistics
            </Link>

            <Link
              to="/contact"
              className="px-4 py-2 rounded-lg text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 font-medium"
            >
              Contact
            </Link>
          </div>

          {/* Right Side - Auth & Mobile Menu */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to={userRole === 'admin' ? "/admin-dashboard" : "/user-dashboard"}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:block">
                  {userRole === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                </span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:block">Login</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 shadow-lg">
              <Link
                to="/live-map"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
              >
                Live Map
              </Link>
              <Link
                to="/predict"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200"
              >
                Predict
              </Link>
              <Link
                to="/alerts"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                Alerts
              </Link>
              <Link
                to="/stats"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                Statistics
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;