import React from 'react';
import { CATEGORY_TRANSLATIONS } from '../constants/translations';

const LinkCard = ({ link }) => {
    // Determine the category to display, fallback to the original name or "Autre"
    const displayCategory = CATEGORY_TRANSLATIONS[link.category_name] || link.category_name || "Autre";

    // Format the date to French locale standards
    const formattedDate = new Date(link.saved_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    return (
        <div className="card mb-3 shadow-sm border-0">
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