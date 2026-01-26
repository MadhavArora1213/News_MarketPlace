import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import SEO from '../components/common/SEO';
import Skeleton from '../components/common/Skeleton';
import { useLanguage } from '../context/LanguageContext';

const HowItWorks = () => {
  const { t } = useLanguage();
  const [openFAQ, setOpenFAQ] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const steps = [
    {
      id: "01",
      title: t('howItWorks.steps.1.title'),
      description: t('howItWorks.steps.1.desc'),
      icon: "user-plus",
      details: [t('howItWorks.steps.1.details.0', 'Email Validation'), t('howItWorks.steps.1.details.1', 'Identity Check'), t('howItWorks.steps.1.details.2', 'Portfolio Review'), t('howItWorks.steps.1.details.3', 'Instant Approval')]
    },
    {
      id: "02",
      title: t('howItWorks.steps.2.title'),
      description: t('howItWorks.steps.2.desc'),
      icon: "globe-alt",
      details: [t('howItWorks.steps.2.details.0', 'Smart Filters'), t('howItWorks.steps.2.details.1', 'Topic Cluster'), t('howItWorks.steps.2.details.2', 'Journalist Profiles'), t('howItWorks.steps.2.details.3', 'Live Previews')]
    },
    {
      id: "03",
      title: t('howItWorks.steps.3.title'),
      description: t('howItWorks.steps.3.desc'),
      icon: "currency-dollar",
      details: [t('howItWorks.steps.3.details.0', 'Secure Checkout'), t('howItWorks.steps.3.details.1', 'One-Click Buy'), t('howItWorks.steps.3.details.2', 'Manage Subs'), t('howItWorks.steps.3.details.3', 'History Log')]
    },
    {
      id: "04",
      title: t('howItWorks.steps.4.title'),
      description: t('howItWorks.steps.4.desc'),
      icon: "chat-bubble-left",
      details: [t('howItWorks.steps.4.details.0', 'Rate Content'), t('howItWorks.steps.4.details.1', 'Direct Messaging'), t('howItWorks.steps.4.details.2', 'Community Hub'), t('howItWorks.steps.4.details.3', 'Trust Score')]
    }
  ];

  const faqs = [
    {
      question: t('howItWorks.faq.1.q'),
      answer: t('howItWorks.faq.1.a')
    },
    {
      question: t('howItWorks.faq.2.q'),
      answer: t('howItWorks.faq.2.a')
    },
    {
      question: t('howItWorks.faq.3.q'),
      answer: t('howItWorks.faq.3.a')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <UserHeader />
        <div className="pt-12 pb-20 px-6 max-w-5xl mx-auto text-center">
          <Skeleton className="h-4 w-32 mx-auto mb-6" />
          <Skeleton className="h-20 w-3/4 mx-auto mb-8" />
          <Skeleton className="h-10 w-1/2 mx-auto" />
        </div>
        <div className="max-w-5xl mx-auto px-6 pb-24">
          <div className="space-y-16">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-20">
                <Skeleton className="w-28 h-28 rounded-[2rem]" />
                <div className="flex-1">
                  <Skeleton className="h-10 w-1/2 mb-4" />
                  <Skeleton className="h-6 w-full mb-8" />
                  <div className="flex gap-3">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
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
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <SEO
        title={t('howItWorks.seo.title', 'How It Works | News Marketplace')}
        description={t('howItWorks.seo.desc', 'A simple, transparent guide to using our news marketplace.')}
        keywords={t('howItWorks.seo.keywords', 'guide, help, steps, verification')}
      />
      <UserHeader />

      {/* Ultra-Minimal Hero */}
      <div className="pt-12 pb-20 px-6 max-w-5xl mx-auto text-center">
        <p className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-6">
          {t('howItWorks.hero.badge')}
        </p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 mb-8 whitespace-pre-line">
          {t('howItWorks.hero.titleMain', 'Simple, transparent, and ')}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            {t('howItWorks.hero.titleHighlight', 'secure.')}
          </span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          {t('howItWorks.hero.desc')}
        </p>
      </div>

      {/* The Linear Path Section */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="space-y-16">
          {steps.map((step, index) => (
            <div key={index} className="group flex flex-col md:flex-row gap-8 md:gap-20 items-start relative">

              {/* Connector Line (Left) */}
              {index !== steps.length - 1 && (
                <div className="hidden md:block absolute left-[3.5rem] top-24 bottom-[-4rem] w-px bg-slate-100 group-hover:bg-blue-100 transition-colors duration-500"></div>
              )}

              {/* Number & Icon Block */}
              <div className="flex-shrink-0 relative z-10">
                <div className="w-28 h-28 rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:shadow-xl group-hover:shadow-blue-200 transition-all duration-500">
                  <span className="text-2xl font-bold text-slate-300 group-hover:text-blue-400/50 mb-1 transition-colors">
                    {step.id}
                  </span>
                  <Icon name={step.icon} className="w-8 h-8 text-slate-900 group-hover:text-white transition-colors" />
                </div>
              </div>

              {/* Content Block */}
              <div className="flex-1 pt-4">
                <h3 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-xl">
                  {step.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  {step.details.map((detail, i) => (
                    <span key={i} className="inline-flex items-center px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-600 group-hover:border-blue-100 group-hover:bg-blue-50/50 group-hover:text-blue-700 transition-all duration-300">
                      {detail}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Essential FAQ (Minimal) */}
      <div className="bg-slate-50 border-t border-slate-200 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-12 text-center">{t('howItWorks.faq.title')}</h2>
          <div className="grid gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/60 hover:border-slate-300 transition-colors">
                <h3 className="font-bold text-lg text-slate-900 mb-3">{faq.question}</h3>
                <p className="text-slate-500 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-slate-600 mb-6">{t('howItWorks.cta.title')}</p>
            <Link to="/contact-us">
              <button className="px-8 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl">
                {t('howItWorks.cta.button')}
              </button>
            </Link>
          </div>
        </div>
      </div>

      <UserFooter />
    </div>
  );
};

export default HowItWorks;
