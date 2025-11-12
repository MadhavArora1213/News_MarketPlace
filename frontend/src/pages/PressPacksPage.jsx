import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  Search, Filter, Eye, Globe, MapPin, Building,
  DollarSign, FileText, ExternalLink, Package
} from 'lucide-react';

const PressPacksPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pressPacks, setPressPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    fetchPressPacks();
  }, []);

  const fetchPressPacks = async (page = 1) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        is_active: 'true'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (regionFilter) params.append('region', regionFilter);
      if (industryFilter) params.append('industry', industryFilter);
      if (languageFilter) params.append('language', languageFilter);
      if (priceFilter) params.append('price_range', priceFilter);

      const response = await api.get(`/press-packs?${params.toString()}`);
      let packs = response.data.pressPacks || [];

      setPressPacks(packs);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalCount(response.data.pagination?.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching press packs:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setPressPacks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPressPacks(1); // Reset to first page on filter change
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, regionFilter, industryFilter, languageFilter, priceFilter]);

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const getUniqueRegions = () => {
    const regions = pressPacks.map(p => p.region).filter(Boolean);
    return [...new Set(regions)].sort();
  };

  const getUniqueIndustries = () => {
    const industries = pressPacks.map(p => p.industry).filter(Boolean);
    return [...new Set(industries)].sort();
  };

  const getUniqueLanguages = () => {
    const languages = pressPacks.map(p => p.language).filter(Boolean);
    return [...new Set(languages)].sort();
  };

  const formatPrice = (price) => {
    if (!price) return 'Contact for pricing';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const handlePackClick = (packId) => {
    navigate(`/press-packs/${packId}`);
  };

  const handlePageChange = (page) => {
    fetchPressPacks(page);
  };

  const priceRanges = [
    { value: '', label: 'All Prices' },
    { value: '0-100', label: '$0 - $100' },
    { value: '100-500', label: '$100 - $500' },
    { value: '500-1000', label: '$500 - $1,000' },
    { value: '1000-5000', label: '$1,000 - $5,000' },
    { value: '5000+', label: '$5,000+' }
  ];

  if (loading && pressPacks.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4 border-4 border-[#E0E0E0] border-t-[#1976D2]"></div>
            <p className="text-lg text-[#757575]">Loading press packs...</p>
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
            <div className="flex justify-center mb-6">
              <div className="bg-[#1976D2] rounded-full p-4">
                <Package className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Press Release Distribution Packs
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Professional press release distribution packages to maximize your media coverage. {totalCount > 0 && `${totalCount} packages available`} across various regions and industries.
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
                placeholder="Search by package name, region, or industry..."
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
                  Region
                </label>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                >
                  <option value="">All Regions</option>
                  {getUniqueRegions().map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  Industry
                </label>
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                >
                  <option value="">All Industries</option>
                  {getUniqueIndustries().map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  Language
                </label>
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                >
                  <option value="">All Languages</option>
                  {getUniqueLanguages().map(language => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  Price Range
                </label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:ring-2 focus:ring-[#1976D2] focus:border-[#1976D2] bg-white text-[#212121]"
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Press Packs Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          {pressPacks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pressPacks.map((pack, index) => (
                  <motion.div
                    key={pack.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => handlePackClick(pack.id)}
                    className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
                  >
                    {/* Pack Image */}
                    {pack.image && (
                      <div className="aspect-video bg-[#E0E0E0] overflow-hidden">
                        <img
                          src={pack.image}
                          alt={pack.distribution_package}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-[#1976D2] transition-colors" style={{ color: '#212121' }}>
                            {pack.distribution_package}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[#757575] mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{pack.region}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Building size={14} />
                              <span>{pack.industry}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-[#1976D2] rounded-full p-2">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-3 rounded-lg bg-[#E3F2FD]">
                          <div className="text-lg font-bold text-[#1976D2]">
                            {pack.no_of_indexed_websites || 0}
                          </div>
                          <div className="text-xs text-[#757575]">Indexed Sites</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-[#E0F2F1]">
                          <div className="text-lg font-bold text-[#00796B]">
                            {pack.no_of_non_indexed_websites || 0}
                          </div>
                          <div className="text-xs text-[#757575]">Non-Indexed Sites</div>
                        </div>
                      </div>

                      {/* Price and Details */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-[#4CAF50] mb-1">
                            {formatPrice(pack.price)}
                          </div>
                          <div className="text-sm text-[#757575]">
                            {pack.words_limit ? `${pack.words_limit} words` : 'Flexible length'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-[#757575] mb-1">Language</div>
                          <div className="font-medium text-[#212121]">{pack.language}</div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pack.indexed && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#E8F5E8] text-[#4CAF50]">
                            Indexed
                          </span>
                        )}
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#FFF3E0] text-[#FF9800]">
                          {pack.region}
                        </span>
                      </div>

                      {/* CTA Button */}
                      <button
                        className="w-full text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#1976D2' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePackClick(pack.id);
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
                <Package className="w-12 h-12 text-[#BDBDBD]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#212121] mb-3">
                No press packs found
              </h3>
              <p className="text-[#757575] text-lg max-w-md mx-auto">
                We couldn't find any press packs matching your search criteria. Try adjusting your filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRegionFilter('');
                  setIndustryFilter('');
                  setLanguageFilter('');
                  setPriceFilter('');
                  fetchPressPacks(1);
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

export default PressPacksPage;