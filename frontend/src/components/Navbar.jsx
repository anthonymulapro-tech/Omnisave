import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogoClick = (e) => {
        if (location.pathname === '/dashboard' || location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark glass-navbar sticky-top">
            <div className="container">
                {/* BRAND LOGO */}
                <Link
                    className="brand-logo"
                    to={isAuthenticated ? "/dashboard" : "/"}
                    onClick={handleLogoClick}
                >
                    Omnisave
                </Link>

                {/* MOBILE TOGGLE BUTTON */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={toggleMenu}
                    aria-controls="navbarNav"
                    aria-expanded={isMenuOpen}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* NAVIGATION LINKS */}
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