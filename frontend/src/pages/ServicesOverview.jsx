import React from 'react';
import { Link } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import SEO from '../components/common/SEO';

const ServicesOverview = () => {
  const services = [
    {
      step: "01",
      category: 'Content Creation',
      description: 'Professional writing and content creation services with AI assistance for superior quality.',
      features: ['AI Writing Assistant', 'Grammar & Style Check', 'Plagiarism Detection', 'SEO Optimization'],
      icon: 'document-text',
    },
    {
      step: "02",
      category: 'Publishing Services',
      description: 'Complete publishing and distribution solutions designed for maximum reach and engagement.',
      features: ['Automated Scheduling', 'Social Media Integration', 'Press Release Distribution', 'Custom Branding'],
      icon: 'share',
    },
    {
      step: "03",
      category: 'Analytics & Insights',
      description: 'Data-driven insights and performance tracking tools for making informed business decisions.',
      features: ['Real-time Dashboards', 'Audience Demographics', 'Conversion Analytics', 'Custom Reports'],
      icon: 'chart-bar',
    }
  ];

  const stats = [
    { number: '500K+', label: 'Content Pieces', icon: 'document-duplicate' },
    { number: '50K+', label: 'Active Users', icon: 'user-group' },
    { number: '99%', label: 'Uptime', icon: 'server' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <SEO
        title="Services Overview | News Marketplace"
        description="AI-powered content creation, publishing solutions, and analytics. Transform your content workflow."
        keywords="services, ai content, publishing, analytics"
      />
      <UserHeader />

      {/* Compact Hero */}
      <div className="pt-20 pb-16 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">End-to-End Platform</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          The Content Workflow.
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
          From creation to distribution and analysis. One seamless process.
        </p>
      </div>

      {/* Process Flow Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[60px] left-0 w-full h-0.5 bg-slate-200 -z-10"></div>

          <div className="grid lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="relative group">
                {/* Step Marker */}
                <div className="w-full flex justify-center mb-8">
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-slate-50 shadow-sm flex items-center justify-center relative z-10 group-hover:border-blue-100 group-hover:scale-110 transition-all duration-300">
                    <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon name={service.icon} size="xl" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
                      {service.step}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 h-full text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.category}</h3>
                  <p className="text-slate-500 leading-relaxed mb-6 text-sm">
                    {service.description}
                  </p>

                  <div className="space-y-3 text-left bg-slate-50 rounded-2xl p-6">
                    {service.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Icon name="check" className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-semibold text-slate-700">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integrated Stats & CTA */}
      <div className="bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden relative text-white">
            {/* Abstract BG */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-6">Proven Impact</h2>
                <div className="flex gap-8 justify-center md:justify-start">
                  {stats.map((stat, idx) => (
                    <div key={idx}>
                      <div className="text-3xl font-black text-blue-400 mb-1">{stat.number}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px md:h-24 w-full md:w-px bg-slate-800"></div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-4">Start Now</h2>
                <p className="text-slate-400 mb-8 max-w-md">
                  Join thousands of creators revolutionizing their workflow.
                </p>
                <div className="flex gap-4 justify-center md:justify-start">
                  <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
                    Get Started
                  </button>
                  <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">
                    View Pricing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 bg-white">
        <UserFooter />
      </div>
    </div>
  );
};

export default ServicesOverview;