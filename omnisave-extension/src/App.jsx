import React, { useState } from 'react';
import './App.css';

function App() {
    // --- STATES ---
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- LOGIN LOGIC ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            // Verify this URL matches your actual Flask login endpoint
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                const receivedToken = data.token || data.access_token;
                localStorage.setItem('token', receivedToken);
                setToken(receivedToken);
                setMessage(null);
            } else {
                setMessage({ type: 'error', text: data.error || 'Login failed.' });
            }
        } catch (error) {
            console.error("Login Error:", error);
            setMessage({ type: 'error', text: 'Network error. Is the server running?' });
        } finally {
            setIsLoading(false);
        }
    };

    // --- LOGOUT LOGIC ---
    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setMessage(null);
    };

    // --- FAST-SAVE TRIGGER ---
    const handleFastSave = () => {
        console.log("Triggering Fast-Save logic...");
        setMessage({ type: 'success', text: 'Connecting to background worker...' });
    };

    return (
        <div className="extension-container">
            <header className="extension-header">
                <h2>Omnisave</h2>
            </header>

            <main>
                {!token ? (
                    /* LOGIN VIEW */
                    <form onSubmit={handleLogin} className="login-form">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        {/* PASSWORD INPUT WITH TOGGLE */}
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="btn-toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Connecting...' : 'Login'}
                        </button>
                    </form>
                ) : (
                    /* ACTION VIEW */
                    <div className="action-section">
                        <button className="btn-fast-save" onClick={handleFastSave}>
                            ⚡ Fast-Save Link
                        </button>
                        <button className="btn-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                )}

                {/* FEEDBACK MESSAGES */}
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