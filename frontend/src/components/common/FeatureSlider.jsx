import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const FeatureSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      id: 1,
      title: "Classified Ads Space",
      subtitle: "Monetize Your Platform",
      icon: "tag",
      placeholderIcon: "bullhorn",
      color: "emerald",
      bgGradient: "from-emerald-400 to-teal-500",
      description: "Transform your platform into a revenue-generating powerhouse with our intelligent advertising solutions."
    },
    {
      id: 2,
      title: "Passive Income Opportunities",
      subtitle: "Earn from Content Creation",
      icon: "trending-up",
      placeholderIcon: "chart-bar",
      color: "purple",
      bgGradient: "from-purple-400 to-pink-500",
      description: "Unlock new income streams through our comprehensive content monetization and contributor reward system."
    },
    {
      id: 3,
      title: "Affiliate Programme",
      subtitle: "Partner & Earn Commissions",
      icon: "users",
      placeholderIcon: "handshake",
      color: "blue",
      bgGradient: "from-blue-400 to-indigo-500",
      description: "Expand your network and earnings potential through our exclusive partnership and referral programmes."
    },
    {
      id: 4,
      title: "Advanced Publishing Tools",
      subtitle: "Professional Content Creation",
      icon: "cog",
      placeholderIcon: "document-text",
      color: "orange",
      bgGradient: "from-orange-400 to-red-500",
      description: "Elevate your content creation with cutting-edge tools designed for modern digital publishing."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  // Auto-slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-16 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="heading-2 text-gray-900 mb-4">Platform Features</h2>
          <p className="body-large text-gray-600 max-w-2xl mx-auto">
            Discover powerful tools and opportunities designed to maximize your success on our news marketplace platform.
          </p>
        </div>

        <div className="relative">
          {/* Slider Container */}
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {features.map((feature) => (
                <div key={feature.id} className="w-full flex-shrink-0">
                  <div className="bg-white relative">
                    <div className="md:flex">
                      {/* Icon Placeholder Section */}
                      <div className="md:w-1/2 relative">
                        <div className={`h-64 md:h-80 bg-gradient-to-br ${feature.bgGradient} flex flex-col items-center justify-center relative overflow-hidden`}>
                          {/* Background Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                            }}></div>
                          </div>
                          
                          {/* Main Icon */}
                          <div className="relative z-10 mb-4">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border border-white/30">
                              <Icon name={feature.placeholderIcon} size="2xl" className="text-white" />
                            </div>
                          </div>
                          
                          {/* Floating Icons */}
                          <div className="absolute top-6 left-6 opacity-20">
                            <Icon name="star" size="lg" className="text-white" />
                          </div>
                          <div className="absolute top-12 right-8 opacity-20">
                            <Icon name="lightning-bolt" size="md" className="text-white" />
                          </div>
                          <div className="absolute bottom-8 left-8 opacity-20">
                            <Icon name="heart" size="md" className="text-white" />
                          </div>
                          <div className="absolute bottom-12 right-6 opacity-20">
                            <Icon name="sparkles" size="lg" className="text-white" />
                          </div>
                          
                          {/* Title Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm text-white p-4">
                            <h4 className="text-lg font-bold">{feature.title}</h4>
                            <p className="text-sm opacity-90">{feature.subtitle}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Content Section */}
                      <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
                        <div className="flex items-center mb-6">
                          <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.bgGradient} mr-6 shadow-lg border border-gray-100 transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
                            <Icon name={feature.icon} size="xl" className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-lg text-gray-600 font-semibold">{feature.subtitle}</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                          {feature.description}
                        </p>
                        
                        <div className="space-y-4">
                          <button className={`w-full md:w-auto px-8 py-3 bg-gradient-to-r ${feature.bgGradient} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300`}>
                            Learn More
                          </button>
                          
                          {/* Feature Highlights */}
                          <div className="flex items-center space-x-6 text-sm text-gray-500 mt-6">
                            <div className="flex items-center">
                              <Icon name="check-circle" size="sm" className="text-green-500 mr-2" />
                              <span>Easy Setup</span>
                            </div>
                            <div className="flex items-center">
                              <Icon name="check-circle" size="sm" className="text-green-500 mr-2" />
                              <span>24/7 Support</span>
                            </div>
                            <div className="flex items-center">
                              <Icon name="check-circle" size="sm" className="text-green-500 mr-2" />
                              <span>Instant Results</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 z-20"
            aria-label="Previous slide"
          >
            <Icon name="chevron-left" size="lg" className="text-gray-700 hover:text-blue-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 z-20"
            aria-label="Next slide"
          >
            <Icon name="chevron-right" size="lg" className="text-gray-700 hover:text-blue-600" />
          </button>

          {/* Enhanced Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-4">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`relative transition-all duration-300 group ${
                  index === currentSlide
                    ? 'scale-125'
                    : 'hover:scale-110'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? `bg-gradient-to-r ${feature.bgGradient} shadow-lg`
                    : 'bg-gray-300 hover:bg-gray-400 group-hover:shadow-md'
                }`} />
                {index === currentSlide && (
                  <div className={`absolute inset-0 w-4 h-4 rounded-full bg-gradient-to-r ${feature.bgGradient} opacity-50 animate-ping`} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSlider;