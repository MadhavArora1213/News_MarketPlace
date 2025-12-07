import React from 'react';
import { useNavigate } from 'react-router-dom';
import CosmicButton from './CosmicButton';
import useTranslatedText from '../../hooks/useTranslatedText';

const RadioSimplified = () => {
  const navigate = useNavigate();

  // Translated texts
  const radioTitle = useTranslatedText('Radio');
  const radioDesc = useTranslatedText('Explore our radio programs and connect with our broadcasting network.');
  const viewRadioText = useTranslatedText('View Radio Programs');

  return (
    <section className="py-4 md:py-6 lg:py-8 bg-[#E3F2FD] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-10 left-5 w-16 h-16 bg-[#1976D2]/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-10 right-5 w-20 h-20 bg-[#FFFFFF]/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-[#1976D2]/5 rounded-full blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-4 md:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#212121] mb-3 md:mb-4 leading-tight tracking-tight">
            {radioTitle}
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#757575] max-w-4xl mx-auto leading-relaxed font-light px-4 md:px-0">
            Explore our radio programs and connect with broadcasting network. Access live shows, interviews, and discussions. Discover diverse content and entertainment options. Connect with hosts and participate in live broadcasts. Enhance your media presence through our radio network.
          </p>
          <div className="mt-4 md:mt-6 flex justify-center space-x-2 md:space-x-3">
            <div className="w-16 h-1.5 md:w-20 bg-gradient-to-r from-[#1976D2] to-[#42A5F5] rounded-full"></div>
            <div className="w-8 h-1.5 md:w-10 bg-gradient-to-r from-[#42A5F5] to-[#90CAF9] rounded-full"></div>
            <div className="w-4 h-1.5 md:w-6 bg-gradient-to-r from-[#90CAF9] to-[#E3F2FD] rounded-full"></div>
          </div>
        </div>

        {/* Different Card with Button */}
        <div className="text-center mb-6">
          <div className="bg-gradient-to-br from-[#F44336] to-[#D32F2F] rounded-3xl p-4 md:p-6 lg:p-8 shadow-2xl border border-white/30 relative overflow-hidden w-full">
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 transition-colors duration-500">
                Discover Our Radio Programs
              </h3>
              <p className="text-white/90 leading-relaxed text-sm md:text-base mb-4">
                Tune in to live broadcasts and connect with our global radio network.
              </p>
              <CosmicButton
                variant="small"
                textColor="#ffffff"
                className="shadow-lg hover:shadow-xl hover:transform hover:translate-y-1 transition-all duration-500 text-sm md:text-base"
                onClick={() => navigate('/radio')}
              >
                {viewRadioText}
              </CosmicButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RadioSimplified;