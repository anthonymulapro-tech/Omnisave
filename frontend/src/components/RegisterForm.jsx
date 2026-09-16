import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css'; // Importing the shared authentication styles

/**
 * Component rendering the user registration form.
 * Handles user input, form submission, password matching validation,
 * toggles for password visibility, and communicates with the backend API.
 *
 * @component
 * @returns {JSX.Element} The registration form interface.
 */
function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [message, setMessage] = useState(null);

    // NEW: States to handle password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    /**
     * Handles the form submission to register a new user.
     * Prevents default page reload, validates password match and strength locally,
     * and sends a POST request to the API.
     *
     * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
     */
    const handleRegister = async (e) => {
        e.preventDefault();

        // 1. Local Validation: Check if passwords match
        if (password !== confirmPassword) {
            setMessage({
                type: 'warning',
                text: 'Les deux mots de passe ne correspondent pas.'
            });
            return;
        }

        // 2. Local Validation: Password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            setMessage({
                type: 'warning',
                text: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.'
            });
            return;
        }

        // 3. API Request
        try {
            const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    confirm_password: confirmPassword,
                    first_name: firstName,
                    last_name: lastName
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Inscription réussie ! Redirection...' });
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                setMessage({ type: 'danger', text: data.error || 'Erreur lors de l\'inscription.' });
            }
        } catch (error) {
            setMessage({ type: 'danger', text: 'Impossible de joindre le serveur.' });
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="surface-card auth-card">

                <h2 className="brand-gradient-text auth-title">Créer un compte</h2>

                <form onSubmit={handleRegister} className="auth-form">

                    {/* First Name & Last Name inline on desktop */}
                    <div className="form-row">
                        <div>
                            <label className="custom-label">Prénom</label>
                            <input
                                type="text"
                                className="styled-input w-100"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Votre prénom"
                            />
                        </div>
                        <div>
                            <label className="custom-label">Nom</label>
                            <input
                                type="text"
                                className="styled-input w-100"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Votre nom"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="custom-label">Adresse Email</label>
                        <input
                            type="email"
                            className="styled-input w-100"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Entrez votre email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="custom-label">Mot de passe</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="styled-input w-100"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Créer un mot de passe"
                                required
                            />
                            <button
                                className="btn-toggle-pwd"
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                        <div className="form-text-custom mt-2">
                            Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial.
                        </div>
                    </div>

                    <div className="form-group mb-4">
                        <label className="custom-label">Confirmer le mot de passe</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="styled-input w-100"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Répéter le mot de passe"
                                required
                            />
                            <button
                                className="btn-toggle-pwd"
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label="Toggle confirm password visibility"
                            >
                                {showConfirmPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-100 mb-4">
                        S'inscrire
                    </button>

                    <div className="auth-footer">
                        <span>Déjà un compte ? </span>
                        <Link to="/login" className="auth-link">
                            Se connecter
                        </Link>
                    </div>
                </form>

                {message && (
                    <div className={`custom-alert custom-alert-${message.type} mt-4 text-center justify-content-center`}>
                        {message.type === 'success' && '✅ '}
                        {message.type === 'danger' && '❌ '}
                        {message.type === 'warning' && '⚠️ '}
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RegisterForm;