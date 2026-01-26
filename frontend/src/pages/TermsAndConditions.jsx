import React, { useState, useEffect } from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import Skeleton from '../components/common/Skeleton';
import { useLanguage } from '../context/LanguageContext';

const TermsAndConditions = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const termsPoints = Array.from({ length: 28 }, (_, i) => ({
    title: t(`terms.point${i + 1}.title`),
    content: t(`terms.point${i + 1}.content`)
  }));

  const additionalRestrictions = Array.from({ length: 7 }, (_, i) =>
    t(`terms.restrictions.${i}`)
  );

  // Search Logic
  const filteredTerms = termsPoints.filter(term =>
    term.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <UserHeader />
        <div className="relative z-10 pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-6 w-1/2 mx-auto mb-10" />
            <Skeleton className="h-12 w-full max-w-lg mx-auto rounded-full" />
          </div>
          <div className="space-y-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                  <div className="md:w-1/3">
                    <Skeleton className="h-6 w-full mb-4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="md:w-2/3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <UserHeader />

      {/* Subtle Textured Background */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
      </div>

      <div className="relative z-10 pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            {t('terms.heroTitle')}
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            {t('terms.heroDesc')}
          </p>

          {/* Search Field */}
          <div className="mt-10 max-w-lg mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Icon name="magnifying-glass" className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder={t('terms.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-full text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        {/* Editorial List Layout */}
        <div className="space-y-8">
          {filteredTerms.map((term, index) => (
            <div key={index} className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                {/* Left Column: Index & Title */}
                <div className="md:w-1/3 flex-shrink-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-xs font-bold text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {(index + 1)}
                    </span>
                    <div className="h-px flex-1 bg-slate-100 group-hover:bg-blue-100 transition-colors"></div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                    {term.title}
                  </h3>
                </div>

                {/* Right Column: Content */}
                <div className="md:w-2/3">
                  <p className="text-slate-600 leading-relaxed text-base font-normal">
                    {term.content}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredTerms.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <Icon name="exclamation-circle" className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">{t('terms.noResults')} "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                {t('terms.viewAll')}
              </button>
            </div>
          )}
        </div>

        {/* Additional Restrictions Section */}
        <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-slate-200">
          <div className="flex flex-col md:flex-row gap-8 md:items-start">
            <div className="md:w-1/3">
              <div className="inline-block p-3 bg-white/10 rounded-xl mb-4 backdrop-blur-sm">
                <Icon name="shield-check" className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{t('terms.serviceRestrictions')}</h2>
              <p className="text-slate-400 text-sm">{t('terms.serviceRestrictionsDesc')}</p>
            </div>

            <div className="md:w-2/3">
              <div className="grid sm:grid-cols-2 gap-4">
                {additionalRestrictions.map((r, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Icon name="x-circle" className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-200 text-sm font-medium">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-16 text-center border-t border-slate-200 pt-8">
          <p className="text-slate-400 text-sm">
            {t('terms.lastUpdate')} <span className="text-slate-900 font-semibold">{t('terms.lastUpdateValue')}</span>
          </p>
        </div>
      </div>

      <div className="relative z-20 bg-white">
        <UserFooter />
      </div>
    </div>
  );
};

export default TermsAndConditions;
