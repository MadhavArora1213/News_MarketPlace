import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Radio, Search, Filter, Globe, MapPin, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';

const RadioPage = () => {
  const [radios, setRadios] = useState([]);
  const [filteredRadios, setFilteredRadios] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedEmirate, setSelectedEmirate] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRadios();
  }, []);

  useEffect(() => {
    filterRadios();
  }, [radios, searchQuery, selectedLanguage, selectedEmirate]);

  const fetchRadios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/radios');
      setRadios(response.data.radios || []);
    } catch (err) {
      console.error('Error fetching radios:', err);
      setError('Failed to load radios. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterRadios = useCallback(() => {
    let filtered = radios.filter(radio => {
      const matchesSearch = radio.radio_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           radio.frequency.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           radio.radio_popular_rj.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage = selectedLanguage === 'all' || radio.radio_language === selectedLanguage;
      const matchesEmirate = selectedEmirate === 'all' || radio.emirate_state === selectedEmirate;
      return matchesSearch && matchesLanguage && matchesEmirate;
    });
    setFilteredRadios(filtered);
  }, [radios, searchQuery, selectedLanguage, selectedEmirate]);

  const languages = ['all', ...new Set(radios.map(radio => radio.radio_language).filter(Boolean))];
  const emirates = ['all', ...new Set(radios.map(radio => radio.emirate_state).filter(Boolean))];

  const handleCardClick = (radioId) => {
    navigate(`/radio/${radioId}`);
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
                <Radio className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#212121] mb-6 tracking-tight">
              Radio Stations
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Discover radio stations across the UAE. Find your favorite frequencies, languages, and popular RJ hosts.
            </p>
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
                placeholder="Search by name, frequency, or RJ..."
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
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang === 'all' ? 'All Languages' : lang}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#757575]" />
              <select
                value={selectedEmirate}
                onChange={(e) => setSelectedEmirate(e.target.value)}
                className="px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] text-[#212121]"
              >
                {emirates.map(emirate => (
                  <option key={emirate} value={emirate}>
                    {emirate === 'all' ? 'All Emirates' : emirate}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Radios Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1976D2] mx-auto mb-4"></div>
              <p className="text-[#757575]">Loading radio stations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRadios.map((radio) => (
                <motion.div
                  key={radio.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleCardClick(radio.id)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-[#1976D2] rounded-full p-3">
                        <Radio className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-[#1976D2] bg-[#E3F2FD] px-3 py-1 rounded-full">
                        {radio.frequency}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-[#212121] mb-2 line-clamp-2">
                      {radio.radio_name}
                    </h3>
                    <div className="space-y-2 text-sm text-[#757575]">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>{radio.radio_language}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{radio.emirate_state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{radio.radio_popular_rj}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && !error && filteredRadios.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#757575] text-lg">No radio stations found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      <UserFooter />
    </div>
  );
};

export default RadioPage;