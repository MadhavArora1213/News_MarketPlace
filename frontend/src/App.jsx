import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/auth/AuthModal';
import Icon from './components/common/Icon';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="arrow-path" size="lg" className="animate-spin text-primary mx-auto mb-4" />
          <p className="body-regular">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Home Page Component
const HomePage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="heading-3 text-primary">News Marketplace</h1>
            </div>
            <nav className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="body-regular">Welcome back!</span>
                  <button className="btn-secondary">Dashboard</button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary"
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="heading-1 mb-6">
            Welcome to News Marketplace
          </h1>
          <p className="body-large mb-8 max-w-2xl mx-auto">
            Discover, create, and share premium news content. Join our community of writers and readers.
          </p>

          {!isAuthenticated && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-primary text-lg px-8 py-3"
            >
              Get Started
            </button>
          )}

          {isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Icon name="pencil" size="lg" className="text-primary mb-4 mx-auto" />
                <h3 className="heading-4 mb-2">Write Articles</h3>
                <p className="body-small">Create and publish your own news content</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Icon name="eye" size="lg" className="text-primary mb-4 mx-auto" />
                <h3 className="heading-4 mb-2">Read Premium</h3>
                <p className="body-small">Access exclusive articles and insights</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Icon name="bell" size="lg" className="text-primary mb-4 mx-auto" />
                <h3 className="heading-4 mb-2">Stay Updated</h3>
                <p className="body-small">Get notified about latest news and trends</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

// Dashboard Page Component
const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="heading-3 text-primary">Dashboard</h1>
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="heading-2 mb-4">Welcome, {user?.first_name}!</h2>
          <p className="body-regular">Your dashboard is ready. Start exploring News Marketplace!</p>
        </div>
      </main>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
