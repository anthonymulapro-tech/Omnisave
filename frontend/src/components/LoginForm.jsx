import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. On importe l'outil de navigation

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate(); // 2. On prépare la fonction de redirection

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                setMessage('✅ Connexion réussie ! Redirection...');

                // 3. On redirige vers l'analyseur (la racine '/') après 1 seconde
                setTimeout(() => {
                    navigate('/');
                }, 1000);

            } else {
                setMessage('❌ Erreur : ' + data.error);
            }
        } catch (error) {
            setMessage('❌ Impossible de joindre le serveur.');
        }
    };

    // Le reste de ton affichage HTML/Bootstrap en dessous ne change absolument pas !
    return (
        <div className="container mt-5" style={{ maxWidth: '400px' }}>
            <h2 className="text-center mb-4">Connexion à Omnisave</h2>
            <form onSubmit={handleLogin} className="card p-4 shadow-sm">
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Mot de passe</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                    Se connecter
                </button>
            </form>
            {message && <div className="alert alert-info mt-3">{message}</div>}
        </div>
    );
}

export default LoginForm;