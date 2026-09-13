import React, { useState, useEffect } from 'react';
import LinksDashboard from './LinksDashboard';
import SupervisionSidebar from './SupervisionSidebar';
import EditSidebar from '../components/EditSidebar';

const Dashboard = () => {
    // --- States for displaying links ---
    const [links, setLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- States for the input form ---
    const [newUrl, setNewUrl] = useState('');
    const [addMessage, setAddMessage] = useState(null);

    // --- States for the Supervision Sidebar ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarLoading, setIsSidebarLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [sidebarError, setSidebarError] = useState(null);

    // --- States for the Edit Sidebar ---
    const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
    const [selectedLinkForEdit, setSelectedLinkForEdit] = useState(null);
    const [editError, setEditError] = useState(null);

    const fetchLinks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/links', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Impossible de récupérer les liens');
            const data = await response.json();
            setLinks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const handleDeleteLink = (deletedLinkId) => {
        setLinks(prevLinks => prevLinks.filter(link => link.link_id !== deletedLinkId));
    };

    // --- STEP 1: TRIGGER PREVIEW ---
    const handlePreviewLink = async (e) => {
        e.preventDefault();
        if (!newUrl.trim()) return;

        // Prepare and open the sidebar in loading state
        setAddMessage(null);
        setIsSidebarOpen(true);
        setIsSidebarLoading(true);
        setPreviewData(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/links/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url: newUrl })
            });

            const data = await response.json();

            if (response.ok) {
                // Pass the data to the sidebar, which will stop its loader
                setPreviewData(data);
            } else {
                setAddMessage({ type: 'danger', text: data.error || "Échec de l'analyse du lien." });
                setIsSidebarOpen(false); // Close if error
            }
        } catch (err) {
            setAddMessage({ type: 'danger', text: 'Erreur de connexion au serveur.' });
            setIsSidebarOpen(false);
        } finally {
            setIsSidebarLoading(false);
        }
    };

    // --- STEP 2: HANDLE FINAL SAVE FROM SIDEBAR ---
    const handleSaveLink = async (finalizedData) => {
    setIsSidebarLoading(true);
    setSidebarError(null); // On nettoie les anciennes erreurs

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/links', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(finalizedData)
        });

        const data = await response.json();

        if (response.ok) {
            setAddMessage({ type: 'success', text: 'Lien sauvegardé avec succès !' });
            setNewUrl('');
            setIsSidebarOpen(false);
            fetchLinks();
        } else {
            // L'API Python renvoie "Category '...' is not configured."
            if (data.error && data.error.includes("not configured")) {
                setSidebarError("Nous ne connaissons pas cette catégorie");
            } else {
                setSidebarError(data.error || 'Échec de la sauvegarde du lien.');
            }
        }
    } catch (err) {
        setSidebarError('Erreur de connexion au serveur lors de la sauvegarde.');
    } finally {
        setIsSidebarLoading(false);
    }
};

    if (isLoading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
            </div>
        );
    }

    // Ouvre le tiroir et injecte les données du lien cliqué
    const handleEditClick = (link) => {
        setSelectedLinkForEdit(link);
        setEditError(null);
        setIsEditSidebarOpen(true);
    };

    // Ferme le tiroir
    const handleCloseEdit = () => {
        setIsEditSidebarOpen(false);
        setSelectedLinkForEdit(null);
        setEditError(null);
    };

    // Envoie la modification au serveur
    const handleSaveEdit = async (updatedData) => {
        setEditError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/links/${updatedData.link_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: updatedData.title,
                    category: updatedData.category, // C'est bien le texte que l'on envoie
                    tags: updatedData.tags
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Gestion de l'erreur rouge pour la catégorie
                if (data.error && data.error.includes("is not configured")) {
                    setEditError("Nous ne connaissons pas cette catégorie");
                } else {
                    setEditError(data.error || "Une erreur est survenue");
                }
                return; // On arrête là si erreur
            }

            // SUCCÈS ! On ferme le tiroir et on rafraîchit la liste
            handleCloseEdit();
            fetchLinks(); // ⚠️ Assure-toi que c'est bien le nom de ta fonction qui recharge les liens !

        } catch (error) {
            console.error("Erreur lors de la modification:", error);
            setEditError("Erreur de connexion au serveur");
        }
    };

    return (
        <div className="container mt-4">

            {/* --- ADD NEW LINK SECTION --- */}
            <div className="card shadow-sm mb-5 border-0">
                <div className="card-body p-4 bg-light rounded">
                    <h4 className="mb-3">Ajouter un lien</h4>
                    <form onSubmit={handlePreviewLink}>
                        <div className="input-group input-group-lg">
                            <input
                                type="url"
                                className="form-control"
                                placeholder="Collez votre lien Instagram, TikTok, ou Youtube ici..."
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                disabled={isSidebarOpen} // Disable input if sidebar is busy
                                required
                            />
                            <button
                                className="btn btn-primary px-4"
                                type="submit"
                                disabled={isSidebarOpen}
                            >
                                Analysez votre lien
                            </button>
                        </div>
                    </form>

                    {addMessage && (
                        <div className={`alert alert-${addMessage.type} mt-3 mb-0`} role="alert">
                            {addMessage.text}
                        </div>
                    )}
                </div>
            </div>

            {/* --- SAVED LINKS SECTION --- */}
            <h2 className="mb-4">Mes liens sauvegardés</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            {links.length === 0 && !error ? (
                <div className="alert alert-info text-center">
                    Vous n'avez pas encore sauvegardés de lien. Collez une URL ci-dessus pour commencer votre collection !
                </div>
            ) : (
                <LinksDashboard
                    initialLinks={links}
                    onDelete={handleDeleteLink}
                    onEdit={handleEditClick}
                />
            )}

            {/* --- SUPERVISION SIDEBAR COMPONENT --- */}
            <SupervisionSidebar
                isOpen={isSidebarOpen}
                isLoading={isSidebarLoading}
                previewData={previewData}
                error={sidebarError}
                onClose={() => setIsSidebarOpen(false)}
                onSave={handleSaveLink}
            />

            <EditSidebar
                isOpen={isEditSidebarOpen}
                linkData={selectedLinkForEdit}
                error={editError}
                onClose={handleCloseEdit}
                onSave={handleSaveEdit}
            />
        </div>
    );
};

export default Dashboard;