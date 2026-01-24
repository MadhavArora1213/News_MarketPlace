import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

// Custom hook for window width
const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1024; // Default desktop width for SSR
  });

  useEffect(() => {
    // Only add listeners if window is available
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowWidth;
};

// Reporter Submission Form Component
const ReporterSubmissionForm = ({ onClose, onSuccess, renderAsModal = true }) => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const windowWidth = useWindowWidth();

  const [formData, setFormData] = useState({
    function_department: '',
    position: '',
    name: '',
    gender: '',
    email: '',
    whatsapp: '',
    publication_name: '',
    website_url: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    publication_industry: '',
    publication_location: '',
    niche_industry: '',
    minimum_expectation_usd: '',
    articles_per_month: '',
    turnaround_time: '',
    company_allowed_in_title: false,
    individual_allowed_in_title: false,
    subheading_allowed: false,
    sample_url: '',
    will_change_wordings: false,
    article_placed_permanently: false,
    article_can_be_deleted: false,
    article_can_be_modified: false,
    terms_accepted: false,
    how_heard_about_us: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'

  // Redirect if not authenticated or if admin is logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAdminAuthenticated) {
      alert(t('reporterRegistration.adminErrorAlert'));
      onClose();
      return;
    }
  }, [isAuthenticated, isAdminAuthenticated, navigate, onClose]);

  // Pre-fill email from user account
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user, formData.email]);

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
        setTimeout(() => {
          renderRecaptcha();
        }, 100);
      }
    };

    const renderRecaptcha = () => {
      const container = document.getElementById('recaptcha-container-reporter');
      if (!container) {
        console.log('reCAPTCHA container not found');
        return;
      }

      if (container.hasChildNodes()) {
        console.log('reCAPTCHA already rendered, skipping');
        return;
      }

      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LdNzrErAAAAAB1EB7ETPEhUrynf0wSQftMt-COT";

      try {
        const widgetId = window.grecaptcha.render('recaptcha-container-reporter', {
          'sitekey': siteKey,
          'callback': (token) => {
            setRecaptchaToken(token);
            setErrors(prev => ({ ...prev, recaptcha: '' }));
          },
          'expired-callback': () => {
            setRecaptchaToken('');
            setErrors(prev => ({ ...prev, recaptcha: t('websiteSubmission.recaptchaError') }));
          },
          'error-callback': () => {
            setRecaptchaToken('');
            setErrors(prev => ({ ...prev, recaptcha: t('websiteSubmission.recaptchaError') }));
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const requiredFields = [
      'function_department', 'position', 'name', 'gender', 'email',
      'publication_name', 'publication_industry', 'publication_location',
      'niche_industry', 'how_heard_about_us'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = t('websiteSubmission.requiredField');
      }
    });

    // URL validations
    if (formData.website_url && !formData.website_url.match(/^https?:\/\/.+/)) {
      newErrors.website_url = t('websiteSubmission.invalidUrl');
    }
    if (formData.linkedin && !formData.linkedin.match(/^https?:\/\/.+/)) {
      newErrors.linkedin = t('websiteSubmission.invalidUrl');
    }
    if (formData.instagram && !formData.instagram.match(/^https?:\/\/.+/)) {
      newErrors.instagram = t('websiteSubmission.invalidUrl');
    }
    if (formData.facebook && !formData.facebook.match(/^https?:\/\/.+/)) {
      newErrors.facebook = t('websiteSubmission.invalidUrl');
    }
    if (formData.sample_url && !formData.sample_url.match(/^https?:\/\/.+/)) {
      newErrors.sample_url = t('websiteSubmission.invalidUrl');
    }

    // Email validation
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = t('websiteSubmission.invalidEmail');
    }

    // WhatsApp validation
    if (formData.whatsapp && !formData.whatsapp.match(/^\+?[\d\s\-()]+$/)) {
      newErrors.whatsapp = t('reporterRegistration.whatsappInvalid') || 'Invalid WhatsApp number format';
    }

    // Numeric validations
    if (formData.minimum_expectation_usd && isNaN(formData.minimum_expectation_usd)) {
      newErrors.minimum_expectation_usd = t('websiteSubmission.invalidNumber');
    }
    if (formData.articles_per_month && (isNaN(formData.articles_per_month) || formData.articles_per_month < 0)) {
      newErrors.articles_per_month = t('websiteSubmission.invalidNumber');
    }

    // Terms accepted
    if (!formData.terms_accepted) {
      newErrors.terms_accepted = t('websiteSubmission.acceptTermsError');
    }

    // Message character limit
    if (formData.message && formData.message.length > 500) {
      newErrors.message = t('websiteSubmission.messageLimit');
    }

    // reCAPTCHA
    if (!recaptchaToken) {
      newErrors.recaptcha = t('websiteSubmission.recaptchaRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Double-check authentication before submission
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAdminAuthenticated) {
      alert(t('reporterRegistration.adminErrorAlert'));
      if (onClose) onClose();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    try {
      const submitData = {
        ...formData,
        recaptchaToken
      };

      await api.post('/reporters', submitData);

      setSubmitStatus('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting reporter:', error);

      let errorMessage = t('reporterRegistration.genericSubmitError');

      if (error.response?.status === 401) {
        errorMessage = t('reporterRegistration.authRequiredError');
        navigate('/login');
        return;
      } else if (error.response?.status === 429) {
        errorMessage = error.response.data.message || 'Rate limit exceeded. Please try again later.';
      } else if (error.response?.status === 400) {
        errorMessage = t('reporterRegistration.inputCheckError');
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

  if (!isAuthenticated || isAdminAuthenticated) {
    return null;
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

  const isMobile = windowWidth < 768;

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isMobile ? 'flex-start' : 'center',
    zIndex: 10000,
    padding: isMobile ? '10px' : '20px',
    overflowY: 'auto'
  };

  const contentStyle = {
    background: '#fff',
    borderRadius: isMobile ? '16px 16px 0 0' : '12px',
    padding: isMobile ? '20px' : '24px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: isMobile ? 'calc(100vh - 20px)' : '90vh',
    overflowY: 'auto',
    boxShadow: isMobile ? '0 -4px 20px rgba(0,0,0,0.1)' : '0 20px 40px rgba(0,0,0,0.15)',
    margin: isMobile ? 'auto 0 0 0' : 'auto',
    marginTop: isMobile ? '20px' : 'auto'
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

  const getInputStyle = (fieldName) => ({
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${errors[fieldName] ? theme.danger : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  });

  const getTextareaStyle = (fieldName) => ({
    ...getInputStyle(fieldName),
    minHeight: '80px',
    resize: 'vertical'
  });

  const checkboxStyle = {
    marginRight: '8px'
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

  if (!renderAsModal) {
    // Render as page component
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {t('reporterRegistration.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('reporterRegistration.pageDesc')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {/* Form content */}
          <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: `1px solid ${theme.primaryLight}` }}>
            <p style={{ margin: 0, fontSize: '16px', color: theme.textPrimary, fontWeight: '500' }}>
              {t('reporterRegistration.confidentialityNote')}
            </p>
          </div>

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
              <Icon name="check-circle" size="lg" style={{ color: theme.success }} />
              <div>
                <div style={{ fontWeight: '600', color: theme.success }}>{t('reporterRegistration.successMessage')}</div>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {t('reporterRegistration.successDesc')}
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
              <Icon name="exclamation-triangle" size="lg" style={{ color: theme.danger }} />
              <div>
                <div style={{ fontWeight: '600', color: theme.danger }}>{t('reporterRegistration.errorMessage')}</div>
                <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                  {errors.submit || t('reporterRegistration.inputError')}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>{t('reporterRegistration.personalInformation')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {/* Form fields content - same as modal */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('reporterRegistration.functionDepartment')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <select
                    name="function_department"
                    value={formData.function_department}
                    onChange={handleInputChange}
                    style={getInputStyle('function_department')}
                    required
                  >
                    <option value="">{t('reporterRegistration.selectDepartment')}</option>
                    <option value="Commercial">{t('reporterRegistration.commercial')}</option>
                    <option value="Procurement">{t('reporterRegistration.procurement')}</option>
                    <option value="Publishing">{t('reporterRegistration.publishing')}</option>
                    <option value="Marketing">{t('reporterRegistration.marketing')}</option>
                    <option value="Accounts and Finance">{t('reporterRegistration.accountsFinance')}</option>
                  </select>
                  {errors.function_department && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.function_department}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('reporterRegistration.position')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    style={getInputStyle('position')}
                    required
                  >
                    <option value="">{t('reporterRegistration.selectPosition')}</option>
                    <option value="Journalist">{t('reporterRegistration.journalist')}</option>
                    <option value="Reporter">{t('reporterRegistration.reporter')}</option>
                    <option value="Contributor">{t('reporterRegistration.contributor')}</option>
                    <option value="Staff">{t('reporterRegistration.staff')}</option>
                  </select>
                  {errors.position && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.position}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('reporterRegistration.fullName')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={getInputStyle('name')}
                    required
                  />
                  {errors.name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.name}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('reporterRegistration.gender')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    style={getInputStyle('gender')}
                    required
                  >
                    <option value="">{t('reporterRegistration.selectGender')}</option>
                    <option value="Male">{t('reporterRegistration.male')}</option>
                    <option value="Female">{t('reporterRegistration.female')}</option>
                    <option value="Other">{t('reporterRegistration.other')}</option>
                  </select>
                  {errors.gender && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.gender}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('reporterRegistration.email')} <span style={requiredAsterisk}>*</span>
                    {user?.email && formData.email === user.email && (
                      <span style={{ fontSize: '12px', color: theme.textSecondary, marginLeft: '8px' }}>
                        {t('reporterRegistration.fromAccount')}
                      </span>
                    )}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={getInputStyle('email')}
                    required
                    readOnly={user?.email && formData.email === user.email}
                  />
                  {errors.email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.email}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('reporterRegistration.whatsapp')}</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    style={getInputStyle('whatsapp')}
                    placeholder={t('reporterRegistration.whatsappPlaceholder')}
                  />
                  {errors.whatsapp && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.whatsapp}</div>}
                </div>
              </div>
            </div>

            {/* Publication Information Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>{t('reporterRegistration.publicationInformation')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('reporterRegistration.publicationName')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="text"
                    name="publication_name"
                    value={formData.publication_name}
                    onChange={handleInputChange}
                    style={getInputStyle('publication_name')}
                    required
                  />
                  {errors.publication_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_name}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('reporterRegistration.websiteUrl')}</label>
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    style={getInputStyle('website_url')}
                    placeholder={t('reporterRegistration.urlPlaceholder')}
                  />
                  {errors.website_url && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.website_url}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('reporterRegistration.publicationIndustry')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="text"
                    name="publication_industry"
                    value={formData.publication_industry}
                    onChange={handleInputChange}
                    style={getInputStyle('publication_industry')}
                    placeholder={t('reporterRegistration.industryPlaceholder')}
                    required
                  />
                  {errors.publication_industry && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_industry}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('reporterRegistration.publicationLocation')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="text"
                    name="publication_location"
                    value={formData.publication_location}
                    onChange={handleInputChange}
                    style={getInputStyle('publication_location')}
                    placeholder={t('reporterRegistration.locationPlaceholder')}
                    required
                  />
                  {errors.publication_location && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_location}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('reporterRegistration.nicheIndustry')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="text"
                    name="niche_industry"
                    value={formData.niche_industry}
                    onChange={handleInputChange}
                    style={getInputStyle('niche_industry')}
                    placeholder={t('reporterRegistration.nichePlaceholder')}
                    required
                  />
                  {errors.niche_industry && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.niche_industry}</div>}
                </div>
              </div>
            </div>

            {/* Social Media Links Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>{t('reporterRegistration.socialMediaLinks')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('reporterRegistration.linkedin')}</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    style={getInputStyle('linkedin')}
                    placeholder={t('reporterRegistration.linkedinPlaceholder')}
                  />
                  {errors.linkedin && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.linkedin}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('reporterRegistration.instagram')}</label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    style={getInputStyle('instagram')}
                    placeholder={t('reporterRegistration.instagramPlaceholder')}
                  />
                  {errors.instagram && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.instagram}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('reporterRegistration.facebook')}</label>
                  <input
                    type="url"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    style={getInputStyle('facebook')}
                    placeholder={t('reporterRegistration.facebookPlaceholder')}
                  />
                  {errors.facebook && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.facebook}</div>}
                </div>
              </div>
            </div>

            {/* Content Policies Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>{t('reporterRegistration.contentPolicies')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('reporterRegistration.minExpectation')}</label>
                  <input
                    type="number"
                    name="minimum_expectation_usd"
                    value={formData.minimum_expectation_usd}
                    onChange={handleInputChange}
                    style={getInputStyle('minimum_expectation_usd')}
                    min="0"
                    step="0.01"
                  />
                  {errors.minimum_expectation_usd && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.minimum_expectation_usd}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('reporterRegistration.articlesPerMonth')}</label>
                  <input
                    type="number"
                    name="articles_per_month"
                    value={formData.articles_per_month}
                    onChange={handleInputChange}
                    style={getInputStyle('articles_per_month')}
                    min="0"
                  />
                  {errors.articles_per_month && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.articles_per_month}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('reporterRegistration.turnaroundTime')}</label>
                  <input
                    type="text"
                    name="turnaround_time"
                    value={formData.turnaround_time}
                    onChange={handleInputChange}
                    style={getInputStyle('turnaround_time')}
                    placeholder={t('reporterRegistration.turnaroundPlaceholder')}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('reporterRegistration.sampleUrl')}</label>
                  <input
                    type="url"
                    name="sample_url"
                    value={formData.sample_url}
                    onChange={handleInputChange}
                    style={getInputStyle('sample_url')}
                    placeholder={t('reporterRegistration.samplePlaceholder')}
                  />
                  {errors.sample_url && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.sample_url}</div>}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: theme.textPrimary }}>{t('reporterRegistration.articlePermissions')}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div style={formGroupStyle}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        name="company_allowed_in_title"
                        checked={formData.company_allowed_in_title}
                        onChange={handleInputChange}
                        style={checkboxStyle}
                      />
                      {t('reporterRegistration.companyInTitle')}
                    </label>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        name="individual_allowed_in_title"
                        checked={formData.individual_allowed_in_title}
                        onChange={handleInputChange}
                        style={checkboxStyle}
                      />
                      {t('reporterRegistration.individualInTitle')}
                    </label>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        name="subheading_allowed"
                        checked={formData.subheading_allowed}
                        onChange={handleInputChange}
                        style={checkboxStyle}
                      />
                      {t('reporterRegistration.subheadingAllowed')}
                    </label>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        name="will_change_wordings"
                        checked={formData.will_change_wordings}
                        onChange={handleInputChange}
                        style={checkboxStyle}
                      />
                      {t('reporterRegistration.willChangeWordings')}
                    </label>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        name="article_placed_permanently"
                        checked={formData.article_placed_permanently}
                        onChange={handleInputChange}
                        style={checkboxStyle}
                      />
                      {t('reporterRegistration.placedPermanently')}
                    </label>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        name="article_can_be_deleted"
                        checked={formData.article_can_be_deleted}
                        onChange={handleInputChange}
                        style={checkboxStyle}
                      />
                      {t('reporterRegistration.canBeDeleted')}
                    </label>
                  </div>

                  <div style={formGroupStyle}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        name="article_can_be_modified"
                        checked={formData.article_can_be_modified}
                        onChange={handleInputChange}
                        style={checkboxStyle}
                      />
                      {t('reporterRegistration.canBeModified')}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('reporterRegistration.howHeard')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <select
                    name="how_heard_about_us"
                    value={formData.how_heard_about_us}
                    onChange={handleInputChange}
                    style={getInputStyle('how_heard_about_us')}
                    required
                  >
                    <option value="">{t('reporterRegistration.selectOption')}</option>
                    <option value="Social Media">{t('websiteSubmission.socialMediaOption')}</option>
                    <option value="Search Engine">{t('websiteSubmission.searchOption')}</option>
                    <option value="Referral">{t('websiteSubmission.referralOption')}</option>
                    <option value="Email">{t('websiteSubmission.email')}</option>
                    <option value="Other">{t('websiteSubmission.other')}</option>
                  </select>
                  {errors.how_heard_about_us && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.how_heard_about_us}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('reporterRegistration.message')}</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    style={getTextareaStyle('message')}
                    maxLength="500"
                    placeholder={t('reporterRegistration.messagePlaceholder')}
                  />
                  <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                    {formData.message.length}/500 {t('reporterRegistration.characters')}
                  </div>
                  {errors.message && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.message}</div>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '24px', flexDirection: isMobile ? 'column' : 'row' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="terms_accepted"
                  id="terms"
                  checked={formData.terms_accepted}
                  onChange={handleInputChange}
                  style={checkboxStyle}
                />
                <label htmlFor="terms" style={{ fontSize: '14px', color: '#212121' }}>
                  {t('reporterRegistration.iAccept')} <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">{t('reporterRegistration.termsAndConditions')}</a> <span style={requiredAsterisk}>*</span>
                </label>
              </div>
            </div>
            {errors.terms_accepted && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.terms_accepted}</div>}

            {/* reCAPTCHA */}
            <div style={{ marginTop: '24px', marginBottom: '24px' }}>
              <div
                id="recaptcha-container-reporter"
                style={{ display: 'inline-block' }}
              ></div>
              {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
                {t('reporterRegistration.submitProfileNote') || 'Complete the reCAPTCHA verification to submit your reporter profile.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
                disabled={loading}
              >
                {t('reporterRegistration.cancel')}
              </button>
              <button
                type="submit"
                style={{ ...buttonStyle, backgroundColor: '#1976D2', color: '#fff' }}
                disabled={loading}
              >
                {loading ? t('reporterRegistration.submitting') : t('reporterRegistration.submitProfile')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Render as modal (default behavior)
  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            {t('reporterRegistration.title')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: isMobile ? '28px' : '24px',
              cursor: 'pointer',
              padding: isMobile ? '8px' : '4px',
              borderRadius: '6px',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: isMobile ? '44px' : '32px',
              minHeight: isMobile ? '44px' : '32px',
              transition: 'all 0.2s ease',
              zIndex: 10001
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f0f0f0';
              e.target.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#666';
            }}
            onTouchStart={(e) => {
              e.target.style.backgroundColor = '#f0f0f0';
              e.target.style.color = '#333';
            }}
            onTouchEnd={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#666';
            }}
            aria-label="Close form"
          >
            ×
          </button>
        </div>

        <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: `1px solid ${theme.primaryLight}` }}>
          <p style={{ margin: 0, fontSize: '16px', color: theme.textPrimary, fontWeight: '500' }}>
            {t('reporterRegistration.confidentialityNote')}
          </p>
        </div>

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
            <Icon name="check-circle" size="lg" style={{ color: theme.success }} />
            <div>
              <div style={{ fontWeight: '600', color: theme.success }}>{t('reporterRegistration.successMessage')}</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                {t('reporterRegistration.successDesc')}
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
            <Icon name="exclamation-triangle" size="lg" style={{ color: theme.danger }} />
            <div>
              <div style={{ fontWeight: '600', color: theme.danger }}>{t('reporterRegistration.errorMessage')}</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                {errors.submit || t('reporterRegistration.inputError')}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>{t('reporterRegistration.personalInformation')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  {t('reporterRegistration.functionDepartment')} <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="function_department"
                  value={formData.function_department}
                  onChange={handleInputChange}
                  style={getInputStyle('function_department')}
                  required
                >
                  <option value="">{t('reporterRegistration.selectDepartment')}</option>
                  <option value="Commercial">{t('reporterRegistration.commercial')}</option>
                  <option value="Procurement">{t('reporterRegistration.procurement')}</option>
                  <option value="Publishing">{t('reporterRegistration.publishing')}</option>
                  <option value="Marketing">{t('reporterRegistration.marketing')}</option>
                  <option value="Accounts and Finance">{t('reporterRegistration.accountsFinance')}</option>
                </select>
                {errors.function_department && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.function_department}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  {t('reporterRegistration.position')} <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  style={getInputStyle('position')}
                  required
                >
                  <option value="">{t('reporterRegistration.selectPosition')}</option>
                  <option value="Journalist">{t('reporterRegistration.journalist')}</option>
                  <option value="Reporter">{t('reporterRegistration.reporter')}</option>
                  <option value="Contributor">{t('reporterRegistration.contributor')}</option>
                  <option value="Staff">{t('reporterRegistration.staff')}</option>
                </select>
                {errors.position && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.position}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  {t('reporterRegistration.fullName')} <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={getInputStyle('name')}
                  required
                />
                {errors.name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.name}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  {t('reporterRegistration.gender')} <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={getInputStyle('gender')}
                  required
                >
                  <option value="">{t('reporterRegistration.selectGender')}</option>
                  <option value="Male">{t('reporterRegistration.male')}</option>
                  <option value="Female">{t('reporterRegistration.female')}</option>
                  <option value="Other">{t('reporterRegistration.other')}</option>
                </select>
                {errors.gender && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.gender}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Email <span style={requiredAsterisk}>*</span>
                  {user?.email && formData.email === user.email && (
                    <span style={{ fontSize: '12px', color: theme.textSecondary, marginLeft: '8px' }}>
                      {t('reporterRegistration.fromAccount')}
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={getInputStyle('email')}
                  required
                  readOnly={user?.email && formData.email === user.email}
                />
                {errors.email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.email}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>{t('reporterRegistration.whatsapp')}</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  style={getInputStyle('whatsapp')}
                  placeholder={t('reporterRegistration.whatsappPlaceholder')}
                />
                {errors.whatsapp && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.whatsapp}</div>}
              </div>
            </div>
          </div>

          {/* Publication Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>{t('reporterRegistration.publicationInformation')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  {t('reporterRegistration.publicationName')} <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="publication_name"
                  value={formData.publication_name}
                  onChange={handleInputChange}
                  style={getInputStyle('publication_name')}
                  required
                />
                {errors.publication_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_name}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>{t('reporterRegistration.websiteUrl')}</label>
                <input
                  type="url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleInputChange}
                  style={getInputStyle('website_url')}
                  placeholder={t('reporterRegistration.urlPlaceholder')}
                />
                {errors.website_url && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.website_url}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  {t('reporterRegistration.publicationIndustry')} <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="publication_industry"
                  value={formData.publication_industry}
                  onChange={handleInputChange}
                  style={getInputStyle('publication_industry')}
                  placeholder={t('reporterRegistration.industryPlaceholder')}
                  required
                />
                {errors.publication_industry && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_industry}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  {t('reporterRegistration.publicationLocation')} <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="publication_location"
                  value={formData.publication_location}
                  onChange={handleInputChange}
                  style={getInputStyle('publication_location')}
                  placeholder={t('reporterRegistration.locationPlaceholder')}
                  required
                />
                {errors.publication_location && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.publication_location}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  {t('reporterRegistration.nicheIndustry')} <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="niche_industry"
                  value={formData.niche_industry}
                  onChange={handleInputChange}
                  style={getInputStyle('niche_industry')}
                  placeholder={t('reporterRegistration.nichePlaceholder')}
                  required
                />
                {errors.niche_industry && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.niche_industry}</div>}
              </div>
            </div>
          </div>

          {/* Social Media Links Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>{t('reporterRegistration.socialMediaLinks')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>{t('reporterRegistration.linkedin')}</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  style={getInputStyle('linkedin')}
                  placeholder={t('reporterRegistration.linkedinPlaceholder')}
                />
                {errors.linkedin && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.linkedin}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>{t('reporterRegistration.instagram')}</label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  style={getInputStyle('instagram')}
                  placeholder={t('reporterRegistration.instagramPlaceholder')}
                />
                {errors.instagram && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.instagram}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>{t('reporterRegistration.facebook')}</label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  style={getInputStyle('facebook')}
                  placeholder={t('reporterRegistration.facebookPlaceholder')}
                />
                {errors.facebook && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.facebook}</div>}
              </div>
            </div>
          </div>

          {/* Content Policies Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>{t('reporterRegistration.contentPolicies')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>{t('reporterRegistration.minExpectation')}</label>
                <input
                  type="number"
                  name="minimum_expectation_usd"
                  value={formData.minimum_expectation_usd}
                  onChange={handleInputChange}
                  style={getInputStyle('minimum_expectation_usd')}
                  min="0"
                  step="0.01"
                />
                {errors.minimum_expectation_usd && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.minimum_expectation_usd}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>{t('reporterRegistration.articlesPerMonth')}</label>
                <input
                  type="number"
                  name="articles_per_month"
                  value={formData.articles_per_month}
                  onChange={handleInputChange}
                  style={getInputStyle('articles_per_month')}
                  min="0"
                />
                {errors.articles_per_month && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.articles_per_month}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>{t('reporterRegistration.turnaroundTime')}</label>
                <input
                  type="text"
                  name="turnaround_time"
                  value={formData.turnaround_time}
                  onChange={handleInputChange}
                  style={getInputStyle('turnaround_time')}
                  placeholder={t('reporterRegistration.turnaroundPlaceholder')}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>{t('reporterRegistration.sampleUrl')}</label>
                <input
                  type="url"
                  name="sample_url"
                  value={formData.sample_url}
                  onChange={handleInputChange}
                  style={getInputStyle('sample_url')}
                  placeholder={t('reporterRegistration.samplePlaceholder')}
                />
                {errors.sample_url && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.sample_url}</div>}
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: theme.textPrimary }}>{t('reporterRegistration.articlePermissions')}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="company_allowed_in_title"
                      checked={formData.company_allowed_in_title}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    {t('reporterRegistration.companyInTitle')}
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="individual_allowed_in_title"
                      checked={formData.individual_allowed_in_title}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    {t('reporterRegistration.individualInTitle')}
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="subheading_allowed"
                      checked={formData.subheading_allowed}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    {t('reporterRegistration.subheadingAllowed')}
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="will_change_wordings"
                      checked={formData.will_change_wordings}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    {t('reporterRegistration.willChangeWordings')}
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="article_placed_permanently"
                      checked={formData.article_placed_permanently}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    {t('reporterRegistration.placedPermanently')}
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="article_can_be_deleted"
                      checked={formData.article_can_be_deleted}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    {t('reporterRegistration.canBeDeleted')}
                  </label>
                </div>

                <div style={formGroupStyle}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      name="article_can_be_modified"
                      checked={formData.article_can_be_modified}
                      onChange={handleInputChange}
                      style={checkboxStyle}
                    />
                    {t('reporterRegistration.canBeModified')}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  {t('reporterRegistration.howHeard')} <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="how_heard_about_us"
                  value={formData.how_heard_about_us}
                  onChange={handleInputChange}
                  style={getInputStyle('how_heard_about_us')}
                  required
                >
                  <option value="">{t('reporterRegistration.selectOption')}</option>
                  <option value="Social Media">{t('websiteSubmission.socialMediaOption')}</option>
                  <option value="Search Engine">{t('websiteSubmission.searchOption')}</option>
                  <option value="Referral">{t('websiteSubmission.referralOption')}</option>
                  <option value="Email">{t('websiteSubmission.email')}</option>
                  <option value="Other">{t('websiteSubmission.other')}</option>
                </select>
                {errors.how_heard_about_us && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.how_heard_about_us}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>{t('reporterRegistration.message')}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  style={getTextareaStyle('message')}
                  maxLength="500"
                  placeholder={t('reporterRegistration.messagePlaceholder')}
                />
                <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                  {formData.message.length}/500 {t('reporterRegistration.characters')}
                </div>
                {errors.message && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.message}</div>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '24px', flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                name="terms_accepted"
                id="terms"
                checked={formData.terms_accepted}
                onChange={handleInputChange}
                style={checkboxStyle}
              />
              <label htmlFor="terms" style={{ fontSize: '14px', color: '#212121' }}>
                {t('reporterRegistration.iAccept')} <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">{t('reporterRegistration.termsAndConditions')}</a> <span style={requiredAsterisk}>*</span>
              </label>
            </div>
          </div>
          {errors.terms_accepted && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.terms_accepted}</div>}

          {/* reCAPTCHA */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div
              id="recaptcha-container-reporter"
              style={{ display: 'inline-block' }}
            ></div>
            {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
              {t('reporterRegistration.submitProfileNote') || 'Complete the reCAPTCHA verification to submit your reporter profile.'}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
              disabled={loading}
            >
              {t('reporterRegistration.cancel')}
            </button>
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: '#1976D2', color: '#fff' }}
              disabled={loading}
            >
              {loading ? t('reporterRegistration.submitting') : t('reporterRegistration.submitProfile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReporterSubmissionForm;