import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import ReporterSubmissionForm from '../components/user/ReporterSubmissionForm';

const ReporterRegistrationPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <div className="container mx-auto px-4 py-8">
        <ReporterSubmissionForm onClose={handleClose} onSuccess={handleSuccess} renderAsModal={false} />
      </div>
      <UserFooter />
    </div>
  );
};

export default ReporterRegistrationPage;