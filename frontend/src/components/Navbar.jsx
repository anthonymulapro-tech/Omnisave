import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
    const location = useLocation();

    // Gère l'état d'ouverture du menu mobile
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Ferme le menu automatiquement à chaque changement d'URL
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    // Check if the user is authenticated by looking for the JWT in local storage
    const isAuthenticated = !!localStorage.getItem('token');

    /**
     * Handles the logout process by clearing the token and redirecting to login.
     */
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Fonction pour basculer l'état du menu au clic sur le burger
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
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
                    onClick={toggleMenu} // React prend le contrôle ici
                    aria-controls="navbarNav"
                    aria-expanded={isMenuOpen}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* NAVIGATION LINKS */}
                {/* On ajoute conditionnellement la classe 'show' de Bootstrap si isMenuOpen est true */}
                <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
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