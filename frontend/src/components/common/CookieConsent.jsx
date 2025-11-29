import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import useTranslatedText from '../../hooks/useTranslatedText';
import { initializeAnalytics, initializeMarketing } from '../../utils/cookieUtils';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Translated texts
  const cookieTitle = useTranslatedText('Cookie Preferences');
  const cookieDescription = useTranslatedText('We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.');
  const acceptAllText = useTranslatedText('Accept All Cookies');
  const rejectAllText = useTranslatedText('Reject All Cookies');
  const customizeText = useTranslatedText('Customize Settings');
  const necessaryCookiesText = useTranslatedText('Necessary Cookies');
  const necessaryDesc = useTranslatedText('Required for the website to function properly. Cannot be disabled.');
  const analyticsCookiesText = useTranslatedText('Analytics Cookies');
  const analyticsDesc = useTranslatedText('Help us understand how visitors interact with our website.');
  const marketingCookiesText = useTranslatedText('Marketing Cookies');
  const marketingDesc = useTranslatedText('Used to deliver personalized advertisements.');
  const savePreferencesText = useTranslatedText('Save Preferences');
  const privacyPolicyText = useTranslatedText('Privacy Policy');
  const cookiePolicyText = useTranslatedText('Cookie Policy');

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
      consentId: generateConsentId()
    };

    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShowBanner(false);

    // Set actual cookies based on preferences
    setCookiePreferences(preferences);
  };

  const handleRejectAll = () => {
    const preferences = {
      necessary: true, // Always true for necessary cookies
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      consentId: generateConsentId()
    };

    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShowBanner(false);

    // Set actual cookies based on preferences
    setCookiePreferences(preferences);

    // Initialize tracking services based on consent
    if (preferences.analytics) {
      initializeAnalytics();
    }
    if (preferences.marketing) {
      initializeMarketing();
    }
  };

  const handleSavePreferences = (preferences) => {
    const fullPreferences = {
      ...preferences,
      timestamp: new Date().toISOString(),
      consentId: generateConsentId()
    };

    localStorage.setItem('cookieConsent', JSON.stringify(fullPreferences));
    setShowBanner(false);
    setShowDetails(false);

    // Set actual cookies based on preferences
    setCookiePreferences(fullPreferences);

    // Initialize tracking services based on consent
    if (fullPreferences.analytics) {
      initializeAnalytics();
    }
    if (fullPreferences.marketing) {
      initializeMarketing();
    }
  };

  const generateConsentId = () => {
    return 'consent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const setCookiePreferences = (preferences) => {
    // Set analytics cookies if accepted
    if (preferences.analytics) {
      document.cookie = "analytics_consent=true; path=/; max-age=31536000"; // 1 year
      // Here you would initialize analytics services like Google Analytics
    }

    // Set marketing cookies if accepted
    if (preferences.marketing) {
      document.cookie = "marketing_consent=true; path=/; max-age=31536000"; // 1 year
      // Here you would initialize marketing services
    }

    // Always set necessary cookies
    document.cookie = "necessary_consent=true; path=/; max-age=31536000"; // 1 year
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1976D2]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="shield-check" size="sm" className="text-[#1976D2]" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-[#212121] truncate">{cookieTitle}</h3>
              </div>
              <p className="text-xs sm:text-sm text-[#757575] leading-relaxed max-w-2xl pr-2">
                {cookieDescription}
              </p>
              <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-xs text-[#757575] flex-wrap">
                <a href="/privacy-policy" className="hover:text-[#1976D2] underline whitespace-nowrap">{privacyPolicyText}</a>
                <a href="/cookie-policy" className="hover:text-[#1976D2] underline whitespace-nowrap">{cookiePolicyText}</a>
              </div>
            </div>

            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowDetails(true)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[#1976D2] border border-[#1976D2] rounded-lg hover:bg-[#1976D2]/10 transition-colors whitespace-nowrap"
              >
                {customizeText}
              </button>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleRejectAll}
                  className="flex-1 xs:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[#757575] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  {rejectAllText}
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 xs:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-white bg-[#1976D2] rounded-lg hover:bg-[#0D47A1] transition-colors whitespace-nowrap"
                >
                  {acceptAllText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Cookie Settings Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-sm sm:max-w-md md:max-w-2xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#212121] pr-2">{cookieTitle}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <Icon name="x" size="md" className="text-[#757575]" />
                </button>
              </div>

              <CookieSettingsForm onSave={handleSavePreferences} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Cookie Settings Form Component
const CookieSettingsForm = ({ onSave }) => {
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true
    analytics: false,
    marketing: false
  });

  const necessaryCookiesText = useTranslatedText('Necessary Cookies');
  const necessaryDesc = useTranslatedText('Required for the website to function properly. Cannot be disabled.');
  const analyticsCookiesText = useTranslatedText('Analytics Cookies');
  const analyticsDesc = useTranslatedText('Help us understand how visitors interact with our website.');
  const marketingCookiesText = useTranslatedText('Marketing Cookies');
  const marketingDesc = useTranslatedText('Used to deliver personalized advertisements.');
  const savePreferencesText = useTranslatedText('Save Preferences');

  const handleToggle = (type) => {
    if (type === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Necessary Cookies */}
      <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-[#4CAF50] rounded flex items-center justify-center flex-shrink-0">
            <Icon name="check" size="xs" className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[#212121] text-sm sm:text-base">{necessaryCookiesText}</h3>
            <p className="text-xs sm:text-sm text-[#757575] mt-1 leading-relaxed">{necessaryDesc}</p>
          </div>
        </div>
        <div className="text-xs sm:text-sm text-[#757575] font-medium whitespace-nowrap">Always Active</div>
      </div>

      {/* Analytics Cookies */}
      <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
        <button
          onClick={() => handleToggle('analytics')}
          className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
            preferences.analytics
              ? 'bg-[#1976D2] border-[#1976D2]'
              : 'border-gray-300'
          }`}
        >
          {preferences.analytics && <Icon name="check" size="xs" className="text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#212121] text-sm sm:text-base">{analyticsCookiesText}</h3>
          <p className="text-xs sm:text-sm text-[#757575] mt-1 leading-relaxed">{analyticsDesc}</p>
        </div>
      </div>

      {/* Marketing Cookies */}
      <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
        <button
          onClick={() => handleToggle('marketing')}
          className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
            preferences.marketing
              ? 'bg-[#1976D2] border-[#1976D2]'
              : 'border-gray-300'
          }`}
        >
          {preferences.marketing && <Icon name="check" size="xs" className="text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#212121] text-sm sm:text-base">{marketingCookiesText}</h3>
          <p className="text-xs sm:text-sm text-[#757575] mt-1 leading-relaxed">{marketingDesc}</p>
        </div>
      </div>

      <div className="flex justify-end pt-3 sm:pt-4 border-t border-gray-200">
        <button
          onClick={() => onSave(preferences)}
          className="px-4 sm:px-6 py-2 bg-[#1976D2] text-white font-medium rounded-lg hover:bg-[#0D47A1] transition-colors text-sm sm:text-base"
        >
          {savePreferencesText}
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;