import React, { useState, useEffect } from 'react';
import LinksDashboard from './LinksDashboard';

const Dashboard = () => {
    // --- States for displaying links ---
    const [links, setLinks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- States for adding a new link ---
    const [newUrl, setNewUrl] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [addMessage, setAddMessage] = useState(null);

    // 1. Extract fetch logic into a reusable function
    const fetchLinks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/links', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch links');
            }

            const data = await response.json();
            setLinks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Trigger fetch on component mount
    useEffect(() => {
        fetchLinks();
    }, []);

    // 2. Handle the deletion (Prop drilling target)
    const handleDeleteLink = (deletedLinkId) => {
        setLinks(prevLinks => prevLinks.filter(link => link.link_id !== deletedLinkId));
    };

    // 3. Handle the submission of a new link
    const handleAddLink = async (e) => {
        e.preventDefault();
        if (!newUrl.trim()) return;

        setIsAdding(true);
        setAddMessage(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url: newUrl })
            });

            const data = await response.json();

            if (response.ok) {
                setAddMessage({ type: 'success', text: 'Link successfully analyzed and saved!' });
                setNewUrl(''); // Clear the input field
                fetchLinks(); // Refresh the grid to show the new card
            } else {
                setAddMessage({ type: 'danger', text: data.error || 'Failed to analyze link.' });
            }
        } catch (err) {
            setAddMessage({ type: 'danger', text: 'Server connection error.' });
        } finally {
            setIsAdding(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">

            {/* --- ADD NEW LINK SECTION --- */}
            <div className="card shadow-sm mb-5 border-0">
                <div className="card-body p-4 bg-light rounded">
                    <h4 className="mb-3">Save a new link</h4>
                    <form onSubmit={handleAddLink}>
                        <div className="input-group input-group-lg">
                            <input
                                type="url"
                                className="form-control"
                                placeholder="Paste your Instagram, TikTok, or X link here..."
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                disabled={isAdding}
                                required
                            />
                            <button
                                className="btn btn-primary px-4"
                                type="submit"
                                disabled={isAdding}
                            >
                                {isAdding ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Analyzing...
                                    </>
                                ) : (
                                    'Analyze & Save'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Feedback messages for the add action */}
                    {addMessage && (
                        <div className={`alert alert-${addMessage.type} mt-3 mb-0`} role="alert">
                            {addMessage.text}
                        </div>
                    )}
                </div>
            </div>

            {/* --- SAVED LINKS SECTION --- */}
            <h2 className="mb-4">My Saved Links</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            {links.length === 0 && !error ? (
                <div className="alert alert-info text-center">
                    You haven't saved any links yet. Paste a URL above to get started!
                </div>
            ) : (
                <LinksDashboard initialLinks={links} onDelete={handleDeleteLink} />
            )}
        </div>
    );
};

export default Dashboard;