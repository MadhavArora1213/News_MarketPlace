import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import AuthModal from '../components/auth/AuthModal';
import api from '../services/api';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const ThemeSubmissionPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [errors, setErrors] = useState({});

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

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuth(true);
    }
  }, [isAuthenticated]);

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
    const requiredFields = ['platform', 'username', 'page_name', 'category', 'location'];
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    // URL validation for page_website
    if (formData.page_website && !formData.page_website.match(/^https?:\/\/.+/)) {
      newErrors.page_website = 'Please enter a valid URL starting with http:// or https://';
    }

    // Numeric validations
    const numericFields = ['no_of_followers', 'video_minute_allowed'];
    numericFields.forEach(field => {
      if (formData[field] && isNaN(formData[field])) {
        newErrors[field] = 'Please enter a valid number';
      }
    });

    // Price validations (decimal)
    const priceFields = [
      'price_reel_without_tagging_collaboration',
      'price_reel_with_tagging_collaboration',
      'price_reel_with_tagging',
      'pin_post_charges_week',
      'story_charges',
      'story_with_reel_charges'
    ];
    priceFields.forEach(field => {
      if (formData[field] && (isNaN(formData[field]) || parseFloat(formData[field]) < 0)) {
        newErrors[field] = 'Please enter a valid price (0 or greater)';
      }
    });

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
        no_of_followers: formData.no_of_followers ? parseInt(formData.no_of_followers) : null,
        video_minute_allowed: formData.video_minute_allowed ? parseInt(formData.video_minute_allowed) : null,
        price_reel_without_tagging_collaboration: formData.price_reel_without_tagging_collaboration ? parseFloat(formData.price_reel_without_tagging_collaboration) : null,
        price_reel_with_tagging_collaboration: formData.price_reel_with_tagging_collaboration ? parseFloat(formData.price_reel_with_tagging_collaboration) : null,
        price_reel_with_tagging: formData.price_reel_with_tagging ? parseFloat(formData.price_reel_with_tagging) : null,
        pin_post_charges_week: formData.pin_post_charges_week ? parseFloat(formData.pin_post_charges_week) : null,
        story_charges: formData.story_charges ? parseFloat(formData.story_charges) : null,
        story_with_reel_charges: formData.story_with_reel_charges ? parseFloat(formData.story_with_reel_charges) : null
      };

      await api.post('/themes', dataToSend);

      setSubmitStatus('success');
      setTimeout(() => {
        navigate('/themes');
      }, 3000);

    } catch (error) {
      console.error('Error submitting theme:', error);

      let errorMessage = 'Failed to submit theme. Please try again.';

      if (error.response?.status === 400) {
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

  const handleCloseAuth = () => {
    setShowAuth(false);
    if (!isAuthenticated) {
      navigate('/');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <UserHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-[#FF9800] mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-[#212121] mb-2">Authentication Required</h2>
            <p className="text-[#757575] mb-6">Please log in to submit a theme.</p>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-[#1976D2] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0D47A1] transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
        <UserFooter />
        <AuthModal
          isOpen={showAuth}
          onClose={handleCloseAuth}
          onLoginSuccess={handleCloseAuth}
        />
      </div>
    );
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

  return (
    <div className="min-h-screen bg-white">
      <UserHeader />

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
              Submit Your Theme
            </h1>
            <p className="text-lg md:text-xl text-[#757575] max-w-3xl mx-auto leading-relaxed font-light">
              Share your social media theme details with our community. Your submission will be reviewed and approved before being published.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto">
          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#E8F5E8] border border-[#4CAF50] rounded-lg p-6 mb-8 flex items-center gap-4"
            >
              <CheckCircle className="w-8 h-8 text-[#4CAF50] flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-[#4CAF50] mb-2">Theme Submitted Successfully!</h3>
                <p className="text-[#757575]">
                  Your theme has been submitted and is pending approval. You will be notified once it's reviewed.
                  Redirecting to themes page in a few seconds...
                </p>
              </div>
            </motion.div>
          )}

          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#FFE8E8] border border-[#F44336] rounded-lg p-6 mb-8 flex items-center gap-4"
            >
              <AlertCircle className="w-8 h-8 text-[#F44336] flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-[#F44336] mb-2">Submission Failed</h3>
                <p className="text-[#757575]">{errors.submit || 'Please check your input and try again.'}</p>
              </div>
            </motion.div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-[#E0E0E0] p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-xl font-semibold text-[#212121] mb-6 border-b border-[#E0E0E0] pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Platform <span className="text-[#F44336]">*</span>
                    </label>
                    <select
                      name="platform"
                      value={formData.platform}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] bg-white"
                      required
                    >
                      <option value="">Select Platform</option>
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Twitter">Twitter</option>
                      <option value="Facebook">Facebook</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.platform && <p className="text-[#F44336] text-sm mt-1">{errors.platform}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Username <span className="text-[#F44336]">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                      placeholder="@username"
                      required
                    />
                    {errors.username && <p className="text-[#F44336] text-sm mt-1">{errors.username}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Page Name <span className="text-[#F44336]">*</span>
                    </label>
                    <input
                      type="text"
                      name="page_name"
                      value={formData.page_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                      placeholder="Display name"
                      required
                    />
                    {errors.page_name && <p className="text-[#F44336] text-sm mt-1">{errors.page_name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Number of Followers
                    </label>
                    <input
                      type="number"
                      name="no_of_followers"
                      value={formData.no_of_followers}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                      placeholder="e.g., 10000"
                      min="0"
                    />
                    {errors.no_of_followers && <p className="text-[#F44336] text-sm mt-1">{errors.no_of_followers}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Category <span className="text-[#F44336]">*</span>
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                      placeholder="e.g., Fashion, Technology, Food"
                      required
                    />
                    {errors.category && <p className="text-[#F44336] text-sm mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Location <span className="text-[#F44336]">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                      placeholder="e.g., Dubai, UAE"
                      required
                    />
                    {errors.location && <p className="text-[#F44336] text-sm mt-1">{errors.location}</p>}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-[#212121] mb-2">
                    Collaboration Details
                  </label>
                  <textarea
                    name="collaboration"
                    value={formData.collaboration}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121] resize-vertical"
                    placeholder="Describe collaboration opportunities, requirements, etc."
                  />
                  {errors.collaboration && <p className="text-[#F44336] text-sm mt-1">{errors.collaboration}</p>}
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-[#212121] mb-2">
                    Page Website
                  </label>
                  <input
                    type="url"
                    name="page_website"
                    value={formData.page_website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                    placeholder="https://example.com"
                  />
                  {errors.page_website && <p className="text-[#F44336] text-sm mt-1">{errors.page_website}</p>}
                </div>
              </div>

              {/* Pricing Information */}
              <div>
                <h3 className="text-xl font-semibold text-[#212121] mb-6 border-b border-[#E0E0E0] pb-2">
                  Pricing Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Reel Price (Without Tagging/Collaboration)
                    </label>
                    <input
                      type="number"
                      name="price_reel_without_tagging_collaboration"
                      value={formData.price_reel_without_tagging_collaboration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.price_reel_without_tagging_collaboration && <p className="text-[#F44336] text-sm mt-1">{errors.price_reel_without_tagging_collaboration}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Reel Price (With Tagging/Collaboration)
                    </label>
                    <input
                      type="number"
                      name="price_reel_with_tagging_collaboration"
                      value={formData.price_reel_with_tagging_collaboration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.price_reel_with_tagging_collaboration && <p className="text-[#F44336] text-sm mt-1">{errors.price_reel_with_tagging_collaboration}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Reel Price (With Tagging)
                    </label>
                    <input
                      type="number"
                      name="price_reel_with_tagging"
                      value={formData.price_reel_with_tagging}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.price_reel_with_tagging && <p className="text-[#F44336] text-sm mt-1">{errors.price_reel_with_tagging}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Video Minutes Allowed
                    </label>
                    <input
                      type="number"
                      name="video_minute_allowed"
                      value={formData.video_minute_allowed}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                      placeholder="e.g., 60"
                      min="0"
                    />
                    {errors.video_minute_allowed && <p className="text-[#F44336] text-sm mt-1">{errors.video_minute_allowed}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Pin Post Charges (Weekly)
                    </label>
                    <input
                      type="number"
                      name="pin_post_charges_week"
                      value={formData.pin_post_charges_week}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.pin_post_charges_week && <p className="text-[#F44336] text-sm mt-1">{errors.pin_post_charges_week}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Story Charges
                    </label>
                    <input
                      type="number"
                      name="story_charges"
                      value={formData.story_charges}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.story_charges && <p className="text-[#F44336] text-sm mt-1">{errors.story_charges}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#212121] mb-2">
                      Story with Reel Charges
                    </label>
                    <input
                      type="number"
                      name="story_with_reel_charges"
                      value={formData.story_with_reel_charges}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent text-[#212121]"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.story_with_reel_charges && <p className="text-[#F44336] text-sm mt-1">{errors.story_with_reel_charges}</p>}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-[#E0E0E0]">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#1976D2] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#0D47A1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <Loader className="w-5 h-5 animate-spin" />}
                  {loading ? 'Submitting...' : 'Submit Theme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <UserFooter />

      <AuthModal
        isOpen={showAuth}
        onClose={handleCloseAuth}
        onLoginSuccess={handleCloseAuth}
      />
    </div>
  );
};

export default ThemeSubmissionPage;