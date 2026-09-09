import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Analyzer from './components/Analyzer';


function App() {
  return (
    <Router>
      <Routes>
        {/* Homepage */}
        <Route path="/" element={<Analyzer />} />

        {/* URL /login */}
        <Route path="/login" element={<LoginForm />} />

        {/* URL /login */}
        <Route path="/register" element={<RegisterForm />} />

        {/* Return Homepage */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;