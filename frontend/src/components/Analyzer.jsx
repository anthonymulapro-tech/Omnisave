import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Analyzer() {
  const [urlInput, setUrlInput] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult({ type: 'info', text: 'Extraction et analyse par l\'IA en cours...' });

    // Retrieve the JWT token stored during login
    const token = localStorage.getItem('token');

    // If the user is not authenticated, redirect to the login page
    if (!token) {
        navigate('/login');
        return;
    }

    try {
      // Send request to the protected backend route (Extraction + AI + DB persistence)
      const response = await fetch("http://127.0.0.1:5000/api/links", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // 🔒 Attach the JWT for security
        },
        // The backend expects an 'url' key
        body: JSON.stringify({ url: urlInput }),
      });

      const data = await response.json();

      if (response.ok) {
        // Full success (HTTP 201 Created)
        setResult({
            type: 'success',
            text: `✅ Succès ! Catégorie détectée : ${data.detected_category}`
        });
        setUrlInput(''); // Clear the input field for the next link
      } else if (response.status === 401 || response.status === 422) {
        // Token is expired or invalid, clear storage and force logout
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        // Backend-handled errors (e.g., unsupported URL format)
        setResult({ type: 'danger', text: `❌ Erreur : ${data.error}` });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setResult({ type: 'danger', text: "❌ Impossible de joindre le serveur Python." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <div className="card shadow-sm p-4">
          <h2 className="text-center mb-4">Sauvegarder un lien</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">URL de la publication :</label>
              <input
                type="url"
                className="form-control"
                placeholder="Collez un lien Instagram, YouTube ou TikTok..."
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
              {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Analyse de l'IA en cours...
                  </>
              ) : 'Analyser et Sauvegarder'}
            </button>
          </form>

          {result && (
            <div className={`alert alert-${result.type} mt-4 text-center`} role="alert">
              <strong>{result.text}</strong>
            </div>
          )}
      </div>
    </div>
  );
}

export default Analyzer;