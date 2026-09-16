import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // <-- Import the new Footer component
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import React from 'react';
// Adjust the path depending on where you saved LinkCard.jsx
import LinkCard from './components/LinkCard';

function App() {
  return (
    <Router>
      {/* Global wrapper to force the footer to the bottom of the screen (minHeight: 100vh) */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* The Navbar is placed inside the Router but outside the Routes,
            so it renders on every single page! */}
        <Navbar />

        {/* Main content wrapper: 'flex: 1' forces the container to take all available space, 
            pushing the footer down to the bottom of the viewport */}
        <div className="container mt-4" style={{ flex: 1 }}>
          <Routes>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Authentication */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            {/* Dashboard (Placeholder for now) */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* User Profile */}
            <Route path="/profile" element={<Profile />} />

            {/* Fallback route: Return to Homepage if URL is unknown */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        {/* The Footer will be rendered at the bottom of all pages */}
        <Footer />

      </div>
    </Router>
  );
}

export default App;