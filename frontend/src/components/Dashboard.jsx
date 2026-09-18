import React, { useState, useEffect } from 'react';
import LinksDashboard from './LinksDashboard';
import SupervisionSidebar from './SupervisionSidebar';
import EditSidebar from '../components/EditSidebar';
import './Dashboard.css';

const Dashboard = () => {
    // --- States ---
    const [links, setLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fastSaveEnabled, setFastSaveEnabled] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [addMessage, setAddMessage] = useState(null);
    const [isFastSaving, setIsFastSaving] = useState(false);

    // Sidebars states
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarLoading, setIsSidebarLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [sidebarError, setSidebarError] = useState(null);
    const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
    const [selectedLinkForEdit, setSelectedLinkForEdit] = useState(null);
    const [editError, setEditError] = useState(null);

    // --- PWA Share Target Handler ---
useEffect(() => {
    try {
        const currentUrl = window.location.href;

        // 1. Check if the URL contains the parameter
        if (currentUrl.includes('url=')) {
            // Extract directly from the full string to avoid React Router stripping
            const sharedData = currentUrl.split('url=')[1];
            const extractedUrl = sharedData.match(/https?:\/\/[^\s]+/)?.[0];

            if (extractedUrl) {
                // Populate the UI input visually
                setNewUrl(extractedUrl);

                // Trigger the analysis automatically with a small delay
                // This prevents React state race conditions during initial mount
                setTimeout(() => {
                    handlePreviewLink(null, extractedUrl);
                }, 500);
            }

            // 2. Clean the URL to prevent infinite loops on manual refresh
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } catch (error) {
        console.error("PWA Share Error:", error);
    }
}, []); // Empty array guarantees it runs ONLY ONCE
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

    // --- EVENTS ---
    useEffect(() => {
        fetchUserProfile();
        fetchLinks();

        let timeout1;
        let timeout2;

        const syncData = () => {

            fetchLinks();
            clearTimeout(timeout1);
            clearTimeout(timeout2);
            timeout1 = setTimeout(fetchLinks, 3000);
            timeout2 = setTimeout(fetchLinks, 7000);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') syncData();
        };
        const handleFocus = () => syncData();

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            clearTimeout(timeout1);
            clearTimeout(timeout2);
        };
    }, []);

    // --- OPTIMISTIC UI : Delete ---
    const handleDeleteLink = (deletedLinkId) => {
        setLinks(prevLinks => prevLinks.filter(link => link.link_id !== deletedLinkId));
    };

    // --- OPTIMISTIC UI : Favorite ---
    const handleToggleFavorite = (linkId, newFavoriteStatus) => {
        setLinks(prevLinks =>
            prevLinks.map(link =>
                link.link_id === linkId
                    ? { ...link, is_favorite: newFavoriteStatus }
                    : link
            )
        );
    };

    // --- STEP 1: TRIGGER PREVIEW ---
const handlePreviewLink = async (e, directUrl = null) => {
    // Prevent default only if triggered by the manual form submit button
    if (e && e.preventDefault) {
        e.preventDefault();
    }

    // Use the URL from the iOS shortcut if provided, otherwise fallback to React state
    const targetUrl = directUrl || newUrl;

    // VISUAL DEBUG: Check if the function is triggered with the correct URL
    setAddMessage({ type: 'info', text: `Début de l'analyse pour : ${targetUrl.substring(0, 30)}...` });

    if (!targetUrl || !targetUrl.trim()) return;

    if (fastSaveEnabled) {
        setIsFastSaving(true);
        // VISUAL DEBUG: Fast save route
        setAddMessage({ type: 'info', text: 'Analyse et sauvegarde rapide en cours ⚡' });
    } else {
        setIsSidebarOpen(true);
        setIsSidebarLoading(true);
        setPreviewData(null);
    }

    try {
        const token = localStorage.getItem('token');

        // Send the POST request to the analyzer
        const response = await fetch(`http://${window.location.hostname}:5000/api/links/preview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ url: targetUrl }) // MUST use targetUrl here
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
        setAddMessage({ type: 'danger', text: `Erreur de connexion : ${err.message}` });
        setIsSidebarOpen(false);
    } finally {
        if (!fastSaveEnabled) setIsSidebarLoading(false);
        setIsFastSaving(false);
    }
};

    // --- STEP 1.5: BACKGROUND FAST-SAVE ---
    const performFastSave = async (analyzedData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://${window.location.hostname}:5000/api/links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(analyzedData)
            });

            const data = await response.json();

            if (response.ok) {
                setAddMessage({ type: 'success', text: 'Lien sauvegardé avec succès ! ⚡' });
                setNewUrl('');
                fetchLinks();
            } else {
                setAddMessage({ type: 'danger', text: data.error || 'Échec de la sauvegarde.' });
            }
        } catch (err) {
            setAddMessage({ type: 'danger', text: 'Erreur lors de la sauvegarde.' });
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(finalizedData)
            });

            const data = await response.json();

            if (response.ok) {
                setAddMessage({ type: 'success', text: 'Lien sauvegardé avec succès !' });
                setNewUrl('');
                setIsSidebarOpen(false);
                fetchLinks();
            } else {
                setSidebarError(data.error || 'Échec de la sauvegarde.');
            }
        } catch (err) {
            setSidebarError('Erreur de connexion au serveur.');
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

    // --- OPTIMISTIC UI : Edit ---
    const handleSaveEdit = async (updatedData) => {
        setEditError(null);
        setLinks(prevLinks => prevLinks.map(link =>
            link.link_id === updatedData.link_id ? { ...link, ...updatedData } : link
        ));
        handleCloseEdit();

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://${window.location.hostname}:5000/api/links/${updatedData.link_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    title: updatedData.title,
                    categories: updatedData.categories,
                    tags: updatedData.tags,
                    thumbnail_url: updatedData.thumbnail_url
                })
            });

            if (!response.ok) {
                fetchLinks();
                alert("Une erreur est survenue lors de la modification en arrière-plan.");
            }
        } catch (error) {
            fetchLinks();
        }
    };

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
            {/* ADD NEW LINK SECTION */}
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
                    <button className="btn-primary" type="submit" disabled={isFastSaving}>
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

            {/* SAVED LINKS SECTION */}
            <h2 className="section-title">Mes liens sauvegardés</h2>

            {error && <div className="custom-alert custom-alert-danger">{error}</div>}

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

            {/* SIDEBARS */}
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