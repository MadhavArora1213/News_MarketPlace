import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import PaparazziSubmissionForm from '../components/user/PaparazziSubmissionForm';

const PaparazziSubmissionPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/paparazzi');
  };

  const handleSuccess = () => {
    navigate('/paparazzi');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <div className="container mx-auto px-4 py-8">
        <PaparazziSubmissionForm onClose={handleClose} onSuccess={handleSuccess} renderAsModal={false} />
      </div>
      <UserFooter />
    </div>
  );
};

export default PaparazziSubmissionPage;