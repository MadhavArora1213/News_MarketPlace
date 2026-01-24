import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

// Website Submission Form Component
const WebsiteSubmissionForm = ({ onClose, onSuccess }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    media_name: '',
    media_website_address: '',
    news_media_type: '',
    languages: [],
    categories: [],
    custom_category: '',
    location_type: 'Global',
    selected_continent: [],
    selected_country: [],
    selected_state: [],
    ig: '',
    facebook: '',
    linkedin: '',
    tiktok: '',
    u_tube: '',
    snapchat: '',
    twitter: '',
    social_media_embedded_allowed: false,
    social_media_url_in_article_allowed: false,
    external_website_link_allowed: false,
    no_of_images_allowed_in_article: '',
    words_limit: '',
    back_date_allowed: false,
    da: '',
    dr: '',
    pa: '',
    do_follow_link: '',
    disclaimer: '',
    listicle_allowed: false,
    turnaround_time: '',
    price: '',
    name_of_the_company_allowed_in_title: false,
    name_of_the_individual_allowed_in_title: false,
    sub_heading_sub_title_allowed: false,
    by_line_author_name_allowed: false,
    will_article_be_placed_permanently: false,
    will_the_article_can_be_deleted_after_publishing_on_our_request: false,
    will_the_article_can_be_modified_after_publishing_on_our_request: false,
    website_owner_name: '',
    website_owner_nationality: '',
    website_owner_gender: '',
    callingNumber: '',
    callingCountry: '',
    whatsappNumber: '',
    whatsappCountry: '',
    email: '',
    telegram: '',
    terms_accepted: false,
    how_did_you_hear: '',
    any_to_say: ''
  });

  const [files, setFiles] = useState({
    website_registration_document: null,
    tax_document: null,
    bank_details: null,
    owner_passport: null,
    general_contact_details: null
  });

  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [sameAsCalling, setSameAsCalling] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState(''); // 'success' or 'error'

  // Removed currentStep as OTP is now part of the form
  const [otpData, setOtpData] = useState({
    emailOtp: ''
  });
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpErrors, setOtpErrors] = useState({});

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
      alert(t('websiteSubmission.adminErrorAlert'));
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
      const container = document.getElementById('recaptcha-container-website');
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
        const widgetId = window.grecaptcha.render('recaptcha-container-website', {
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
    const { name, value, type, checked, options } = e.target;
    if (type === 'checkbox') {
      if (name === 'languages' || name === 'categories') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else if (options && e.target.multiple) {
      // Handle multi-select
      const selectedValues = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setFormData(prev => ({
        ...prev,
        [name]: selectedValues
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (name, value) => {
    console.log(`=== PHONE CHANGE: ${name} = "${value}" ===`);
    console.log('Current formData before change:', {
      callingCountry: formData.callingCountry,
      callingNumber: formData.callingNumber
    });

    // Update form data immediately
    setFormData(prev => {
      const newData = { ...prev, [name]: value };

      // If changing calling number and sameAsCalling is checked, update WhatsApp
      if (name === 'callingNumber' && sameAsCalling) {
        newData.whatsappNumber = value;
      } else if (name === 'callingCountry' && sameAsCalling) {
        newData.whatsappCountry = value;
        newData.whatsappNumber = prev.callingNumber; // Also copy the number
      }

      console.log('New formData after change:', {
        callingCountry: newData.callingCountry,
        callingNumber: newData.callingNumber
      });
      return newData;
    });

    // Clear errors immediately when user types/selects
    if (name === 'callingNumber' || name === 'callingCountry') {
      console.log('Clearing phone errors');
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.callingNumber;
        console.log('Errors after clearing phone errors:', newErrors);
        return newErrors;
      });
    }

    // Clear WhatsApp errors when auto-updating due to sameAsCalling
    if (name === 'callingNumber' && sameAsCalling && errors.whatsappNumber) {
      setErrors(prev => ({ ...prev, whatsappNumber: '' }));
    } else if (name === 'callingCountry' && sameAsCalling && errors.whatsappNumber) {
      setErrors(prev => ({ ...prev, whatsappNumber: '' }));
    }
  };

  // Handle same as calling checkbox
  const handleSameAsCallingChange = (checked) => {
    setSameAsCalling(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        whatsappCountry: prev.callingCountry,
        whatsappNumber: prev.callingNumber
      }));
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
    // Force a re-render to get latest state
    const currentFormData = { ...formData };
    const currentFiles = { ...files };

    console.log('=== FORM VALIDATION START ===');
    console.log('Current form data:', currentFormData);
    console.log('Phone fields check:', {
      callingCountry: currentFormData.callingCountry,
      callingNumber: currentFormData.callingNumber,
      callingCountryType: typeof currentFormData.callingCountry,
      callingNumberType: typeof currentFormData.callingNumber,
      callingCountryLength: currentFormData.callingCountry?.length,
      callingNumberLength: currentFormData.callingNumber?.length
    });

    const newErrors = {};

    const requiredFields = [
      'media_name', 'media_website_address', 'news_media_type', 'website_owner_name',
      'website_owner_nationality', 'website_owner_gender', 'email', 'how_did_you_hear'
    ];

    requiredFields.forEach(field => {
      const value = currentFormData[field];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = t('websiteSubmission.requiredField');
        console.log(`Required field missing: ${field} = "${value}"`);
      }
    });

    // Phone number validation - more specific checking with detailed logging
    const callingCountry = currentFormData.callingCountry;
    const callingNumber = currentFormData.callingNumber;

    console.log('Phone validation details:', {
      callingCountry,
      callingNumber,
      callingCountryTrimmed: callingCountry?.trim(),
      callingNumberTrimmed: callingNumber?.trim(),
      hasCallingCountry: !!(callingCountry && callingCountry.trim() !== ''),
      hasCallingNumber: !!(callingNumber && callingNumber.trim() !== '')
    });

    const hasCallingCountry = callingCountry && typeof callingCountry === 'string' && callingCountry.trim() !== '';
    const hasCallingNumber = callingNumber && typeof callingNumber === 'string' && callingNumber.trim() !== '';

    console.log('Final phone validation:', { hasCallingCountry, hasCallingNumber });

    if (!hasCallingCountry) {
      newErrors.callingNumber = t('websiteSubmission.countryRequired') || 'Country is required for phone number';
      console.log('❌ Country missing');
    } else if (!hasCallingNumber) {
      newErrors.callingNumber = t('websiteSubmission.phoneRequired') || 'Phone number is required';
      console.log('❌ Phone number missing');
    } else {
      // Both fields have values, validate length
      const countryData = countryPhoneData[callingCountry.trim()];
      console.log('Country data lookup:', {
        country: callingCountry.trim(),
        found: !!countryData,
        countryData
      });

      if (countryData) {
        const numberLength = callingNumber.trim().length;
        console.log('Phone length validation:', {
          number: callingNumber.trim(),
          length: numberLength,
          required: `${countryData.minLength}-${countryData.maxLength}`,
          valid: numberLength >= countryData.minLength && numberLength <= countryData.maxLength
        });

        if (numberLength < countryData.minLength || numberLength > countryData.maxLength) {
          newErrors.callingNumber = t('websiteSubmission.invalidPhone', { min: countryData.minLength, max: countryData.maxLength, country: callingCountry });
          console.log('❌ Phone length invalid');
        } else {
          console.log('✅ Phone validation passed');
        }
      } else {
        console.log('⚠️ Country data not found for:', callingCountry.trim());
      }
    }

    // URL validations
    if (currentFormData.media_website_address && !currentFormData.media_website_address.match(/^https?:\/\/.+/)) {
      newErrors.media_website_address = t('websiteSubmission.invalidUrl');
    }

    // Email validations
    if (currentFormData.email && !currentFormData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = t('websiteSubmission.invalidEmail');
    }

    // WhatsApp validation (only if filled)
    if (currentFormData.whatsappCountry && currentFormData.whatsappNumber && currentFormData.whatsappNumber.trim() !== '') {
      const countryData = countryPhoneData[currentFormData.whatsappCountry];
      if (countryData) {
        const length = currentFormData.whatsappNumber.trim().length;
        if (length < countryData.minLength || length > countryData.maxLength) {
          newErrors.whatsappNumber = t('websiteSubmission.invalidPhone', { min: countryData.minLength, max: countryData.maxLength, country: currentFormData.whatsappCountry });
        }
      }
    }

    // Number validations
    if (currentFormData.no_of_images_allowed_in_article && isNaN(currentFormData.no_of_images_allowed_in_article)) {
      newErrors.no_of_images_allowed_in_article = t('websiteSubmission.invalidNumber');
    }
    if (currentFormData.words_limit && isNaN(currentFormData.words_limit)) {
      newErrors.words_limit = t('websiteSubmission.invalidNumber');
    }
    if (currentFormData.da && (isNaN(currentFormData.da) || currentFormData.da < 0 || currentFormData.da > 100)) {
      newErrors.da = t('websiteSubmission.daError') || t('websiteSubmission.invalidScore');
    }
    if (currentFormData.dr && (isNaN(currentFormData.dr) || currentFormData.dr < 0 || currentFormData.dr > 100)) {
      newErrors.dr = t('websiteSubmission.drError') || t('websiteSubmission.invalidScore');
    }
    if (currentFormData.pa && (isNaN(currentFormData.pa) || currentFormData.pa < 0 || currentFormData.pa > 100)) {
      newErrors.pa = t('websiteSubmission.paError') || t('websiteSubmission.invalidScore');
    }
    if (currentFormData.price && isNaN(currentFormData.price)) {
      newErrors.price = t('websiteSubmission.invalidNumber');
    }

    // Terms accepted
    if (!currentFormData.terms_accepted) {
      newErrors.terms_accepted = t('websiteSubmission.termsError') || t('websiteSubmission.acceptTermsError');
    }

    // File validations (required)
    const requiredFiles = ['website_registration_document', 'bank_details', 'general_contact_details'];
    requiredFiles.forEach(field => {
      if (!currentFiles[field]) {
        newErrors[field] = t('websiteSubmission.fileRequired');
        console.log(`Required file missing: ${field}`);
      }
    });

    // Textarea limit
    if (currentFormData.any_to_say && currentFormData.any_to_say.length > 500) {
      newErrors.any_to_say = t('websiteSubmission.messageLimitError') || t('websiteSubmission.messageLimit');
    }

    // OTP verification
    if (!otpVerified.email) {
      newErrors.otp = t('websiteSubmission.otpVerifyError') || t('websiteSubmission.otpRequired');
      console.log('❌ Email OTP not verified');
    } else {
      console.log('✅ Email OTP verified');
    }

    // reCAPTCHA
    if (!recaptchaToken) {
      newErrors.recaptcha = t('websiteSubmission.recaptchaError') || t('websiteSubmission.recaptchaRequired');
      console.log('❌ reCAPTCHA not completed');
    } else {
      console.log('✅ reCAPTCHA completed');
    }

    console.log('Final validation errors:', newErrors);
    console.log('=== FORM VALIDATION END ===');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('=== FORM SUBMISSION ATTEMPT ===');
    console.log('Form data at submission:', formData);
    console.log('OTP verified status:', otpVerified);
    console.log('reCAPTCHA token:', recaptchaToken ? 'Present' : 'Missing');
    console.log('Files:', files);

    if (!validateForm()) {
      console.log('❌ Form validation failed, stopping submission');
      return;
    }

    console.log('✅ Form validation passed, proceeding with submission');

    setLoading(true);
    setSubmitStatus(null);

    try {
      const submitData = new FormData();

      // Format phone numbers with country codes
      const formatPhoneNumber = (country, number) => {
        if (!country || !number) return '';
        const countryData = countryPhoneData[country];
        return countryData ? `${countryData.code}${number}` : number;
      };

      // Add form data
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'custom_location') {
          // Skip the old custom_location field as it's replaced by the new location fields
          return;
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      submitData.append('recaptchaToken', recaptchaToken);

      await api.post('/websites/submit', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Show success popup
      setPopupMessage(t('websiteSubmission.submitSuccessMessage') || t('websiteSubmission.success'));
      setPopupType('success');
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 3000);

    } catch (error) {
      console.error('Error submitting website:', error);

      let errorMessage = t('websiteSubmission.genericSubmitError') || t('websiteSubmission.error');

      if (error.response?.status === 429) {
        errorMessage = error.response.data.message || 'Rate limit exceeded. Please try again later.';
      } else if (error.response?.status === 400) {
        errorMessage = t('websiteSubmission.inputCheckError') || t('websiteSubmission.inputError');
        if (error.response.data.details) {
          const validationErrors = {};
          error.response.data.details.forEach(detail => {
            validationErrors[detail.path] = detail.msg;
          });
          setErrors(validationErrors);
        }
      }

      // Show error popup
      setPopupMessage(errorMessage);
      setPopupType('error');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 5000);
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

  const handleSendOtp = async (type) => {
    if (type !== 'email') return;

    const value = formData.email;
    if (!value) {
      setErrors(prev => ({ ...prev, email: t('websiteSubmission.emailRequiredOtp') || t('websiteSubmission.requiredField') }));
      return;
    }

    setOtpSendLoading(prev => ({ ...prev, [type]: true }));

    try {
      const payload = { type, email: value };

      console.log(`Sending ${type} OTP to:`, value);
      const response = await api.post('/websites/send-otp', payload);

      console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} OTP:`, response.data.otp);
      setOtpSent(prev => ({ ...prev, [type]: true }));
      alert(t('websiteSubmission.otpSentSuccess', { type }));
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert(t('websiteSubmission.otpSendFail'));
    } finally {
      setOtpSendLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleVerifyOtp = async (type) => {
    if (type !== 'email') return;

    const otpValue = otpData.emailOtp;
    if (!otpValue || otpValue.length !== 6) {
      setOtpErrors(prev => ({ ...prev, emailOtp: t('websiteSubmission.otpInvalidLength') }));
      return;
    }

    setOtpLoading(true);
    try {
      const verificationData = {
        type,
        otp: otpValue,
        email: formData.email
      };

      console.log('Sending verification data:', verificationData);
      await api.post('/websites/verify-otp', verificationData);

      setOtpVerified(prev => ({ ...prev, [type]: true }));
      setOtpErrors(prev => ({ ...prev, emailOtp: '' }));
      alert(t('websiteSubmission.otpVerifySuccess', { type }));
      console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully.`);
      // Keep form open for user to complete submission
    } catch (error) {
      console.error('Error verifying OTP:', error);
      const errorMessage = error.response?.data?.error || t('websiteSubmission.otpVerifyFail');
      setOtpErrors(prev => ({ ...prev, emailOtp: errorMessage }));
      console.error(`${type} OTP verification failed:`, errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  if (!isAuthenticated || isAdminAuthenticated) {
    return null;
  }

  // Location data
  const continents = [
    'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Australia/Oceania', 'Antarctica'
  ];

  const states = [
    // US States
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
    'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
    'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming',
    // Canadian Provinces
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories',
    'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon',
    // Indian States
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

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
    maxWidth: '900px',
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

  // Country codes and phone number formats
  const countryPhoneData = {
    "Afghanistan": { code: "+93", minLength: 9, maxLength: 9 },
    "Albania": { code: "+355", minLength: 9, maxLength: 9 },
    "Algeria": { code: "+213", minLength: 9, maxLength: 9 },
    "Andorra": { code: "+376", minLength: 6, maxLength: 9 },
    "Angola": { code: "+244", minLength: 9, maxLength: 9 },
    "Antigua and Barbuda": { code: "+1", minLength: 10, maxLength: 10 },
    "Argentina": { code: "+54", minLength: 10, maxLength: 10 },
    "Armenia": { code: "+374", minLength: 8, maxLength: 8 },
    "Australia": { code: "+61", minLength: 9, maxLength: 9 },
    "Austria": { code: "+43", minLength: 10, maxLength: 13 },
    "Azerbaijan": { code: "+994", minLength: 9, maxLength: 9 },
    "Bahamas": { code: "+1", minLength: 10, maxLength: 10 },
    "Bahrain": { code: "+973", minLength: 8, maxLength: 8 },
    "Bangladesh": { code: "+880", minLength: 10, maxLength: 10 },
    "Barbados": { code: "+1", minLength: 10, maxLength: 10 },
    "Belarus": { code: "+375", minLength: 9, maxLength: 9 },
    "Belgium": { code: "+32", minLength: 9, maxLength: 9 },
    "Belize": { code: "+501", minLength: 7, maxLength: 7 },
    "Benin": { code: "+229", minLength: 8, maxLength: 8 },
    "Bhutan": { code: "+975", minLength: 8, maxLength: 8 },
    "Bolivia": { code: "+591", minLength: 8, maxLength: 8 },
    "Bosnia and Herzegovina": { code: "+387", minLength: 8, maxLength: 9 },
    "Botswana": { code: "+267", minLength: 8, maxLength: 8 },
    "Brazil": { code: "+55", minLength: 10, maxLength: 11 },
    "Brunei": { code: "+673", minLength: 7, maxLength: 7 },
    "Bulgaria": { code: "+359", minLength: 9, maxLength: 9 },
    "Burkina Faso": { code: "+226", minLength: 8, maxLength: 8 },
    "Burundi": { code: "+257", minLength: 8, maxLength: 8 },
    "Cabo Verde": { code: "+238", minLength: 7, maxLength: 7 },
    "Cambodia": { code: "+855", minLength: 8, maxLength: 9 },
    "Cameroon": { code: "+237", minLength: 9, maxLength: 9 },
    "Canada": { code: "+1", minLength: 10, maxLength: 10 },
    "Central African Republic": { code: "+236", minLength: 8, maxLength: 8 },
    "Chad": { code: "+235", minLength: 8, maxLength: 8 },
    "Chile": { code: "+56", minLength: 9, maxLength: 9 },
    "China": { code: "+86", minLength: 11, maxLength: 11 },
    "Colombia": { code: "+57", minLength: 10, maxLength: 10 },
    "Comoros": { code: "+269", minLength: 7, maxLength: 7 },
    "Congo": { code: "+242", minLength: 9, maxLength: 9 },
    "Costa Rica": { code: "+506", minLength: 8, maxLength: 8 },
    "Croatia": { code: "+385", minLength: 9, maxLength: 9 },
    "Cuba": { code: "+53", minLength: 8, maxLength: 8 },
    "Cyprus": { code: "+357", minLength: 8, maxLength: 8 },
    "Czech Republic": { code: "+420", minLength: 9, maxLength: 9 },
    "Denmark": { code: "+45", minLength: 8, maxLength: 8 },
    "Djibouti": { code: "+253", minLength: 8, maxLength: 8 },
    "Dominica": { code: "+1", minLength: 10, maxLength: 10 },
    "Dominican Republic": { code: "+1", minLength: 10, maxLength: 10 },
    "Ecuador": { code: "+593", minLength: 9, maxLength: 9 },
    "Egypt": { code: "+20", minLength: 10, maxLength: 10 },
    "El Salvador": { code: "+503", minLength: 8, maxLength: 8 },
    "Equatorial Guinea": { code: "+240", minLength: 9, maxLength: 9 },
    "Eritrea": { code: "+291", minLength: 7, maxLength: 7 },
    "Estonia": { code: "+372", minLength: 7, maxLength: 8 },
    "Eswatini": { code: "+268", minLength: 8, maxLength: 8 },
    "Ethiopia": { code: "+251", minLength: 9, maxLength: 9 },
    "Fiji": { code: "+679", minLength: 7, maxLength: 7 },
    "Finland": { code: "+358", minLength: 9, maxLength: 11 },
    "France": { code: "+33", minLength: 9, maxLength: 9 },
    "Gabon": { code: "+241", minLength: 8, maxLength: 8 },
    "Gambia": { code: "+220", minLength: 7, maxLength: 7 },
    "Georgia": { code: "+995", minLength: 9, maxLength: 9 },
    "Germany": { code: "+49", minLength: 10, maxLength: 13 },
    "Ghana": { code: "+233", minLength: 9, maxLength: 9 },
    "Greece": { code: "+30", minLength: 10, maxLength: 10 },
    "Grenada": { code: "+1", minLength: 10, maxLength: 10 },
    "Guatemala": { code: "+502", minLength: 8, maxLength: 8 },
    "Guinea": { code: "+224", minLength: 9, maxLength: 9 },
    "Guinea-Bissau": { code: "+245", minLength: 7, maxLength: 7 },
    "Guyana": { code: "+592", minLength: 7, maxLength: 7 },
    "Haiti": { code: "+509", minLength: 8, maxLength: 8 },
    "Honduras": { code: "+504", minLength: 8, maxLength: 8 },
    "Hungary": { code: "+36", minLength: 9, maxLength: 9 },
    "Iceland": { code: "+354", minLength: 7, maxLength: 9 },
    "India": { code: "+91", minLength: 10, maxLength: 10 },
    "Indonesia": { code: "+62", minLength: 10, maxLength: 13 },
    "Iran": { code: "+98", minLength: 10, maxLength: 10 },
    "Iraq": { code: "+964", minLength: 10, maxLength: 10 },
    "Ireland": { code: "+353", minLength: 9, maxLength: 9 },
    "Israel": { code: "+972", minLength: 9, maxLength: 9 },
    "Italy": { code: "+39", minLength: 9, maxLength: 12 },
    "Jamaica": { code: "+1", minLength: 10, maxLength: 10 },
    "Japan": { code: "+81", minLength: 10, maxLength: 11 },
    "Jordan": { code: "+962", minLength: 9, maxLength: 9 },
    "Kazakhstan": { code: "+7", minLength: 10, maxLength: 10 },
    "Kenya": { code: "+254", minLength: 9, maxLength: 9 },
    "Kiribati": { code: "+686", minLength: 5, maxLength: 5 },
    "Kuwait": { code: "+965", minLength: 8, maxLength: 8 },
    "Kyrgyzstan": { code: "+996", minLength: 9, maxLength: 9 },
    "Laos": { code: "+856", minLength: 8, maxLength: 10 },
    "Latvia": { code: "+371", minLength: 8, maxLength: 8 },
    "Lebanon": { code: "+961", minLength: 8, maxLength: 8 },
    "Lesotho": { code: "+266", minLength: 8, maxLength: 8 },
    "Liberia": { code: "+231", minLength: 8, maxLength: 9 },
    "Libya": { code: "+218", minLength: 9, maxLength: 9 },
    "Liechtenstein": { code: "+423", minLength: 7, maxLength: 9 },
    "Lithuania": { code: "+370", minLength: 8, maxLength: 8 },
    "Luxembourg": { code: "+352", minLength: 9, maxLength: 9 },
    "Madagascar": { code: "+261", minLength: 9, maxLength: 9 },
    "Malawi": { code: "+265", minLength: 9, maxLength: 9 },
    "Malaysia": { code: "+60", minLength: 9, maxLength: 10 },
    "Maldives": { code: "+960", minLength: 7, maxLength: 7 },
    "Mali": { code: "+223", minLength: 8, maxLength: 8 },
    "Malta": { code: "+356", minLength: 8, maxLength: 8 },
    "Marshall Islands": { code: "+692", minLength: 7, maxLength: 7 },
    "Mauritania": { code: "+222", minLength: 8, maxLength: 8 },
    "Mauritius": { code: "+230", minLength: 8, maxLength: 8 },
    "Mexico": { code: "+52", minLength: 10, maxLength: 10 },
    "Micronesia": { code: "+691", minLength: 7, maxLength: 7 },
    "Moldova": { code: "+373", minLength: 8, maxLength: 8 },
    "Monaco": { code: "+377", minLength: 8, maxLength: 9 },
    "Mongolia": { code: "+976", minLength: 8, maxLength: 8 },
    "Montenegro": { code: "+382", minLength: 8, maxLength: 9 },
    "Morocco": { code: "+212", minLength: 9, maxLength: 9 },
    "Mozambique": { code: "+258", minLength: 9, maxLength: 9 },
    "Myanmar": { code: "+95", minLength: 8, maxLength: 10 },
    "Namibia": { code: "+264", minLength: 9, maxLength: 9 },
    "Nauru": { code: "+674", minLength: 7, maxLength: 7 },
    "Nepal": { code: "+977", minLength: 10, maxLength: 10 },
    "Netherlands": { code: "+31", minLength: 9, maxLength: 9 },
    "New Zealand": { code: "+64", minLength: 8, maxLength: 10 },
    "Nicaragua": { code: "+505", minLength: 8, maxLength: 8 },
    "Niger": { code: "+227", minLength: 8, maxLength: 8 },
    "Nigeria": { code: "+234", minLength: 10, maxLength: 11 },
    "North Korea": { code: "+850", minLength: 8, maxLength: 10 },
    "North Macedonia": { code: "+389", minLength: 8, maxLength: 8 },
    "Norway": { code: "+47", minLength: 8, maxLength: 8 },
    "Oman": { code: "+968", minLength: 8, maxLength: 8 },
    "Pakistan": { code: "+92", minLength: 10, maxLength: 10 },
    "Palau": { code: "+680", minLength: 7, maxLength: 7 },
    "Panama": { code: "+507", minLength: 8, maxLength: 8 },
    "Papua New Guinea": { code: "+675", minLength: 8, maxLength: 11 },
    "Paraguay": { code: "+595", minLength: 9, maxLength: 9 },
    "Peru": { code: "+51", minLength: 9, maxLength: 9 },
    "Philippines": { code: "+63", minLength: 10, maxLength: 10 },
    "Poland": { code: "+48", minLength: 9, maxLength: 9 },
    "Portugal": { code: "+351", minLength: 9, maxLength: 9 },
    "Qatar": { code: "+974", minLength: 8, maxLength: 8 },
    "Romania": { code: "+40", minLength: 10, maxLength: 10 },
    "Russia": { code: "+7", minLength: 10, maxLength: 10 },
    "Rwanda": { code: "+250", minLength: 9, maxLength: 9 },
    "Saint Kitts and Nevis": { code: "+1", minLength: 10, maxLength: 10 },
    "Saint Lucia": { code: "+1", minLength: 10, maxLength: 10 },
    "Saint Vincent and the Grenadines": { code: "+1", minLength: 10, maxLength: 10 },
    "Samoa": { code: "+685", minLength: 5, maxLength: 7 },
    "San Marino": { code: "+378", minLength: 9, maxLength: 10 },
    "Sao Tome and Principe": { code: "+239", minLength: 7, maxLength: 7 },
    "Saudi Arabia": { code: "+966", minLength: 9, maxLength: 9 },
    "Senegal": { code: "+221", minLength: 9, maxLength: 9 },
    "Serbia": { code: "+381", minLength: 9, maxLength: 9 },
    "Seychelles": { code: "+248", minLength: 7, maxLength: 7 },
    "Sierra Leone": { code: "+232", minLength: 8, maxLength: 8 },
    "Singapore": { code: "+65", minLength: 8, maxLength: 8 },
    "Slovakia": { code: "+421", minLength: 9, maxLength: 9 },
    "Slovenia": { code: "+386", minLength: 8, maxLength: 8 },
    "Solomon Islands": { code: "+677", minLength: 7, maxLength: 7 },
    "Somalia": { code: "+252", minLength: 8, maxLength: 9 },
    "South Africa": { code: "+27", minLength: 9, maxLength: 9 },
    "South Korea": { code: "+82", minLength: 10, maxLength: 11 },
    "South Sudan": { code: "+211", minLength: 9, maxLength: 9 },
    "Spain": { code: "+34", minLength: 9, maxLength: 9 },
    "Sri Lanka": { code: "+94", minLength: 9, maxLength: 9 },
    "Sudan": { code: "+249", minLength: 9, maxLength: 9 },
    "Suriname": { code: "+597", minLength: 7, maxLength: 7 },
    "Sweden": { code: "+46", minLength: 9, maxLength: 10 },
    "Switzerland": { code: "+41", minLength: 9, maxLength: 12 },
    "Syria": { code: "+963", minLength: 9, maxLength: 9 },
    "Taiwan": { code: "+886", minLength: 9, maxLength: 9 },
    "Tajikistan": { code: "+992", minLength: 9, maxLength: 9 },
    "Tanzania": { code: "+255", minLength: 9, maxLength: 9 },
    "Thailand": { code: "+66", minLength: 9, maxLength: 9 },
    "Timor-Leste": { code: "+670", minLength: 8, maxLength: 9 },
    "Togo": { code: "+228", minLength: 8, maxLength: 8 },
    "Tonga": { code: "+676", minLength: 5, maxLength: 7 },
    "Trinidad and Tobago": { code: "+1", minLength: 10, maxLength: 10 },
    "Tunisia": { code: "+216", minLength: 8, maxLength: 8 },
    "Turkey": { code: "+90", minLength: 10, maxLength: 10 },
    "Turkmenistan": { code: "+993", minLength: 8, maxLength: 8 },
    "Tuvalu": { code: "+688", minLength: 5, maxLength: 6 },
    "Uganda": { code: "+256", minLength: 9, maxLength: 9 },
    "Ukraine": { code: "+380", minLength: 9, maxLength: 9 },
    "United Arab Emirates": { code: "+971", minLength: 9, maxLength: 9 },
    "United Kingdom": { code: "+44", minLength: 10, maxLength: 11 },
    "United States": { code: "+1", minLength: 10, maxLength: 10 },
    "Uruguay": { code: "+598", minLength: 8, maxLength: 8 },
    "Uzbekistan": { code: "+998", minLength: 9, maxLength: 9 },
    "Vanuatu": { code: "+678", minLength: 7, maxLength: 7 },
    "Vatican City": { code: "+39", minLength: 9, maxLength: 12 },
    "Venezuela": { code: "+58", minLength: 10, maxLength: 10 },
    "Vietnam": { code: "+84", minLength: 9, maxLength: 10 },
    "Yemen": { code: "+967", minLength: 9, maxLength: 9 },
    "Zambia": { code: "+260", minLength: 9, maxLength: 9 },
    "Zimbabwe": { code: "+263", minLength: 9, maxLength: 9 }
  };

  // Countries list
  const countries = Object.keys(countryPhoneData);

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            {t('websiteSubmission.title')}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <>
          <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: `1px solid ${theme.primaryLight}` }}>
            <p style={{ margin: 0, fontSize: '16px', color: theme.textPrimary, fontWeight: '500' }}>
              {t('websiteSubmission.oneStepAway')}
            </p>
          </div>


          <form onSubmit={handleSubmit}>
            {/* Media Details Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>{t('websiteSubmission.mediaDetails')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('websiteSubmission.mediaName')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="text"
                    name="media_name"
                    value={formData.media_name}
                    onChange={handleInputChange}
                    style={inputStyle}
                    required
                  />
                  {errors.media_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.media_name}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('websiteSubmission.mediaWebsiteAddress')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="url"
                    name="media_website_address"
                    value={formData.media_website_address}
                    onChange={handleInputChange}
                    style={inputStyle}
                    required
                    placeholder="https://example.com"
                  />
                  {errors.media_website_address && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.media_website_address}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('websiteSubmission.newsMediaType')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <select
                    name="news_media_type"
                    value={formData.news_media_type}
                    onChange={handleInputChange}
                    style={inputStyle}
                    required
                  >
                    <option value="">{t('websiteSubmission.selectType')}</option>
                    <option value="Blog">{t('websiteSubmission.blog')}</option>
                    <option value="Local news">{t('websiteSubmission.localNews')}</option>
                    <option value="News agency">{t('websiteSubmission.newsAgency')}</option>
                    <option value="News media">{t('websiteSubmission.newsMedia')}</option>
                    <option value="Just a website">{t('websiteSubmission.justAWebsite')}</option>
                    <option value="Social media">{t('websiteSubmission.socialMedia')}</option>
                  </select>
                  {errors.news_media_type && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.news_media_type}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Language You Publish In</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['english', 'russian', 'arabic', 'hindi', 'french', 'chinese'].map(lang => (
                      <label key={lang} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          name="languages"
                          value={lang}
                          checked={formData.languages.includes(lang)}
                          onChange={handleInputChange}
                          style={checkboxStyle}
                        />
                        {t('websiteSubmission.' + lang)}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Do You Cover Any Specific Category?</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Tech', 'Marketing', 'Finance', 'Web 3', 'Entrepreneur', 'Hospitality', 'Other'].map(category => (
                      <label key={category} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          name="categories"
                          value={category.toLowerCase()}
                          checked={formData.categories.includes(category.toLowerCase())}
                          onChange={handleInputChange}
                          style={checkboxStyle}
                        />
                        {category}
                      </label>
                    ))}
                  </div>
                  <input
                    type="text"
                    name="custom_category"
                    value={formData.custom_category}
                    onChange={handleInputChange}
                    style={{ ...inputStyle, marginTop: '8px' }}
                    placeholder={t('websiteSubmission.customCategory')}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Does Your Media Cover a Particular Location or Is It Global?</label>
                  <select
                    name="location_type"
                    value={formData.location_type}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value="Global">{t('websiteSubmission.global')}</option>
                    <option value="Regional">{t('websiteSubmission.regional')}</option>
                  </select>

                  {formData.location_type === 'Regional' && (
                    <div style={{ marginTop: '8px' }}>
                      <select
                        name="selected_continent"
                        onChange={handleInputChange}
                        multiple
                        style={{ ...inputStyle, marginBottom: '8px', minHeight: '100px' }}
                      >
                        {continents.map(continent => (
                          <option key={continent} value={continent} selected={formData.selected_continent.includes(continent)}>{continent}</option>
                        ))}
                      </select>
                      <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '8px' }}>
                        {t('websiteSubmission.selectContinents')}
                      </div>

                      <select
                        name="selected_country"
                        onChange={handleInputChange}
                        multiple
                        style={{ ...inputStyle, marginBottom: '8px', minHeight: '100px' }}
                      >
                        {countries.map(country => (
                          <option key={country} value={country} selected={formData.selected_country.includes(country)}>{country}</option>
                        ))}
                      </select>
                      <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '8px' }}>
                        {t('websiteSubmission.selectCountries')}
                      </div>

                      <select
                        name="selected_state"
                        onChange={handleInputChange}
                        multiple
                        style={{ ...inputStyle, minHeight: '100px' }}
                      >
                        {states.map(state => (
                          <option key={state} value={state} selected={formData.selected_state.includes(state)}>{state}</option>
                        ))}
                      </select>
                      <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                        {t('websiteSubmission.selectStates')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media Links Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Social Media Links</h3>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {[
                  { key: 'ig', label: t('websiteSubmission.instagram'), placeholder: '@instagram_handle' },
                  { key: 'facebook', label: t('websiteSubmission.facebook'), placeholder: '@facebook_handle' },
                  { key: 'linkedin', label: t('websiteSubmission.linkedin'), placeholder: '@linkedin_handle' },
                  { key: 'tiktok', label: t('websiteSubmission.tiktok'), placeholder: '@tiktok_handle' },
                  { key: 'u_tube', label: t('websiteSubmission.youtube'), placeholder: '@youtube_handle' },
                  { key: 'snapchat', label: t('websiteSubmission.snapchat'), placeholder: '@snapchat_handle' },
                  { key: 'twitter', label: t('websiteSubmission.twitter'), placeholder: '@x_handle' }
                ].map(social => (
                  <div key={social.key} style={formGroupStyle}>
                    <label style={labelStyle}>{social.label}</label>
                    <input
                      type="text"
                      name={social.key}
                      value={formData[social.key]}
                      onChange={handleInputChange}
                      style={inputStyle}
                      placeholder={social.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Content Policies Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>{t('websiteSubmission.contentPolicies')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.socialMediaEmbeddedAllowed')}</label>
                  <input
                    type="checkbox"
                    name="social_media_embedded_allowed"
                    checked={formData.social_media_embedded_allowed}
                    onChange={handleInputChange}
                    style={checkboxStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.socialMediaUrlAllowed')}</label>
                  <input
                    type="checkbox"
                    name="social_media_url_in_article_allowed"
                    checked={formData.social_media_url_in_article_allowed}
                    onChange={handleInputChange}
                    style={checkboxStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.externalLinkAllowed')}</label>
                  <input
                    type="checkbox"
                    name="external_website_link_allowed"
                    checked={formData.external_website_link_allowed}
                    onChange={handleInputChange}
                    style={checkboxStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.imagesAllowed')}</label>
                  <input
                    type="number"
                    name="no_of_images_allowed_in_article"
                    value={formData.no_of_images_allowed_in_article}
                    onChange={handleInputChange}
                    style={inputStyle}
                    min="0"
                  />
                  {errors.no_of_images_allowed_in_article && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.no_of_images_allowed_in_article}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.wordsLimit')}</label>
                  <input
                    type="number"
                    name="words_limit"
                    value={formData.words_limit}
                    onChange={handleInputChange}
                    style={inputStyle}
                    min="0"
                  />
                  {errors.words_limit && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.words_limit}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.backDateAllowed')}</label>
                  <select
                    name="back_date_allowed"
                    value={formData.back_date_allowed}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value={false}>{t('websiteSubmission.no')}</option>
                    <option value={true}>{t('websiteSubmission.yes')}</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.da')}</label>
                  <input
                    type="number"
                    name="da"
                    value={formData.da}
                    onChange={handleInputChange}
                    style={inputStyle}
                    min="0"
                    max="100"
                  />
                  {errors.da && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.da}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.dr')}</label>
                  <input
                    type="number"
                    name="dr"
                    value={formData.dr}
                    onChange={handleInputChange}
                    style={inputStyle}
                    min="0"
                    max="100"
                  />
                  {errors.dr && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.dr}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.pa')}</label>
                  <input
                    type="number"
                    name="pa"
                    value={formData.pa}
                    onChange={handleInputChange}
                    style={inputStyle}
                    min="0"
                    max="100"
                  />
                  {errors.pa && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.pa}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.linkType')}</label>
                  <select
                    name="do_follow_link"
                    value={formData.do_follow_link}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value="">{t('websiteSubmission.select')}</option>
                    <option value="Do Follow">{t('websiteSubmission.doFollow')}</option>
                    <option value="No Follow">{t('websiteSubmission.noFollow')}</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.disclaimerType')}</label>
                  <select
                    name="disclaimer"
                    value={formData.disclaimer}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value="">{t('websiteSubmission.select')}</option>
                    <option value="Disclaimer">{t('websiteSubmission.disclaimer')}</option>
                    <option value="Non Disclaimer">{t('websiteSubmission.nonDisclaimer')}</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.listicleAllowed')}</label>
                  <select
                    name="listicle_allowed"
                    value={formData.listicle_allowed}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value={false}>{t('websiteSubmission.notAllowed')}</option>
                    <option value={true}>{t('websiteSubmission.allowed')}</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.turnaroundTime')}</label>
                  <input
                    type="text"
                    name="turnaround_time"
                    value={formData.turnaround_time}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.price')}</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    style={inputStyle}
                    min="0"
                  />
                  {errors.price && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.price}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.companyAllowedInTitle')}</label>
                  <select
                    name="name_of_the_company_allowed_in_title"
                    value={formData.name_of_the_company_allowed_in_title}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value={false}>{t('websiteSubmission.no')}</option>
                    <option value={true}>{t('websiteSubmission.yes')}</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.individualAllowedInTitle')}</label>
                  <select
                    name="name_of_the_individual_allowed_in_title"
                    value={formData.name_of_the_individual_allowed_in_title}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value={false}>{t('websiteSubmission.no')}</option>
                    <option value={true}>{t('websiteSubmission.yes')}</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.subheadingAllowed')}</label>
                  <select
                    name="sub_heading_sub_title_allowed"
                    value={formData.sub_heading_sub_title_allowed}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value={false}>{t('websiteSubmission.no')}</option>
                    <option value={true}>{t('websiteSubmission.yes')}</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.bylineAllowed')}</label>
                  <select
                    name="by_line_author_name_allowed"
                    value={formData.by_line_author_name_allowed}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value={false}>{t('websiteSubmission.no')}</option>
                    <option value={true}>{t('websiteSubmission.yes')}</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.placedPermanently')}</label>
                  <select
                    name="will_article_be_placed_permanently"
                    value={formData.will_article_be_placed_permanently}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value={false}>{t('websiteSubmission.no')}</option>
                    <option value={true}>{t('websiteSubmission.yes')}</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.canBeDeleted')}</label>
                  <select
                    name="will_the_article_can_be_deleted_after_publishing_on_our_request"
                    value={formData.will_the_article_can_be_deleted_after_publishing_on_our_request}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value={false}>{t('websiteSubmission.no')}</option>
                    <option value={true}>{t('websiteSubmission.yes')}</option>
                  </select>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.canBeModified')}</label>
                  <select
                    name="will_the_article_can_be_modified_after_publishing_on_our_request"
                    value={formData.will_the_article_can_be_modified_after_publishing_on_our_request}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value={false}>{t('websiteSubmission.no')}</option>
                    <option value={true}>{t('websiteSubmission.yes')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Owner Information Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>{t('websiteSubmission.ownerInformation')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('websiteSubmission.ownerName')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="text"
                    name="website_owner_name"
                    value={formData.website_owner_name}
                    onChange={handleInputChange}
                    style={inputStyle}
                    required
                  />
                  {errors.website_owner_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.website_owner_name}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('websiteSubmission.ownerNationality')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="text"
                    name="website_owner_nationality"
                    value={formData.website_owner_nationality}
                    onChange={handleInputChange}
                    style={inputStyle}
                    required
                  />
                  {errors.website_owner_nationality && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.website_owner_nationality}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('websiteSubmission.ownerGender')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <select
                    name="website_owner_gender"
                    value={formData.website_owner_gender}
                    onChange={handleInputChange}
                    style={inputStyle}
                    required
                  >
                    <option value="">{t('websiteSubmission.selectGender')}</option>
                    <option value="Male">{t('websiteSubmission.male')}</option>
                    <option value="Female">{t('websiteSubmission.female')}</option>
                    <option value="Other">{t('websiteSubmission.other')}</option>
                  </select>
                  {errors.website_owner_gender && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.website_owner_gender}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('websiteSubmission.ownerNumber')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      name="callingCountry"
                      value={formData.callingCountry}
                      onChange={(e) => handlePhoneChange('callingCountry', e.target.value)}
                      style={{
                        ...inputStyle,
                        flex: '0 0 120px',
                        borderColor: errors.callingNumber ? theme.danger : '#d1d5db'
                      }}
                      required
                    >
                      <option value="">{t('websiteSubmission.country')}</option>
                      {countries.map(country => (
                        <option key={country} value={country}>
                          {country} ({countryPhoneData[country]?.code})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="callingNumber"
                      value={formData.callingNumber}
                      onChange={(e) => handlePhoneChange('callingNumber', e.target.value)}
                      style={{
                        ...inputStyle,
                        flex: 1,
                        borderColor: errors.callingNumber ? theme.danger : '#d1d5db'
                      }}
                      placeholder={t('websiteSubmission.enterPhone')}
                      required
                    />
                  </div>
                  {formData.callingCountry && (
                    <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                      {t('websiteSubmission.expectedLength', {
                        min: countryPhoneData[formData.callingCountry]?.minLength,
                        max: countryPhoneData[formData.callingCountry]?.maxLength
                      })}
                    </div>
                  )}
                  {errors.callingNumber && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.callingNumber}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.whatsapp')}</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      name="whatsappCountry"
                      value={formData.whatsappCountry}
                      onChange={(e) => handlePhoneChange('whatsappCountry', e.target.value)}
                      style={{ ...inputStyle, flex: '0 0 120px' }}
                    >
                      <option value="">{t('websiteSubmission.country')}</option>
                      {countries.map(country => (
                        <option key={country} value={country}>
                          {country} ({countryPhoneData[country]?.code})
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={(e) => handlePhoneChange('whatsappNumber', e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder={t('websiteSubmission.enterWhatsapp')}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="checkbox"
                      id="sameAsCalling"
                      checked={sameAsCalling}
                      onChange={(e) => handleSameAsCallingChange(e.target.checked)}
                      style={checkboxStyle}
                    />
                    <label htmlFor="sameAsCalling" style={{ fontSize: '12px', color: theme.textSecondary }}>
                      {t('websiteSubmission.sameAsCalling')}
                    </label>
                  </div>
                  {formData.whatsappCountry && (
                    <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                      {t('websiteSubmission.expectedLength', {
                        min: countryPhoneData[formData.whatsappCountry]?.minLength,
                        max: countryPhoneData[formData.whatsappCountry]?.maxLength
                      })}
                    </div>
                  )}
                  {errors.whatsappNumber && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.whatsappNumber}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('websiteSubmission.email')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder={t('websiteSubmission.enterEmail')}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleSendOtp('email')}
                        disabled={otpSendLoading.email || !formData.email}
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
                        {otpSendLoading.email ? t('websiteSubmission.sending') : otpSent.email ? t('websiteSubmission.sent') : t('websiteSubmission.sendOtp')}
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
                            placeholder={t('websiteSubmission.enterOtp')}
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
                            {t('websiteSubmission.verify')}
                          </button>
                        </div>
                        <p style={{ fontSize: '12px', color: theme.textSecondary, margin: 0, display: 'flex', alignItems: 'flex-start' }}>
                          <Icon name="information-circle" size="xs" style={{ color: theme.primary, marginRight: '6px', marginTop: '2px', flexShrink: 0 }} />
                          {t('websiteSubmission.checkEmail')}
                        </p>
                      </div>
                    )}
                    {otpVerified.email && (
                      <div style={{ display: 'flex', alignItems: 'center', color: theme.success, fontSize: '14px', marginTop: '8px' }}>
                        <Icon name="check-circle" size="sm" style={{ color: theme.success, marginRight: '6px' }} />
                        <span>{t('websiteSubmission.emailVerified')}</span>
                      </div>
                    )}
                  </div>
                  {errors.email && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.email}</div>}
                  {errors.emailOtp && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.emailOtp}</div>}
                  {errors.otp && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.otp}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.telegram')}</label>
                  <input
                    type="text"
                    name="telegram"
                    value={formData.telegram}
                    onChange={handleInputChange}
                    style={inputStyle}
                    placeholder={t('websiteSubmission.telegramPlaceholder')}
                  />
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>{t('websiteSubmission.documents')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('websiteSubmission.registrationDocument')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="file"
                    name="website_registration_document"
                    onChange={handleFileChange}
                    style={fileInputStyle}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  {errors.website_registration_document && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.website_registration_document}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('websiteSubmission.taxDocument')}
                  </label>
                  <input
                    type="file"
                    name="tax_document"
                    onChange={handleFileChange}
                    style={fileInputStyle}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {errors.tax_document && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.tax_document}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('websiteSubmission.bankDetails')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="file"
                    name="bank_details"
                    onChange={handleFileChange}
                    style={fileInputStyle}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  {errors.bank_details && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.bank_details}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('websiteSubmission.ownerPassport')}
                  </label>
                  <input
                    type="file"
                    name="owner_passport"
                    onChange={handleFileChange}
                    style={fileInputStyle}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {errors.owner_passport && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.owner_passport}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('websiteSubmission.contactDetails')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="file"
                    name="general_contact_details"
                    onChange={handleFileChange}
                    style={fileInputStyle}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  {errors.general_contact_details && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.general_contact_details}</div>}
                </div>
              </div>
            </div>

            {/* Additional Fields */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    {t('websiteSubmission.howDidYouHear')} <span style={requiredAsterisk}>*</span>
                  </label>
                  <select
                    name="how_did_you_hear"
                    value={formData.how_did_you_hear}
                    onChange={handleInputChange}
                    style={inputStyle}
                    required
                  >
                    <option value="">{t('websiteSubmission.selectOption')}</option>
                    <option value="Social Media">{t('websiteSubmission.socialMediaOption')}</option>
                    <option value="Search">{t('websiteSubmission.searchOption')}</option>
                    <option value="Referral">{t('websiteSubmission.referralOption')}</option>
                    <option value="Other">{t('websiteSubmission.other')}</option>
                  </select>
                  {errors.how_did_you_hear && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.how_did_you_hear}</div>}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>{t('websiteSubmission.message')}</label>
                  <textarea
                    name="any_to_say"
                    value={formData.any_to_say}
                    onChange={handleInputChange}
                    style={textareaStyle}
                    maxLength="500"
                    placeholder={t('websiteSubmission.messagePlaceholder')}
                  />
                  <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '4px' }}>
                    {formData.any_to_say.length}/500 {t('websiteSubmission.characters')}
                  </div>
                  {errors.any_to_say && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.any_to_say}</div>}
                </div>
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
                  {t('websiteSubmission.iAccept')} <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer">{t('websiteSubmission.termsAndConditions')}</a> <span style={requiredAsterisk}>*</span>
                </label>
              </div>
            </div>
            {errors.terms_accepted && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.terms_accepted}</div>}

            {/* reCAPTCHA */}
            <div style={{ marginTop: '24px', marginBottom: '24px' }}>
              <div
                id="recaptcha-container-website"
                style={{ display: 'inline-block' }}
              ></div>
              {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
                {t('websiteSubmission.recaptchaVerification')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '12px', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
                disabled={loading}
              >
                {t('websiteSubmission.cancel')}
              </button>
              <button
                type="submit"
                style={{ ...buttonStyle, backgroundColor: '#1976D2', color: '#fff' }}
                disabled={loading}
              >
                {loading ? t('websiteSubmission.submitting') : t('websiteSubmission.submitWebsite')}
              </button>
            </div>
          </form>
        </>
      </div>

      {/* Popup for success/error messages */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: theme.background,
          border: `1px solid ${popupType === 'success' ? theme.success : theme.danger}`,
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          maxWidth: '400px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Icon
              name={popupType === 'success' ? 'check-circle' : 'exclamation-triangle'}
              size="3x"
              style={{ color: popupType === 'success' ? theme.success : theme.danger }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: popupType === 'success' ? theme.success : theme.danger, marginBottom: '8px' }}>
                {popupType === 'success' ? t('websiteSubmission.successTitle') || 'Success!' : t('websiteSubmission.errorTitle') || 'Error!'}
              </div>
              <div style={{ fontSize: '14px', color: theme.textSecondary, whiteSpace: 'pre-line' }}>
                {popupMessage}
              </div>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: theme.textSecondary,
                padding: '0',
                marginLeft: 'auto'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteSubmissionForm;