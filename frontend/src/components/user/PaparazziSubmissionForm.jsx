import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Paparazzi Submission Form Component for Users
const PaparazziSubmissionForm = ({ onClose, onSuccess, renderAsModal = true }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

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
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Load reCAPTCHA script and render widget
  useEffect(() => {
    const loadRecaptcha = () => {
      if (!window.grecaptcha) {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = () => {
          if (window.grecaptcha) {
            window.grecaptcha.ready(() => {
              console.log('reCAPTCHA ready');
              renderRecaptcha();
            });
          }
        };
      } else {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          renderRecaptcha();
        }, 100);
      }
    };

    const renderRecaptcha = () => {
      const container = document.getElementById('recaptcha-container');
      if (!container) {
        console.log('reCAPTCHA container not found');
        return;
      }

      // Check if already rendered
      if (container.hasChildNodes()) {
        console.log('reCAPTCHA already rendered, skipping');
        return;
      }

      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LdNzrErAAAAAB1EB7ETPEhUrynf0wSQftMt-COT";

      try {
        const widgetId = window.grecaptcha.render('recaptcha-container', {
          'sitekey': siteKey,
          'callback': (token) => {
            setRecaptchaToken(token);
            setErrors(prev => ({ ...prev, recaptcha: '' }));
          },
          'expired-callback': () => {
            setRecaptchaToken('');
            setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA expired. Please try again.' }));
          },
          'error-callback': () => {
            setRecaptchaToken('');
            setErrors(prev => ({ ...prev, recaptcha: 'reCAPTCHA error. Please try again.' }));
          }
        });
        console.log('reCAPTCHA rendered with widget ID:', widgetId);
      } catch (error) {
        console.error('Error rendering reCAPTCHA:', error);
      }
    };

    loadRecaptcha();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    const requiredFields = ['username', 'page_name', 'followers_count'];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // URL validation
    if (formData.page_website && !/^https?:\/\/.+/.test(formData.page_website)) {
      newErrors.page_website = 'Please enter a valid URL starting with http:// or https://';
    }

    // Numeric validations
    if (formData.followers_count && (isNaN(formData.followers_count) || parseInt(formData.followers_count) < 0)) {
      newErrors.followers_count = 'Followers count must be a non-negative integer';
    }

    const priceFields = [
      'price_reel_no_tag_no_collab', 'price_reel_with_tag_no_collab', 'price_reel_with_tag',
      'video_minutes_allowed', 'pin_post_weekly_charge', 'story_charge', 'story_with_reel_charge'
    ];

    priceFields.forEach(field => {
      if (formData[field] && (isNaN(formData[field]) || parseFloat(formData[field]) < 0)) {
        newErrors[field] = 'Price must be a non-negative number';
      }
    });

    if (formData.video_minutes_allowed && (isNaN(formData.video_minutes_allowed) || parseInt(formData.video_minutes_allowed) < 0)) {
      newErrors.video_minutes_allowed = 'Video minutes must be a non-negative integer';
    }

    // Platform validation
    const validPlatforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook'];
    if (!validPlatforms.includes(formData.platform)) {
      newErrors.platform = 'Please select a valid platform';
    }

    // reCAPTCHA validation
    if (!recaptchaToken) {
      newErrors.recaptcha = 'Please complete the reCAPTCHA verification';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

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
        story_with_reel_charge: parseFloat(formData.story_with_reel_charge) || 0,
        recaptchaToken
      };

      await api.post('/paparazzi', dataToSend);

      setSubmitStatus('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting paparazzi:', error);

      let errorMessage = 'Failed to submit paparazzi profile. Please try again.';

      if (error.response?.status === 429) {
        errorMessage = error.response.data.message || 'Rate limit exceeded. Please try again later.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Please check your input and try again.';
        if (error.response.data.details) {
          const validationErrors = {};
          error.response.data.details.forEach(detail => {
            validationErrors[detail.path] = detail.msg;
          });
          setErrors(validationErrors);
        }
      }

      setSubmitStatus('error');
      setErrors(prev => ({ ...prev, submit: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const theme = {
    primary: '#1976D2',
    primaryDark: '#0D47A1',
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
    borderDark: '#757575'
  };

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
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    margin: 'auto'
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
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    marginRight: '12px'
  };

  const requiredAsterisk = {
    color: theme.danger,
    marginLeft: '4px'
  };

  const innerContent = (
    <div style={renderAsModal ? contentStyle : {}}>
      {renderAsModal && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            Submit Paparazzi Profile
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>
      )}
      {!renderAsModal && (
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', textAlign: 'center' }}>
            Submit Paparazzi Profile
          </h1>
        </div>
      )}

        {submitStatus === 'success' && (
          <div style={{
            padding: '16px',
            backgroundColor: '#e8f5e8',
            border: `1px solid ${theme.success}`,
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ color: theme.success, fontSize: '20px' }}>✓</span>
            <div>
              <div style={{ fontWeight: '600', color: theme.success }}>Paparazzi Profile Submitted Successfully!</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                Your profile has been submitted and is pending review. You will be notified once it's approved.
              </div>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div style={{
            padding: '16px',
            backgroundColor: '#ffebee',
            border: `1px solid ${theme.danger}`,
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ color: theme.danger, fontSize: '20px' }}>⚠</span>
            <div>
              <div style={{ fontWeight: '600', color: theme.danger }}>Submission Failed</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                {errors.submit || 'Please check your input and try again.'}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Platform <span style={requiredAsterisk}>*</span>
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                style={inputStyle}
                required
              >
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="YouTube">YouTube</option>
                <option value="Twitter">Twitter</option>
                <option value="Facebook">Facebook</option>
              </select>
              {errors.platform && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.platform}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Username <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                style={inputStyle}
                required
                placeholder="e.g., @username"
              />
              {errors.username && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.username}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Page Name <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="page_name"
                value={formData.page_name}
                onChange={handleInputChange}
                style={inputStyle}
                required
                placeholder="Display name"
              />
              {errors.page_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.page_name}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Followers Count <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="number"
                name="followers_count"
                min="0"
                value={formData.followers_count}
                onChange={handleInputChange}
                style={inputStyle}
                required
                placeholder="Number of followers"
              />
              {errors.followers_count && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.followers_count}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Collaboration</label>
              <input
                type="text"
                name="collaboration"
                value={formData.collaboration}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Collaboration details"
              />
              {errors.collaboration && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.collaboration}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="e.g., Entertainment, Lifestyle"
              />
              {errors.category && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.category}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="City, Country"
              />
              {errors.location && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.location}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Website</label>
              <input
                type="url"
                name="page_website"
                value={formData.page_website}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="https://example.com"
              />
              {errors.page_website && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.page_website}</div>}
            </div>
          </div>

          <div style={{ marginTop: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Pricing Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Reel (No Tag, No Collab) Price ($)</label>
                <input
                  type="number"
                  name="price_reel_no_tag_no_collab"
                  step="0.01"
                  min="0"
                  value={formData.price_reel_no_tag_no_collab}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                {errors.price_reel_no_tag_no_collab && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.price_reel_no_tag_no_collab}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Reel (With Tag, No Collab) Price ($)</label>
                <input
                  type="number"
                  name="price_reel_with_tag_no_collab"
                  step="0.01"
                  min="0"
                  value={formData.price_reel_with_tag_no_collab}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                {errors.price_reel_with_tag_no_collab && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.price_reel_with_tag_no_collab}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Reel (With Tag) Price ($)</label>
                <input
                  type="number"
                  name="price_reel_with_tag"
                  step="0.01"
                  min="0"
                  value={formData.price_reel_with_tag}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                {errors.price_reel_with_tag && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.price_reel_with_tag}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Video Minutes Allowed</label>
                <input
                  type="number"
                  name="video_minutes_allowed"
                  min="0"
                  value={formData.video_minutes_allowed}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                {errors.video_minutes_allowed && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.video_minutes_allowed}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Pin Post Weekly Charge ($)</label>
                <input
                  type="number"
                  name="pin_post_weekly_charge"
                  step="0.01"
                  min="0"
                  value={formData.pin_post_weekly_charge}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                {errors.pin_post_weekly_charge && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.pin_post_weekly_charge}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Story Charge ($)</label>
                <input
                  type="number"
                  name="story_charge"
                  step="0.01"
                  min="0"
                  value={formData.story_charge}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                {errors.story_charge && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.story_charge}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Story with Reel Charge ($)</label>
                <input
                  type="number"
                  name="story_with_reel_charge"
                  step="0.01"
                  min="0"
                  value={formData.story_with_reel_charge}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
                {errors.story_with_reel_charge && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.story_with_reel_charge}</div>}
              </div>
            </div>
          </div>

          {/* reCAPTCHA */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div
              id="recaptcha-container"
              style={{ display: 'inline-block' }}
            ></div>
            {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
              Complete the reCAPTCHA verification to submit your paparazzi profile.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '12px', flexDirection: 'row' }}>
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
              {loading ? 'Submitting...' : 'Submit Profile'}
            </button>
          </div>
        </form>
      </div>
    // </div>

  );

  if (renderAsModal) {
    return (
      <div style={modalStyle} onClick={onClose}>
        {innerContent}
      </div>
    );
  } else {
    return innerContent;
  }
};

export default PaparazziSubmissionForm;