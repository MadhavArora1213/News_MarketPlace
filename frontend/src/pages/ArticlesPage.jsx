import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import api from '../services/api';
import AuthModal from '../components/auth/AuthModal';
import {
  ExternalLink, Eye, FileText, Calendar, User, Newspaper
} from 'lucide-react';

const ArticlesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, [currentPage]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12
      });

      const response = await api.get(`/article-submissions/approved-articles?${params.toString()}`);
      setArticles(response.data.articles || []);
      setTotalPages(response.data.pagination.totalPages);
      setTotalArticles(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
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

  const handleManualSubmission = () => {
    if (isAuthenticated) {
      navigate('/submit-article');
    } else {
      setShowAuth(true);
    }
  };

  const handleAISubmission = () => {
    alert('Coming Soon');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredArticles = articles.filter(article => {
    if (!searchTerm) return true;
    return [
      article.title,
      article.sub_title,
      article.by_line,
      article.publication?.publication_name
    ].some(field => field && field.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <UserHeader onShowAuth={handleShowAuth} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4 border-4 border-[#1976D2] border-t-transparent"></div>
            <p className="text-lg text-[#757575]">Loading articles...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
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
              Approved Articles
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              {totalArticles} Approved Articles Available
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={handleManualSubmission}
                className="px-6 py-3 bg-[#1976D2] text-white rounded-lg font-medium hover:bg-[#0D47A1] transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={18} />
                Manual Article Submission
              </button>
              <button
                onClick={handleAISubmission}
                className="px-6 py-3 bg-[#4CAF50] text-white rounded-lg font-medium hover:bg-[#388E3C] transition-colors flex items-center justify-center gap-2"
              >
                <Newspaper size={18} />
                AI Generated Article
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by title, subtitle, author, or publication..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2]"
            />
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {filteredArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] hover:shadow-md transition-shadow p-6"
                  >
                    {/* Image */}
                    {article.image1 && (
                      <div className="mb-4">
                        <img
                          src={`/api/uploads/article-submissions/${article.image1}`}
                          alt={article.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-2 text-[#212121] line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Subtitle */}
                    {article.sub_title && (
                      <p className="text-sm text-[#757575] mb-3 line-clamp-2">
                        {article.sub_title}
                      </p>
                    )}

                    {/* Publication */}
                    <div className="flex items-center text-sm mb-2">
                      <Newspaper size={14} className="mr-2 text-[#1976D2]" />
                      <span className="font-medium text-[#757575]">Publication: </span>
                      <span className="text-[#212121] ml-1">{article.publication?.publication_name || 'Not Assigned'}</span>
                    </div>

                    {/* Author */}
                    <div className="flex items-center text-sm mb-2">
                      <User size={14} className="mr-2 text-[#1976D2]" />
                      <span className="font-medium text-[#757575]">Author: </span>
                      <span className="text-[#212121] ml-1">{article.by_line || 'Anonymous'}</span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center text-sm mb-4">
                      <Calendar size={14} className="mr-2 text-[#1976D2]" />
                      <span className="font-medium text-[#757575]">Date: </span>
                      <span className="text-[#212121] ml-1">{formatDate(article.created_at)}</span>
                    </div>

                    {/* View Button */}
                    <button
                      onClick={() => navigate(`/articles/${article.slug}`)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm bg-[#1976D2] text-white hover:bg-[#0D47A1]"
                    >
                      <Eye size={14} />
                      View Article
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-[#E0E0E0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5]"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded-lg ${
                          currentPage === page
                            ? 'bg-[#1976D2] text-white border-[#1976D2]'
                            : 'border-[#E0E0E0] hover:bg-[#F5F5F5]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-[#E0E0E0] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F5F5F5]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#F5F5F5]">
                <FileText size={48} className="text-[#BDBDBD]" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-[#212121]">
                No articles found
              </h3>
              <p className="mb-6 max-w-md mx-auto text-[#757575]">
                We couldn't find any articles matching your search criteria.
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

export default ArticlesPage;