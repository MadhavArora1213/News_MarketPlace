import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import useTranslatedText from '../hooks/useTranslatedText';

export default function UserFooter() {
  const socialMediaIcons = [
    { name: 'facebook', href: '#', label: useTranslatedText('Facebook') },
    { name: 'twitter', href: '#', label: useTranslatedText('Twitter') },
    { name: 'linkedin', href: '#', label: useTranslatedText('LinkedIn') },
    { name: 'instagram', href: '#', label: useTranslatedText('Instagram') },
    { name: 'whatsapp', href: '#', label: useTranslatedText('WhatsApp') },
    { name: 'telegram', href: '#', label: useTranslatedText('Telegram') },
    { name: 'youtube', href: '#', label: useTranslatedText('YouTube') }
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <img src="/logo.png" alt={useTranslatedText('Visibility as a Service (VaaS) Solutions Logo')} className="h-12 mr-3" />
              <h3 className="heading-4 text-primary">{useTranslatedText('Visibility as a Service (VaaS) Solutions')}</h3>
            </div>
            <p className="body-regular text-gray-600 mb-4">
              {useTranslatedText('Your trusted platform for news distribution and media partnerships.')}
            </p>
            {/* Social Media */}
            <div className="flex space-x-3">
              {socialMediaIcons.map((icon) => (
                <a
                  key={icon.name}
                  href={icon.href}
                  aria-label={icon.label}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  <Icon name={icon.name} size="sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="heading-4 text-gray-900 mb-4">{useTranslatedText('Legal & Policies')}</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Privacy Policy')}</Link></li>
              <li><Link to="/cookie-policy" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Cookie Policy')}</Link></li>
              <li><Link to="/refund-policy" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Refund Policy')}</Link></li>
              <li><Link to="/terms-and-conditions" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Terms of Service')}</Link></li>
              <li><Link to="/trademark-policy" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Trademark and Logo Policy')}</Link></li>
              <li><Link to="/data-protection" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Data Protection Policy')}</Link></li>
              <li><Link to="/reselling-agreement" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Reselling Agreement')}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="heading-4 text-gray-900 mb-4">{useTranslatedText('Company')}</h4>
            <ul className="space-y-2">
              <li><Link to="/about-us" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('About Us')}</Link></li>
              <li><Link to="/services-overview" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Services Overview')}</Link></li>
              <li><Link to="/how-it-works" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('How It Works')}</Link></li>
              <li><Link to="/blogs" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Blog Section')}</Link></li>
              <li><Link to="/csr" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('CSR')}</Link></li>
              <li><Link to="/careers" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Career')}</Link></li>
              <li><Link to="/contact-us" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Contact US')}</Link></li>
              <li><Link to="/faq" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('FAQ')}</Link></li>
            </ul>
          </div>

          {/* Services & Partnerships */}
          <div>
            <h4 className="heading-4 text-gray-900 mb-4">{useTranslatedText('Services & Partnerships')}</h4>
            <ul className="space-y-2">
              <li><Link to="/agency-registration" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Agency Registration')}</Link></li>
              <li><Link to="/submit-article" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Submit your Publication')}</Link></li>
              <li><Link to="/reporter-registration" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Editor/Contributor Registration')}</Link></li>
              <li><Link to="/event-enquiry" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Media Partnerships for Events')}</Link></li>
              <li><Link to="/press-guidelines" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Press Release Distribution Guidelines')}</Link></li>
              <li><Link to="/affiliate-program" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Affiliate Programme')}</Link></li>
              <li><Link to="/brands-people" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Brands and People Featured')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="body-small text-gray-600 mb-4 md:mb-0">
              {useTranslatedText('© 2024 Visibility as a Service (VaaS) Solutions. All rights reserved.')}
            </p>
            <div className="flex items-center space-x-6">
              <Link to="/privacy-policy" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Privacy')}</Link>
              <Link to="/terms-and-conditions" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Terms')}</Link>
              <Link to="/cookie-policy" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Cookies')}</Link>
              <Link to="/refund-policy" className="body-small text-gray-600 hover:text-primary transition-colors">{useTranslatedText('Refunds')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}