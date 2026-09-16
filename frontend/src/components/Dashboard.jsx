import React, { useState, useEffect } from 'react';
import LinksDashboard from './LinksDashboard';
import SupervisionSidebar from './SupervisionSidebar';
import EditSidebar from '../components/EditSidebar';

const Dashboard = () => {
    // --- States for displaying links ---
    const [links, setLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State for User Preferences ---
    const [fastSaveEnabled, setFastSaveEnabled] = useState(false);

    // --- States for the input form ---
    const [newUrl, setNewUrl] = useState('');
    const [addMessage, setAddMessage] = useState(null);
    const [isFastSaving, setIsFastSaving] = useState(false); // To disable button during background save

    // --- States for the Supervision Sidebar ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarLoading, setIsSidebarLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [sidebarError, setSidebarError] = useState(null);

    // --- States for the Edit Sidebar ---
    const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
    const [selectedLinkForEdit, setSelectedLinkForEdit] = useState(null);
    const [editError, setEditError] = useState(null);

    // Fetch User Profile to get Fast-Save preference
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFastSaveEnabled(data.fast_save || false);
            }
        } catch (err) {
            console.error("Erreur lors de la récupération du profil:", err);
        }
    };

    const fetchLinks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/links', {
                headers: { 'Authorization': `Bearer ${token}` }
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

    // Load both links and user preferences on mount
    useEffect(() => {
        fetchUserProfile();
        fetchLinks();
    }, []);

    const handleDeleteLink = (deletedLinkId) => {
        setLinks(prevLinks => prevLinks.filter(link => link.link_id !== deletedLinkId));
    };

    // --- STEP 1: TRIGGER PREVIEW ---
    const handlePreviewLink = async (e) => {
        e.preventDefault();
        if (!newUrl.trim()) return;

        setAddMessage(null);

        // UI Feedback based on user preference
        if (fastSaveEnabled) {
            setIsFastSaving(true);
            setAddMessage({ type: 'info', text: 'Analyse et sauvegarde rapide en cours...' });
        } else {
            setIsSidebarOpen(true);
            setIsSidebarLoading(true);
            setPreviewData(null);
        }

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
                if (fastSaveEnabled) {
                    // FAST-SAVE: Directly save the preview data without sidebar
                    await performFastSave(data);
                } else {
                    // NORMAL: Pass the data to the sidebar
                    setPreviewData(data);
                }
            } else {
                setAddMessage({ type: 'danger', text: data.error || "Échec de l'analyse du lien." });
                setIsSidebarOpen(false);
            }
        } catch (err) {
            setAddMessage({ type: 'danger', text: 'Erreur de connexion au serveur.' });
            setIsSidebarOpen(false);
        } finally {
            if (!fastSaveEnabled) {
                setIsSidebarLoading(false);
            }
            setIsFastSaving(false);
        }
    };

    // --- STEP 1.5: BACKGROUND FAST-SAVE ---
    const performFastSave = async (analyzedData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(analyzedData)
            });

            const data = await response.json();

            if (response.ok) {
                setAddMessage({ type: 'success', text: 'Lien sauvegardé automatiquement avec succès ! ⚡' });
                setNewUrl(''); // Clear input
                fetchLinks();  // Refresh the list
            } else {
                setAddMessage({ type: 'danger', text: data.error || 'Échec de la sauvegarde rapide.' });
            }
        } catch (err) {
            setAddMessage({ type: 'danger', text: 'Erreur de connexion lors de la sauvegarde.' });
        }
    };

    // --- STEP 2: HANDLE FINAL SAVE FROM SIDEBAR (Normal Mode) ---
    const handleSaveLink = async (finalizedData) => {
        setIsSidebarLoading(true);
        setSidebarError(null);

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

    const handleEditClick = (link) => {
        setSelectedLinkForEdit(link);
        setEditError(null);
        setIsEditSidebarOpen(true);
    };

    const handleCloseEdit = () => {
        setIsEditSidebarOpen(false);
        setSelectedLinkForEdit(null);
        setEditError(null);
    };

    const handleToggleFavorite = (linkId, newFavoriteStatus) => {
    setLinks(prevLinks =>
        prevLinks.map(link =>
            link.link_id === linkId
                ? { ...link, is_favorite: newFavoriteStatus }
                : link
        )
    );
};

    const handleSaveEdit = async (updatedData) => {
        console.log("2. Dashboard a bien reçu l'ordre ! Données :", updatedData);
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
                    categories: updatedData.categories,
                    tags: updatedData.tags,
                    thumbnail_url: updatedData.thumbnail_url
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error && data.error.includes("is not configured")) {
                    setEditError("Nous ne connaissons pas cette catégorie");
                } else {
                    setEditError(data.error || "Une erreur est survenue");
                }
                return;
            }

            handleCloseEdit();
            fetchLinks();

        } catch (error) {
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
                        {/*
                            MAGIE RESPONSIVE :
                            flex-column = empilé de haut en bas sur mobile
                            flex-md-row = côte à côte sur ordinateur
                            gap-2 = espace entre le champ et le bouton
                        */}
                        <div className="d-flex flex-column flex-md-row gap-2">
                            <input
                                type="url"
                                className="form-control form-control-lg flex-grow-1"
                                placeholder="Collez votre lien ici (Instagram, TikTok, Youtube)..."
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                disabled={isSidebarOpen || isFastSaving}
                                required
                            />
                            {/* Le bouton prendra toute la largeur sur mobile, et s'adaptera sur PC */}
                            <button
                                className="btn btn-primary btn-lg px-4"
                                type="submit"
                                disabled={isSidebarOpen || isFastSaving}
                            >
                                {fastSaveEnabled ? 'Sauvegarde rapide ⚡' : 'Analysez votre lien'}
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
                    onToggleFavorite={handleToggleFavorite}
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