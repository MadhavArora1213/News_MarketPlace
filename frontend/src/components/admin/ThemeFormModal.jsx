import React, { useState, useEffect } from 'react';
import api from '../../services/api';

// Theme Form Modal Component
const ThemeFormModal = ({ isOpen, onClose, theme, onSave }) => {
  const [formData, setFormData] = useState({
    platform: '',
    username: '',
    page_name: '',
    no_of_followers: '',
    collaboration: '',
    category: '',
    location: '',
    price_reel_without_tagging_collaboration: '',
    price_reel_with_tagging_collaboration: '',
    price_reel_with_tagging: '',
    video_minute_allowed: '',
    pin_post_charges_week: '',
    story_charges: '',
    story_with_reel_charges: '',
    page_website: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (theme) {
      setFormData({
        platform: theme.platform || '',
        username: theme.username || '',
        page_name: theme.page_name || '',
        no_of_followers: theme.no_of_followers || '',
        collaboration: theme.collaboration || '',
        category: theme.category || '',
        location: theme.location || '',
        price_reel_without_tagging_collaboration: theme.price_reel_without_tagging_collaboration || '',
        price_reel_with_tagging_collaboration: theme.price_reel_with_tagging_collaboration || '',
        price_reel_with_tagging: theme.price_reel_with_tagging || '',
        video_minute_allowed: theme.video_minute_allowed || '',
        pin_post_charges_week: theme.pin_post_charges_week || '',
        story_charges: theme.story_charges || '',
        story_with_reel_charges: theme.story_with_reel_charges || '',
        page_website: theme.page_website || ''
      });
    } else {
      setFormData({
        platform: '',
        username: '',
        page_name: '',
        no_of_followers: '',
        collaboration: '',
        category: '',
        location: '',
        price_reel_without_tagging_collaboration: '',
        price_reel_with_tagging_collaboration: '',
        price_reel_with_tagging: '',
        video_minute_allowed: '',
        pin_post_charges_week: '',
        story_charges: '',
        story_with_reel_charges: '',
        page_website: ''
      });
    }
  }, [theme, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        no_of_followers: parseInt(formData.no_of_followers) || 0,
        price_reel_without_tagging_collaboration: parseFloat(formData.price_reel_without_tagging_collaboration) || 0,
        price_reel_with_tagging_collaboration: parseFloat(formData.price_reel_with_tagging_collaboration) || 0,
        price_reel_with_tagging: parseFloat(formData.price_reel_with_tagging) || 0,
        video_minute_allowed: parseInt(formData.video_minute_allowed) || 0,
        pin_post_charges_week: parseFloat(formData.pin_post_charges_week) || 0,
        story_charges: parseFloat(formData.story_charges) || 0,
        story_with_reel_charges: parseFloat(formData.story_with_reel_charges) || 0
      };

      if (theme) {
        await api.put(`/themes/admin/${theme.id}`, dataToSend);
      } else {
        await api.post('/themes/admin', dataToSend);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving theme:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error saving theme. Please try again.';
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
    maxWidth: '900px',
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
            {theme ? 'Edit Theme' : 'Create Theme'}
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
                <option value="">Select Platform</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Twitter">Twitter</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Other">Other</option>
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
                value={formData.no_of_followers}
                onChange={(e) => setFormData({ ...formData, no_of_followers: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Collaboration Type</label>
              <input
                type="text"
                value={formData.collaboration}
                onChange={(e) => setFormData({ ...formData, collaboration: e.target.value })}
                style={inputStyle}
                placeholder="e.g., Sponsored, Shoutout"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={inputStyle}
                placeholder="e.g., Fashion, Technology"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={inputStyle}
                placeholder="e.g., United States, India"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Website URL</label>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Reel Price (No Tagging/Collab)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_reel_without_tagging_collaboration}
                  onChange={(e) => setFormData({ ...formData, price_reel_without_tagging_collaboration: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Reel Price (With Tagging/Collab)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_reel_with_tagging_collaboration}
                  onChange={(e) => setFormData({ ...formData, price_reel_with_tagging_collaboration: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Reel Price (With Tagging)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_reel_with_tagging}
                  onChange={(e) => setFormData({ ...formData, price_reel_with_tagging: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Video Minutes Allowed</label>
                <input
                  type="number"
                  min="0"
                  value={formData.video_minute_allowed}
                  onChange={(e) => setFormData({ ...formData, video_minute_allowed: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Pin Post Charges (Weekly)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pin_post_charges_week}
                  onChange={(e) => setFormData({ ...formData, pin_post_charges_week: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Story Charges</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.story_charges}
                  onChange={(e) => setFormData({ ...formData, story_charges: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Story + Reel Charges</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.story_with_reel_charges}
                  onChange={(e) => setFormData({ ...formData, story_with_reel_charges: e.target.value })}
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
              {loading ? 'Saving...' : (theme ? 'Update Theme' : 'Create Theme')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThemeFormModal;