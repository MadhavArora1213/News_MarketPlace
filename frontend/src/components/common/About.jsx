import React from 'react';
import Icon from './Icon';
import CosmicButton from './CosmicButton';

const About = () => {
  const stats = [
    { number: "10M+", label: "Articles Published", icon: "document-text" },
    { number: "500K+", label: "Content Creators", icon: "users" },
    { number: "150+", label: "Countries Reached", icon: "globe-alt" },
    { number: "99.9%", label: "Success Rate", icon: "check-circle" }
  ];

  const features = [
    {
      icon: "newspaper",
      title: "Premium Content",
      description: "Access high-quality, verified news content from trusted sources worldwide."
    },
    {
      icon: "user-group",
      title: "Global Community",
      description: "Connect with writers, editors, and readers from across the globe."
    },
    {
      icon: "shield-check",
      title: "Verified Publishing",
      description: "Guaranteed publication with transparent pricing and quality assurance."
    }
  ];

  return (
    <section className="py-8 bg-[#E3F2FD] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#1976D2]/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#1976D2]/10 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#FFFFFF]/20 rounded-full blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#212121] mb-8 leading-tight">
            About <span className="text-[#1976D2]">News MarketPlace</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#757575] max-w-4xl mx-auto leading-relaxed font-light">
            We're revolutionizing digital publishing by connecting content creators with global audiences through innovative, transparent, and efficient platforms.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <div className="w-16 h-1 bg-[#1976D2] rounded-full"></div>
            <div className="w-8 h-1 bg-[#42A5F5] rounded-full"></div>
            <div className="w-4 h-1 bg-[#90CAF9] rounded-full"></div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#FFFFFF] rounded-2xl p-8 text-center shadow-lg border border-[#E0E0E0] hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#1976D2]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-[#1976D2] to-[#42A5F5] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                  <Icon name={stat.icon} size="xl" className="text-[#FFFFFF]" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-[#212121] mb-3 group-hover:text-[#1976D2] transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-[#757575] uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6">
              Why Choose Us
            </h2>
            <p className="text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed">
              Discover the features that make News MarketPlace the preferred platform for content creators worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#FFFFFF] rounded-3xl p-10 text-center shadow-xl border border-[#E0E0E0] hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1976D2]/5 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-gradient-to-br group-hover:from-[#1976D2] group-hover:to-[#42A5F5] transition-all duration-500 shadow-lg transform group-hover:scale-110">
                    <Icon name={feature.icon} size="2xl" className="text-[#1976D2] group-hover:text-[#FFFFFF] transition-colors duration-300" />
                  </div>
                  <h3 className="text-3xl font-bold text-[#212121] mb-6 group-hover:text-[#1976D2] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-[#757575] leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-[#FFFFFF] rounded-3xl p-12 md:p-16 shadow-2xl border border-[#E0E0E0] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#E3F2FD]/30 to-transparent"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-8">
                Our Mission
              </h2>
              <p className="text-xl text-[#757575] leading-relaxed mb-10">
                To democratize publishing by providing creators with the tools, platform, and audience they need to share their stories with the world. We believe in transparent, fair, and accessible media for everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <CosmicButton variant="small" textColor="#000000" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  Learn More About Us
                </CosmicButton>
                <CosmicButton variant="small" textColor="#000000" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  Join Our Community
                </CosmicButton>
              </div>
            </div>
            <div className="text-center relative">
              <div className="absolute inset-0 bg-[#1976D2]/10 rounded-2xl blur-2xl"></div>
              <section
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  aspectRatio: '1213/667',
                  backgroundColor: '#E3F2FD',
                  maskImage:
                    "url(\"data:image/svg+xml,%3Csvg width='221' height='122' viewBox='0 0 221 122' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fillRule='evenodd' clipRule='evenodd' d='M183 4C183 1.79086 184.791 0 187 0H217C219.209 0 221 1.79086 221 4V14V28V99C221 101.209 219.209 103 217 103H182C179.791 103 178 104.791 178 107V118C178 120.209 176.209 122 174 122H28C25.7909 122 24 120.209 24 118V103V94V46C24 43.7909 22.2091 42 20 42H4C1.79086 42 0 40.2091 0 38V18C0 15.7909 1.79086 14 4 14H24H43H179C181.209 14 183 12.2091 183 10V4Z' fill='%23D9D9D9'/%3E%3C/svg%3E%0A\")",
                  WebkitMaskImage:
                    "url(\"data:image/svg+xml,%3Csvg width='221' height='122' viewBox='0 0 221 122' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fillRule='evenodd' clipRule='evenodd' d='M183 4C183 1.79086 184.791 0 187 0H217C219.209 0 221 1.79086 221 4V14V28V99C221 101.209 219.209 103 217 103H182C179.791 103 178 104.791 178 107V118C178 120.209 176.209 122 174 122H28C25.7909 122 24 120.209 24 118V103V94V46C24 43.7909 22.2091 42 20 42H4C1.79086 42 0 40.2091 0 38V18C0 15.7909 1.79086 14 4 14H24H43H179C181.209 14 183 12.2091 183 10V4Z' fill='%23D9D9D9'/%3E%3C/svg%3E%0A\")",
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                }}>
                <img
                  src="https://images.unsplash.com/photo-1433838552652-f9a46b332c40?q=80&w=2070&auto=format&fit=crop"
                  alt="Global publishing network"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;