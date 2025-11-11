import React, { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';

// Paparazzi Form Modal Component
const PaparazziFormModal = ({ isOpen, onClose, paparazzi, onSave }) => {
  const [formData, setFormData] = useState({
    platform: 'Instagram',
    username: '',
    page_name: '',
    followers_count: '',
    collaboration: '',
    category: '',
    location: '',
    price_reel_no_tag_no_collab: '',
    price_reel_with_tag_no_collab: '',
    price_reel_with_tag: '',
    video_minutes_allowed: '',
    pin_post_weekly_charge: '',
    story_charge: '',
    story_with_reel_charge: '',
    page_website: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (paparazzi) {
      setFormData({
        platform: paparazzi.platform || 'Instagram',
        username: paparazzi.username || '',
        page_name: paparazzi.page_name || '',
        followers_count: paparazzi.followers_count || '',
        collaboration: paparazzi.collaboration || '',
        category: paparazzi.category || '',
        location: paparazzi.location || '',
        price_reel_no_tag_no_collab: paparazzi.price_reel_no_tag_no_collab || '',
        price_reel_with_tag_no_collab: paparazzi.price_reel_with_tag_no_collab || '',
        price_reel_with_tag: paparazzi.price_reel_with_tag || '',
        video_minutes_allowed: paparazzi.video_minutes_allowed || '',
        pin_post_weekly_charge: paparazzi.pin_post_weekly_charge || '',
        story_charge: paparazzi.story_charge || '',
        story_with_reel_charge: paparazzi.story_with_reel_charge || '',
        page_website: paparazzi.page_website || ''
      });
    } else {
      setFormData({
        platform: 'Instagram',
        username: '',
        page_name: '',
        followers_count: '',
        collaboration: '',
        category: '',
        location: '',
        price_reel_no_tag_no_collab: '',
        price_reel_with_tag_no_collab: '',
        price_reel_with_tag: '',
        video_minutes_allowed: '',
        pin_post_weekly_charge: '',
        story_charge: '',
        story_with_reel_charge: '',
        page_website: ''
      });
    }
  }, [paparazzi, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        followers_count: parseInt(formData.followers_count) || 0,
        price_reel_no_tag_no_collab: parseFloat(formData.price_reel_no_tag_no_collab) || 0,
        price_reel_with_tag_no_collab: parseFloat(formData.price_reel_with_tag_no_collab) || 0,
        price_reel_with_tag: parseFloat(formData.price_reel_with_tag) || 0,
        video_minutes_allowed: parseInt(formData.video_minutes_allowed) || 0,
        pin_post_weekly_charge: parseFloat(formData.pin_post_weekly_charge) || 0,
        story_charge: parseFloat(formData.story_charge) || 0,
        story_with_reel_charge: parseFloat(formData.story_with_reel_charge) || 0
      };

      if (paparazzi) {
        await api.put(`/paparazzi/admin/${paparazzi.id}`, dataToSend);
      } else {
        await api.post('/paparazzi/admin', dataToSend);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving paparazzi:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error saving paparazzi. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px'
  };

  const contentStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
  };

  const formGroupStyle = {
    marginBottom: '16px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#212121',
    marginBottom: '6px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    marginRight: '12px'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            {paparazzi ? 'Edit Paparazzi' : 'Create Paparazzi'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Platform *</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                style={inputStyle}
                required
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="Twitter">Twitter</option>
                <option value="Facebook">Facebook</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Username *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Page Name *</label>
              <input
                type="text"
                value={formData.page_name}
                onChange={(e) => setFormData({ ...formData, page_name: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Followers Count</label>
              <input
                type="number"
                min="0"
                value={formData.followers_count}
                onChange={(e) => setFormData({ ...formData, followers_count: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={inputStyle}
                placeholder="e.g., Fashion, Travel, Food"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={inputStyle}
                placeholder="e.g., Dubai, UAE"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Collaboration Type</label>
              <input
                type="text"
                value={formData.collaboration}
                onChange={(e) => setFormData({ ...formData, collaboration: e.target.value })}
                style={inputStyle}
                placeholder="e.g., Sponsored Posts, Giveaways"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Website</label>
              <input
                type="url"
                value={formData.page_website}
                onChange={(e) => setFormData({ ...formData, page_website: e.target.value })}
                style={inputStyle}
                placeholder="https://..."
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Pricing Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Reel (No Tag, No Collab) ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_reel_no_tag_no_collab}
                  onChange={(e) => setFormData({ ...formData, price_reel_no_tag_no_collab: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Reel (With Tag, No Collab) ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_reel_with_tag_no_collab}
                  onChange={(e) => setFormData({ ...formData, price_reel_with_tag_no_collab: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Reel (With Tag & Collab) ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_reel_with_tag}
                  onChange={(e) => setFormData({ ...formData, price_reel_with_tag: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Video Minutes Allowed</label>
                <input
                  type="number"
                  min="0"
                  value={formData.video_minutes_allowed}
                  onChange={(e) => setFormData({ ...formData, video_minutes_allowed: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Pin Post Weekly Charge ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pin_post_weekly_charge}
                  onChange={(e) => setFormData({ ...formData, pin_post_weekly_charge: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Story Charge ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.story_charge}
                  onChange={(e) => setFormData({ ...formData, story_charge: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Story with Reel Charge ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.story_with_reel_charge}
                  onChange={(e) => setFormData({ ...formData, story_with_reel_charge: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: '#1976D2', color: '#fff' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : (paparazzi ? 'Update Paparazzi' : 'Create Paparazzi')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Rejection Reason Modal Component
const RejectionReasonModal = ({ isOpen, onClose, onConfirm, paparazzi }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(reason);
      onClose();
      setReason('');
    } catch (error) {
      console.error('Error rejecting paparazzi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px'
  };

  const contentStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    marginRight: '12px'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#F44336' }}>
            Reject Paparazzi Submission
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Please provide a reason for rejecting <strong>{paparazzi?.page_name}</strong>'s submission:
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#212121', marginBottom: '8px' }}>
              Rejection Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                minHeight: '100px',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
              placeholder="Please explain why this submission is being rejected..."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: '#F44336', color: '#fff' }}
              disabled={loading}
            >
              {loading ? 'Rejecting...' : 'Reject Submission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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

const PaparazziManagement = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();

  // Check if user has permission to manage paparazzi
  if (!hasAnyRole(['super_admin', 'content_manager'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access paparazzi management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required roles: Super Admin or Content Manager
          </p>
        </div>
      </div>
    );
  }

  const [paparazzi, setPaparazzi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPaparazzi, setEditingPaparazzi] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectingPaparazzi, setRejectingPaparazzi] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Layout constants (same as AdminDashboard)
  const headerZ = 1000;
  const mobileOverlayZ = 500;
  const sidebarZ = 200;
  const headerHeight = 64;
  const mainPaddingTop = headerHeight + 18;
  const sidebarWidth = 240;
  const leftGap = 24;

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
    const fetchData = async () => {
      try {
        await fetchPaparazzi();
      } catch (error) {
        console.error('Error fetching data:', error);
        // If unauthorized, the API interceptor will handle redirect
      }
    };

    fetchData();
  }, []);

  const fetchPaparazzi = async () => {
    try {
      const response = await api.get('/paparazzi/admin');
      setPaparazzi(response.data.paparazzi || []);
    } catch (error) {
      console.error('Error fetching paparazzi:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
        return;
      }
      alert('Failed to load paparazzi. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered paparazzi based on search and filters
  const filteredPaparazzi = useMemo(() => {
    let filtered = paparazzi;

    if (debouncedSearchTerm) {
      filtered = filtered.filter(p =>
        p.page_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        p.username.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        p.location?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (platformFilter) {
      filtered = filtered.filter(p => p.platform === platformFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter(p => p.category && p.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    if (locationFilter) {
      filtered = filtered.filter(p => p.location && p.location.toLowerCase().includes(locationFilter.toLowerCase()));
    }

    return filtered;
  }, [paparazzi, debouncedSearchTerm, statusFilter, platformFilter, categoryFilter, locationFilter]);

  // Update filtered paparazzi when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [debouncedSearchTerm, statusFilter, platformFilter, categoryFilter, locationFilter]);

  // Sorting logic
  const sortedPaparazzi = useMemo(() => {
    return [...filteredPaparazzi].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'followers_count' || sortField === 'price_reel_no_tag_no_collab') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortField === 'created_at' || sortField === 'updated_at') {
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
  }, [filteredPaparazzi, sortField, sortDirection]);

  // Pagination logic
  const paginatedPaparazzi = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedPaparazzi.slice(startIndex, startIndex + pageSize);
  }, [sortedPaparazzi, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedPaparazzi.length / pageSize);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // CRUD operations
  const handleCreatePaparazzi = () => {
    setEditingPaparazzi(null);
    setShowFormModal(true);
  };

  const handleEditPaparazzi = (paparazziItem) => {
    setEditingPaparazzi(paparazziItem);
    setShowFormModal(true);
  };

  const handleDeletePaparazzi = async (paparazziId) => {
    if (!window.confirm('Are you sure you want to delete this paparazzi submission?')) return;

    try {
      await api.delete(`/paparazzi/admin/${paparazziId}`);
      fetchPaparazzi();
    } catch (error) {
      console.error('Error deleting paparazzi:', error);
      alert('Error deleting paparazzi. Please try again.');
    }
  };

  const handleApprovePaparazzi = async (paparazziId) => {
    if (!window.confirm('Are you sure you want to approve this paparazzi submission?')) return;

    try {
      await api.put(`/paparazzi/admin/${paparazziId}/approve`);
      fetchPaparazzi();
    } catch (error) {
      console.error('Error approving paparazzi:', error);
      alert('Error approving paparazzi. Please try again.');
    }
  };

  const handleRejectPaparazzi = (paparazziItem) => {
    setRejectingPaparazzi(paparazziItem);
    setShowRejectionModal(true);
  };

  const handleRejectConfirm = async (reason) => {
    try {
      await api.put(`/paparazzi/admin/${rejectingPaparazzi.id}/reject`, { reason });
      fetchPaparazzi();
    } catch (error) {
      console.error('Error rejecting paparazzi:', error);
      alert('Error rejecting paparazzi. Please try again.');
    }
  };

  const handleFormSave = () => {
    fetchPaparazzi();
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPlatformFilter('');
    setCategoryFilter('');
    setLocationFilter('');
  };

  const getStatusStyle = (status) => {
    const statusColors = {
      pending: { bg: `${theme.warning}20`, color: theme.warning },
      approved: { bg: `${theme.success}20`, color: theme.success },
      rejected: { bg: `${theme.danger}20`, color: theme.danger }
    };

    const colors = statusColors[status] || { bg: `${theme.textDisabled}20`, color: theme.textDisabled };

    return {
      backgroundColor: colors.bg,
      color: colors.color,
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem'
    };
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      Instagram: '📸',
      TikTok: '🎵',
      YouTube: '📺',
      Twitter: '🐦',
      Facebook: '👥'
    };
    return icons[platform] || '📱';
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundSoft, color: theme.text, paddingBottom: '3rem' }}>
        {/* Header */}
        <header
          className="shadow-sm"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: headerZ,
            backgroundColor: theme.background,
            boxShadow: '0 6px 20px rgba(2,6,23,0.06)',
            borderBottom: `1px solid ${theme.borderLight}`
          }}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10" style={{ minHeight: 64 }}>
            <div className="flex justify-between items-center py-3">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="shield-check" size="lg" style={{ color: '#1976D2' }} />
                <span style={{ fontWeight: 700, fontSize: 18 }}>News Marketplace Admin</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>Loading...</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            {/* Skeleton Filters Sidebar */}
            <aside style={{
              width: '280px',
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 8px 20px rgba(2,6,23,0.06)',
              height: 'fit-content'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i}>
                    <div style={{
                      height: '14px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      width: '60%'
                    }}></div>
                    <div style={{
                      height: '32px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '6px',
                      width: '100%'
                    }}></div>
                  </div>
                ))}
              </div>
            </aside>

            <main style={{ flex: 1, minWidth: 0 }}>
              {/* Page Header Skeleton */}
              <div style={{ background: '#fff', borderRadius: 12, padding: 28, marginBottom: 24, border: `4px solid #000` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f3f4f6' }}></div>
                  <div style={{ height: 34, background: '#f3f4f6', borderRadius: 4, width: '300px' }}></div>
                </div>
                <div style={{ height: 16, background: '#f3f4f6', borderRadius: 4, width: '200px' }}></div>
              </div>

              {/* Table Skeleton */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  {[...Array(10)].map((_, index) => (
                    <div key={index} style={{
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                      padding: '16px'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '120px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '100px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '60px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <div style={{ width: '60px', height: '24px', background: '#f3f4f6', borderRadius: 4 }}></div>
                          <div style={{ width: '60px', height: '24px', background: '#f3f4f6', borderRadius: 4 }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundSoft, color: theme.text, paddingBottom: '3rem' }}>
      {/* Header */}
      <header
        className="shadow-sm"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: headerZ,
          backgroundColor: theme.background,
          boxShadow: '0 6px 20px rgba(2,6,23,0.06)',
          borderBottom: `1px solid ${theme.borderLight}`
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10" style={{ minHeight: 64 }}>
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 md:hidden"
                aria-label="Toggle sidebar"
                style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              </button>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mr-3 hidden md:block"
                aria-label="Toggle sidebar"
                style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.text} strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="shield-check" size="lg" style={{ color: '#1976D2' }} />
                <span style={{ fontWeight: 700, fontSize: 18 }}>News Marketplace Admin</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{admin?.first_name ? `${admin.first_name} ${admin.last_name}` : 'Master Admin'}</div>
                <div style={{ marginTop: 6 }}>
                  <span style={getRoleStyle(admin?.role)}>{roleDisplayNames[admin?.role] || '—'}</span>
                </div>
              </div>

              <button onClick={logout} style={{ ...btnPrimary, padding: '0.45rem 0.75rem' }}>
                <Icon name="arrow-right-on-rectangle" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10" style={{
        paddingTop: mainPaddingTop,
        marginLeft: !isMobile && sidebarOpen ? (sidebarWidth + leftGap) : 0,
        transition: 'margin-left 0.28s ease-in-out'
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <main style={{ flex: 1, minWidth: 0, paddingLeft: !isMobile ? leftGap : 0 }}>
            {/* Page Header */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: `4px solid #000`, display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: 24, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="camera" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Paparazzi Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage paparazzi submissions and approvals</p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCreatePaparazzi}
                  style={{ ...btnPrimary, fontSize: '14px', padding: '12px 20px' }}
                  disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                >
                  <Icon name="plus" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                  Add Paparazzi
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.textSecondary} strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search paparazzi by name, username, category, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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

                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
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

              {/* Filter Row */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    minWidth: '120px'
                  }}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    minWidth: '120px'
                  }}
                >
                  <option value="">All Platforms</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Twitter">Twitter</option>
                  <option value="Facebook">Facebook</option>
                </select>

                <input
                  type="text"
                  placeholder="Filter by category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minWidth: '120px'
                  }}
                />

                <input
                  type="text"
                  placeholder="Filter by location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minWidth: '120px'
                  }}
                />

                <button
                  onClick={clearFilters}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: theme.textPrimary,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Clear Filters
                </button>
              </div>

              {/* Search Results Summary */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {debouncedSearchTerm ? (
                    <>
                      <span style={{ color: theme.primary, fontWeight: '600' }}>Search:</span> Found <strong>{sortedPaparazzi.length}</strong> paparazzi
                    </>
                  ) : (
                    <>
                      Showing <strong>{paginatedPaparazzi.length}</strong> of <strong>{sortedPaparazzi.length}</strong> paparazzi
                      {sortedPaparazzi.length !== paparazzi.length && (
                        <span> (filtered from {paparazzi.length} total)</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Paparazzi Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              {/* Table Controls */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                      Paparazzi
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

              <div style={{ overflowX: 'auto', maxHeight: paginatedPaparazzi.length > 50 ? '600px' : 'auto', overflowY: paginatedPaparazzi.length > 50 ? 'auto' : 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Platform
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('page_name')}
                      >
                        Page Name {getSortIcon('page_name')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Username
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('followers_count')}
                      >
                        Followers {getSortIcon('followers_count')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Category
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Location
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('status')}
                      >
                        Status {getSortIcon('status')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPaparazzi.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <Icon name="camera" size="lg" style={{ color: theme.textDisabled }} />
                            <div>No paparazzi found matching your criteria.</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedPaparazzi.map((paparazziItem, index) => (
                        <tr key={paparazziItem.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '16px' }}>{getPlatformIcon(paparazziItem.platform)}</span>
                              {paparazziItem.platform}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '4px' }}>
                              {paparazziItem.page_name}
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                              ID: {paparazziItem.id}
                            </div>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            @{paparazziItem.username}
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            {paparazziItem.followers_count ? paparazziItem.followers_count.toLocaleString() : '—'}
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            {paparazziItem.category || '—'}
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            {paparazziItem.location || '—'}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={getStatusStyle(paparazziItem.status)}>
                              {paparazziItem.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {paparazziItem.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprovePaparazzi(paparazziItem.id)}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: theme.success,
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="Approve Paparazzi"
                                  >
                                    <Icon name="check" size="xs" style={{ color: '#fff' }} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectPaparazzi(paparazziItem)}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: theme.danger,
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="Reject Paparazzi"
                                  >
                                    <Icon name="x-mark" size="xs" style={{ color: '#fff' }} />
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleEditPaparazzi(paparazziItem)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: theme.primary,
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Edit Paparazzi"
                              >
                                <Icon name="pencil" size="xs" style={{ color: '#fff' }} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePaparazzi(paparazziItem.id)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: theme.danger,
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Delete Paparazzi"
                              >
                                <Icon name="trash" size="xs" style={{ color: '#fff' }} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: currentPage === 1 ? '#f3f4f6' : '#fff',
                        color: currentPage === 1 ? '#9ca3af' : theme.textPrimary,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Previous
                    </button>

                    <span style={{ fontSize: '14px', color: theme.textSecondary }}>
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#fff',
                        color: currentPage === totalPages ? '#9ca3af' : theme.textPrimary,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Paparazzi Form Modal */}
      <PaparazziFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        paparazzi={editingPaparazzi}
        onSave={handleFormSave}
      />

      {/* Rejection Reason Modal */}
      <RejectionReasonModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onConfirm={handleRejectConfirm}
        paparazzi={rejectingPaparazzi}
      />
    </div>
  );
};

export default PaparazziManagement;