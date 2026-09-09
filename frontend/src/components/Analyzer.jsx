import { useState } from 'react';

function Analyzer() {
  const [textInput, setTextInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult("Analyse en cours, veuillez patienter...");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text_input: textInput }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(`Catégorie : ${data.category}`);
      } else {
        setResult(`Erreur : ${data.error}`);
      }
    } catch (error) {
      console.error("Erreur Fetch:", error);
      setResult("Erreur : Impossible de joindre le serveur Python.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Analyseur Omnisave</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Texte / Lien à analyser :</label>
          <textarea
            className="form-control"
            rows="4"
            placeholder="Collez une description ou un lien Instagram/YouTube ici..."
            required
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Analyse...' : 'Analyser'}
        </button>
      </form>
      {result && (
        <div className={`alert mt-4 text-center ${result.includes('Erreur') ? 'alert-danger' : 'alert-success'}`} role="alert">
          <strong>{result.toUpperCase()}</strong>
        </div>
      )}
    </div>
  );
}

export default Analyzer;