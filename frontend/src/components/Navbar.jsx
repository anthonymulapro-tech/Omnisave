import { Link, useNavigate } from 'react-router-dom';

/**
 * Navbar component providing main navigation for the application.
 * Conditionally renders links based on user authentication status.
 *
 * @component
 * @returns {JSX.Element} The Bootstrap navigation bar.
 */
function Navbar() {
    const navigate = useNavigate();

    // Check if the user is authenticated by looking for the JWT in local storage
    const isAuthenticated = !!localStorage.getItem('token');

    /**
     * Handles the logout process by clearing the token and redirecting to login.
     */
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
            <div className="container">
                {/* Brand Logo / Name */}
                <Link className="navbar-brand fw-bold" to="/">
                    Omnisave
                </Link>

                {/* Mobile Toggle Button */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navigation Links */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {isAuthenticated ? (
                            // Links visible ONLY to logged-in users
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/dashboard">Accueil</Link>
                                </li>

                                <li className="nav-item ms-lg-3">
                                    <button onClick={handleLogout} className="btn btn-outline-danger btn-sm mt-1">
                                        Se déconnecter
                                    </button>
                                </li>
                            </>
                        ) : (
                            // Links visible ONLY to guests (not logged in)
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login">Connexion</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register">Inscription</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;