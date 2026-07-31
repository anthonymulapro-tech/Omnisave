import { useState } from 'react'

function App() {
  const [textInput, setTextInput] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Texte envoyé à l'analyse :", textInput);
    setResult("SPORT (Simulation)");
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Analyseur Omnisave</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="text_input" className="form-label">Texte / Lien à analyser :</label>
          <textarea
            className="form-control"
            id="text_input"
            rows="4"
            placeholder="Collez une description ou un lien Instagram/YouTube ici..."
            required
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary w-100">Analyser</button>
      </form>

      {result && (
        <div className="alert alert-success mt-4 text-center" role="alert">
          Catégorie détectée : <strong>{result}</strong>
        </div>
      )}
    </div>
  )
}

export default App