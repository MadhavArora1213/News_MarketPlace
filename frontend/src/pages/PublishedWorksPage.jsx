import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  ExternalLink, Eye
} from 'lucide-react';


const PublishedWorksPage = () => {
  const { isAuthenticated, hasRole, hasAnyRole, getRoleLevel } = useAuth();
  const navigate = useNavigate();
  const [publishedWorks, setPublishedWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    articleYear: '',
    companyCountry: '',
    individualCountry: '',
    industry: ''
  });

  const uniqueYears = [...new Set(publishedWorks.map(w => w.article_year).filter(Boolean))].sort();
  const uniqueCompanyCountries = [...new Set(publishedWorks.map(w => w.company_country).filter(Boolean))].sort();
  const uniqueIndividualCountries = [...new Set(publishedWorks.map(w => w.individual_country).filter(Boolean))].sort();
  const uniqueIndustries = [...new Set(publishedWorks.map(w => w.industry).filter(Boolean))].sort();

  const filteredWorks = publishedWorks.filter(work => {
    const matchesSearch = searchTerm === '' || [
      work.publication_name,
      work.company_name,
      work.person_name,
      work.industry,
      work.company_country,
      work.individual_country
    ].some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesYear = filters.articleYear === '' || work.article_year == filters.articleYear;
    const matchesCompanyCountry = filters.companyCountry === '' || work.company_country === filters.companyCountry;
    const matchesIndividualCountry = filters.individualCountry === '' || work.individual_country === filters.individualCountry;
    const matchesIndustry = filters.industry === '' || work.industry === filters.industry;
    return matchesSearch && matchesYear && matchesCompanyCountry && matchesIndividualCountry && matchesIndustry;
  });

  useEffect(() => {
    fetchPublishedWorks();
  }, []);

  const fetchPublishedWorks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/published-works');
      setPublishedWorks(response.data.publishedWorks || []);
    } catch (error) {
      console.error('Error fetching published works:', error);
      if (error.response?.status === 401) {
        setShowAuth(true);
      } else {
        setPublishedWorks([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handlePublishedWorkClick = (publishedWork) => {
    navigate(`/published-works/${publishedWork.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4 border-4 border-[#1976D2] border-t-transparent"></div>
            <p className="text-lg text-[#757575]">Loading published works...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <UserHeader onShowAuth={handleShowAuth} />

      {/* Disclaimer Ticker */}
      <section className="relative overflow-hidden bg-red-600 text-white py-3">
        <style>
          {`
            @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            .animate-marquee {
              animation: marquee 30s linear infinite;
            }
          `}
        </style>
        <div className="whitespace-nowrap animate-marquee">
          <span className="inline-block px-4">
            Disclaimer: All information is provided as is. We do not guarantee the accuracy, completeness, or timeliness of the information. Users should verify information independently before making any decisions.
          </span>
          <span className="inline-block px-4">
            Disclaimer: All information is provided as is. We do not guarantee the accuracy, completeness, or timeliness of the information. Users should verify information independently before making any decisions.
          </span>
        </div>
      </section>

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
              Published Works
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              {filteredWorks.length} Published Articles Available
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by publication, company, person, industry, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.articleYear}
              onChange={(e) => setFilters({ ...filters, articleYear: e.target.value })}
              className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={filters.companyCountry}
              onChange={(e) => setFilters({ ...filters, companyCountry: e.target.value })}
              className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
            >
              <option value="">All Company Countries</option>
              {uniqueCompanyCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <select
              value={filters.individualCountry}
              onChange={(e) => setFilters({ ...filters, individualCountry: e.target.value })}
              className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
            >
              <option value="">All Individual Countries</option>
              {uniqueIndividualCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
            >
              <option value="">All Industries</option>
              {uniqueIndustries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Published Works Cards */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {filteredWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorks.map((work, index) => (
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-sm font-semibold text-[#1976D2]">
                      SN: {work.sn}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-[#212121]">
                    {work.publication_name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <div className="mb-2">
                        <span className="font-medium text-[#757575]">Year: </span>
                        <span className="text-[#212121]">{work.article_year || 'N/A'}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium text-[#757575]">Date: </span>
                        <span className="text-[#212121]">{formatDate(work.article_date)}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium text-[#757575]">Company: </span>
                        <span className="text-[#212121]">{work.company_name}</span>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2">
                        <span className="font-medium text-[#757575]">Person: </span>
                        <span className="text-[#212121]">{work.person_name}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium text-[#757575]">Industry: </span>
                        <span className="text-[#212121]">{work.industry}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium text-[#757575]">Company Country: </span>
                        <span className="text-[#212121]">{work.company_country}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-medium text-[#757575]">Individual Country: </span>
                        <span className="text-[#212121]">{work.individual_country}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div>
                      <span className="font-medium text-[#757575]">Website: </span>
                      <a
                        href={work.publication_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {work.publication_website.length > 30 ? `${work.publication_website.substring(0, 30)}...` : work.publication_website}
                      </a>
                    </div>
                    <div>
                      <span className="font-medium text-[#757575]">Article Link: </span>
                      <a
                        href={work.article_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {work.article_link.length > 30 ? `${work.article_link.substring(0, 30)}...` : work.article_link}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePublishedWorkClick(work)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm bg-[#1976D2] text-white hover:bg-[#0D47A1]"
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#F5F5F5]">
                <ExternalLink size={48} className="text-[#BDBDBD]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-[#212121]">
                No published works found
              </h3>
              <p className="mb-6 max-w-md mx-auto text-[#757575]">
                We couldn't find any published works at the moment.
              </p>
            </div>
          )}
        </div>
      </section>

      <UserFooter />

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal
          isOpen={showAuth}
          onClose={handleCloseAuth}
          onLoginSuccess={handleCloseAuth}
        />
      )}
    </div>
  );
};

export default PublishedWorksPage;