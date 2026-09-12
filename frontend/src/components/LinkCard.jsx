import React, { useState } from 'react';
import { CATEGORY_TRANSLATIONS } from '../constants/translations';

const LinkCard = ({ link,onDelete }) => {
    const [imageError, setImageError] = useState(false);

    const displayCategory = CATEGORY_TRANSLATIONS[link.category_name] || link.category_name || "Autre";

    const formattedDate = new Date(link.saved_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    const handleDelete = async () => {
        // Native browser confirmation
        const isConfirmed = window.confirm("Are you sure you want to delete this link?");
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
                alert("Failed to delete the link. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting link:", error);
            alert("An error occurred while deleting the link.");
        }
    };

    return (
        <div className="card mb-3 shadow-sm border-0 overflow-hidden position-relative">

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

            {/* Footer: Date and Analysis Status */}
            <div className="card-footer bg-white text-muted small d-flex justify-content-between border-top-0">
                <span>Ajouté le {formattedDate}</span>
                <span>
                    {link.analysis_status === 'COMPLETED' ? '✅ Analysé' : '⏳ En cours'}
                </span>
            </div>
        </div>
    );
};

export default LinkCard;