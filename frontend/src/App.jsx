import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import React from 'react';
import LegalMentions from './pages/LegalMentions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        <Navbar />

        <div className="container mt-4" style={{ flex: 1 }}>
          <Routes>

            {/* REDIRECTION FIX: Preserve query parameters (?url=...) when redirecting to dashboard */}
            <Route path="/" element={<Navigate to={`/dashboard${window.location.search}`} replace />} />

            {/* Authentication */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            {/* Dashboard (Placeholder for now) */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* User Profile */}
            <Route path="/profile" element={<Profile />} />

            {/* Legal Pages */}
            <Route path="/legal-mentions" element={<LegalMentions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            {/* Fallback route: Return to Homepage if URL is unknown */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        <Footer />

      </div>
    </Router>
  );
}

export default App;