import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
                text: '⚠️ Les deux mots de passe ne correspondent pas.'
            });
            return;
        }

        // 2. Local Validation: Password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            setMessage({
                type: 'warning',
                text: '⚠️ Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.'
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
                setMessage({ type: 'success', text: '✅ Inscription réussie ! Redirection...' });
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            } else {
                setMessage({ type: 'danger', text: '❌ ' + data.error });
            }
        } catch (error) {
            setMessage({ type: 'danger', text: '❌ Impossible de joindre le serveur.' });
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '400px' }}>
            <h2 className="text-center mb-4 fw-bold">Créer un compte</h2>
            <form onSubmit={handleRegister} className="card p-4 shadow-sm border-0">

                {/* Grid responsive : g-3 ajoute un espacement, col-12 empile sur mobile, col-sm-6 aligne sur PC */}
                <div className="row g-3 mb-3">
                    <div className="col-12 col-sm-6">
                        <label className="form-label fw-semibold">Prénom</label>
                        <input type="text" className="form-control form-control-lg" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="col-12 col-sm-6">
                        <label className="form-label fw-semibold">Nom</label>
                        <input type="text" className="form-control form-control-lg" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input type="email" className="form-control form-control-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Mot de passe</label>
                    <div className="input-group input-group-lg">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            className="btn btn-outline-secondary px-3"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                    <div className="form-text mt-2" style={{ fontSize: '0.85rem' }}>
                        Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial.
                    </div>
                </div>

                <div className="mb-4">
                    <label className="form-label fw-semibold">Confirmer le mot de passe</label>
                    <div className="input-group input-group-lg">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button
                            className="btn btn-outline-secondary px-3"
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label="Toggle confirm password visibility"
                        >
                            {showConfirmPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                </div>

                <button type="submit" className="btn btn-success btn-lg w-100 mb-3 fw-bold">
                    S'inscrire
                </button>

                <div className="text-center mt-2">
                    <Link to="/login" className="text-decoration-none text-muted">
                        Déjà un compte ? <span className="text-primary fw-semibold">Se connecter</span>
                    </Link>
                </div>
            </form>

            {message && <div className={`alert alert-${message.type} mt-4 py-2`}>{message.text}</div>}
        </div>
    );
}

export default RegisterForm;