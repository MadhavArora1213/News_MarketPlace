import React from 'react';
import { PenTool, BookOpen, BarChart3, Check } from 'lucide-react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';

const ServicesOverview = () => {
  const services = [
    {
      category: 'Content Creation',
      icon: <PenTool className="w-7 h-7" />,
      description: 'Professional writing and content creation services with AI assistance for superior quality.',
      features: ['AI Writing Assistant', 'Grammar & Style Check', 'Plagiarism Detection', 'SEO Optimization', 'Multi-language Support']
    },
    {
      category: 'Publishing Services',
      icon: <BookOpen className="w-7 h-7" />,
      description: 'Complete publishing and distribution solutions designed for maximum reach and engagement.',
      features: ['Automated Scheduling', 'Social Media Integration', 'Email Marketing', 'Press Release Distribution', 'Custom Branding']
    },
    {
      category: 'Analytics & Insights',
      icon: <BarChart3 className="w-7 h-7" />,
      description: 'Data-driven insights and performance tracking tools for making informed business decisions.',
      features: ['Real-time Dashboards', 'Audience Demographics', 'Engagement Tracking', 'Conversion Analytics', 'Custom Reports']
    }
  ];

  const allServices = [
    'AI Writing Assistant',
    'Grammar & Style Check',
    'Plagiarism Detection',
    'SEO Optimization',
    'Multi-language Support',
    'Automated Scheduling',
    'Social Media Integration',
    'Email Marketing',
    'Press Release Distribution',
    'Custom Branding',
    'Real-time Dashboards',
    'Audience Demographics',
    'Engagement Tracking',
    'Conversion Analytics',
    'Custom Reports'
  ];

  const CheckIcon = () => <Check className="w-5 h-5" />;

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#E3F2FD] via-[#E0F2F1] to-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6 leading-tight">
              Services
              <span className="text-[#1976D2] block mt-1">Overview</span>
            </h1>
            <p className="text-lg text-[#757575] max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover our comprehensive suite of services designed to help you create, publish, and analyze content that drives results. From professional writing to advanced analytics, we provide everything you need to succeed.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-8 shadow-lg border border-[#E0E0E0] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-3xl font-bold text-[#1976D2] mb-2">500+</div>
                <div className="text-[#757575] font-medium">Articles Published</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-8 shadow-lg border border-[#E0E0E0] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-3xl font-bold text-[#1976D2] mb-2">50+</div>
                <div className="text-[#757575] font-medium">Partner Publications</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-8 shadow-lg border border-[#E0E0E0] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-3xl font-bold text-[#1976D2] mb-2">24/7</div>
                <div className="text-[#757575] font-medium">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#212121] mb-6">Service Categories</h2>
            <p className="text-lg text-[#757575] max-w-3xl mx-auto leading-relaxed">
              Choose from our three main service categories, each designed to meet different needs and budgets with professional excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-start mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#1976D2] to-[#0D47A1] rounded-xl flex items-center justify-center mr-4 shadow-md group-hover:scale-105 transition-transform duration-300">
                      <div className="text-white">
                        {service.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#212121] mb-2">{service.category}</h3>
                      <p className="text-[#757575] leading-relaxed text-sm">{service.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <div className="text-[#1976D2] mr-3 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                          <CheckIcon />
                        </div>
                        <span className="text-[#212121] font-medium text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* All Services Grid */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-[#212121] mb-4">Complete Service Portfolio</h2>
                <p className="text-lg text-[#757575] max-w-2xl mx-auto">Comprehensive solutions for all your content and publishing needs</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allServices.map((service, index) => (
                  <div key={index} className="flex items-center p-4 bg-[#F5F5F5] rounded-xl hover:bg-[#E3F2FD] transition-all duration-300 shadow-sm border border-[#E0E0E0] hover:border-[#1976D2] group hover:shadow-md">
                    <div className="text-[#1976D2] mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                      <CheckIcon />
                    </div>
                    <span className="font-medium text-[#212121] group-hover:text-[#1976D2] transition-colors text-sm">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#1976D2] via-[#0D47A1] to-[#004D40] py-16 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-[#E3F2FD] mb-8 leading-relaxed max-w-3xl mx-auto">
            Choose the services that best fit your needs and start creating amazing content today. Join thousands of satisfied customers who trust our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[#1976D2] hover:bg-[#E3F2FD] px-8 py-4 rounded-xl font-bold text-base transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              View All Plans
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-[#1976D2] px-8 py-4 rounded-xl font-bold text-base transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Features Highlight Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#212121] mb-6">Why Choose Our Platform?</h2>
            <p className="text-lg text-[#757575] max-w-3xl mx-auto leading-relaxed">
              Experience the difference with our cutting-edge technology and dedicated support team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "AI-Powered",
                description: "Advanced AI technology for superior content creation",
                icon: "🤖"
              },
              {
                title: "24/7 Support",
                description: "Round-the-clock assistance from our expert team",
                icon: "🛟"
              },
              {
                title: "Secure Platform",
                description: "Enterprise-grade security for your content and data",
                icon: "🔒"
              },
              {
                title: "Proven Results",
                description: "Track record of success with measurable outcomes",
                icon: "📈"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:bg-[#FAFAFA] transition-all duration-300 group">
                <div className="text-3xl mb-4 group-hover:scale-105 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-[#212121] mb-3">{feature.title}</h3>
                <p className="text-[#757575] leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default ServicesOverview;