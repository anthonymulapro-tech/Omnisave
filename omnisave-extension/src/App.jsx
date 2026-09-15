import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    // --- STATES ---
    // Token is initialized to null. It will be fetched via useEffect on mount.
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // --- INIT: LOAD TOKEN ---
    useEffect(() => {
        if (window.chrome && chrome.storage) {
            // Asynchronous read from the extension's local storage
            chrome.storage.local.get(['token'], (result) => {
                if (result.token) {
                    setToken(result.token);
                }
            });
        } else {
            // Fallback for testing with npm run dev on a standard browser
            setToken(localStorage.getItem('token') || null);
        }
    }, []);

    // --- LOGIN LOGIC ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                const receivedToken = data.token || data.access_token;

                // SAVE TOKEN
                if (window.chrome && chrome.storage) {
                    chrome.storage.local.set({ token: receivedToken });
                } else {
                    localStorage.setItem('token', receivedToken);
                }

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
        // REMOVE TOKEN
        if (window.chrome && chrome.storage) {
            chrome.storage.local.remove(['token']);
        } else {
            localStorage.removeItem('token');
        }
        setToken(null);
        setMessage(null);
    };

    // --- FAST-SAVE TRIGGER ---
    const handleFastSave = () => {
        setIsLoading(true);
        setMessage({ type: 'success', text: 'Analyzing... You can close this popup!' });

        // Ensure Chrome extension API is available
        if (window.chrome && chrome.runtime) {
            // Send message to background.js with the JWT token
            chrome.runtime.sendMessage(
                { action: 'FAST_SAVE', token: token },
                (response) => {
                    setIsLoading(false);
                    if (response && response.success) {
                        setMessage({ type: 'success', text: response.message }); //
                    } else {
                        setMessage({ type: 'error', text: response.error || 'Failed to grab link.' });
                    }
                }
            );
        } else {
            // Fallback if testing outside of Chrome Extension context
            setMessage({ type: 'error', text: 'Chrome API not available in local dev mode.' });
            setIsLoading(false);
        }
    };

    return (
        <div className="extension-container">
            <header className="extension-header">
                <h2>Omnisave</h2>
            </header>

            <main>
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
                    <div className="action-section">
                        <button className="btn-fast-save" onClick={handleFastSave}>
                            ⚡ Fast-Save Link
                        </button>
                        <button className="btn-logout" onClick={handleLogout}>
                            Logout
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