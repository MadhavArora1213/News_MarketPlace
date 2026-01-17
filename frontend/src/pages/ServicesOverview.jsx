import React from 'react';
import { Link } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import SEO from '../components/common/SEO';

const ServicesOverview = () => {
  const services = [
    {
      category: 'Content Creation',
      description: 'Professional writing and content creation services with AI assistance for superior quality.',
      features: ['AI Writing Assistant', 'Grammar & Style Check', 'Plagiarism Detection', 'SEO Optimization', 'Multi-language Support'],
      icon: 'pencil-square',
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      category: 'Publishing Services',
      description: 'Complete publishing and distribution solutions designed for maximum reach and engagement.',
      features: ['Automated Scheduling', 'Social Media Integration', 'Email Marketing', 'Press Release Distribution', 'Custom Branding'],
      icon: 'globe-alt',
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      category: 'Analytics & Insights',
      description: 'Data-driven insights and performance tracking tools for making informed business decisions.',
      features: ['Real-time Dashboards', 'Audience Demographics', 'Engagement Tracking', 'Conversion Analytics', 'Custom Reports'],
      icon: 'presentation-chart-line',
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  const whyChooseFeatures = [
    {
      title: "AI-Powered",
      description: "Advanced artificial intelligence for superior content creation and optimization",
      icon: "cpu-chip",
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock assistance from our expert support team worldwide",
      icon: "chat-bubble-left-right",
    },
    {
      title: "Enterprise Security",
      description: "Military-grade security protocols protecting your valuable content and data",
      icon: "shield-check",
    },
    {
      title: "Proven Results",
      description: "Track record of success with measurable ROI and performance improvements",
      icon: "trending-up",
    }
  ];

  const stats = [
    { number: '500K+', label: 'Content Pieces Created', icon: 'document-text' },
    { number: '50K+', label: 'Active Users', icon: 'users' },
    { number: '99.9%', label: 'Uptime Guarantee', icon: 'lightning-bolt' }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <SEO
        title="Services Overview | News Marketplace"
        description="AI-powered content creation, publishing solutions, and analytics. Transform your content workflow."
        keywords="services, ai content, publishing, analytics"
      />
      <UserHeader />

      {/* Hero Section */}
      <div className="pt-32 pb-24 text-center px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Platform Services</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tighter leading-none">
          Build, Publish, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            & Analyze.
          </span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Discover our comprehensive suite of AI-powered services designed to transform your content creation and publishing workflow.
        </p>
      </div>

      {/* Stats Strip */}
      <div className="border-y border-slate-100 bg-slate-50/50 mb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm">
                  <Icon name={stat.icon} size="md" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black text-slate-900">{stat.number}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alternating Feature Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-32">
        {services.map((service, index) => (
          <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-24`}>

            {/* Visual Side */}
            <div className="w-full lg:w-1/2">
              <div className={`relative rounded-[3rem] ${service.bg} p-12 aspect-square md:aspect-[4/3] flex items-center justify-center group overflow-hidden`}>
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-20 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                {/* Main Icon Card */}
                <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 z-10">
                  <Icon name={service.icon} className={`w-20 h-20 ${service.color}`} />
                </div>

                {/* Floating Feature Badges */}
                <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/50 text-sm font-semibold text-slate-700 hidden md:block animate-bounce" style={{ animationDuration: '3s' }}>
                  {service.features[0]}
                </div>
                <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/50 text-sm font-semibold text-slate-700 hidden md:block animate-bounce" style={{ animationDuration: '4s' }}>
                  {service.features[1]}
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div className="w-full lg:w-1/2">
              <div className="inline-flex items-center gap-2 mb-6">
                <span className={`h-px w-8 ${service.bg.replace('bg-', 'bg-').replace('50', '600')}`}></span>
                <span className={`font-bold uppercase tracking-widest text-xs ${service.color}`}>
                  Service 0{index + 1}
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                {service.category}
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed mb-8 border-l-4 border-slate-100 pl-6">
                {service.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {service.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-1 w-5 h-5 rounded-full ${service.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon name="check" className={`w-3 h-3 ${service.color}`} />
                    </div>
                    <span className="text-slate-700 font-medium">{feat}</span>
                  </div>
                ))}
              </div>

              <button className="mt-10 group inline-flex items-center gap-2 font-bold text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-blue-600 hover:border-blue-600 transition-colors">
                Learn more about {service.category}
                <Icon name="arrow-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Why Choose Section (Grid) */}
      <div className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-slate-500">Experience the difference with cutting-edge technology.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseFeatures.map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-900 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center mb-6 transition-colors">
                  <Icon name={item.icon} size="md" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Large CTA Footer */}
      <div className="relative py-24 overflow-hidden bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Ready to Transform?
          </h2>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
            Join thousands of content creators who have revolutionized their workflow with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-5 bg-slate-900 text-white font-bold rounded-full hover:bg-black transition-all shadow-xl hover:scale-105">
              Start Free Trial
            </button>
            <button className="px-10 py-5 bg-white text-slate-900 border border-slate-200 font-bold rounded-full hover:bg-slate-50 transition-all">
              Schedule Demo
            </button>
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