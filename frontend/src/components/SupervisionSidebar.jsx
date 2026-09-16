import React, { useState, useEffect } from 'react';
import './SupervisionSidebar.css';
import { sendLexiconSuggestions } from '../services/lexiconService';

const SupervisionSidebar = ({ isOpen, isLoading, previewData, error, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [categories, setCategories] = useState(['']);
    const [tagsStr, setTagsStr] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');

    useEffect(() => {
        if (previewData) {
            setTitle(previewData.title || '');
            setThumbnailUrl(previewData.thumbnail_url || '');

            if (previewData.categories && previewData.categories.length > 0) {
                setCategories(previewData.categories);
            } else if (previewData.category) {
                setCategories([previewData.category]);
            } else {
                setCategories(['']);
            }

            setTagsStr(previewData.tags ? previewData.tags.join(', ') : '');
        }
    }, [previewData]);

    const handleCategoryChange = (index, value) => {
        const newCategories = [...categories];
        newCategories[index] = value;
        setCategories(newCategories);
    };

    const addCategory = () => {
        if (categories.length < 5) {
            setCategories([...categories, '']);
        }
    };

    const removeCategory = (index) => {
        const newCategories = categories.filter((_, i) => i !== index);
        setCategories(newCategories.length > 0 ? newCategories : ['']);
    };

    const handleConfirm = () => {
        const tagsArray = tagsStr
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');

        const validCategories = categories
            .map(cat => cat.trim())
            .filter(cat => cat !== '');

        const primaryCategory = validCategories.length > 0 ? validCategories[0] : '';
        if (primaryCategory) {
            sendLexiconSuggestions(primaryCategory, tagsArray);
        }

        const finalizedData = {
            ...previewData,
            title: title,
            categories: validCategories,
            tags: tagsArray,
            thumbnail_url: thumbnailUrl
        };

        onSave(finalizedData);
    };

    const sidebarClasses = `supervision-sidebar d-flex flex-column ${
        isOpen ? 'is-open' : 'is-closed'
    } ${
        isLoading ? 'is-loading' : 'is-ready'
    }`;

    return (
        <>
            {/* 1. OVERLAY (NON-CLICKABLE DARK BACKDROP) */}
            {sidebarClasses.includes('is-open') && (
                <div
                    // Replaced inline styles with 'sidebar-overlay' and dynamic cursor classes
                    className={`position-fixed top-0 start-0 w-100 h-100 bg-dark sidebar-overlay ${isLoading ? 'cursor-wait' : 'cursor-default'}`}
                    title={isLoading ? "Veuillez patienter..." : ""}
                ></div>
            )}

            {/* 2. THE SIDEBAR */}
            <div
                className={`${sidebarClasses} shadow-lg d-flex flex-column`}
            >
                {/* --- HEADER --- */}
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <h5 className="m-0 fw-bold">Supervision IA</h5>
                    <button type="button" className="btn-close p-3" onClick={onClose} disabled={isLoading} aria-label="Fermer"></button>
                </div>

                {/* --- BODY --- */}
                <div className="p-4 flex-grow-1 overflow-auto bg-white">
                    {isLoading ? (
                        <div className="h-100 d-flex flex-column justify-content-center align-items-center text-primary">
                            {/* Replaced inline style with 'loading-spinner' class */}
                            <div className="spinner-border mb-3 loading-spinner" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                            <h5 className="fw-bold">Analyse en cours...</h5>
                            <p className="text-muted text-center mt-2 px-2">
                                Notre IA extrait les données et génère les tags. Veuillez patienter.
                            </p>
                        </div>
                    ) : previewData ? (
                        <div>
                            <div className="alert alert-success py-2 mb-4">
                                <strong>Analyse terminée !</strong> Vérifiez et modifiez avant de sauvegarder.
                            </div>

                            {/* THUMBNAIL PREVIEW */}
                            {thumbnailUrl && (
                                <div className="mb-4 text-center">
                                    {/* Replaced inline style with 'thumbnail-preview' class */}
                                    <img
                                        src={thumbnailUrl}
                                        alt="Aperçu"
                                        className="img-fluid rounded shadow-sm w-100 thumbnail-preview"
                                        onError={(e) => {
                                            if (!e.target.src.includes('placehold.co')) {
                                                e.target.src = 'https://placehold.co/300x180/eeeeee/999999?text=Image+Invalide';
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            {/* IMAGE URL FIELD */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">URL de l'image (Miniature)</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    value={thumbnailUrl}
                                    onChange={(e) => setThumbnailUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                                <div className="form-text mt-1">Collez une URL d'image ou laissez vide.</div>
                            </div>

                            {/* TITLE FIELD */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">Titre</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* CATEGORIES FIELD */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">Catégories (Max 5)</label>

                                {categories.map((cat, index) => (
                                    <div key={index} className="d-flex mb-2">
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            value={cat}
                                            onChange={(e) => handleCategoryChange(index, e.target.value)}
                                            placeholder={index === 0 ? "Catégorie principale" : `Catégorie ${index + 1}`}
                                        />
                                        {categories.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger ms-2 px-3 fw-bold"
                                                onClick={() => removeCategory(index)}
                                                title="Supprimer cette catégorie"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {categories.length < 5 && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary w-100 py-2 mt-2 fw-semibold"
                                        onClick={addCategory}
                                    >
                                        + Ajouter une catégorie
                                    </button>
                                )}

                                <div className="form-text mt-2">Ajoutez des catégories existantes ou créez-en.</div>
                            </div>

                            {/* TAGS FIELD */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">Tags</label>
                                <textarea
                                    className="form-control form-control-lg"
                                    rows="3"
                                    value={tagsStr}
                                    onChange={(e) => setTagsStr(e.target.value)}
                                ></textarea>
                                <div className="form-text">Séparez les tags par des virgules (ex: recette, sport).</div>
                            </div>

                            {error && <div className="alert alert-danger py-2">{error}</div>}

                            {/* CONFIRM BUTTON */}
                            <button
                                className="btn btn-success btn-lg w-100 py-3 mt-3 fw-bold shadow-sm"
                                onClick={handleConfirm}
                                disabled={isLoading}
                            >
                                Confirmer & Sauvegarder
                            </button>

                            {/* CANCEL BUTTON */}
                            <button
                                className="btn btn-outline-danger btn-lg w-100 py-3 mt-2 fw-bold"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Annuler
                            </button>
                        </div>
                    ) : (
                        <div className="text-muted text-center mt-5">En attente d'un lien...</div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SupervisionSidebar;