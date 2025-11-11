import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, Search, Filter, Globe, MapPin, Users, DollarSign, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PaparazziPage = () => {
  const [paparazzi, setPaparazzi] = useState([]);
  const [filteredPaparazzi, setFilteredPaparazzi] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPaparazzi();
  }, []);

  useEffect(() => {
    filterPaparazzi();
  }, [paparazzi, searchQuery, selectedPlatform, selectedCategory, selectedLocation]);

  const fetchPaparazzi = async () => {
    try {
      setLoading(true);
      const response = await api.get('/paparazzi');
      setPaparazzi(response.data.paparazzi || []);
    } catch (err) {
      console.error('Error fetching paparazzi:', err);
      setError('Failed to load paparazzi. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterPaparazzi = useCallback(() => {
    let filtered = paparazzi.filter(p => {
      const matchesSearch = p.page_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPlatform = selectedPlatform === 'all' || p.platform === selectedPlatform;
      const matchesCategory = selectedCategory === 'all' || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchesLocation = selectedLocation === 'all' || (p.location && p.location.toLowerCase().includes(selectedLocation.toLowerCase()));
      return matchesSearch && matchesPlatform && matchesCategory && matchesLocation;
    });
    setFilteredPaparazzi(filtered);
  }, [paparazzi, searchQuery, selectedPlatform, selectedCategory, selectedLocation]);

  const platforms = ['all', ...new Set(paparazzi.map(p => p.platform).filter(Boolean))];
  const categories = ['all', ...new Set(paparazzi.map(p => p.category).filter(Boolean))];
  const locations = ['all', ...new Set(paparazzi.map(p => p.location).filter(Boolean))];

  const handleCardClick = (paparazziId) => {
    navigate(`/paparazzi/${paparazziId}`);
  };

  const handleSubmitNew = () => {
    if (!isAuthenticated) {
      // TODO: Show login modal or redirect to login
      alert('Please login to submit new paparazzi');
      return;
    }
    navigate('/paparazzi/submit');
  };

  const formatFollowers = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatPrice = (price) => {
    return price ? `$${price}` : 'Contact for pricing';
  };

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-[#1976D2] rounded-full p-4">
                <Camera className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Paparazzi Network
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Connect with professional paparazzi across social media platforms. Find the perfect photographer for your content needs.
            </p>
            <div className="mt-8">
              <button
                onClick={handleSubmitNew}
                className="inline-flex items-center gap-2 bg-[#1976D2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1565C0] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Submit New Paparazzi
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, username, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#757575]" />
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
              >
                {platforms.map(platform => (
                  <option key={platform} value={platform}>
                    {platform === 'all' ? 'All Platforms' : platform}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#757575]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#757575]" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
              >
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Paparazzi Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1976D2] mx-auto mb-4"></div>
              <p className="text-[#757575]">Loading paparazzi...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPaparazzi.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleCardClick(p.id)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-[#1976D2] rounded-full p-3">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-[#1976D2] bg-[#E3F2FD] px-3 py-1 rounded-full">
                        {p.platform}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-[#212121] mb-2 line-clamp-2">
                      {p.page_name}
                    </h3>
                    <p className="text-sm text-[#757575] mb-3">@{p.username}</p>
                    <div className="space-y-2 text-sm text-[#757575]">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{formatFollowers(p.followers_count)} followers</span>
                      </div>
                      {p.category && (
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4" />
                          <span>{p.category}</span>
                        </div>
                      )}
                      {p.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{p.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#E0E0E0]">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-[#1976D2] font-medium">
                          {formatPrice(p.price_reel_with_tag)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && !error && filteredPaparazzi.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#757575] text-lg">No paparazzi found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default PaparazziPage;