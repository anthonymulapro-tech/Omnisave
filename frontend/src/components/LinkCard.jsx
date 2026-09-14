import React, { useState } from 'react';
import { CATEGORY_TRANSLATIONS } from '../constants/translations';

const LinkCard = ({ link,onDelete, onEdit, onToggleFavorite }) => {
    const [imageError, setImageError] = useState(false);

    const [isFavorite, setIsFavorite] = useState(link.is_favorite || false);

    const displayCategory = CATEGORY_TRANSLATIONS[link.category_name] || link.category_name || "Autre";

    const formattedDate = new Date(link.saved_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    // Favorite
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

    const handleDelete = async () => {
        // Native browser confirmation
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
                // If successful, tell the parent component to remove it from the UI
                if (onDelete) onDelete(link.link_id);
            } else {
                alert("Le lien n'a pas pu être supprimé. Merci d'essayer à nouveau.");
            }
        } catch (error) {
            console.error("Error deleting link:", error);
            alert("Une erreur s'est produite lors de la suppression du lien.");
        }
    };

    return (
        <div className="card mb-3 shadow-sm border-0 overflow-hidden position-relative">
            {/* Favorite button */}
            <button
                onClick={handleToggleFavorite}
                className="btn position-absolute top-0 start-0 m-2 bg-light p-2 shadow-sm rounded-circle d-flex align-items-center justify-content-center"
                aria-label="Toggle favorite"
                style={{ zIndex: 10, cursor: 'pointer', width: '36px', height: '36px', border: 'none' }}
                title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
                {isFavorite ? '❤️' : '🤍'}
            </button>

            <button
                onClick={handleDelete}
                className="btn-close position-absolute top-0 end-0 m-2 bg-light p-2 shadow-sm rounded-circle"
                aria-label="Delete link"
                style={{ zIndex: 10, cursor: 'pointer' }}
                title="Delete this link"
            ></button>

            {link.thumbnail_url && !imageError ? (
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <img
                        src={link.thumbnail_url}
                        alt={link.title}
                        className="card-img-top"
                        referrerPolicy="no-referrer"
                        onError={() => setImageError(true)}
                        style={{ height: '220px', objectFit: 'cover' }}
                    />
                </a>
            ) : (
                <div
                    className="card-img-top bg-light d-flex align-items-center justify-content-center"
                    style={{ height: '220px' }}
                >
                    <span className="text-muted fw-bold">
                        📷 Image indisponible
                    </span>
                </div>
            )}

            <div className="card-body">
                {/* Header: Platform and Category translation */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted small fw-bold text-uppercase">
                        {link.platform}
                    </span>
                    <span className="badge bg-secondary">
                        {displayCategory}
                    </span>
                </div>

                {/* Title and clickable URL */}
                <h5 className="card-title mb-2">
                    <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none text-dark fw-semibold"
                    >
                        {link.title}
                    </a>
                </h5>

                {/* Tags Section: Maps through the array returned by the API */}
                {link.tags && link.tags.length > 0 && (
                    <div className="mt-3">
                        {link.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="badge rounded-pill bg-primary me-2 mb-1"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer: Date and Actions */}
            <div className="card-footer bg-white text-muted small d-flex justify-content-between align-items-center border-top-0 py-3">
                <span>Ajouté le {formattedDate}</span>
                <button
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
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