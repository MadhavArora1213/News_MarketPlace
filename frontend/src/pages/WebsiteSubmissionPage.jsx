import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import WebsiteSubmissionForm from '../components/user/WebsiteSubmissionForm';
import { useLanguage } from '../context/LanguageContext';

const WebsiteSubmissionPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, hasAnyRole } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (hasAnyRole(['super_admin', 'content_manager', 'editor'])) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate, hasAnyRole]);

  const handleClose = () => {
    navigate('/');
  };

  const handleSuccess = () => {
    navigate('/');
  };

  if (!isAuthenticated || hasAnyRole(['super_admin', 'content_manager', 'editor'])) {
    return null; // or loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('websiteSubmission.uploadYourWebsite')}</h1>
        </div>
        <WebsiteSubmissionForm onClose={handleClose} onSuccess={handleSuccess} renderAsModal={false} />
      </div>
      <UserFooter />
    </div>
  );
};

export default WebsiteSubmissionPage;