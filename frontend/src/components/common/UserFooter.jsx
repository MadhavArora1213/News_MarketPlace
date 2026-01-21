import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import { useLanguage } from '../../context/LanguageContext';

export default function UserFooter() {
  const { t, language } = useLanguage();

  const legalLinks = [
    { name: t("Privacy Policy"), href: "/privacy-policy" },
    { name: t("Cookie Policy"), href: "/cookie-policy" },
    { name: t("Refund Policy"), href: "/refund-policy" },
    { name: t("Terms of Service"), href: "/terms-and-conditions" },
    { name: t("Trademark and Logo Policy"), href: "/trademark-policy" },
    { name: t("Data Protection Policy"), href: "/data-protection" },
    { name: t("Reselling Agreement"), href: "/reselling-agreement" },
  ];

  const companyLinks = [
    { name: t("About Us"), href: "/about-us" },
    { name: t("Services Overview"), href: "/services-overview" },
    { name: t("Blog Section"), href: "/blogs" },
    { name: t("CSR"), href: "/csr" },
    { name: t("Career"), href: "/careers" },
    { name: t("Contact US"), href: "/contact-us" },
    { name: t("FAQ"), href: "/faq" },
  ];

  const services = [
    { name: t("Submit your Publication"), href: "/website-submission" },
    { name: t("Editor/Contributor Registration"), href: "/reporter-registration" },
    { name: t("Media Partnerships for Events"), href: "/event-enquiry" },
    { name: t("Press Release Distribution Guidelines"), href: "/press-guidelines" },
    { name: t("Affiliate Programme"), href: "/affiliate-program" },
    { name: t("Brands and People Featured"), href: "/brands-people" },
  ];

  const socialMediaIcons = [
    { name: 'facebook', href: 'https://vaas.solutions', label: 'Facebook' },
    { name: 'x-logo', href: 'https://vaas.solutions', label: 'X' },
    { name: 'linkedin', href: 'https://www.linkedin.com/company/visibilityasaservice/', label: 'LinkedIn' },
    { name: 'instagram', href: 'https://www.instagram.com/vaas.solutions', label: 'Instagram' },
    { name: 'whatsapp', href: 'https://whatsapp.com/channel/0029VbBpPm2J3juzI0r3wy11', label: t('WhatsApp') },
    { name: 'telegram', href: 'https://t.me/visibilityasaservice', label: t('Telegram') },
    { name: 'youtube', href: 'https://vaas.solutions', label: 'YouTube' },
    { name: 'tiktok', href: 'https://vaas.solutions', label: 'TikTok' }
  ];

  const isRTL = language === 'ar';

  return (
    <footer className={`bg-gray-50 border-t border-gray-200 py-8 md:py-12 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8">
          {/* Company Info */}
          <div className={`${isRTL ? 'lg:pl-8' : 'lg:pr-8'}`}>
            <div className={`flex items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <img src="/logo.png" alt="Visibility as a Service (VaaS) Solutions Logo" className={`h-12 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              <h3 className="heading-4 text-primary font-bold">{t('Visibility as a Service (VaaS) Solutions')}</h3>
            </div>
            <p className="body-regular text-gray-600 mb-6 leading-relaxed">
              {t('Your trusted platform for news distribution and media partnerships.')}
            </p>
            {/* Social Media */}
            <div className={`flex flex-wrap gap-3 ${isRTL ? 'justify-start' : 'justify-start'}`}>
              {socialMediaIcons.map((icon) => (
                <a
                  key={icon.name}
                  href={icon.href}
                  aria-label={icon.label}
                  className="text-gray-500 hover:text-[#1976D2] transition-all duration-300 hover:scale-110 p-2 bg-white rounded-lg shadow-sm border border-gray-100"
                >
                  <Icon name={icon.name} size="xs" />
                </a>
              ))}
            </div>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="heading-4 text-gray-900 mb-6 font-bold pb-2 border-b border-gray-100 inline-block">{t('Legal & Policies')}</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="body-small text-gray-600 hover:text-[#1976D2] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="heading-4 text-gray-900 mb-6 font-bold pb-2 border-b border-gray-100 inline-block">{t('Company')}</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="body-small text-gray-600 hover:text-[#1976D2] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services & Partnerships */}
          <div>
            <h4 className="heading-4 text-gray-900 mb-6 font-bold pb-2 border-b border-gray-100 inline-block">{t('Services & Partnerships')}</h4>
            <ul className="space-y-3">
              {services.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="body-small text-gray-600 hover:text-[#1976D2] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className={`flex flex-col md:flex-row justify-between items-center ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <p className="body-small text-gray-600 mb-4 md:mb-0">
              {t('© 2026 Visibility as a Service (VaaS) Solutions. All rights reserved.')}
            </p>
            <div className={`flex items-center space-x-6 ${isRTL ? 'space-x-reverse' : ''}`}>
              <Link to="/privacy-policy" className="body-small text-gray-600 hover:text-[#1976D2] transition-colors">{t('Privacy')}</Link>
              <Link to="/terms-and-conditions" className="body-small text-gray-600 hover:text-[#1976D2] transition-colors">{t('Terms')}</Link>
              <Link to="/cookie-policy" className="body-small text-gray-600 hover:text-[#1976D2] transition-colors">{t('Cookies')}</Link>
              <Link to="/refund-policy" className="body-small text-gray-600 hover:text-[#1976D2] transition-colors">{t('Refunds')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}