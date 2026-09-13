import React, { useState, useEffect } from 'react';
import './SupervisionSidebar.css'; // Import the external CSS file

const SupervisionSidebar = ({ isOpen, isLoading, previewData, error, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [tagsStr, setTagsStr] = useState('');

    useEffect(() => {
        if (previewData) {
            setTitle(previewData.title || '');
            setCategory(previewData.category || '');
            setTagsStr(previewData.tags ? previewData.tags.join(', ') : '');
        }
    }, [previewData]);

    const handleConfirm = () => {
        const tagsArray = tagsStr
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');

        const finalizedData = {
            ...previewData,
            title: title,
            category: category,
            tags: tagsArray
        };

        onSave(finalizedData);
    };

    // Determine dynamic classes based on the component's state
    const sidebarClasses = `supervision-sidebar d-flex flex-column ${
        isOpen ? 'is-open' : 'is-closed'
    } ${
        isLoading ? 'is-loading' : 'is-ready'
    }`;

    const isCategoryError = error === "Nous ne connaissons pas cette catégorie";

    return (
        <div className={sidebarClasses}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                <h5 className="m-0">Supervision IA</h5>
                <button type="button" className="btn-close" onClick={onClose} disabled={isLoading}></button>
            </div>

            <div className="p-4 flex-grow-1">
                {isLoading ? (
                    <div className="h-100 d-flex flex-column justify-content-center align-items-center text-primary">
                        <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <h5>Analyse en cours...</h5>
                        <p className="text-muted text-center mt-2">
                            Notre IA extrait les données et génère les tags. Veuillez patienter.
                        </p>
                    </div>
                ) : previewData ? (
                    <div>
                        <div className="alert alert-success py-2 mb-4">
                            <strong>Analyse terminée !</strong> Vérifiez et modifiez avant de sauvegarder.
                        </div>

                        {previewData.thumbnail_url && (
                            <div className="mb-4 text-center">
                                <img src={previewData.thumbnail_url} alt="Aperçu" className="img-fluid rounded shadow-sm" style={{ maxHeight: '180px', objectFit: 'cover' }} />
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label fw-bold">Titre</label>
                            <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        {/* --- CASE CATÉGORIE AVEC CONTOUR ROUGE ET TEXTE EN DESSOUS --- */}
                        <div className="mb-3">
                            <label className="form-label fw-bold">Catégorie</label>
                            <input
                                type="text"
                                className={`form-control ${isCategoryError ? 'is-invalid' : ''}`}
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                            {isCategoryError ? (
                                <div className="invalid-feedback">Cette catégorie n'existe pas encore. Veuillez ajouter une catégorie existante.</div>
                            ) : (
                                <div className="form-text">Assurez-vous que cela correspond à une catégorie existante.</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold">Tags</label>
                            <textarea className="form-control" rows="3" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)}></textarea>
                            <div className="form-text">Séparez les tags par des virgules (ex: recette, sport, actualité).</div>
                        </div>

                        {/* --- BOUTON DE VALIDATION SANS TEXTE EN DESSOUS --- */}
                        <button className="btn btn-success w-100 py-2 fw-bold" onClick={handleConfirm} disabled={isLoading}>
                            Confirmer & Sauvegarder le lien
                        </button>
                    </div>
                ) : (
                    <div className="text-muted text-center mt-5">En attente d'un lien...</div>
                )}
            </div>
        </div>
    );
};

export default SupervisionSidebar;