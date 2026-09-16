import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 1. On importe l'outil de navigation

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

    return (
        <div className="container mt-5" style={{ maxWidth: '400px' }}>
            <h2 className="text-center mb-4 fw-bold">Connexion</h2>
            <form onSubmit={handleLogin} className="card p-4 shadow-sm border-0">
                <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                        type="email"
                        className="form-control form-control-lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="form-label fw-semibold">Mot de passe</label>
                    <input
                        type="password"
                        className="form-control form-control-lg"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold">
                    Se connecter
                </button>

                <div className="text-center mt-4">
                    <Link to="/register" className="text-decoration-none text-muted">
                        Pas encore de compte ? <span className="text-primary fw-semibold">S'inscrire</span>
                    </Link>
                </div>
            </form>
            {message && <div className="alert alert-info mt-4 py-2">{message}</div>}
        </div>
    );
}

export default LoginForm;