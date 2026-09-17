import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const [messageType, setMessageType] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch(`http://${window.location.hostname}:5000/api/auth/login`, {
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
        <div className="auth-wrapper">
            <div className="surface-card auth-card">
                <h2 className="brand-gradient-text auth-title">Connexion</h2>

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                        <label className="custom-label">Adresse Email</label>
                        <input
                            type="email"
                            className="styled-input w-100"
                            placeholder="Entrez votre email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label className="custom-label">Mot de passe</label>
                        <input
                            type="password"
                            className="styled-input w-100"
                            placeholder="Votre mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Primary btn*/}
                    <button type="submit" className="btn-primary w-100 mb-4">
                        Se connecter
                    </button>

                    <div className="auth-footer">
                        <span>Pas encore de compte ? </span>
                        <Link to="/register" className="auth-link">
                            S'inscrire
                        </Link>
                    </div>
                </form>

                {/* Alerts */}
                {message && (
                    <div className={`custom-alert custom-alert-${messageType} mt-4 text-center`}>
                        {messageType === 'success' && '✅ '}
                        {messageType === 'danger' && '❌ '}
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoginForm;