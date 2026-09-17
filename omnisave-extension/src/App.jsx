import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    // --- STATES ---
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- INIT: LOAD TOKEN ---
    useEffect(() => {
        if (window.chrome && chrome.storage) {
            chrome.storage.local.get(['token'], (result) => {
                if (result.token) {
                    setToken(result.token);
                }
            });
        } else {
            setToken(localStorage.getItem('token') || null);
        }
    }, []);

    // --- LOGIN LOGIC ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`http://${window.location.hostname}:5000/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                const receivedToken = data.token || data.access_token;

                if (window.chrome && chrome.storage) {
                    chrome.storage.local.set({ token: receivedToken });
                } else {
                    localStorage.setItem('token', receivedToken);
                }

                setToken(receivedToken);
                setMessage(null);
            } else {
                setMessage({ type: 'error', text: data.error || 'Échec de la connexion.' });
            }
        } catch (error) {
            console.error("Login Error:", error);
            setMessage({ type: 'error', text: 'Erreur réseau. Le serveur est-il en ligne ?' });
        } finally {
            setIsLoading(false);
        }
    };

    // --- LOGOUT LOGIC ---
    const handleLogout = (customMessage = null) => {
        if (window.chrome && chrome.storage) {
            chrome.storage.local.remove(['token']);
        } else {
            localStorage.removeItem('token');
        }
        setToken(null);
        setMessage(customMessage ? { type: 'error', text: customMessage } : null);
    };

    // --- FAST-SAVE TRIGGER ---
    const handleFastSave = () => {
        setIsLoading(true);
        setMessage({ type: 'success', text: 'Analyse en cours... Vous pouvez fermer cette fenêtre !' });

        if (window.chrome && chrome.runtime) {
            chrome.runtime.sendMessage(
                { action: 'FAST_SAVE', token: token },
                (response) => {
                    setIsLoading(false);

                    if (response) {
                        if (response.isUnauthorized) {
                            handleLogout("Votre session a expiré. Veuillez vous reconnecter.");
                            return;
                        }

                        if (response.success) {
                            setMessage({ type: 'success', text: response.message });
                        } else {
                            setMessage({ type: 'error', text: response.error || 'Échec de la récupération du lien.' });
                        }
                    } else {
                         setMessage({ type: 'error', text: 'Aucune réponse de l\'extension.' });
                    }
                }
            );
        } else {
            setMessage({ type: 'error', text: 'API Chrome indisponible en mode développement local.' });
            setIsLoading(false);
        }
    };

    return (
        <div className="extension-container">
            <header className="extension-header">
                <h2>Omnisave</h2>
            </header>

            <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {!token ? (
                    <form onSubmit={handleLogin} className="login-form">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="btn-toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>
                ) : (
                    <div className="action-section">
                        <button className="btn-fast-save" onClick={handleFastSave}>
                            <span>⚡</span> Sauvegarde rapide
                        </button>
                        <button className="btn-logout" onClick={() => handleLogout()}>
                            Déconnexion
                        </button>
                    </div>
                )}

                {message && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;