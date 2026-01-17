import React from 'react';
import { Link } from 'react-router-dom';
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
      bg: "bg-blue-50",
      color: "text-blue-600"
    },
    {
      title: "What VaaS Solutions Do",
      content: "VaaS Solutions provides comprehensive omnichannel media, corporate communication, marketing, and PR solutions, including article publishing, press releases, content distribution, and digital marketing services. The platform connects clients with credible visibility solutions, ensuring maximum reach and impact for their vision and objectives.",
      icon: "presentation-chart-line", // "chart-bar" or similar
      bg: "bg-indigo-50",
      color: "text-indigo-600"
    },
    {
      title: "Why VaaS Solutions",
      content: "With years of the founder’s experience across multiple industries, we understand the nuances of visibility. Our team comprises media professionals, content strategists, and technology experts who work together to deliver exceptional results for all the stakeholders.",
      icon: "light-bulb",
      bg: "bg-amber-50",
      color: "text-amber-600"
    },
    {
      title: "Stakeholder Commitment",
      content: "We uphold the highest standards in service delivery, ensuring every requirement meets best-in-class benchmarks. Our commitment ensures that all partners—suppliers, clients, and collaborators—receive maximum value for their time and efforts.",
      icon: "handshake", // or "user-group"
      bg: "bg-emerald-50",
      color: "text-emerald-600"
    },
    {
      title: "Global Network",
      content: "VaaS Solutions’ network spans continents, connecting clients with top-tier media outlets and creators across the Middle East, North America, Europe, and Asia. This global reach ensures that our partners’ vision and mission receive the international and regional exposure they deserve.",
      icon: "globe-alt",
      bg: "bg-cyan-50",
      color: "text-cyan-600"
    },
    {
      title: "Innovation and Technology",
      content: "We leverage cutting-edge technology to streamline the publishing process, from content submission to publication tracking. Our platform features real-time analytics, automated workflows, and AI-powered content optimization tools.",
      icon: "cpu-chip", // "cog" or similar
      bg: "bg-purple-50",
      color: "text-purple-600"
    },
    {
      title: "Client Success",
      content: "Our success is measured by our clients' success. We provide dedicated support, transparent communication, and measurable results. Every client relationship is built on trust, reliability, and mutual growth.",
      icon: "trophy",
      bg: "bg-rose-50",
      color: "text-rose-600"
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
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      <SEO
        title="About VaaS Solutions | Vision & Mission"
        description="Discover the platform’s vision, mission, and the driving force behind the region’s first-of-its-kind MarTech platform for visibility services."
        keywords="about us, news marketplace, digital publishing, media solutions, content creators, global publications"
      />
      <UserHeader />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-xs font-bold tracking-widest uppercase mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Our Story
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-8 leading-tight">
            About Visibility as a Service <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-blue-500">
              (VaaS) Solutions
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-4xl mx-auto leading-relaxed font-medium">
            Discover the platform’s vision, mission, and the driving force behind the region’s first-of-its-kind MarTech platform for visibility services.
          </p>
        </div>
      </div>


      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">

        {/* Featured Block: Our Vision */}
        <div className="relative bg-slate-900 rounded-[2.5rem] p-10 md:p-16 mb-24 overflow-hidden text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="rocket-launch" className="w-6 h-6 text-indigo-400" /> {/* Fallback icon will appear if not generic */}
              <h3 className="text-indigo-400 text-sm font-bold uppercase tracking-widest">Our Core Mission</h3>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-8">
              To revolutionize visibility requirements.
            </h2>
            <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-5xl">
              To revolutionize visibility requirements by connecting creators, businesses, media outlets, brands, companies, influencers, and marketing professionals through innovative, transparent, and efficient platforms. VaaS Solutions bridge the gap between traditional media and modern digital needs, ensuring every voice is heard and every story is told.
            </p>
          </div>
        </div>

        {/* Grid of Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-24">
          {aboutSections.map((section, idx) => (
            <div key={idx} className="group p-8 md:p-10 rounded-[2rem] bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col h-full">
                <div className={`w-14 h-14 rounded-2xl ${section.bg} ${section.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon name={section.icon || "star"} size="lg" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{section.title}</h3>
                <div className="h-1 w-12 bg-slate-100 group-hover:bg-indigo-500 transition-colors rounded-full mb-6"></div>
                <p className="text-slate-600 leading-relaxed text-base flex-grow">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Team Values Section */}
        <div className="bg-slate-50 rounded-[2.5rem] p-10 md:p-16 border border-slate-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-slate-500">The principles that guide everything we do.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamValues.map((val, i) => (
              <div key={i} className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                  <Icon name="check" size="sm" />
                </div>
                <span className="font-semibold text-slate-700">{val}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="relative z-20 bg-white">
        <UserFooter />
      </div>
    </div>
  );
};

export default AboutUs;