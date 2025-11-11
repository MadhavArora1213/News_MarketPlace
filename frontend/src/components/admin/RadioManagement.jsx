import React, { useState, useEffect, useMemo } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Icon from '../common/Icon';
import Sidebar from './Sidebar';
import api from '../../services/api';

// Radio Form Modal Component
const RadioFormModal = ({ isOpen, onClose, radio, groups, onSave }) => {
  const [formData, setFormData] = useState({
    sn: '',
    group_id: '',
    radio_name: '',
    frequency: '',
    radio_language: '',
    radio_website: '',
    radio_linkedin: '',
    radio_instagram: '',
    emirate_state: '',
    radio_popular_rj: '',
    remarks: ''
  });

  // Generate sequential radio SN when component mounts for new radios
  useEffect(() => {
    const generateSequentialSN = async () => {
      if (!radio) {
        try {
          // Fetch existing radios to get the highest SN number
          const response = await api.get('/radios/admin');
          const existingRadios = response.data.radios || [];

          // Extract numbers from existing SNs (format: RAD-XXX)
          const existingNumbers = existingRadios
            .map(r => {
              const match = r.sn.match(/^RAD-(\d+)$/);
              return match ? parseInt(match[1]) : 0;
            })
            .filter(num => !isNaN(num));

          // Get the next sequential number
          const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

          // Format as RAD-XXX (pad with zeros to 3 digits)
          const formattedNumber = nextNumber.toString().padStart(3, '0');
          setFormData(prev => ({ ...prev, sn: `RAD-${formattedNumber}` }));
        } catch (error) {
          console.error('Error generating SN:', error);
          // Fallback to timestamp-based SN
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 100000);
          const uniqueId = `${timestamp}${random}`.slice(-12);
          setFormData(prev => ({ ...prev, sn: `RAD-${uniqueId}` }));
        }
      }
    };

    generateSequentialSN();
  }, [radio]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (radio) {
      setFormData({
        sn: radio.sn || '',
        group_id: radio.group_id || '',
        radio_name: radio.radio_name || '',
        frequency: radio.frequency || '',
        radio_language: radio.radio_language || '',
        radio_website: radio.radio_website || '',
        radio_linkedin: radio.radio_linkedin || '',
        radio_instagram: radio.radio_instagram || '',
        emirate_state: radio.emirate_state || '',
        radio_popular_rj: radio.radio_popular_rj || '',
        remarks: radio.remarks || ''
      });
    } else {
      setFormData({
        sn: '',
        group_id: '',
        radio_name: '',
        frequency: '',
        radio_language: '',
        radio_website: '',
        radio_linkedin: '',
        radio_instagram: '',
        emirate_state: '',
        radio_popular_rj: '',
        remarks: ''
      });
    }
  }, [radio, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        group_id: formData.group_id && formData.group_id !== '' ? parseInt(formData.group_id) : null
      };

      if (radio) {
        await api.put(`/radios/admin/${radio.id}`, submitData);
      } else {
        await api.post('/radios/admin', submitData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving radio:', error);
      let errorMessage = 'Error saving radio. Please try again.';

      if (error.response?.data) {
        if (error.response.data.error === 'Validation failed' && error.response.data.details) {
          // Show validation errors
          const validationErrors = error.response.data.details.map(err => `${err.param}: ${err.msg}`).join('\n');
          errorMessage = `Validation failed:\n${validationErrors}`;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

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
    maxWidth: '700px',
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
            {radio ? 'Edit Radio' : 'Create Radio'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>SN</label>
              <input
                type="text"
                value={formData.sn}
                onChange={(e) => setFormData({ ...formData, sn: e.target.value })}
                style={inputStyle}
                required
                placeholder="Auto-generated sequential SN"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Owners Group *</label>
              <select
                value={formData.group_id}
                onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
                style={inputStyle}
                required
              >
                <option value="">Select Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.group_name}</option>
                ))}
              </select>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Radio / FM Name *</label>
              <input
                type="text"
                value={formData.radio_name}
                onChange={(e) => setFormData({ ...formData, radio_name: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Frequency *</label>
              <input
                type="text"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                style={inputStyle}
                required
                placeholder="e.g., 92.7 FM"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Radio Language *</label>
              <input
                type="text"
                value={formData.radio_language}
                onChange={(e) => setFormData({ ...formData, radio_language: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Emirate / State *</label>
              <input
                type="text"
                value={formData.emirate_state}
                onChange={(e) => setFormData({ ...formData, emirate_state: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Radio Website</label>
              <input
                type="url"
                value={formData.radio_website}
                onChange={(e) => setFormData({ ...formData, radio_website: e.target.value })}
                style={inputStyle}
                placeholder="https://..."
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Radio LinkedIn</label>
              <input
                type="url"
                value={formData.radio_linkedin}
                onChange={(e) => setFormData({ ...formData, radio_linkedin: e.target.value })}
                style={inputStyle}
                placeholder="https://linkedin.com/..."
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Radio Instagram</label>
              <input
                type="url"
                value={formData.radio_instagram}
                onChange={(e) => setFormData({ ...formData, radio_instagram: e.target.value })}
                style={inputStyle}
                placeholder="https://instagram.com/..."
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Radio Popular RJ</label>
              <input
                type="text"
                value={formData.radio_popular_rj}
                onChange={(e) => setFormData({ ...formData, radio_popular_rj: e.target.value })}
                style={inputStyle}
                placeholder="Popular RJ name"
              />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                placeholder="Additional remarks"
              />
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
              {loading ? 'Saving...' : (radio ? 'Update Radio' : 'Create Radio')}
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

const RadioManagement = () => {
  const { admin, logout, hasRole, hasAnyRole, getRoleLevel } = useAdminAuth();

  // Check if user has permission to manage radios
  if (!hasAnyRole(['super_admin', 'content_manager'])) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.backgroundSoft }}>
        <div style={{ textAlign: 'center' }}>
          <Icon name="shield-exclamation" size="lg" style={{ color: theme.danger, marginBottom: '16px' }} />
          <h2 style={{ color: theme.textPrimary, marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: theme.textSecondary }}>You don't have permission to access radio management.</p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            Required roles: Super Admin or Content Manager
          </p>
        </div>
      </div>
    );
  }

  const [radios, setRadios] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [emirateFilter, setEmirateFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRadio, setEditingRadio] = useState(null);
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
        await fetchGroups();
        await fetchRadios();
      } catch (error) {
        console.error('Error fetching data:', error);
        // If unauthorized, the API interceptor will handle redirect
      }
    };

    fetchData();
  }, []);

  const fetchRadios = async () => {
    try {
      const response = await api.get('/radios/admin');
      setRadios(response.data.radios || []);
    } catch (error) {
      console.error('Error fetching radios:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
        return;
      }
      alert('Failed to load radios. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups/admin');
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('adminAccessToken');
        window.location.href = '/admin/login';
        return;
      }
    }
  };

  // Create groups map for easy lookup
  const groupsMap = useMemo(() => {
    return groups.reduce((map, group) => {
      map[group.id] = group.group_name;
      return map;
    }, {});
  }, [groups]);

  // Filtered radios based on search and filters
  const filteredRadios = useMemo(() => {
    let filtered = radios;

    if (debouncedSearchTerm) {
      filtered = filtered.filter(radio =>
        radio.radio_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        radio.frequency.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        radio.radio_language.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        radio.sn.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (groupFilter) {
      filtered = filtered.filter(radio => radio.group_id === parseInt(groupFilter));
    }

    if (languageFilter) {
      filtered = filtered.filter(radio => radio.radio_language.toLowerCase().includes(languageFilter.toLowerCase()));
    }

    if (emirateFilter) {
      filtered = filtered.filter(radio => radio.emirate_state.toLowerCase().includes(emirateFilter.toLowerCase()));
    }

    return filtered;
  }, [radios, debouncedSearchTerm, groupFilter, languageFilter, emirateFilter]);

  // Update filtered radios when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [debouncedSearchTerm, groupFilter, languageFilter, emirateFilter]);

  // Sorting logic
  const sortedRadios = useMemo(() => {
    return [...filteredRadios].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'created_at' || sortField === 'updated_at') {
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
  }, [filteredRadios, sortField, sortDirection]);

  // Pagination logic
  const paginatedRadios = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedRadios.slice(startIndex, startIndex + pageSize);
  }, [sortedRadios, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedRadios.length / pageSize);

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
  const handleCreateRadio = () => {
    setEditingRadio(null);
    setShowFormModal(true);
  };

  const handleEditRadio = (radio) => {
    setEditingRadio(radio);
    setShowFormModal(true);
  };

  const handleDeleteRadio = async (radioId) => {
    if (!window.confirm('Are you sure you want to delete this radio?')) return;

    try {
      await api.delete(`/radios/admin/${radioId}`);
      fetchRadios();
    } catch (error) {
      console.error('Error deleting radio:', error);
      alert('Error deleting radio. Please try again.');
    }
  };

  const handleFormSave = () => {
    fetchRadios();
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
    setGroupFilter('');
    setLanguageFilter('');
    setEmirateFilter('');
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
                {[1, 2, 3].map(i => (
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
                      <div style={{ display: 'grid', gridTemplateColumns: '50px 2fr 1fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '20px', height: '20px', background: '#f3f4f6', borderRadius: '50%' }}></div>
                        <div>
                          <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '120px', marginBottom: '4px' }}></div>
                          <div style={{ height: '12px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        </div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '60px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '80px' }}></div>
                        <div style={{ height: '14px', background: '#f3f4f6', borderRadius: 4, width: '70px' }}></div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <div style={{ width: '50px', height: '24px', background: '#f3f4f6', borderRadius: 4 }}></div>
                          <div style={{ width: '50px', height: '24px', background: '#f3f4f6', borderRadius: 4 }}></div>
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
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: `4px solid #000`, display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 24, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e6f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="radio" size="sm" style={{ color: '#1976D2' }} />
                  </div>
                  <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Radio Management</h1>
                </div>
                <p style={{ marginTop: 8, color: '#757575' }}>Manage radio stations and their details</p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCreateRadio}
                  style={{ ...btnPrimary, fontSize: '14px', padding: '12px 20px' }}
                  disabled={!hasAnyRole(['super_admin', 'content_manager'])}
                >
                  <Icon name="plus" size="sm" style={{ color: '#fff', marginRight: 8 }} />
                  Add Radio
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
                    placeholder="Search radios by name, frequency, language, or SN..."
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
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    minWidth: '150px'
                  }}
                >
                  <option value="">All Groups</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.group_name}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Filter by language"
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minWidth: '150px'
                  }}
                />

                <input
                  type="text"
                  placeholder="Filter by emirate/state"
                  value={emirateFilter}
                  onChange={(e) => setEmirateFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minWidth: '150px'
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
                      <span style={{ color: theme.primary, fontWeight: '600' }}>Search:</span> Found <strong>{sortedRadios.length}</strong> radios
                    </>
                  ) : (
                    <>
                      Showing <strong>{paginatedRadios.length}</strong> of <strong>{sortedRadios.length}</strong> radios
                      {sortedRadios.length !== radios.length && (
                        <span> (filtered from {radios.length} total)</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Radios Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 20px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
              {/* Table Controls */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                      Radios
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

              <div style={{ overflowX: 'auto', maxHeight: paginatedRadios.length > 50 ? '600px' : 'auto', overflowY: paginatedRadios.length > 50 ? 'auto' : 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        SN
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('radio_name')}
                      >
                        Radio Name {getSortIcon('radio_name')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Owners Group
                      </th>
                      <th
                        style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}
                        onClick={() => handleSort('frequency')}
                      >
                        Frequency {getSortIcon('frequency')}
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Language
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Emirate/State
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Popular RJ
                      </th>
                      <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: theme.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRadios.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <Icon name="radio" size="lg" style={{ color: theme.textDisabled }} />
                            <div>No radios found matching your criteria.</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedRadios.map((radio, index) => (
                        <tr key={radio.id} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            {radio.sn}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: theme.textPrimary, marginBottom: '4px' }}>
                              {radio.radio_name}
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                              ID: {radio.id}
                            </div>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            {groupsMap[radio.group_id] || 'Unknown Group'}
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            {radio.frequency}
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            {radio.radio_language}
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            {radio.emirate_state}
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: theme.textPrimary }}>
                            {radio.radio_popular_rj || '—'}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleEditRadio(radio)}
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
                                title="Edit Radio"
                              >
                                <Icon name="pencil" size="xs" style={{ color: '#fff' }} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRadio(radio.id)}
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
                                title="Delete Radio"
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

      {/* Radio Form Modal */}
      <RadioFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        radio={editingRadio}
        groups={groups}
        onSave={handleFormSave}
      />
    </div>
  );
};

export default RadioManagement;