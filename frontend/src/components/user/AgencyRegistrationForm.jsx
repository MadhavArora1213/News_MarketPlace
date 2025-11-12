import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import api from '../../services/api';

// Agency Registration Form Component
const AgencyRegistrationForm = ({ onClose, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    agency_name: '',
    agency_legal_entity_name: '',
    agency_website: '',
    agency_ig: '',
    agency_linkedin: '',
    agency_facebook: '',
    agency_address: '',
    agency_owner_name: '',
    agency_owner_linkedin: '',
    agency_founded_year: '',
    agency_owner_passport_nationality: '',
    agency_email: '',
    agency_contact_number: '',
    agency_owner_email: '',
    agency_owner_contact_number: '',
    agency_owner_whatsapp_number: '',
    telegram: '',
    terms_accepted: false,
    how_did_you_hear: '',
    any_to_say: ''
  });

  const [files, setFiles] = useState({
    company_incorporation_trade_license: null,
    tax_registration_document: null,
    agency_bank_details: null,
    agency_owner_passport: null,
    agency_owner_photo: null
  });

  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'

  const [currentStep, setCurrentStep] = useState('form'); // 'form' or 'otp'
  const [otpData, setOtpData] = useState({
    emailOtp: ''
  });
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpErrors, setOtpErrors] = useState({});
  const [otpSubmitStatus, setOtpSubmitStatus] = useState(null); // null, 'success', 'error'

  // Country codes - removed as we only need email OTP

  // OTP sending states
  const [otpSent, setOtpSent] = useState({
    email: false
  });
  const [otpSendLoading, setOtpSendLoading] = useState({
    email: false
  });

  // OTP verification states
  const [otpVerified, setOtpVerified] = useState({
    email: false
  });

  // Redirect if not authenticated or if admin is logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAdminAuthenticated) {
      alert('Admins should register agencies through the admin panel.');
      onClose();
      return;
    }
  }, [isAuthenticated, isAdminAuthenticated, navigate, onClose]);

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
      const container = document.getElementById('recaptcha-container-agency');
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
        const widgetId = window.grecaptcha.render('recaptcha-container-agency', {
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles(prev => ({
      ...prev,
      [name]: fileList[0] || null
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const requiredFields = [
      'agency_name', 'agency_legal_entity_name', 'agency_website', 'agency_address',
      'agency_owner_name', 'agency_founded_year', 'agency_owner_passport_nationality',
      'agency_email', 'agency_contact_number', 'agency_owner_email', 'agency_owner_contact_number',
      'how_did_you_hear'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // URL validations
    const urlFields = ['agency_website', 'agency_linkedin', 'agency_facebook', 'agency_owner_linkedin'];
    urlFields.forEach(field => {
      if (formData[field] && !formData[field].match(/^https?:\/\/.+/)) {
        newErrors[field] = 'Please enter a valid URL starting with http:// or https://';
      }
    });

    // Email validations
    const emailFields = ['agency_email', 'agency_owner_email'];
    emailFields.forEach(field => {
      if (formData[field] && !formData[field].match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        newErrors[field] = 'Please enter a valid email address';
      }
    });

    // Number validation
    if (formData.agency_founded_year && (isNaN(formData.agency_founded_year) || parseInt(formData.agency_founded_year) < 1800 || parseInt(formData.agency_founded_year) > new Date().getFullYear())) {
      newErrors.agency_founded_year = 'Please enter a valid year';
    }

    // Terms accepted
    if (!formData.terms_accepted) {
      newErrors.terms_accepted = 'You must accept the terms and conditions';
    }

    // File validations (required)
    const requiredFiles = ['company_incorporation_trade_license', 'tax_registration_document', 'agency_bank_details', 'agency_owner_passport', 'agency_owner_photo'];
    requiredFiles.forEach(field => {
      if (!files[field]) {
        newErrors[field] = 'This file is required';
      }
    });

    // Textarea limit
    if (formData.any_to_say && formData.any_to_say.length > 500) {
      newErrors.any_to_say = 'Message cannot exceed 500 characters';
    }

    // reCAPTCHA
    if (!recaptchaToken) {
      newErrors.recaptcha = 'Please complete the reCAPTCHA verification';
    }

    // Note: OTP verification is now done separately and doesn't block form submission
    // Users can verify OTPs before or after form submission

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
      const submitData = new FormData();

      // Add form data
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Add files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      submitData.append('recaptchaToken', recaptchaToken);

      // Country codes removed as we only need email OTP

      await api.post('/agencies/register', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSubmitStatus('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('Error registering agency:', error);

      let errorMessage = 'Failed to register agency. Please try again.';

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

  const handleOtpChange = (name, value) => {
    setOtpData(prev => ({
      ...prev,
      [name]: value
    }));

    if (otpErrors[name]) {
      setOtpErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Removed handleOtpSubmit as we only need email OTP verification

  // Removed handleCountryCodeChange since we only need email OTP

  const handleSendOtp = async (type) => {
    if (type !== 'email') return; // Only email OTP is supported

    const value = formData.agency_email;
    if (!value) {
      setErrors(prev => ({ ...prev, agency_email: 'This field is required to send OTP' }));
      return;
    }

    setOtpSendLoading(prev => ({ ...prev, [type]: true }));

    try {
      const payload = { type, email: value };

      console.log(`Sending ${type} OTP to:`, value);
      const response = await api.post('/agencies/send-otp', payload);

      console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} OTP:`, response.data.otp);
      setOtpSent(prev => ({ ...prev, [type]: true }));
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} OTP sent successfully.`);
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setOtpSendLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleVerifyOtp = async (type) => {
    if (type !== 'email') return; // Only email OTP is supported

    const otpValue = otpData.emailOtp;
    if (!otpValue || otpValue.length !== 6) {
      setOtpErrors(prev => ({ ...prev, emailOtp: 'Please enter a valid 6-digit OTP' }));
      return;
    }

    setOtpLoading(true);
    try {
      const verificationData = {
        type,
        otp: otpValue,
        email: formData.agency_email
      };

      console.log('Sending verification data:', verificationData);
      await api.post('/agencies/verify-otp', verificationData);

      setOtpVerified(prev => ({ ...prev, [type]: true }));
      setOtpErrors(prev => ({ ...prev, emailOtp: '' }));
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully!`);
      console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully. You can now submit the registration form.`);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      const errorMessage = error.response?.data?.error || 'Invalid OTP. Please try again.';
      setOtpErrors(prev => ({ ...prev, emailOtp: errorMessage }));
      console.error(`${type} OTP verification failed:`, errorMessage);
    } finally {
      setOtpLoading(false);
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
    border: `1px solid ${errors[name] ? theme.danger : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '60px',
    resize: 'vertical'
  };

  const fileInputStyle = {
    ...inputStyle,
    padding: '8px'
  };

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

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
           <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
             {currentStep === 'form' ? 'Agency Registration' : 'OTP Verification'}
           </h2>
           <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
             ×
           </button>
         </div>

        <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: `1px solid ${theme.primaryLight}` }}>
          <p style={{ margin: 0, fontSize: '16px', color: theme.textPrimary, fontWeight: '500' }}>
            We will not approach any of your clients, anytime, our growth is possible only when our agencies partner network grows.
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
              <div style={{ fontWeight: '600', color: theme.success }}>Agency Registered Successfully!</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                Your agency has been registered and is pending review. You will be notified once it's approved.
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
              <div style={{ fontWeight: '600', color: theme.danger }}>Registration Failed</div>
              <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                {errors.submit || 'Please check your input and try again.'}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Name <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="agency_name"
                value={formData.agency_name}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.agency_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_name}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Legal Entity Name <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="agency_legal_entity_name"
                value={formData.agency_legal_entity_name}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.agency_legal_entity_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_legal_entity_name}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Website <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="url"
                name="agency_website"
                value={formData.agency_website}
                onChange={handleInputChange}
                style={inputStyle}
                required
                placeholder="https://example.com"
              />
              {errors.agency_website && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_website}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Agency IG</label>
              <input
                type="text"
                name="agency_ig"
                value={formData.agency_ig}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="@instagram_handle"
              />
              {errors.agency_ig && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_ig}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Agency LinkedIn</label>
              <input
                type="url"
                name="agency_linkedin"
                value={formData.agency_linkedin}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="https://linkedin.com/company/example"
              />
              {errors.agency_linkedin && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_linkedin}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Agency Facebook</label>
              <input
                type="url"
                name="agency_facebook"
                value={formData.agency_facebook}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="https://facebook.com/example"
              />
              {errors.agency_facebook && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_facebook}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Owner Name <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="agency_owner_name"
                value={formData.agency_owner_name}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.agency_owner_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_name}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Agency Owner LinkedIn</label>
              <input
                type="url"
                name="agency_owner_linkedin"
                value={formData.agency_owner_linkedin}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="https://linkedin.com/in/example"
              />
              {errors.agency_owner_linkedin && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_linkedin}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Founded Year <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="number"
                name="agency_founded_year"
                value={formData.agency_founded_year}
                onChange={handleInputChange}
                style={inputStyle}
                min="1800"
                max={new Date().getFullYear()}
                required
              />
              {errors.agency_founded_year && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_founded_year}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Owner Passport Nationality <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="text"
                name="agency_owner_passport_nationality"
                value={formData.agency_owner_passport_nationality}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.agency_owner_passport_nationality && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_passport_nationality}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Email <span style={requiredAsterisk}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="email"
                    name="agency_email"
                    value={formData.agency_email}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Enter email address"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleSendOtp('email')}
                    disabled={otpSendLoading.email || !formData.agency_email}
                    style={{
                      ...buttonStyle,
                      backgroundColor: otpSent.email ? theme.success : '#1976D2',
                      color: '#fff',
                      padding: '8px 16px',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                      minWidth: '100px'
                    }}
                  >
                    {otpSendLoading.email ? 'Sending...' : otpSent.email ? 'Sent' : 'Send OTP'}
                  </button>
                </div>
                {otpSent.email && !otpVerified.email && (
                  <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: `1px solid ${theme.primaryLight}` }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={otpData.emailOtp}
                        onChange={(e) => handleOtpChange('emailOtp', e.target.value)}
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                        pattern="[0-9]{6}"
                      />
                      <button
                        type="button"
                        onClick={() => handleVerifyOtp('email')}
                        disabled={otpLoading}
                        style={{
                          ...buttonStyle,
                          backgroundColor: '#4CAF50',
                          color: '#fff',
                          padding: '8px 16px',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                          minWidth: '80px'
                        }}
                      >
                        Verify
                      </button>
                    </div>
                    <p style={{ fontSize: '12px', color: theme.textSecondary, margin: 0, display: 'flex', alignItems: 'flex-start' }}>
                      <Icon name="information-circle" size="xs" style={{ color: theme.primary, marginRight: '6px', marginTop: '2px', flexShrink: 0 }} />
                      Check your email for the OTP code. It may take a few minutes to arrive.
                    </p>
                  </div>
                )}
                {otpVerified.email && (
                  <div style={{ display: 'flex', alignItems: 'center', color: theme.success, fontSize: '14px', marginTop: '8px' }}>
                    <Icon name="check-circle" size="sm" style={{ color: theme.success, marginRight: '6px' }} />
                    <span>Email verified successfully!</span>
                  </div>
                )}
              </div>
              {errors.agency_email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_email}</div>}
              {errors.emailOtp && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.emailOtp}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Contact Number <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="tel"
                name="agency_contact_number"
                value={formData.agency_contact_number}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Enter phone number"
                required
              />
              {errors.agency_contact_number && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_contact_number}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Owner Email <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="email"
                name="agency_owner_email"
                value={formData.agency_owner_email}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
              {errors.agency_owner_email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_email}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Owner Contact Number <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="tel"
                name="agency_owner_contact_number"
                value={formData.agency_owner_contact_number}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Enter phone number"
                required
              />
              {errors.agency_owner_contact_number && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_contact_number}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Agency Owner WhatsApp Number</label>
              <input
                type="tel"
                name="agency_owner_whatsapp_number"
                value={formData.agency_owner_whatsapp_number}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Enter WhatsApp number"
              />
              {errors.agency_owner_whatsapp_number && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_whatsapp_number}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Telegram</label>
              <input
                type="text"
                name="telegram"
                value={formData.telegram}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="@telegram_handle"
              />
              {errors.telegram && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.telegram}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                How Did You Hear About Us? <span style={requiredAsterisk}>*</span>
              </label>
              <select
                name="how_did_you_hear"
                value={formData.how_did_you_hear}
                onChange={handleInputChange}
                style={inputStyle}
                required
              >
                <option value="">Select an option</option>
                <option value="Social Media">Social Media</option>
                <option value="Referral">Referral</option>
                <option value="Search Engine">Search Engine</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Other">Other</option>
              </select>
              {errors.how_did_you_hear && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.how_did_you_hear}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Address <span style={requiredAsterisk}>*</span>
              </label>
              <textarea
                name="agency_address"
                value={formData.agency_address}
                onChange={handleInputChange}
                style={textareaStyle}
                required
                placeholder="Full address"
              />
              {errors.agency_address && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_address}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Any to Say</label>
              <textarea
                name="any_to_say"
                value={formData.any_to_say}
                onChange={handleInputChange}
                style={textareaStyle}
                maxLength="500"
                placeholder="Additional comments (max 500 characters)"
              />
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                {formData.any_to_say.length}/500 characters
              </div>
              {errors.any_to_say && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.any_to_say}</div>}
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Company Incorporation or Trade License <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="file"
                name="company_incorporation_trade_license"
                onChange={handleFileChange}
                style={fileInputStyle}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              {errors.company_incorporation_trade_license && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.company_incorporation_trade_license}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Tax Registration Document <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="file"
                name="tax_registration_document"
                onChange={handleFileChange}
                style={fileInputStyle}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              {errors.tax_registration_document && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.tax_registration_document}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Bank Details <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="file"
                name="agency_bank_details"
                onChange={handleFileChange}
                style={fileInputStyle}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              {errors.agency_bank_details && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_bank_details}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Owner Passport <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="file"
                name="agency_owner_passport"
                onChange={handleFileChange}
                style={fileInputStyle}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
              {errors.agency_owner_passport && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_passport}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>
                Agency Owner Photo <span style={requiredAsterisk}>*</span>
              </label>
              <input
                type="file"
                name="agency_owner_photo"
                onChange={handleFileChange}
                style={fileInputStyle}
                accept=".jpg,.jpeg,.png"
                required
              />
              {errors.agency_owner_photo && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.agency_owner_photo}</div>}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '24px', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
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
                I accept the <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms and Conditions</a> <span style={requiredAsterisk}>*</span>
              </label>
            </div>
          </div>
          {errors.terms_accepted && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.terms_accepted}</div>}

          {/* reCAPTCHA */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div
              id="recaptcha-container-agency"
              style={{ display: 'inline-block' }}
            ></div>
            {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
              Complete the reCAPTCHA verification to register your agency.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '12px', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
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
              {loading ? 'Registering...' : 'Register Agency'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgencyRegistrationForm;