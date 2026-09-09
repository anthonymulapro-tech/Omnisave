import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Component rendering the user registration form.
 * Handles user input, form submission, and communicates with the backend API
 * to create a new user account for the Omnisave platform.
 *
 * @component
 * @returns {JSX.Element} The registration form interface.
 */
function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [message, setMessage] = useState(null);

    const navigate = useNavigate();

    /**
     * Handles the form submission to register a new user.
     * Prevents default page reload, validates password strength,
     * and sends a POST request to the API.
     *
     * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
     */
    const handleRegister = async (e) => {
        e.preventDefault();

        // Regex: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            setMessage({
                type: 'warning',
                text: '⚠️ Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.'
            });
            return; // Stop the execution here, do not send the fetch request
        }
        // -----------------------------------------

        try {
            const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password,
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
            <h2 className="text-center mb-4">Créer un compte</h2>
            <form onSubmit={handleRegister} className="card p-4 shadow-sm">

                <div className="row mb-3">
                    <div className="col">
                        <label className="form-label">Prénom</label>
                        <input type="text" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="col">
                        <label className="form-label">Nom</label>
                        <input type="text" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="mb-4">
                    <label className="form-label">Mot de passe</label>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />

                    <div className="form-text" style={{ fontSize: '0.8rem' }}>
                        Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial.
                    </div>
                </div>

                <button type="submit" className="btn btn-success w-100 mb-3">
                    S'inscrire
                </button>

                <div className="text-center">
                    <Link to="/login" className="text-decoration-none">Déjà un compte ? Se connecter</Link>
                </div>
            </form>

            {message && <div className={`alert alert-${message.type} mt-3`}>{message.text}</div>}
        </div>
    );
}

export default RegisterForm;