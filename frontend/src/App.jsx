import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Analyzer from './components/Analyzer';
import Dashboard from './components/Dashboard';


function App() {
  return (
    <Router>
      {/* The Navbar is placed inside the Router but outside the Routes,
          so it renders on every single page! */}
      <Navbar />

      {/* Main content wrapper with margin for spacing */}
      <div className="container mt-4">
        <Routes>
          {/* Homepage (Analyzer) */}
          <Route path="/" element={<Analyzer />} />

          {/* Authentication */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Dashboard (Placeholder for now) */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Fallback route: Return to Homepage if URL is unknown */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;