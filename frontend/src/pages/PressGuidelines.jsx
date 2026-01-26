import React, { useState, useEffect } from 'react';
import Icon from '../components/common/Icon';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import SEO from '../components/common/SEO';
import Schema from '../components/common/Schema';
import Skeleton from '../components/common/Skeleton';
import { useLanguage } from '../context/LanguageContext';

const PressGuidelines = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const contentRequirements = [
    t('press.content.list.0'),
    t('press.content.list.1'),
    t('press.content.list.2'),
    t('press.content.list.3'),
    t('press.content.list.4')
  ];

  const technicalSpecs = [
    t('press.tech.list.0'),
    t('press.tech.list.1'),
    t('press.tech.list.2'),
    t('press.tech.list.3'),
    t('press.tech.list.4')
  ];

  const distributionProcess = [
    t('press.process.list.0'),
    t('press.process.list.1'),
    t('press.process.list.2'),
    t('press.process.list.3'),
    t('press.process.list.4')
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <UserHeader />
        <div className="pt-20 pb-16 text-center px-4 max-w-4xl mx-auto">
          <Skeleton className="h-6 w-32 mx-auto mb-6 rounded-full" />
          <Skeleton className="h-16 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <Skeleton className="w-12 h-12 rounded-xl mb-6" />
                <Skeleton className="h-8 w-1/2 mb-6" />
                <div className="space-y-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16">
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <SEO
        title={t('press.seo.title')}
        description={t('press.seo.desc')}
        keywords={t('press.seo.keywords')}
      />
      <Schema
        type="howto"
        data={{
          title: t('press.main.title'),
          description: t('press.main.desc'),
          steps: distributionProcess.map((step, idx) => ({
            title: `Step ${idx + 1}`,
            description: step
          }))
        }}
      />
      <UserHeader />

      {/* Hero Section */}
      <div className="pt-20 pb-16 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('press.hero.title')}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          {t('press.main.title')}
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
          {t('press.main.desc')}
        </p>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Content Requirements */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Icon name="document-text" size="lg" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">{t('press.content.title')}</h3>
            <ul className="space-y-4">
              {contentRequirements.map((item, index) => (
                <li key={index} className="flex items-start text-slate-600">
                  <Icon name="check-circle" size="sm" className="text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="leading-relaxed text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <Icon name="information-circle" size="lg" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">{t('press.tech.title')}</h3>
            <ul className="space-y-4">
              {technicalSpecs.map((item, index) => (
                <li key={index} className="flex items-start text-slate-600">
                  <Icon name="check-circle" size="sm" className="text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="leading-relaxed text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Distribution Process */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-full hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
              <Icon name="paper-airplane" size="lg" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">{t('press.process.title')}</h3>
            <ul className="space-y-4">
              {distributionProcess.map((item, index) => (
                <li key={index} className="flex items-start text-slate-600">
                  <Icon name="check-circle" size="sm" className="text-emerald-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="leading-relaxed text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-3xl p-8 md:p-12 border border-slate-200 text-center shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="mail" size="xl" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-slate-900">{t('press.contact.title')}</h3>
            <p className="text-slate-600 mb-0 leading-relaxed text-lg">
              {t('press.contact.desc')}
            </p>
          </div>
        </div>

      </div>

      <UserFooter />
    </div>
  );
};

export default PressGuidelines;
