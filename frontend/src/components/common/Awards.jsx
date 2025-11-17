import React from 'react';
import Icon from './Icon';
import CosmicButton from './CosmicButton';

const Awards = () => {
  const awards = [
    {
      id: 1,
      title: "Excellence in Digital Publishing",
      year: "2024",
      category: "Innovation",
      recipient: "News MarketPlace",
      description: "Recognized for revolutionizing content distribution through innovative platform solutions.",
      icon: "trophy",
      color: "from-yellow-400 to-yellow-600"
    },
    {
      id: 2,
      title: "Best Media Partnership Platform",
      year: "2024",
      category: "Partnerships",
      recipient: "News MarketPlace",
      description: "Awarded for creating the most effective bridge between content creators and media outlets.",
      icon: "handshake",
      color: "from-blue-400 to-blue-600"
    },
    {
      id: 3,
      title: "Content Creator Empowerment Award",
      year: "2023",
      category: "Community",
      recipient: "News MarketPlace Team",
      description: "Honored for empowering thousands of content creators to reach global audiences.",
      icon: "users",
      color: "from-green-400 to-green-600"
    },
    {
      id: 4,
      title: "Innovation in Media Technology",
      year: "2023",
      category: "Technology",
      recipient: "News MarketPlace",
      description: "Pioneering advanced publishing tools that transformed the media landscape.",
      icon: "lightning-bolt",
      color: "from-purple-400 to-purple-600"
    },
    {
      id: 5,
      title: "Global Reach Achievement",
      year: "2023",
      category: "Expansion",
      recipient: "News MarketPlace",
      description: "Connecting content creators across continents with unprecedented reach and impact.",
      icon: "globe-alt",
      color: "from-indigo-400 to-indigo-600"
    },
    {
      id: 6,
      title: "Trust & Transparency Award",
      year: "2022",
      category: "Ethics",
      recipient: "News MarketPlace",
      description: "Exemplifying the highest standards of transparency and ethical publishing practices.",
      icon: "shield-check",
      color: "from-red-400 to-red-600"
    }
  ];

  return (
    <section className="py-8 bg-[#E3F2FD] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#1976D2]/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#FFFFFF]/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-[#1976D2]/5 rounded-full blur-xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
       
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#212121] mb-8 leading-tight">
            Awards & <span className="text-[#1976D2]">Recognition</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#757575] max-w-4xl mx-auto leading-relaxed font-light">
            Celebrating our achievements and the recognition we've received for excellence in digital publishing and media innovation.
          </p>
          <div className="mt-8 flex justify-center space-x-6">
            <div className="w-20 h-1 bg-[#1976D2] rounded-full"></div>
            <div className="w-12 h-1 bg-[#42A5F5] rounded-full"></div>
            <div className="w-6 h-1 bg-[#90CAF9] rounded-full"></div>
          </div>
        </div>

        {/* Awards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
          {awards.map((award) => (
            <div
              key={award.id}
              className="bg-[#FFFFFF] rounded-3xl shadow-xl border border-[#E0E0E0] overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 group relative"
            >
              {/* Award Visual Header */}
              <div className="relative bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB] p-8 pb-6">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#1976D2]/10 rounded-full -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between mb-6">
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#212121] group-hover:text-[#1976D2] transition-colors duration-300">{award.year}</div>
                    <div className="text-sm text-[#757575] font-medium">Award Year</div>
                  </div>
                </div>
                <span className="bg-[#1976D2]/10 text-[#1976D2] text-sm font-semibold px-4 py-2 rounded-full border border-[#1976D2]/20">
                  {award.category}
                </span>
              </div>

              {/* Award Content */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-[#212121] mb-4 group-hover:text-[#1976D2] transition-colors duration-300 leading-tight">
                  {award.title}
                </h3>
                <p className="text-[#757575] mb-6 leading-relaxed text-lg">{award.description}</p>

                {/* Recipient */}
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-[#1976D2]/10 rounded-lg flex items-center justify-center">
                    <Icon name="user" size="sm" className="text-[#1976D2]" />
                  </div>
                  <span className="text-[#1976D2] font-semibold text-lg">{award.recipient}</span>
                </div>

                {/* Verification Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#4CAF50]/10 rounded-lg flex items-center justify-center">
                      <Icon name="badge-check" size="sm" className="text-[#4CAF50]" />
                    </div>
                    <span className="text-[#4CAF50] font-medium text-sm">Verified Award</span>
                  </div>
                  <CosmicButton variant="small" textColor="#000000" className="shadow-md hover:shadow-lg transition-shadow duration-300">
                    Learn More
                  </CosmicButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-[#FFFFFF] rounded-3xl p-12 md:p-16 shadow-2xl border border-[#E0E0E0] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#E3F2FD]/30 to-transparent"></div>
          <div className="text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6">
              Nominate for Awards
            </h2>
            <p className="text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed mb-10">
              Recognize excellence in digital publishing. Nominate outstanding work or submit your achievements for consideration.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <CosmicButton variant="small" textColor="#000000" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                Submit Nomination
              </CosmicButton>
              <CosmicButton variant="small" textColor="#000000" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                View Past Winners
              </CosmicButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Awards;