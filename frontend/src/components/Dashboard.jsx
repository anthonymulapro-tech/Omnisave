import React, { useState, useEffect } from 'react';
import LinksDashboard from './LinksDashboard';
import SupervisionSidebar from './SupervisionSidebar';
import EditSidebar from '../components/EditSidebar';
import './Dashboard.css'; // Import custom styles

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
    const [isFastSaving, setIsFastSaving] = useState(false);

    // --- States for the Supervision Sidebar ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarLoading, setIsSidebarLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [sidebarError, setSidebarError] = useState(null);

    // --- States for the Edit Sidebar ---
    const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
    const [selectedLinkForEdit, setSelectedLinkForEdit] = useState(null);
    const [editError, setEditError] = useState(null);

    // --- PWA Share Target Handler ---
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        // Android share target might send the link in 'url' or 'text' params
        const sharedData = params.get('url') || params.get('text');

        if (sharedData) {
            // Extract the exact URL using regex in case the OS adds extra text
            const extractedUrl = sharedData.match(/https?:\/\/[^\s]+/)?.[0];

            if (extractedUrl) {
                setNewUrl(extractedUrl);
                setAddMessage({ type: 'info', text: 'Lien reçu depuis le partage !' });
            }

            // Clean the URL bar to prevent re-processing the same link on page refresh
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // Fetch User Profile
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://${window.location.hostname}:5000/api/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFastSaveEnabled(data.fast_save || false);
            }
        } catch (err) {
            console.error("Profile fetch error:", err);
        }
    };

    // Fetch Links
    const fetchLinks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://${window.location.hostname}:5000/api/links`, {
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

    // Load data on mount
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
            const response = await fetch(`http://${window.location.hostname}:5000/api/links/preview`, {
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
                    await performFastSave(data);
                } else {
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
            const response = await fetch(`http://${window.location.hostname}:5000/api/links`, {
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
                setNewUrl('');
                fetchLinks();
            } else {
                setAddMessage({ type: 'danger', text: data.error || 'Échec de la sauvegarde rapide.' });
            }
        } catch (err) {
            setAddMessage({ type: 'danger', text: 'Erreur de connexion lors de la sauvegarde.' });
        }
    };

    // --- STEP 2: HANDLE FINAL SAVE FROM SIDEBAR ---
    const handleSaveLink = async (finalizedData) => {
        setIsSidebarLoading(true);
        setSidebarError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://${window.location.hostname}:5000/api/links`, {
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
        setEditError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://${window.location.hostname}:5000/api/links/${updatedData.link_id}`, {
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

    // Render loading state with custom spinner
    if (isLoading) {
        return (
            <div className="loader-container">
                <div className="spinner"></div>
                <span>Chargement de vos liens...</span>
            </div>
        );
    }

    return (
        <div className="dashboard-container">

            {/* --- ADD NEW LINK SECTION --- */}
            {/* Uses surface-card from index.css for the global modern look */}
            <div className="surface-card add-link-section">
                <h4 className="add-link-title">Ajouter un lien</h4>
                <form onSubmit={handlePreviewLink} className="add-link-form">
                    <input
                        type="url"
                        className="styled-input"
                        placeholder="Collez votre lien ici (Instagram, TikTok, Youtube)..."
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        disabled={isFastSaving}
                        required
                    />
                    {/* Uses the global btn-primary from index.css */}
                    <button
                        className="btn-primary"
                        type="submit"
                        disabled={isFastSaving}
                    >
                        {fastSaveEnabled ? 'Sauvegarde rapide ⚡' : 'Analyser le lien'}
                    </button>
                </form>

                {addMessage && (
                    <div className={`custom-alert custom-alert-${addMessage.type}`}>
                        {addMessage.type === 'success' && '✅ '}
                        {addMessage.type === 'danger' && '⚠️ '}
                        {addMessage.type === 'info' && '⏳ '}
                        {addMessage.text}
                    </div>
                )}
            </div>

            {/* --- SAVED LINKS SECTION --- */}
            <h2 className="section-title">Mes liens sauvegardés</h2>

            {error && (
                <div className="custom-alert custom-alert-danger">{error}</div>
            )}

            {links.length === 0 && !error ? (
                <div className="custom-alert custom-alert-info">
                    💡 Vous n'avez pas encore sauvegardé de lien. Collez une URL ci-dessus pour commencer votre collection !
                </div>
            ) : (
                <LinksDashboard
                    initialLinks={links}
                    onDelete={handleDeleteLink}
                    onEdit={handleEditClick}
                    onToggleFavorite={handleToggleFavorite}
                />
            )}

            {/* --- SIDEBARS --- */}
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
                onDelete={handleDeleteLink}
            />
        </div>
    );
};

export default Dashboard;