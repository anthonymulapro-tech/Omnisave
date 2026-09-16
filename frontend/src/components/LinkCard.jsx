import React, { useState, useEffect } from 'react';
import { CATEGORY_TRANSLATIONS } from '../constants/translations';
import './LinkCard.css'; // Importing our new specific styles

const LinkCard = ({ link, onDelete, onEdit, onToggleFavorite }) => {
    const [imageError, setImageError] = useState(false);
    const [isFavorite, setIsFavorite] = useState(link.is_favorite || false);

    useEffect(() => {
        setImageError(false);
    }, [link.thumbnail_url]);

    // Format the date for display
    const formattedDate = new Date(link.saved_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    // Handle favorite toggle API call
    const handleToggleFavorite = async () => {
        const newStatus = !isFavorite;
        setIsFavorite(newStatus);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:5000/api/links/${link.link_id}/favorite`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_favorite: newStatus })
            });

            if (response.ok) {
                if (onToggleFavorite) onToggleFavorite(link.link_id, newStatus);
            } else {
                setIsFavorite(!newStatus);
                alert("Erreur lors de la mise à jour du favori.");
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            setIsFavorite(!newStatus);
            alert("Une erreur est survenue.");
        }
    };

    // Handle link deletion API call
    const handleDelete = async () => {
        const isConfirmed = window.confirm('Êtes-vous sûr de vouloir supprimer ce lien ?');
        if (!isConfirmed) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:5000/api/links/${link.link_id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                if (onDelete) onDelete(link.link_id);
            } else {
                alert("Le lien n'a pas pu être supprimé. Merci d'essayer à nouveau.");
            }
        } catch (error) {
            console.error("Error deleting link:", error);
            alert("Une erreur s'est produite lors de la suppression du lien.");
        }
    };

    // Determine the categories to display (fallback to 'Autres' if empty)
    const displayCategories = link.categories && link.categories.length > 0
        ? link.categories
        : ["Autres"];

    return (
        /* We use 'surface-card' from App.css for the base styling and 'link-card' for specifics */
        <div className="surface-card link-card">

            {/* THUMBNAIL & FLOATING ACTIONS */}
            <div className="link-card-image-wrapper">

                {/* FAVORITE BUTTON */}
                <button
                    onClick={handleToggleFavorite}
                    className="card-action-btn btn-favorite"
                    aria-label="Toggle favorite"
                    title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                    {isFavorite ? '❤️' : '🤍'}
                </button>

                {/* DELETE BUTTON */}
                <button
                    onClick={handleDelete}
                    className="card-action-btn btn-delete"
                    aria-label="Delete link"
                    title="Supprimer ce lien"
                >
                    🗑️
                </button>

                {/* IMAGE */}
                {link.thumbnail_url && !imageError ? (
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <img
                            src={link.thumbnail_url}
                            alt={link.title}
                            className="link-card-img"
                            referrerPolicy="no-referrer"
                            onError={() => setImageError(true)}
                        />
                    </a>
                ) : (
                    <div className="link-card-no-image">
                        <span>📷 Image indisponible</span>
                    </div>
                )}
            </div>

            {/* CARD BODY */}
            <div className="link-card-body">

                {/* HEADER: Platform and Categories */}
                <div className="link-card-header">
                    <span className="link-platform">
                        {link.platform}
                    </span>
                    <div className="badge-group">
                        {displayCategories.map((cat, index) => (
                            <span key={index} className="badge-category">
                                {CATEGORY_TRANSLATIONS[cat] || cat}
                            </span>
                        ))}
                    </div>
                </div>

                {/* TITLE */}
                <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-title"
                >
                    {link.title}
                </a>

                {/* TAGS SECTION */}
                {link.tags && link.tags.length > 0 && (
                    <div className="badge-group mt-auto">
                        {link.tags.map((tag, index) => (
                            <span key={index} className="badge-tag">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div className="link-card-footer">
                <span>Ajouté le {formattedDate}</span>
                <button
                    className="btn-edit"
                    onClick={() => onEdit(link)}
                    title="Modifier les éléments"
                >
                    ✏️ Modifier
                </button>
            </div>
        </div>
    );
};

export default LinkCard;