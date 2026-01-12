import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../common/Icon';
import api from '../../services/api';

// RealEstate Submission Form Component
const RealEstateSubmissionForm = ({ onClose, onSuccess }) => {
  const { isAuthenticated } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    ig_url: '',
    no_of_followers: '',
    verified_tick: false,
    linkedin: '',
    tiktok: '',
    facebook: '',
    youtube: '',
    real_estate_profession: '', // Will be one of: agency_owner, agent, developer_employee
    gender: '',
    nationality: '',
    current_residence_city: '',
    languages: [],
    image: null
  });

  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState(''); // 'success' or 'error'

  // Form data states
  const [languages, setLanguages] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Redirect if not authenticated or if admin is logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isAdminAuthenticated) {
      alert('Admins should submit real estate listings through the admin panel.');
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
      const container = document.getElementById('recaptcha-container-real-estate');
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
        const widgetId = window.grecaptcha.render('recaptcha-container-real-estate', {
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

  // Fetch languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      setLoadingLanguages(true);
      try {
        const response = await api.get('/real-estates/form/languages');
        setLanguages(response.data.languages);
      } catch (error) {
        console.error('Error fetching languages:', error);
      } finally {
        setLoadingLanguages(false);
      }
    };
    fetchLanguages();
  }, []);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await api.get('/real-estates/form/countries');
        setCountries(response.data.countries);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch cities when nationality changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.nationality) {
        setCities([]);
        return;
      }

      setLoadingCities(true);
      try {
        const response = await api.get(`/real-estates/form/cities/${encodeURIComponent(formData.nationality)}`);
        setCities(response.data.cities);
        // Reset city selection if current city is not in the new list
        if (formData.current_residence_city && !response.data.cities.includes(formData.current_residence_city)) {
          setFormData(prev => ({ ...prev, current_residence_city: '' }));
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [formData.nationality]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'languages') {
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
    } else if (name === 'real_estate_profession') {
      // Handle radio buttons for profession
      setFormData(prev => ({
        ...prev,
        [name]: value
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

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0] || null
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    const requiredFields = ['first_name', 'last_name', 'gender', 'nationality', 'current_residence_city'];
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // URL validations
    const urlFields = ['ig_url', 'linkedin', 'tiktok', 'facebook', 'youtube'];
    urlFields.forEach(field => {
      if (formData[field] && !formData[field].match(/^https?:\/\/.+/)) {
        newErrors[field] = 'Please enter a valid URL starting with http:// or https://';
      }
    });

    // Number validation for followers
    if (formData.no_of_followers && (isNaN(formData.no_of_followers) || formData.no_of_followers < 0)) {
      newErrors.no_of_followers = 'Please enter a valid number of followers';
    }

    // Profession selection
    if (!formData.real_estate_profession) {
      newErrors.real_estate_profession = 'Please select your profession';
    }

    // File validation
    if (!formData.image) {
      newErrors.image = 'Profile image is required';
    }

    // reCAPTCHA
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
      const submitData = new FormData();

      // Add form data
      Object.keys(formData).forEach(key => {
        if (key === 'languages') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'real_estate_profession') {
          // Convert to the three boolean fields
          const profession = formData[key];
          submitData.append('real_estate_agency_owner', profession === 'agency_owner' ? 'true' : 'false');
          submitData.append('real_estate_agent', profession === 'agent' ? 'true' : 'false');
          submitData.append('developer_employee', profession === 'developer_employee' ? 'true' : 'false');
        } else if (key === 'image' && formData[key]) {
          submitData.append(key, formData[key]);
        } else if (key !== 'image') {
          submitData.append(key, formData[key]);
        }
      });

      submitData.append('recaptchaToken', recaptchaToken);

      await api.post('/real-estates', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Show success popup
      setPopupMessage('Real estate professional profile submitted successfully! Your profile has been submitted and is pending review. You will be notified once it\'s approved.');
      setPopupType('success');
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 3000);

    } catch (error) {
      console.error('Error submitting real estate profile:', error);

      let errorMessage = 'Failed to submit real estate profile. Please try again.';

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

      // Show error popup
      setPopupMessage(errorMessage);
      setPopupType('error');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 5000);
    } finally {
      setLoading(false);
    }
  };


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

  if (!isAuthenticated || isAdminAuthenticated) {
    return null;
  }

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            Real Estate Professional Submission
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <div style={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: `1px solid ${theme.primaryLight}` }}>
          <p style={{ margin: 0, fontSize: '16px', color: theme.textPrimary, fontWeight: '500' }}>
            Join our network of verified real estate professionals. Your profile will be reviewed before going live.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  First Name <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                />
                {errors.first_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.first_name}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Last Name <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                />
                {errors.last_name && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.last_name}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Gender <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
                {errors.gender && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.gender}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Nationality <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                  disabled={loadingCountries}
                >
                  <option value="">
                    {loadingCountries ? 'Loading countries...' : 'Select nationality'}
                  </option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {errors.nationality && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.nationality}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Current Residence City <span style={requiredAsterisk}>*</span>
                </label>
                <select
                  name="current_residence_city"
                  value={formData.current_residence_city}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                  disabled={!formData.nationality || loadingCities}
                >
                  <option value="">
                    {!formData.nationality
                      ? 'Select nationality first'
                      : loadingCities
                        ? 'Loading cities...'
                        : 'Select city'
                    }
                  </option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.current_residence_city && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.current_residence_city}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Languages Spoken</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {loadingLanguages ? (
                    <span>Loading languages...</span>
                  ) : (
                    languages.map(lang => (
                      <label key={lang} style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          name="languages"
                          value={lang.toLowerCase()}
                          checked={formData.languages.includes(lang.toLowerCase())}
                          onChange={handleInputChange}
                          style={checkboxStyle}
                        />
                        {lang}
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Social Media Presence</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Instagram URL</label>
                <input
                  type="url"
                  name="ig_url"
                  value={formData.ig_url}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://instagram.com/username"
                />
                {errors.ig_url && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.ig_url}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Number of Instagram Followers</label>
                <input
                  type="number"
                  name="no_of_followers"
                  value={formData.no_of_followers}
                  onChange={handleInputChange}
                  style={inputStyle}
                  min="0"
                  placeholder="e.g., 10000"
                />
                {errors.no_of_followers && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.no_of_followers}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  <input
                    type="checkbox"
                    name="verified_tick"
                    checked={formData.verified_tick}
                    onChange={handleInputChange}
                    style={checkboxStyle}
                  />
                  Instagram Verified Account
                </label>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://linkedin.com/in/username"
                />
                {errors.linkedin && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.linkedin}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>TikTok URL</label>
                <input
                  type="url"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://tiktok.com/@username"
                />
                {errors.tiktok && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.tiktok}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Facebook URL</label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://facebook.com/username"
                />
                {errors.facebook && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.facebook}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>YouTube URL</label>
                <input
                  type="url"
                  name="youtube"
                  value={formData.youtube}
                  onChange={handleInputChange}
                  style={inputStyle}
                  placeholder="https://youtube.com/channel/..."
                />
                {errors.youtube && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.youtube}</div>}
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: theme.textPrimary }}>Professional Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Real Estate Profession <span style={requiredAsterisk}>*</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="radio"
                      name="real_estate_profession"
                      value="agency_owner"
                      checked={formData.real_estate_profession === 'agency_owner'}
                      onChange={handleInputChange}
                      style={{ marginRight: '8px' }}
                    />
                    Real Estate Agency Owner
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="radio"
                      name="real_estate_profession"
                      value="agent"
                      checked={formData.real_estate_profession === 'agent'}
                      onChange={handleInputChange}
                      style={{ marginRight: '8px' }}
                    />
                    Real Estate Agent
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="radio"
                      name="real_estate_profession"
                      value="developer_employee"
                      checked={formData.real_estate_profession === 'developer_employee'}
                      onChange={handleInputChange}
                      style={{ marginRight: '8px' }}
                    />
                    Developer Employee
                  </label>
                {errors.real_estate_profession && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.real_estate_profession}</div>}
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>
                  Profile Image <span style={requiredAsterisk}>*</span>
                </label>
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  style={fileInputStyle}
                  accept="image/*"
                  required
                />
                {errors.image && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.image}</div>}
              </div>
            </div>
          </div>
          </div>

          {/* reCAPTCHA */}
          <div style={{ marginTop: '24px', marginBottom: '24px' }}>
            <div
              id="recaptcha-container-real-estate"
              style={{ display: 'inline-block' }}
            ></div>
            {errors.recaptcha && <div style={{ color: theme.danger, fontSize: '12px', marginTop: '4px' }}>{errors.recaptcha}</div>}
            <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '8px' }}>
              Complete the reCAPTCHA verification to submit your profile.
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
              {loading ? 'Submitting...' : 'Submit Profile'}
            </button>
          </div>
        </form>
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
                {popupType === 'success' ? 'Success!' : 'Error!'}
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

export default RealEstateSubmissionForm;
