import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import TopHeader from '../components/common/TopHeader';
import UserHeader from '../components/common/UserHeader';
import FeatureSlider from '../components/common/FeatureSlider';
import Articles from '../components/common/Articles';
import About from '../components/common/About';
import PowerList from '../components/common/PowerList';
import Awards from '../components/common/Awards';
import FAQ from './FAQ';
import UserFooter from '../components/common/UserFooter';
import AuthModal from '../components/auth/AuthModal';

const Home = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { scrollYProgress } = useScroll();

  // Set the entire page background to primary light color
  const backgroundColor = '#E3F2FD';

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  return (
    <motion.div
      className="min-h-screen"
      style={{ backgroundColor }}
    >
      {/* Top Header */}

      {/* Main Header */}
      <UserHeader onShowAuth={handleShowAuth} />
      <TopHeader />

      {/* Feature Slider */}
      <FeatureSlider />

      {/* Articles Section */}
      <Articles />

      {/* About Section */}
      <About />

      {/* Power List Section */}
      <PowerList />

      {/* Awards Section */}
      <Awards />

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <UserFooter />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuth} onClose={handleCloseAuth} />
    </motion.div>
  );
};

export default Home;