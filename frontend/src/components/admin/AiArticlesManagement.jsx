import React, { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';
import { Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react';

// Brand colors from Color palette .pdf - using only defined colors
const theme = {
  primary: '#1976D2',        // Primary Blue
  primaryDark: '#0D47A1',    // Primary Dark
  primaryLight: '#E3F2FD',   // Primary Light
  secondary: '#00796B',      // Secondary Teal
  secondaryDark: '#004D40',  // Secondary Dark
  secondaryLight: '#E0F2F1', // Secondary Light
  success: '#4CAF50',        // Success Green
  warning: '#FF9800',        // Warning Orange
  danger: '#F44336',         // Error Red
  info: '#9C27B0',           // Info Purple
  textPrimary: '#212121',    // Text Primary
  textSecondary: '#757575',  // Text Secondary
  textDisabled: '#BDBDBD',   // Text Disabled
  background: '#FFFFFF',     // Background
  backgroundAlt: '#FAFAFA',  // Background Alt
  backgroundSoft: '#F5F5F5', // Background Soft
  borderLight: '#E0E0E0',    // Border Light
  borderMedium: '#BDBDBD',   // Border Medium
  borderDark: '#757575',     // Border Dark
  roleColors: {
    super_admin: { bg: '#E0F2F1', color: '#004D40' }, // Using secondary colors
    content_manager: { bg: '#E3F2FD', color: '#0D47A1' }, // Using primary colors
    editor: { bg: '#FAFAFA', color: '#212121' }, // Using neutral colors
    registered_user: { bg: '#F5F5F5', color: '#757575' }, // Using neutral colors
    agency: { bg: '#E0F2F1', color: '#00796B' }, // Using secondary colors
    other: { bg: '#FAFAFA', color: '#757575' } // Using neutral colors
  }
};

const AiArticlesManagement = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();

  // Check if user has permission to manage AI articles
  if (!hasAnyRole(['super_admin', 'content_manager'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft, color: theme.text }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access AI articles management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required roles: Super Admin or Content Manager
          </p>
        </div>
      </div>
    );
  }

  // Layout constants (same as AdminDashboard)
  const headerZ = 1000;
  const mobileOverlayZ = 500;
  const sidebarZ = 200;
  const headerHeight = 64;
  const mainPaddingTop = headerHeight + 18;
  const sidebarWidth = 240;
  const leftGap = 24;

  const [articles, setArticles] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    story_type: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Pagination logic (server-side)
  const totalPages = Math.ceil(totalArticles / pageSize);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize(); // Set initial value
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (sidebarOpen && isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
    return undefined;
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    fetchArticles();
  }, [currentPage, pageSize, filters]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        ...filters
      });

      const response = await api.get(`/ai-generated-articles?${params.toString()}`);
      setArticles(response.data.articles || []);
      setTotalArticles(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching AI articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (articleId, newStatus) => {
    try {
      await api.patch(`/ai-generated-articles/${articleId}/status`, { status: newStatus });
      fetchArticles(); // Refresh the list
    } catch (error) {
      console.error('Error updating article status:', error);
      alert('Failed to update article status');
    }
  };

  const handleDelete = async (articleId) => {
    if (!confirm('Are you sure you want to delete this AI article?')) return;

    try {
      await api.delete(`/ai-generated-articles/${articleId}`);
      fetchArticles(); // Refresh the list
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sidebarStyles = {
    width: sidebarWidth,
    backgroundColor: theme.background,
    borderRight: `1px solid ${theme.borderLight}`,
    padding: 16,
    boxSizing: 'border-box',
    borderRadius: 8
  };

  const mobileSidebarOverlay = {
    position: 'fixed',
    top: headerHeight,
    left: 0,
    height: `calc(100vh - ${headerHeight}px)`,
    zIndex: mobileOverlayZ,
    backgroundColor: '#fff',
    padding: 16,
    boxSizing: 'border-box',
    width: sidebarWidth,
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
  };

  const roleDisplayNames = {
    'super_admin': 'Super Administrator',
    'content_manager': 'Content Manager',
    'editor': 'Editor',
    'registered_user': 'Registered User',
    'agency': 'Agency',
    'other': 'Other'
  };

  const btnPrimary = {
    backgroundColor: theme.primary,
    color: '#fff',
    padding: '0.625rem 1rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    border: 'none',
    boxShadow: `0 6px 18px rgba(25,118,210,0.14)`
  };

  const getRoleStyle = (role) => {
    const r = theme.roleColors[role] || theme.roleColors.other;
    return {
      backgroundColor: r.bg,
      color: r.color,
      padding: '0.125rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      lineHeight: 1
    };
  };

  return (
    <div style={{ backgroundColor: theme.backgroundSoft, minHeight: '100vh', color: theme.textPrimary }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: headerHeight,
        backgroundColor: theme.background,
        borderBottom: `1px solid ${theme.borderLight}`,
        zIndex: headerZ,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1976D2, #0D47A1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: '18px', fontWeight: '800' }}>N</span>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: theme.textPrimary }}>News MarketPlace</h1>
              <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary }}>Admin Panel</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
              {admin?.first_name} {admin?.last_name}
            </div>
            <div style={getRoleStyle(admin?.role)}>
              {roleDisplayNames[admin?.role] || 'User'}
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.danger} strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      {sidebarOpen && (
        <>
          {isMobile && (
            <div
              style={mobileSidebarOverlay}
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <aside style={{
            position: isMobile ? 'fixed' : 'fixed',
            top: headerHeight,
            left: 0,
            width: sidebarWidth,
            height: `calc(100vh - ${headerHeight}px)`,
            zIndex: sidebarZ,
            ...sidebarStyles
          }}>
            <Sidebar
              admin={admin}
              roleDisplayNames={roleDisplayNames}
              theme={theme}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              sidebarStyles={sidebarStyles}
              mobileSidebarOverlay={mobileSidebarOverlay}
              isMobile={isMobile}
              headerHeight={headerHeight}
              sidebarWidth={sidebarWidth}
              sidebarZ={sidebarZ}
              mobileOverlayZ={mobileOverlayZ}
            />
          </aside>
        </>
      )}

      {/* Main Content */}
      <main style={{
        marginLeft: sidebarOpen && !isMobile ? sidebarWidth + leftGap : leftGap,
        paddingTop: mainPaddingTop,
        paddingRight: leftGap,
        paddingBottom: leftGap,
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Page Header */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: `4px solid #000`, display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: 24, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="document-text" size="sm" style={{ color: '#1976D2' }} />
              </div>
              <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>AI Articles Management</h1>
            </div>
            <p style={{ marginTop: 8, color: '#757575' }}>Manage AI-generated article submissions</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', padding: '24px' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Articles Management</h2>
            <p className="text-gray-600">Manage AI-generated article submissions</p>
          </div>

      {/* Search and Filter Bar */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={{
              padding: '12px 16px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              minWidth: '150px',
              transition: 'border-color 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = theme.primary}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filters.story_type}
            onChange={(e) => setFilters({ ...filters, story_type: e.target.value })}
            style={{
              padding: '12px 16px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              minWidth: '150px',
              transition: 'border-color 0.2s',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = theme.primary}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          >
            <option value="">All Types</option>
            <option value="profile">Profile</option>
            <option value="editorial">Editorial</option>
            <option value="advertorial">Advertorial</option>
            <option value="listicle">Listicle</option>
          </select>

          <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search by name, publication..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = theme.primary}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />

            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: '' })}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search Results Summary */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: theme.textSecondary }}>
            {filters.search || filters.status || filters.story_type ? (
              <>
                <span style={{ color: theme.primary, fontWeight: '600' }}>Filtered:</span> Found <strong>{totalArticles}</strong> article{totalArticles !== 1 ? 's' : ''}
              </>
            ) : (
              <>
                Showing <strong>{articles.length}</strong> of <strong>{totalArticles}</strong> article{totalArticles !== 1 ? 's' : ''}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
        {/* Table Controls */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                AI Articles
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#fff'
                }}
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '4px solid #e5e7eb',
                borderTop: `4px solid ${theme.primary}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{ color: theme.textSecondary }}>Loading articles...</span>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: theme.textSecondary }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {filters.search || filters.status || filters.story_type ? '🔍' : '📝'}
            </div>
            <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              {filters.search || filters.status || filters.story_type ? 'No articles found' : 'No articles available'}
            </div>
            <div style={{ fontSize: '16px', marginBottom: '16px' }}>
              {filters.search || filters.status || filters.story_type ? (
                <>
                  No articles match your search or filter criteria.
                  <br />
                  Try different keywords or adjust your filters.
                </>
              ) : (
                'No AI articles have been submitted yet.'
              )}
            </div>

            <button
              onClick={() => setFilters({ status: '', story_type: '', search: '' })}
              style={{
                padding: '12px 24px',
                backgroundColor: theme.primary,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto', maxHeight: articles.length > 50 ? '600px' : 'auto', overflowY: articles.length > 50 ? 'auto' : 'visible' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Article Info
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      User
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Status
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Created
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article, index) => (
                    <tr key={article.id} style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.closest('tr').style.backgroundColor = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.target.closest('tr').style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fafbfc';
                    }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: '2px solid #e5e7eb'
                          }}>
                            <span style={{ fontSize: '16px', color: theme.textSecondary, fontWeight: '600' }}>
                              {article.story_type.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: theme.textPrimary, marginBottom: '4px' }}>
                              {article.story_type.charAt(0).toUpperCase() + article.story_type.slice(1)}
                            </div>
                            {article.publication && (
                              <div style={{ fontSize: '12px', color: theme.primary, fontWeight: '500' }}>
                                {article.publication.publication_name}
                              </div>
                            )}
                            {article.name && (
                              <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
                                {article.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '14px', color: theme.textPrimary, fontWeight: '500' }}>
                          {article.user?.first_name} {article.user?.last_name}
                        </div>
                        <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                          {article.user?.email}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <select
                          value={article.status}
                          onChange={(e) => handleStatusChange(article.id, e.target.value)}
                          style={{
                            backgroundColor: article.status === 'approved' ? '#4CAF5020' : article.status === 'rejected' ? '#F4433620' : article.status === 'pending' ? '#FF980020' : '#BDBDBD20',
                            color: article.status === 'approved' ? '#4CAF50' : article.status === 'rejected' ? '#F44336' : article.status === 'pending' ? '#FF9800' : '#757575',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="draft">Draft</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                          {formatDate(article.created_at)}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setSelectedArticle(article);
                              setShowModal(true);
                            }}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: theme.info,
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#673ab7'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = theme.info}
                          >
                            View Details
                          </button>
                          {article.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(article.id, 'approved')}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: theme.success,
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#388e3c'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = theme.success}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(article.id, 'rejected')}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: theme.danger,
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = theme.danger}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(article.id)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: theme.danger,
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = theme.danger}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  Page {currentPage} of {totalPages} ({totalArticles} total articles)
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: currentPage === 1 ? '#e5e7eb' : theme.primary,
                      color: currentPage === 1 ? theme.textSecondary : '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: currentPage === totalPages ? '#e5e7eb' : theme.primary,
                      color: currentPage === totalPages ? theme.textSecondary : '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Article Details Modal */}
      {showModal && selectedArticle && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI Article Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Story Type</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedArticle.story_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedArticle.status)}`}>
                    {getStatusIcon(selectedArticle.status)}
                    <span className="ml-1 capitalize">{selectedArticle.status}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Publication</label>
                  <p className="text-sm text-gray-900">{selectedArticle.publication?.publication_name || 'Not Assigned'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedArticle.created_at)}</p>
                </div>
              </div>

              {selectedArticle.name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject Name</label>
                  <p className="text-sm text-gray-900">{selectedArticle.name}</p>
                </div>
              )}

              {selectedArticle.generated_content && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Generated Content</label>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: selectedArticle.generated_content }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
  );
};

export default AiArticlesManagement;