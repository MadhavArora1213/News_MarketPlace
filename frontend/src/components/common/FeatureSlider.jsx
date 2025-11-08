import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const FeatureSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      id: 1,
      title: "Classified Ads Space",
      subtitle: "Monetize Your Platform",
      icon: "megaphone",
      placeholderIcon: "megaphone",
      color: "success",
      bgGradient: "from-success-light to-success",
      image: "", // Will use icon fallback
      description: "Transform your platform into a revenue-generating powerhouse with our intelligent advertising solutions."
    },
    {
      id: 2,
      title: "Passive Income Opportunities",
      subtitle: "Earn from Content Creation",
      icon: "currency-dollar",
      placeholderIcon: "currency-dollar",
      color: "info",
      bgGradient: "from-info-light to-info",
      image: "", // Will use icon fallback
      description: "Unlock new income streams through our comprehensive content monetization and contributor reward system."
    },
    {
      id: 3,
      title: "Affiliate Programme",
      subtitle: "Partner & Earn Commissions",
      icon: "handshake",
      placeholderIcon: "handshake",
      color: "primary",
      bgGradient: "from-primary-light to-primary",
      image: "", // Will use icon fallback
      description: "Expand your network and earnings potential through our exclusive partnership and referral programmes."
    },
    {
      id: 4,
      title: "Advanced Publishing Tools",
      subtitle: "Professional Content Creation",
      icon: "pencil-square",
      placeholderIcon: "pencil-square",
      color: "warning",
      bgGradient: "from-warning-light to-warning",
      image: "", // Will use icon fallback
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
    <section className="bg-gradient-to-br from-[#E3F2FD] to-[#FAFAFA] py-4 md:py-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="hidden md:block absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/70 backdrop-blur-md text-[#212121] hover:text-[#1976D2] p-2 md:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-white/20"
            aria-label="Previous slide"
          >
            <Icon name="chevron-left" size="md" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:block absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/70 backdrop-blur-md text-[#212121] hover:text-[#1976D2] p-2 md:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-white/20"
            aria-label="Next slide"
          >
            <Icon name="chevron-right" size="md" />
          </button>

          {/* Slider Container */}
          <div className="overflow-hidden rounded-lg md:rounded-xl shadow-lg md:shadow-xl bg-white/70 backdrop-blur-md border border-white/20">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {features.map((feature) => (
                <div key={feature.id} className="w-full flex-shrink-0">
                  <div className="bg-white/60 backdrop-blur-sm relative min-h-[300px] md:h-64 lg:h-72 border border-white/10">
                    <div className="flex flex-col md:flex-row h-full">
                      {/* Image Section - Full width on mobile, 1/3 on desktop */}
                      <div className="w-full md:w-1/3 relative h-32 md:h-full">
                        {/* Icon Fallback - Always show */}
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center md:border-r border-white/20">
                          <div className="text-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-3 bg-gradient-to-r from-[#1976D2] to-[#0D47A1] rounded-lg flex items-center justify-center">
                              <Icon name={feature.placeholderIcon} size="lg" className="text-white md:text-xl" />
                            </div>
                            <p className="text-xs md:text-sm text-[#212121] font-medium px-2">{feature.title}</p>
                          </div>
                        </div>
                      </div>

                      {/* Content Section - Full width on mobile, 2/3 on desktop */}
                      <div className="w-full md:w-2/3 p-3 md:p-4 lg:p-6 flex flex-col justify-center">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-3 md:mb-4">
                          <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br from-[#1976D2] to-[#0D47A1] mb-2 sm:mb-0 sm:mr-3 md:mr-4 shadow-md md:shadow-lg border border-white/20 transform rotate-1 hover:rotate-0 transition-transform duration-300`}>
                            <Icon name={feature.icon} size="md" className="text-white md:text-lg" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-[#212121] mb-1 leading-tight">{feature.title}</h3>
                            <p className="text-sm md:text-base lg:text-lg text-[#757575] font-semibold">{feature.subtitle}</p>
                          </div>
                        </div>

                        <p className="text-[#212121] leading-relaxed mb-4 md:mb-6 text-sm md:text-base lg:text-lg">
                          {feature.description}
                        </p>

                        <div className="space-y-3">
                          <button className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-white/70 backdrop-blur-sm text-[#212121] border-2 border-[#1976D2] hover:bg-[#1976D2] hover:text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 text-sm md:text-base">
                            Learn More
                          </button>

                          {/* Feature Highlights */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 lg:gap-4 text-xs md:text-sm text-[#757575] mt-3 md:mt-4">
                            <div className="flex items-center justify-center sm:justify-start">
                              <Icon name="check-circle" size="xs" className="text-[#4CAF50] mr-1 flex-shrink-0" />
                              <span className="whitespace-nowrap">Easy Setup</span>
                            </div>
                            <div className="flex items-center justify-center sm:justify-start">
                              <Icon name="check-circle" size="xs" className="text-[#4CAF50] mr-1 flex-shrink-0" />
                              <span className="whitespace-nowrap">24/7 Support</span>
                            </div>
                            <div className="flex items-center justify-center sm:justify-start">
                              <Icon name="check-circle" size="xs" className="text-[#4CAF50] mr-1 flex-shrink-0" />
                              <span className="whitespace-nowrap">Instant Results</span>
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
        </div>
      </div>
    </section>
  );
};

export default FeatureSlider;