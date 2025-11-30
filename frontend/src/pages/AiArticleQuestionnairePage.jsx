import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import AiArticleQuestionnaireForm from '../components/forms/AiArticleQuestionnaireForm';
import { Download, X, Mail, ExternalLink } from 'lucide-react';

// Theme colors
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

const AiArticleQuestionnairePage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showQuestionnairePopup, setShowQuestionnairePopup] = useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show questionnaire popup when component mounts
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      // Show popup after a brief delay to ensure page is loaded
      const timer = setTimeout(() => {
        setShowQuestionnairePopup(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
        <UserHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="arrow-path" size="lg" className="animate-spin text-primary mx-auto mb-4" />
            <p style={{ color: theme.textSecondary }}>Loading...</p>
          </div>
        </div>
        <UserFooter />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundAlt }}>
      <UserHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: theme.textPrimary }}>
            AI Article Questionnaire
          </h1>
          <p style={{ color: theme.textSecondary }}>
            Fill out this comprehensive questionnaire to help our AI generate the perfect article for your needs.
          </p>
        </div>

        <AiArticleQuestionnaireForm />
      </div>

      <UserFooter />

      {/* Questionnaire Popup */}
      {showQuestionnairePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-[#212121] pr-2">For Better Results, Use Our Detailed Questionnaire</h3>
                <button
                  onClick={() => setShowQuestionnairePopup(false)}
                  className="text-[#757575] hover:text-[#212121] transition-colors flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <p className="text-xs sm:text-sm text-[#757575]">
                  While you can fill out the online form below, we recommend using our comprehensive Word questionnaire for the best article quality and results.
                </p>

                <div className="bg-[#E3F2FD] p-3 sm:p-4 rounded-lg">
                  <h4 className="font-medium text-[#1976D2] mb-2 text-sm sm:text-base">Why Use the Word Questionnaire?</h4>
                  <ul className="text-xs sm:text-sm text-[#424242] space-y-1">
                    <li>• More detailed questions for better content</li>
                    <li>• Structured format for comprehensive responses</li>
                    <li>• Better AI understanding of your requirements</li>
                    <li>• Higher quality article output</li>
                  </ul>
                </div>

                <div className="bg-[#FFF8E1] p-3 sm:p-4 rounded-lg">
                  <h4 className="font-medium text-[#FF9800] mb-2 text-sm sm:text-base">Download & Submit</h4>
                  <p className="text-xs sm:text-sm text-[#BF360C] mb-3">
                    Download the questionnaire, fill it out completely, and send it to us for premium article creation.
                  </p>
                  <a
                    href="/NEW Questionnaire_03.2023_v3.docx"
                    download="Article_Questionnaire.docx"
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#FF9800] text-white rounded-lg hover:bg-[#F57C00] transition-colors text-xs sm:text-sm font-medium"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Download Questionnaire</span>
                    <span className="sm:hidden">Download</span>
                  </a>
                </div>

                <div className="border-t pt-3 sm:pt-4">
                  <h4 className="font-medium text-[#212121] mb-2 text-sm sm:text-base">Submission Options:</h4>
                  <div className="space-y-2 text-xs sm:text-sm text-[#757575]">
                    <div className="flex items-start gap-2">
                      <Mail size={14} className="text-[#1976D2] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-medium">Email:</span> Send completed questionnaire to{' '}
                        <strong className="text-xs">article@vaas.solutions</strong>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ExternalLink size={14} className="text-[#4CAF50] mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-medium">Direct Upload:</span>{' '}
                        <a href="https://vaas.solutions/submit-article" target="_blank" rel="noopener noreferrer" className="text-[#4CAF50] hover:underline break-all text-xs">
                          vaas.solutions/submit-article
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => setShowQuestionnairePopup(false)}
                  className="px-3 sm:px-4 py-2 bg-[#1976D2] text-white rounded-lg hover:bg-[#0D47A1] transition-colors text-xs sm:text-sm font-medium order-1 sm:order-2"
                >
                  Continue with Online Form
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AiArticleQuestionnairePage;