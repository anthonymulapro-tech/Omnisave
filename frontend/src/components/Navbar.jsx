import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Importing custom glassmorphism styles

/**
 * Navbar component providing main navigation for the application.
 * Conditionally renders links based on user authentication status.
 *
 * @component
 * @returns {JSX.Element} The custom glassmorphism navigation bar.
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
        // We keep 'navbar navbar-expand-lg' for structural behavior, but use 'glass-navbar' for styling.
        // 'navbar-dark' ensures the mobile hamburger icon is white.
        <nav className="navbar navbar-expand-lg navbar-dark glass-navbar">
            <div className="container">
                {/* BRAND LOGO */}
                <Link className="brand-logo" to="/">
                    Omnisave
                </Link>

                {/* MOBILE TOGGLE BUTTON */}
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

                {/* NAVIGATION LINKS */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-lg-center gap-3 mt-3 mt-lg-0">
                        {isAuthenticated ? (
                            // AUTHENTICATED USERS
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link-custom d-block" to="/dashboard">Accueil</Link>
                                </li>

                                <li className="nav-item">
                                    <Link className="btn-nav-primary" to="/profile">
                                        Profil
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <button onClick={handleLogout} className="btn-nav-danger">
                                        Se déconnecter
                                    </button>
                                </li>
                            </>
                        ) : (
                            // GUESTS
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link-custom d-block" to="/login">Connexion</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn-nav-primary" to="/register">
                                        Inscription
                                    </Link>
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