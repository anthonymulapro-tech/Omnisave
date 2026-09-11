import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard component displaying the list of links saved by the authenticated user.
 * Fetches data from the API on mount and renders it in a responsive grid.
 *
 * @component
 * @returns {JSX.Element} The dashboard interface.
 */
function Dashboard() {
    const [links, setLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // useEffect runs automatically when the component is mounted (displayed)
    useEffect(() => {
        const fetchLinks = async () => {
            const token = localStorage.getItem('token');

            // Security check: if no token, redirect to login
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Fetch links from the protected backend route
                const response = await fetch('http://127.0.0.1:5000/api/links', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401 || response.status === 422) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                // Ensure we are setting an array (depends on your backend JSON structure)
                // If your backend sends { "links": [...] }, use data.links
                setLinks(data.links || data || []);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("❌ Impossible de charger vos liens.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLinks();
    }, [navigate]); // navigate is included in the dependency array for best practices

    // Show a loading spinner while waiting for the API
    if (isLoading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Mes Liens Sauvegardés</h2>

            {/* Display error message if the fetch failed */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Display a message if the array is empty */}
            {links.length === 0 && !error ? (
                <div className="alert alert-info text-center">
                    Vous n'avez pas encore sauvegardé de liens. Retournez sur l'accueil pour en ajouter !
                </div>
            ) : (
                // Display the grid of links
                <div className="row">
                    {links.map((link, index) => (
                        <div className="col-md-6 col-lg-4 mb-4" key={link.link_id || index}>
                            <div className="card shadow-sm h-100">
                                <div className="card-body">
                                    <h5 className="card-title text-truncate" title={link.title || "Titre inconnu"}>
                                        {link.title || "Publication"}
                                    </h5>

                                    <div className="mb-3">
                                        <span className="badge bg-primary me-2">
                                            ID Catégorie : {link.category_id}
                                        </span>
                                        <span className="badge bg-secondary">
                                            {link.platform || "Web"}
                                        </span>
                                    </div>

                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-dark btn-sm w-100"
                                    >
                                        Ouvrir le lien
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;