import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import PowerlistSubmissionForm from '../components/user/PowerlistSubmissionForm';
import {
  Search, Filter, Eye, Heart, Share, Grid, List, Star, Clock,
  TrendingUp, Globe, BookOpen, Award, Target, Zap, CheckCircle,
  ExternalLink, MapPin, Calendar, DollarSign, BarChart3, Users,
  Link as LinkIcon, Image as ImageIcon, FileText, Shield, User, Building,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, UserCheck
} from 'lucide-react';

// Enhanced theme colors inspired by VideoTutorials
const theme = {
  primary: '#1976D2',
  primaryDark: '#1565C0',
  primaryLight: '#E3F2FD',
  secondary: '#00796B',
  secondaryDark: '#004D40',
  secondaryLight: '#E0F2F1',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  info: '#9C27B0',
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  background: '#FFFFFF',
  backgroundAlt: '#FAFAFA',
  backgroundSoft: '#F5F5F5',
  borderLight: '#E0E0E0',
  borderMedium: '#BDBDBD',
  borderDark: '#757575',
  gradientFrom: '#E3F2FD',
  gradientTo: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBorder: '#E0E0E0',
  cardShadow: 'rgba(2,6,23,0.06)',
  hoverBg: '#F5F5F5'
};

const PowerlistPage = () => {
  const { isAuthenticated, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const navigate = useNavigate();
  const [powerlists, setPowerlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  // View mode and layout state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filter states
  const [industryFilter, setIndustryFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form modal
  const [showPowerlistForm, setShowPowerlistForm] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    fetchPowerlists();
    fetchGroups();
  }, []);

  const fetchPowerlists = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        limit: '100'
      });

      // Enhanced search across multiple fields
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
        params.append('name', searchTerm.trim());
      }

      const response = await api.get(`/api/powerlist/public?${params.toString()}`);
      let powerlistsData = response.data.powerlists || [];

      // Client-side search for better results
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        powerlistsData = powerlistsData.filter(powerlist => {
          return (
            powerlist.name?.toLowerCase().includes(searchLower) ||
            powerlist.current_company?.toLowerCase().includes(searchLower) ||
            powerlist.position?.toLowerCase().includes(searchLower) ||
            powerlist.company_industry?.toLowerCase().includes(searchLower) ||
            powerlist.passport_nationality_one?.toLowerCase().includes(searchLower)
          );
        });
      }

      setPowerlists(powerlistsData);
      setTotalCount(powerlistsData.length);
    } catch (error) {
      console.error('Error fetching powerlists:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setPowerlists([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    // Powerlists don't have groups like publications, so this is a placeholder
    // Could be used for other data if needed
  };

  // Enhanced search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPowerlists();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleShowPowerlistForm = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
    } else {
      setShowPowerlistForm(true);
    }
  };

  const handleClosePowerlistForm = () => {
    setShowPowerlistForm(false);
  };

  const handlePowerlistSuccess = () => {
    setShowPowerlistForm(false);
    // Refresh the powerlists to include the new submission if approved
    fetchPowerlists(currentPage);
  };

  const getUniqueIndustries = () => {
    const industries = powerlists.map(p => p.company_industry).filter(Boolean);
    return [...new Set(industries)].sort();
  };

  const getUniqueRegions = () => {
    // Assuming region can be derived from passport nationality or other fields
    const regions = powerlists.map(p => p.passport_nationality_one).filter(Boolean);
    return [...new Set(regions)].sort();
  };

  const handlePowerlistClick = (powerlist) => {
    navigate(`/power-lists/${powerlist.id}`);
  };

  // Filtering logic
  const filteredPowerlists = useMemo(() => {
    let filtered = [...powerlists];

    // Apply filters only when they are set (not empty)
    if (industryFilter) {
      filtered = filtered.filter(powerlist =>
        powerlist.company_industry?.toLowerCase().includes(industryFilter.toLowerCase())
      );
    }

    if (genderFilter) {
      filtered = filtered.filter(powerlist =>
        powerlist.gender?.toLowerCase() === genderFilter.toLowerCase()
      );
    }

    if (regionFilter) {
      filtered = filtered.filter(powerlist =>
        powerlist.passport_nationality_one?.toLowerCase().includes(regionFilter.toLowerCase())
      );
    }

    return filtered;
  }, [powerlists, industryFilter, genderFilter, regionFilter]);

  // Sorting logic
  const sortedPowerlists = useMemo(() => {
    return [...filteredPowerlists].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredPowerlists, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown size={14} />;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const clearAllFilters = () => {
    setIndustryFilter('');
    setGenderFilter('');
    setRegionFilter('');
  };

  const hasActiveFilters = () => {
    return industryFilter || genderFilter || regionFilter;
  };

  if (loading && powerlists.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-16 w-16 mx-auto mb-4"
              style={{
                borderBottom: `2px solid ${theme.primary}`,
                borderRight: `2px solid transparent`
              }}
            ></div>
            <p className="text-lg" style={{ color: theme.textSecondary }}>Loading powerlist...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Enhanced Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E3F2FD] to-white border-b border-[#E0E0E0]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Powerlist Directory
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Connect with influential professionals and industry leaders who can amplify your brand and drive meaningful impact.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search professionals by name, company, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 border border-[#E0E0E0] rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent bg-white"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2" size={20} style={{ color: theme.textSecondary }} />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#757575] hover:text-[#212121] transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Submit Profile Button */}
            <div className="mt-8">
              <button
                onClick={handleShowPowerlistForm}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors bg-[#00796B] text-white hover:bg-[#004D40]"
              >
                <User size={18} />
                Submit Your Profile
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content with Enhanced Layout */}
      <div className={`${isMobile ? 'flex flex-col' : 'flex'}`}>
        {/* Enhanced Filters Sidebar */}
        <aside className={`${sidebarOpen ? (isMobile ? 'w-full' : 'w-80') : 'w-0'} transition-all duration-300 bg-white shadow-lg overflow-hidden ${isMobile ? 'order-2' : ''}`} style={{
          minHeight: isMobile ? 'auto' : 'calc(100vh - 200px)',
          position: isMobile ? 'static' : 'sticky',
          top: isMobile ? 'auto' : '80px',
          zIndex: 10,
          borderRight: isMobile ? 'none' : `1px solid ${theme.borderLight}`,
          borderTop: isMobile ? `1px solid ${theme.borderLight}` : 'none',
          width: isMobile ? '100%' : '25%'
        }}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#212121] flex items-center gap-2">
                <Filter size={20} className="text-[#1976D2]" />
                Filters & Sort
              </h3>
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-[#757575]"
                >
                  ×
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Basic Filters */}
              <div className="bg-[#FAFAFA] rounded-lg p-4 border border-[#E0E0E0]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <User size={16} className="text-[#1976D2]" />
                  Basic Filters
                </h4>

                {/* Filters in row-wise layout for mobile */}
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1'}`}>
                  {/* Industry Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Industry
                    </label>
                    <select
                      value={industryFilter}
                      onChange={(e) => setIndustryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Industries</option>
                      {getUniqueIndustries().map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gender Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Gender
                    </label>
                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Genders</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Region Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                      Region
                    </label>
                    <select
                      value={regionFilter}
                      onChange={(e) => setRegionFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                    >
                      <option value="">All Regions</option>
                      {getUniqueRegions().map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div className="bg-[#E3F2FD] rounded-lg p-4 border border-[#1976D2]">
                <h4 className="font-semibold text-[#212121] mb-3 flex items-center gap-2">
                  <Users size={16} className="text-[#1976D2]" />
                  Demographics
                </h4>

                {/* Gender Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    Gender
                  </label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Region Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.textPrimary }}>
                    Region
                  </label>
                  <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                  >
                    <option value="">All Regions</option>
                    {getUniqueRegions().map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearAllFilters}
                className="w-full px-4 py-3 rounded-lg font-medium transition-colors bg-[#F5F5F5] hover:bg-[#E0E0E0] text-[#212121] border border-[#E0E0E0]"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Enhanced */}
        <main className={`flex-1 p-6 min-w-0 ${isMobile ? 'order-1' : ''}`}>
          {/* Enhanced Controls Bar */}
          <div className="bg-white rounded-lg shadow-lg border p-6 mb-6" style={{
            borderColor: theme.borderLight,
            boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
          }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-[#F5F5F5] hover:bg-[#E0E0E0] transition-colors"
                    style={{ borderColor: theme.borderLight }}
                  >
                    <Filter size={16} />
                    <span className="text-[#212121]">Filters</span>
                  </button>
                )}

                {/* View Toggle */}
                <div className="flex items-center bg-[#F5F5F5] rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-sm text-[#1976D2]'
                        : 'text-[#757575] hover:text-[#212121]'
                    }`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white shadow-sm text-[#1976D2]'
                        : 'text-[#757575] hover:text-[#212121]'
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>

                <span className="text-sm font-medium text-[#212121]">
                  {sortedPowerlists.length} professionals found
                  {searchTerm && (
                    <span className="ml-2 text-[#757575]">
                      for "{searchTerm}"
                    </span>
                  )}
                </span>
              </div>

              {/* Enhanced Sort Dropdown */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#757575]">Sort by:</span>
                <select
                  value={`${sortField}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortField(field);
                    setSortDirection(direction);
                  }}
                  className="px-4 py-2 border border-[#E0E0E0] rounded-lg text-sm bg-white text-[#212121] focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2]"
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="current_company-asc">Company (A-Z)</option>
                  <option value="current_company-desc">Company (Z-A)</option>
                  <option value="company_industry-asc">Industry (A-Z)</option>
                  <option value="company_industry-desc">Industry (Z-A)</option>
                  <option value="gender-asc">Gender (A-Z)</option>
                  <option value="gender-desc">Gender (Z-A)</option>
                  <option value="passport_nationality_one-asc">Location (A-Z)</option>
                  <option value="passport_nationality_one-desc">Location (Z-A)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Powerlists Display */}
          {sortedPowerlists.length > 0 ? (
            <>
              {/* Enhanced Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedPowerlists.map((powerlist, index) => (
                    <motion.div
                      key={powerlist.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onClick={() => handlePowerlistClick(powerlist)}
                      className="bg-white rounded-lg shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                      style={{
                        borderColor: theme.borderLight,
                        boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                      }}
                    >
                      {/* Enhanced Powerlist Header */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: theme.textPrimary }}>
                              {powerlist.name}
                            </h3>
                            <div className="flex items-center text-sm mb-2" style={{ color: theme.textSecondary }}>
                              <Building size={14} className="mr-2" />
                              <span>{powerlist.current_company || 'Independent'}</span>
                            </div>
                            <div className="flex items-center text-sm mb-3" style={{ color: theme.textSecondary }}>
                              <User size={14} className="mr-2" />
                              <span>{powerlist.position || 'Professional'}</span>
                            </div>
                          </div>
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: theme.primaryLight }}
                          >
                            <UserCheck size={24} style={{ color: theme.primary }} />
                          </div>
                        </div>

                        {/* Enhanced Industry and Demographics */}
                        <div className="grid grid-cols-2 gap-2 text-center mb-4 p-4 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                          <div>
                            <div className="text-sm font-medium" style={{ color: theme.primary }}>
                              {powerlist.company_industry || 'General'}
                            </div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>Industry</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium" style={{ color: theme.success }}>
                              {powerlist.gender || 'Not specified'}
                            </div>
                            <div className="text-xs" style={{ color: theme.textSecondary }}>Gender</div>
                          </div>
                        </div>

                        {/* Location Info */}
                        <div className="text-center mb-4 p-3 rounded-lg" style={{ backgroundColor: theme.backgroundSoft }}>
                          <div className="text-sm font-medium" style={{ color: theme.info }}>
                            {powerlist.passport_nationality_one || 'Global'}
                          </div>
                          <div className="text-xs" style={{ color: theme.textSecondary }}>Location</div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center justify-center gap-3 mb-4">
                          {powerlist.linkedin_url && (
                            <a
                              href={powerlist.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-full hover:bg-blue-50 transition-colors"
                            >
                              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                            </a>
                          )}
                          {powerlist.instagram_url && (
                            <a
                              href={powerlist.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-full hover:bg-pink-50 transition-colors"
                            >
                              <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.017 0C8.396 0 7.996.014 6.79.067 5.59.12 4.794.265 4.14.52c-.704.265-1.302.663-1.894 1.254C1.654 2.366 1.256 2.964.992 3.668c-.255.654-.4 1.45-.453 2.65C.48 7.524.466 7.924.466 11.545s.014 4.021.067 5.227c.053 1.2.198 1.996.453 2.65.264.704.662 1.302 1.254 1.894.592.592 1.19.99 1.894 1.254.654.255 1.45.4 2.65.453 1.206.053 1.606.067 5.227.067s4.021-.014 5.227-.067c1.2-.053 1.996-.198 2.65-.453.704-.264 1.302-.662 1.894-1.254.592-.592.99-1.19 1.254-1.894.255-.654.4-1.45.453-2.65.053-1.206.067-1.606.067-5.227s-.014-4.021-.067-5.227c-.053-1.2-.198-1.996-.453-2.65-.264-.704-.662-1.302-1.254-1.894C20.634 1.654 20.036 1.256 19.332.992c-.654-.255-1.45-.4-2.65-.453C16.041.48 15.641.466 12.02.466c-.005 0-.01 0-.015-.001zm.005 1.78c3.578 0 4.001.013 5.204.066 1.122.05 1.74.236 2.145.392.494.192.854.423 1.228.797.374.374.605.734.797 1.228.156.405.342 1.023.392 2.145.053 1.203.066 1.626.066 5.204 0 3.578-.013 4.001-.066 5.204-.05 1.122-.236 1.74-.392 2.145-.192.494-.423.854-.797 1.228-.374.374-.734.605-1.228.797-.405.156-1.023.342-2.145.392-1.203.053-1.626.066-5.204.066-3.578 0-4.001-.013-5.204-.066-1.122-.05-1.74-.236-2.145-.392-.494-.192-.854-.423-1.228-.797-.374-.374-.605-.734-.797-1.228-.156-.405-.342-1.023-.392-2.145-.053-1.203-.066-1.626-.066-5.204 0-3.578.013-4.001.066-5.204.05-1.122.236-1.74.392-2.145.192-.494.423-.854.797-1.228.374-.374.734-.605 1.228-.797.405-.156 1.023-.342 2.145-.392C8.015 2.259 8.437 2.246 12.015 2.246c.005 0 .01 0 .015.001z"/>
                                <path d="M12.017 6.124c-3.767 0-6.827 3.06-6.827 6.826 0 3.767 3.06 6.827 6.827 6.827s6.827-3.06 6.827-6.827c0-3.766-3.06-6.826-6.827-6.826zm0 11.283c-2.472 0-4.477-2.005-4.477-4.477 0-2.472 2.005-4.477 4.477-4.477s4.477 2.005 4.477 4.477c0 2.472-2.005 4.477-4.477 4.477z"/>
                                <circle cx="17.072" cy="6.928" r="1.5"/>
                              </svg>
                            </a>
                          )}
                        </div>

                        {/* Enhanced CTA Button */}
                        <button
                          className="w-full text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                          style={{ backgroundColor: theme.primary }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                          onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                        >
                          <Eye size={16} />
                          View Profile
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Enhanced List View - Table Format */}
              {viewMode === 'list' && (
                <div className="bg-white rounded-lg shadow-lg border overflow-hidden" style={{
                  borderColor: theme.borderLight,
                  boxShadow: '0 8px 20px rgba(2,6,23,0.06)'
                }}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ backgroundColor: theme.backgroundSoft }}>
                        <tr>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center gap-2">
                              Professional {getSortIcon('name')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('current_company')}
                          >
                            <div className="flex items-center gap-2">
                              Company {getSortIcon('current_company')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('company_industry')}
                          >
                            <div className="flex items-center gap-2">
                              Industry {getSortIcon('company_industry')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('gender')}
                          >
                            <div className="flex items-center gap-2">
                              Gender {getSortIcon('gender')}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ color: theme.textPrimary }}
                            onClick={() => handleSort('passport_nationality_one')}
                          >
                            <div className="flex items-center gap-2">
                              Location {getSortIcon('passport_nationality_one')}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: theme.textPrimary }}>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedPowerlists.map((powerlist, index) => (
                          <tr
                            key={powerlist.id}
                            className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                            style={{ borderColor: theme.borderLight }}
                            onClick={() => handlePowerlistClick(powerlist)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: theme.primaryLight }}
                                >
                                  <UserCheck size={20} style={{ color: theme.primary }} />
                                </div>
                                <div>
                                  <div className="font-semibold" style={{ color: theme.textPrimary }}>
                                    {powerlist.name}
                                  </div>
                                  <div className="text-sm" style={{ color: theme.textSecondary }}>
                                    {powerlist.position}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {powerlist.current_company || 'Independent'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {powerlist.company_industry || 'General'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {powerlist.gender || 'Not specified'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm" style={{ color: theme.textPrimary }}>
                                {powerlist.passport_nationality_one || 'Global'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
                                style={{ backgroundColor: theme.primary }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
                              >
                                <Eye size={14} className="inline mr-1" />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-lg shadow-lg border" style={{ borderColor: theme.borderLight }}>
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: theme.backgroundSoft }}
              >
                <User size={48} style={{ color: theme.textDisabled }} />
              </div>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: theme.textPrimary }}>
                No professionals found
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
                We couldn't find any professionals matching your search criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearAllFilters();
                }}
                className="text-white px-6 py-3 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: theme.primary }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.primary}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <UserFooter />

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          isOpen={showAuth}
          onClose={handleCloseAuth}
          onLoginSuccess={handleCloseAuth}
        />
      )}

      {/* Powerlist Submission Form Modal */}
      {showPowerlistForm && (
        <PowerlistSubmissionForm
          onClose={handleClosePowerlistForm}
          onSuccess={handlePowerlistSuccess}
        />
      )}
    </div>
  );
};

export default PowerlistPage;