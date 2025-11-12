import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  Search, Filter, Eye, Heart, Globe, MapPin, Users,
  Star, TrendingUp, Instagram, Youtube, Twitter,
  Facebook, Hash, DollarSign, ExternalLink
} from 'lucide-react';

const ThemesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [followerFilter, setFollowerFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async (page = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: 'approved',
        is_active: 'true'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (platformFilter) params.append('platform', platformFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (locationFilter) params.append('location', locationFilter);
      if (followerFilter) params.append('follower_range', followerFilter);

      const response = await api.get(`/themes?${params.toString()}`);
      let themesData = response.data.themes || [];

      setThemes(themesData);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalCount(response.data.pagination?.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching themes:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setThemes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchThemes(1); // Reset to first page on filter change
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, platformFilter, categoryFilter, locationFilter, followerFilter]);

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const getUniquePlatforms = () => {
    const platforms = themes.map(t => t.platform).filter(Boolean);
    return [...new Set(platforms)].sort();
  };

  const getUniqueCategories = () => {
    const categories = themes.map(t => t.category).filter(Boolean);
    return [...new Set(categories)].sort();
  };

  const getUniqueLocations = () => {
    const locations = themes.map(t => t.location).filter(Boolean);
    return [...new Set(locations)].sort();
  };

  const formatFollowers = (count) => {
    if (!count) return 'N/A';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatPrice = (price) => {
    if (!price) return 'Contact for pricing';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const handleThemeClick = (themeId) => {
    navigate(`/themes/${themeId}`);
  };

  const handlePageChange = (page) => {
    fetchThemes(page);
  };

  const followerRanges = [
    { value: '', label: 'All Followers' },
    { value: '0-1000', label: '0 - 1K' },
    { value: '1000-10000', label: '1K - 10K' },
    { value: '10000-50000', label: '10K - 50K' },
    { value: '50000-100000', label: '50K - 100K' },
    { value: '100000-500000', label: '100K - 500K' },
    { value: '500000+', label: '500K+' }
  ];

  if (loading && themes.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4 border-4 border-[#E0E0E0] border-t-[#1976D2]"></div>
            <p className="text-lg text-[#757575]">Loading themes...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Social Media Themes
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Discover approved social media themes and collaboration opportunities. {totalCount > 0 && `${totalCount} themes available`} for influencers and brands.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#757575] w-5 h-5" />
              <input
                type="text"
                placeholder="Search by username, page name, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
              />
            </div>
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                showFilters
                  ? 'bg-[#1976D2] text-white'
                  : 'bg-[#F5F5F5] text-[#212121] hover:bg-[#E0E0E0]'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  Platform
                </label>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                >
                  <option value="">All Platforms</option>
                  {getUniquePlatforms().map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                >
                  <option value="">All Categories</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  Location
                </label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                >
                  <option value="">All Locations</option>
                  {getUniqueLocations().map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  Followers
                </label>
                <select
                  value={followerFilter}
                  onChange={(e) => setFollowerFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                >
                  {followerRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Themes Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          {themes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themes.map((theme, index) => (
                  <motion.div
                    key={theme.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => handleThemeClick(theme.id)}
                    className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
                  >
                    {/* Theme Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="text-[#1976D2]">
                              {getPlatformIcon(theme.platform)}
                            </div>
                            <span className="text-sm font-medium text-[#1976D2] bg-[#E3F2FD] px-2 py-1 rounded-full">
                              {theme.platform}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold mb-1 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: '#212121' }}>
                            {theme.page_name}
                          </h3>
                          <p className="text-sm text-[#757575] mb-2">@{theme.username}</p>
                          <div className="flex items-center text-sm text-[#757575] mb-2">
                            <MapPin size={14} className="mr-1" />
                            <span>{theme.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-[#757575] mb-3">
                            <Users size={14} className="mr-1" />
                            <span>{formatFollowers(theme.no_of_followers)} followers</span>
                          </div>
                        </div>
                      </div>

                      {/* Category and Price */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#FFF3E0] text-[#FF9800]">
                          {theme.category}
                        </span>
                        <div className="text-right">
                          <div className="text-sm text-[#757575]">From</div>
                          <div className="text-lg font-bold text-[#4CAF50]">
                            {formatPrice(theme.price_reel_without_tagging_collaboration)}
                          </div>
                        </div>
                      </div>

                      {/* Collaboration Preview */}
                      {theme.collaboration && (
                        <p className="text-sm text-[#757575] mb-4 line-clamp-2">
                          {theme.collaboration}
                        </p>
                      )}

                      {/* CTA Button */}
                      <button
                        className="w-full text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group-hover:bg-[#0D47A1]"
                        style={{ backgroundColor: '#1976D2' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleThemeClick(theme.id);
                        }}
                      >
                        <Eye size={16} />
                        View Details
                        <ExternalLink size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-[#E0E0E0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors text-[#212121] disabled:text-[#BDBDBD]"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border border-[#E0E0E0] rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-[#1976D2] text-white border-[#1976D2]'
                            : 'hover:bg-[#F5F5F5] text-[#212121]'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-[#E0E0E0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5] transition-colors text-[#212121] disabled:text-[#BDBDBD]"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-6">
                <Hash className="w-12 h-12 text-[#BDBDBD]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#212121] mb-3">
                No themes found
              </h3>
              <p className="text-[#757575] text-lg max-w-md mx-auto">
                We couldn't find any themes matching your search criteria. Try adjusting your filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPlatformFilter('');
                  setCategoryFilter('');
                  setLocationFilter('');
                  setFollowerFilter('');
                  fetchThemes(1);
                }}
                className="mt-6 bg-[#1976D2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0D47A1] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <UserFooter />

      <AuthModal
        isOpen={showAuth}
        onClose={handleCloseAuth}
        onLoginSuccess={handleCloseAuth}
      />
    </div>
  );
};

export default ThemesPage;