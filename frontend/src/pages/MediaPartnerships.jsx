import React from 'react';
import { motion } from 'framer-motion';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import SEO from '../components/common/SEO';

const MediaPartnerships = () => {

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Media Partnerships"
        description="Partner with News Marketplace for media collaborations, brand partnerships, and content marketing opportunities. Reach our engaged audience."
        keywords="media partnerships, brand partnerships, content marketing, influencer marketing, advertising, sponsorships"
      />
      <UserHeader />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E3F2FD] via-[#F3E5F5] to-[#FFF8E1] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#1976D2] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#9C27B0] rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#FF9800] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#1976D2] to-[#9C27B0] rounded-2xl mb-8 shadow-2xl"
            >
              <Icon name="users" size="xl" className="text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#212121] mb-6 tracking-tight bg-gradient-to-r from-[#1976D2] via-[#9C27B0] to-[#FF9800] bg-clip-text text-transparent"
            >
              Media Partnerships
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-[#757575] max-w-4xl mx-auto leading-relaxed font-light mb-12"
            >
              Partner with us to reach our engaged audience through strategic media collaborations and brand partnerships that drive real results.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <a
                href="#partnership-types"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white font-semibold rounded-xl hover:from-[#0D47A1] hover:to-[#1976D2] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Icon name="sparkles" size="sm" className="mr-2" />
                Explore Partnerships
              </a>
              <a
                href="#contact"
                className="inline-flex items-center px-8 py-4 bg-white text-[#1976D2] font-semibold rounded-xl border-2 border-[#1976D2] hover:bg-[#1976D2] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Icon name="chat-bubble-left" size="sm" className="mr-2" />
                Get In Touch
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1976D2] via-[#9C27B0] to-[#FF9800]"></div>
      </section>

      <main className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAFAFA] to-white">
        <div className="max-w-7xl mx-auto">
          {/* Partnership Types Section */}
          <section id="partnership-types" className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6 bg-gradient-to-r from-[#1976D2] to-[#9C27B0] bg-clip-text text-transparent">
                Partnership Opportunities
              </h2>
              <p className="text-xl text-[#757575] max-w-3xl mx-auto">
                Discover the perfect partnership model for your brand and marketing goals
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "building",
                  title: "Brand Partnerships",
                  description: "Collaborate with brands for co-branded content, sponsored articles, and integrated marketing campaigns that resonate with our audience.",
                  gradient: "from-[#1976D2] to-[#0D47A1]",
                  bgColor: "bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB]"
                },
                {
                  icon: "megaphone",
                  title: "Content Marketing",
                  description: "Create compelling content together through guest posts, sponsored content, and thought leadership articles.",
                  gradient: "from-[#FF9800] to-[#F57C00]",
                  bgColor: "bg-gradient-to-br from-[#FFF8E1] to-[#FFECB3]"
                },
                {
                  icon: "calendar",
                  title: "Event Sponsorship",
                  description: "Sponsor our events, webinars, and virtual summits to connect with industry leaders and decision-makers.",
                  gradient: "from-[#4CAF50] to-[#2E7D32]",
                  bgColor: "bg-gradient-to-br from-[#E8F5E8] to-[#C8E6C9]"
                },
                {
                  icon: "globe-alt",
                  title: "Media Buying",
                  description: "Reach our targeted audience through strategic media buying and advertising placements across our platforms.",
                  gradient: "from-[#9C27B0] to-[#7B1FA2]",
                  bgColor: "bg-gradient-to-br from-[#F3E5F5] to-[#E1BEE7]"
                },
                {
                  icon: "user-group",
                  title: "Influencer Marketing",
                  description: "Partner with our network of influencers and thought leaders for authentic brand endorsements and collaborations.",
                  gradient: "from-[#F44336] to-[#D32F2F]",
                  bgColor: "bg-gradient-to-br from-[#FFEBEE] to-[#FFCDD2]"
                },
                {
                  icon: "chart-bar",
                  title: "Affiliate Programs",
                  description: "Join our affiliate program to earn commissions by promoting our content and driving traffic to your business.",
                  gradient: "from-[#673AB7] to-[#512DA8]",
                  bgColor: "bg-gradient-to-br from-[#F3E5F5] to-[#D1C4E9]"
                }
              ].map((partnership, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`${partnership.bgColor} rounded-2xl p-8 border border-white/50 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 relative overflow-hidden`}
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>

                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${partnership.gradient} rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon name={partnership.icon} size="lg" className="text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-[#212121] mb-4 group-hover:text-[#1976D2] transition-colors duration-300">
                      {partnership.title}
                    </h3>

                    <p className="text-[#757575] leading-relaxed text-lg">
                      {partnership.description}
                    </p>

                    <div className={`mt-6 w-12 h-1 bg-gradient-to-r ${partnership.gradient} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Why Partner With Us Section */}
          <section className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6 bg-gradient-to-r from-[#1976D2] to-[#9C27B0] bg-clip-text text-transparent">
                Why Partner With Us?
              </h2>
              <p className="text-xl text-[#757575] max-w-3xl mx-auto">
                Discover the advantages of partnering with News Marketplace
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                {[
                  {
                    icon: "eye",
                    title: "Engaged Audience",
                    description: "Our audience consists of industry professionals, decision-makers, and engaged readers who actively consume and share content.",
                    color: "#1976D2",
                    bgColor: "#E3F2FD"
                  },
                  {
                    icon: "chart-bar",
                    title: "Proven Results",
                    description: "Our partnerships have delivered measurable results with increased brand awareness, lead generation, and ROI for our partners.",
                    color: "#FF9800",
                    bgColor: "#FFF8E1"
                  },
                  {
                    icon: "users",
                    title: "Expert Team",
                    description: "Work with our experienced team of content creators, marketers, and media professionals who understand your industry.",
                    color: "#4CAF50",
                    bgColor: "#E8F5E8"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-6 group"
                  >
                    <div
                      className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: feature.bgColor }}
                    >
                      <Icon name={feature.icon} size="xl" style={{ color: feature.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#212121] mb-3 group-hover:text-[#1976D2] transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-[#757575] leading-relaxed text-lg">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-8">
                {[
                  {
                    icon: "globe-alt",
                    title: "Multi-Platform Reach",
                    description: "Extend your reach across our website, social media channels, newsletters, and partner networks.",
                    color: "#9C27B0",
                    bgColor: "#F3E5F5"
                  },
                  {
                    icon: "lightning-bolt",
                    title: "Fast Turnaround",
                    description: "Quick campaign setup and execution with dedicated account management and regular performance reporting.",
                    color: "#F44336",
                    bgColor: "#FFEBEE"
                  },
                  {
                    icon: "shield-check",
                    title: "Transparent Reporting",
                    description: "Clear metrics, detailed analytics, and comprehensive reporting to track the success of your partnership campaigns.",
                    color: "#1976D2",
                    bgColor: "#E3F2FD"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-6 group"
                  >
                    <div
                      className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: feature.bgColor }}
                    >
                      <Icon name={feature.icon} size="xl" style={{ color: feature.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#212121] mb-3 group-hover:text-[#1976D2] transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-[#757575] leading-relaxed text-lg">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="bg-gradient-to-r from-[#E3F2FD] to-[#F3E5F5] rounded-3xl p-12 md:p-16 border border-white/50 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#1976D2] to-[#9C27B0] rounded-2xl mb-8 shadow-2xl">
                <Icon name="chat-bubble-left" size="xl" className="text-white" />
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-[#212121] mb-6 bg-gradient-to-r from-[#1976D2] to-[#9C27B0] bg-clip-text text-transparent">
                Ready to Partner With Us?
              </h2>

              <p className="text-xl text-[#757575] mb-12 max-w-3xl mx-auto leading-relaxed">
                Contact our partnerships team to discuss collaboration opportunities and explore how we can work together to achieve your marketing goals.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
                <motion.a
                  href="mailto:partnerships@newsmarketplace.com"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white font-semibold rounded-xl hover:from-[#0D47A1] hover:to-[#1976D2] transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  <Icon name="mail" size="sm" className="mr-3" />
                  Email Us
                </motion.a>

                <motion.a
                  href="/contact-us"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-8 py-4 bg-white text-[#1976D2] font-semibold rounded-xl border-2 border-[#1976D2] hover:bg-[#1976D2] hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  <Icon name="chat-bubble-left" size="sm" className="mr-3" />
                  Contact Form
                </motion.a>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-[#757575]">
                <div className="flex items-center space-x-2">
                  <Icon name="mail" size="sm" />
                  <span className="font-medium">partnerships@newsmarketplace.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="phone" size="sm" />
                  <span className="font-medium">Available upon request</span>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>

      <UserFooter />
    </div>
  );
};

export default MediaPartnerships;