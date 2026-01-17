import React from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import SEO from '../components/common/SEO';

const AboutUs = () => {
  const aboutSections = [
    {
      title: "Vision",
      content: "Our goal is to become the world’s most trusted media marketplace, where high-quality services meet the best pricing. We envision a future where publishing is democratized, accessible, and profitable for all stakeholders in the media ecosystem.",
      icon: "eye",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Our Vision",
      content: "To revolutionize visibility requirements by connecting creators, businesses, media outlets, brands, companies, influencers, and marketing professionals through innovative, transparent, and efficient platforms. VaaS Solutions bridge the gap between traditional media and modern digital needs, ensuring every voice is heard and every story is told.",
      icon: "light-bulb",
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "What VaaS Solutions Do",
      content: "VaaS Solutions provides comprehensive omnichannel media, corporate communication, marketing, and PR solutions, including article publishing, press releases, content distribution, and digital marketing services. The platform connects clients with credible visibility solutions, ensuring maximum reach and impact for their vision and objectives.",
      icon: "chart-bar",
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Why VaaS Solutions",
      content: "With years of the founder’s experience across multiple industries, we understand the nuances of visibility. Our team comprises media professionals, content strategists, and technology experts who work together to deliver exceptional results for all the stakeholders.",
      icon: "user-group",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Stakeholder Commitment",
      content: "We uphold the highest standards in service delivery, ensuring every requirement meets best-in-class benchmarks. Our commitment ensures that all partners—suppliers, clients, and collaborators—receive maximum value for their time and efforts.",
      icon: "handshake",
      color: "text-rose-600",
      bg: "bg-rose-50"
    },
    {
      title: "Global Network",
      content: "VaaS Solutions’ network spans continents, connecting clients with top-tier media outlets and creators across the Middle East, North America, Europe, and Asia. This global reach ensures that our partners’ vision and mission receive the international and regional exposure they deserve.",
      icon: "globe-alt",
      color: "text-cyan-600",
      bg: "bg-cyan-50"
    },
    {
      title: "Innovation and Technology",
      content: "We leverage cutting-edge technology to streamline the publishing process, from content submission to publication tracking. Our platform features real-time analytics, automated workflows, and AI-powered content optimization tools.",
      icon: "cpu-chip",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Client Success",
      content: "Our success is measured by our clients' success. We provide dedicated support, transparent communication, and measurable results. Every client relationship is built on trust, reliability, and mutual growth.",
      icon: "trophy",
      color: "text-orange-600",
      bg: "bg-orange-50"
    }
  ];

  const teamValues = [
    "Integrity in all our dealings",
    "Excellence in service delivery",
    "Innovation in solutions",
    "Transparency in operations",
    "Collaboration with partners",
    "Commitment to client success"
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <SEO
        title="About VaaS Solutions | Vision & Mission"
        description="Discover the platform’s vision, mission, and the driving force behind the region’s first-of-its-kind MarTech platform for visibility services."
        keywords="about us, news marketplace, digital publishing, media solutions"
      />
      <UserHeader />

      <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-white rounded-full shadow-sm border border-slate-100 mb-6">
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold uppercase tracking-widest text-slate-600">Company Profile</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            About VaaS Solutions
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            The region’s first-of-its-kind MarTech platform for visibility services. <br className="hidden md:block" />Democratizing publishing for everyone.
          </p>
        </div>

        {/* Editorial List Layout */}
        <div className="space-y-6">
          {aboutSections.map((section, index) => (
            <div key={index} className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                {/* Icon Column */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${section.bg} ${section.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon name={section.icon} size="xl" />
                </div>

                {/* Content Column */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-base">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Values Footer Section */}
        <div className="mt-16 bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Our Core Values</h2>
            <p className="text-slate-500 mt-2">The principles that define us.</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {teamValues.map((value, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                <Icon name="check-circle" className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-slate-700 font-medium text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-12 text-center border-t border-slate-200 pt-8">
          <p className="text-slate-400 text-sm">
            Established 2024 • Dubai, UAE
          </p>
        </div>

      </div>

      <div className="relative z-20 bg-white">
        <UserFooter />
      </div>
    </div>
  );
};

export default AboutUs;