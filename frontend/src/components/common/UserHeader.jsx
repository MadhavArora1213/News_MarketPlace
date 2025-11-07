import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from './Icon';

const UserHeader = ({ onShowAuth }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [language, setLanguage] = useState('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const socialMediaIcons = [
    { name: 'facebook', href: '#', label: 'Facebook' },
    { name: 'twitter', href: '#', label: 'Twitter' },
    { name: 'linkedin', href: '#', label: 'LinkedIn' },
    { name: 'instagram', href: '#', label: 'Instagram' }
  ];

  const contactIcons = [
    { name: 'whatsapp', href: '#', label: 'WhatsApp' },
    { name: 'telegram', href: '#', label: 'Telegram' },
    { name: 'youtube', href: '#', label: 'YouTube' },
    { name: 'phone', href: 'tel:+1234567890', label: 'Phone' }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Row: Icons Left, Logo Center, Language & Icons Right */}
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          {/* Left: Social Media Icons - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-1.5">
            {socialMediaIcons.map((icon) => (
              <a
                key={icon.name}
                href={icon.href}
                aria-label={icon.label}
                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
              >
                <Icon name={icon.name} size="xs" />
              </a>
            ))}
          </div>

          {/* Center: Logo */}
          <div className="flex items-center">
            <Icon name="newspaper" size="lg" className="text-blue-600 mr-1.5" />
            <h1 className="text-2xl md:text-4xl font-bold text-blue-600">News MarketPlace</h1>
          </div>

          {/* Right: Language, Contact Icons, Menu Icon (mobile) */}
          <div className="flex items-center space-x-2">
            {/* Language - Hidden on mobile */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="hidden md:block text-xs py-1 px-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="fr">FR</option>
              <option value="de">DE</option>
            </select>

            {/* Contact Icons - Hidden on mobile */}
            <div className="hidden md:flex items-center space-x-1">
              {contactIcons.map((icon) => (
                <a
                  key={icon.name}
                  href={icon.href}
                  aria-label={icon.label}
                  className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                >
                  <Icon name={icon.name} size="xs" />
                </a>
              ))}
            </div>

            {/* Mobile: Menu Icon */}
            <button
              className="md:hidden text-gray-600 hover:text-blue-600 p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Icon name={isMobileMenuOpen ? 'x' : 'menu'} size="lg" />
            </button>
          </div>
        </div>

        {/* Bottom Row: Navigation and Action Buttons - Desktop */}
        <div className="hidden md:flex justify-between items-center py-1.5">
          {/* Left: Navigation Links */}
          <nav className="flex items-center space-x-6">
            <a href="#blog" className="text-base text-gray-600 hover:text-primary transition-colors font-medium">
              Blog
            </a>
            <a href="#media-partnerships" className="text-base text-gray-600 hover:text-primary transition-colors font-medium">
              Media Partnerships
            </a>
          </nav>

          {/* Right: Action Buttons */}
          <div className="flex items-center space-x-2">
            {!isAuthenticated ? (
              <>
                <button className="btn-outline-success">
                  Agency Registration
                </button>
                <button className="btn-outline-warning">
                  Editor Registration
                </button>
                <button className="btn-outline-info">
                  Submit Publication
                </button>
                <button onClick={onShowAuth} className="btn-primary">
                  Sign In / Sign Up
                </button>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-600 font-medium">
                  {user?.email || `Welcome, ${user?.first_name}!`}
                </span>
                <button className="btn-outline-info">
                  Submit Publication
                </button>
                <button onClick={logout} className="btn-outline-danger">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-2 space-y-2">
            {/* Navigation Links */}
            <div className="space-y-1">
              <a href="#blog" className="block text-base text-gray-600 hover:text-primary py-1 font-medium">
                Blog
              </a>
              <a href="#media-partnerships" className="block text-base text-gray-600 hover:text-primary py-1 font-medium">
                Media Partnerships
              </a>
            </div>
            
            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              {!isAuthenticated ? (
                <>
                  <button className="w-full btn-outline-success">
                    Agency Registration
                  </button>
                  <button className="w-full btn-outline-warning">
                    Editor Registration
                  </button>
                  <button className="w-full btn-outline-info">
                    Submit Publication
                  </button>
                  <button onClick={onShowAuth} className="w-full btn-primary">
                    Sign In / Sign Up
                  </button>
                </>
              ) : (
                <>
                  <div className="text-sm text-gray-600 font-medium py-1">
                    {user?.email || `Welcome, ${user?.first_name}!`}
                  </div>
                  <button className="w-full btn-outline-info">
                    Submit Publication
                  </button>
                  <button onClick={logout} className="w-full btn-outline-danger">
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Language and Contact Icons - Mobile */}
            <div className="pt-2 space-y-2">
              <div className="flex justify-center items-center space-x-4">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-sm py-2 px-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="en">EN</option>
                  <option value="es">ES</option>
                  <option value="fr">FR</option>
                  <option value="de">DE</option>
                </select>
                {contactIcons.map((icon) => (
                  <a
                    key={icon.name}
                    href={icon.href}
                    aria-label={icon.label}
                    className="text-gray-400 hover:text-primary transition-colors p-2"
                  >
                    <Icon name={icon.name} size="md" />
                  </a>
                ))}
              </div>
            </div>

            {/* Social Media Icons - Mobile */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-center space-x-4">
                {socialMediaIcons.map((icon) => (
                  <a
                    key={icon.name}
                    href={icon.href}
                    aria-label={icon.label}
                    className="text-gray-400 hover:text-primary transition-colors p-2"
                  >
                    <Icon name={icon.name} size="md" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default UserHeader;
