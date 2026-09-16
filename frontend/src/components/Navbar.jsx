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
                {/* BRAND LOGO */}
                <Link className="navbar-brand fw-bold fs-4" to="/">
                    Omnisave
                </Link>

                {/* MOBILE TOGGLE BUTTON */}
                {/* Removed borders and shadow for a cleaner look on mobile */}
                <button
                    className="navbar-toggler border-0 shadow-none p-2"
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
                    {/*
                        RESPONSIVE ALIGNMENT:
                        - align-items-lg-center: Centered only on desktop
                        - gap-2 gap-lg-3: Clean spacing between items (no need for manual mt-1 or ms-3)
                        - pb-3 pb-lg-0: Adds padding at the bottom of the open mobile menu
                    */}
                    <ul className="navbar-nav ms-auto align-items-lg-center gap-2 gap-lg-3 mt-3 mt-lg-0 pb-3 pb-lg-0">
                        {isAuthenticated ? (
                            // AUTHENTICATED USERS
                            <>
                                <li className="nav-item">
                                    {/* Increased padding for better touch targets */}
                                    <Link className="nav-link px-2 py-2" to="/dashboard">Accueil</Link>
                                </li>

                                <li className="nav-item">
                                    {/* w-100 makes the button full-width on mobile, auto-width on desktop */}
                                    <Link className="btn btn-outline-light w-100 px-4 py-2 fw-semibold" to="/profile">
                                        Profil
                                    </Link>
                                </li>

                                <li className="nav-item">
                                    <button onClick={handleLogout} className="btn btn-outline-danger w-100 px-4 py-2 fw-semibold">
                                        Se déconnecter
                                    </button>
                                </li>
                            </>
                        ) : (
                            // GUESTS
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link px-2 py-2" to="/login">Connexion</Link>
                                </li>
                                <li className="nav-item">
                                    {/* Differentiated UI: Register is a solid primary button */}
                                    <Link className="btn btn-primary w-100 px-4 py-2 fw-semibold" to="/register">
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