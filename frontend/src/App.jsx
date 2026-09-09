import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Analyzer from './components/Analyzer';

function App() {
  return (
    <Router>
      <Routes>
        {/* La page d'accueil affiche l'analyseur */}
        <Route path="/" element={<Analyzer />} />

        {/* L'URL /login affiche ton formulaire */}
        <Route path="/login" element={<LoginForm />} />

        {/* Si l'utilisateur tape n'importe quoi, on le renvoie à l'accueil */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;