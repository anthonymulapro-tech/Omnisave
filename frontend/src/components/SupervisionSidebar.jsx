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

    const sidebarClasses = `supervision-sidebar ${
        isOpen ? 'is-open' : 'is-closed'
    } ${
        isLoading ? 'is-loading' : 'is-ready'
    }`;

    return (
        /* RETRAIT DE L'OVERLAY ICI POUR NE PLUS BLOQUER LA PAGE */
        <div className={sidebarClasses}>

            {/* --- HEADER --- */}
            <div className="sidebar-header">
                <h5 className="brand-gradient-text">Supervision IA</h5>
                <button
                    type="button"
                    className="btn-close-custom"
                    onClick={onClose}
                    aria-label="Fermer"
                >
                    ✕
                </button>
            </div>

            {/* --- BODY --- */}
            <div className="sidebar-body">
                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner" role="status"></div>
                        <h5 className="fw-bold mt-2" style={{ color: '#f8fafc' }}>Analyse en cours...</h5>
                        <p className="text-center mt-2 px-2" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            Notre IA extrait les données et génère les tags. Veuillez patienter.
                        </p>
                    </div>
                ) : previewData ? (
                    <div>
                        <div className="custom-alert custom-alert-success mb-4 text-center justify-content-center">
                            <strong>Analyse terminée !</strong> Vérifiez avant de sauvegarder.
                        </div>

                        {/* THUMBNAIL PREVIEW */}
                        {thumbnailUrl && (
                            <div className="mb-4 text-center">
                                <img
                                    src={thumbnailUrl}
                                    alt="Aperçu"
                                    className="thumbnail-preview"
                                    onError={(e) => {
                                        if (!e.target.src.includes('placehold.co')) {
                                            e.target.src = 'https://placehold.co/300x180/1e293b/94a3b8?text=Image+Invalide';
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {/* IMAGE URL FIELD */}
                        <div className="mb-4">
                            <label className="custom-label">URL de l'image (Miniature)</label>
                            <input
                                type="text"
                                className="styled-input w-100"
                                value={thumbnailUrl}
                                onChange={(e) => setThumbnailUrl(e.target.value)}
                                placeholder="https://..."
                            />
                            <div className="help-text">Collez une URL d'image ou laissez vide.</div>
                        </div>

                        {/* TITLE FIELD */}
                        <div className="mb-4">
                            <label className="custom-label">Titre</label>
                            <input
                                type="text"
                                className="styled-input w-100"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* CATEGORIES FIELD */}
                        <div className="mb-4">
                            <label className="custom-label">Catégories (Max 5)</label>

                            {categories.map((cat, index) => (
                                <div key={index} className="category-row">
                                    <input
                                        type="text"
                                        className="styled-input w-100"
                                        value={cat}
                                        onChange={(e) => handleCategoryChange(index, e.target.value)}
                                        placeholder={index === 0 ? "Catégorie principale" : `Catégorie ${index + 1}`}
                                    />
                                    {categories.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn-remove-category"
                                            onClick={() => removeCategory(index)}
                                            title="Supprimer cette catégorie"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}

                            {categories.length < 5 && (
                                <button
                                    type="button"
                                    className="btn-add-category"
                                    onClick={addCategory}
                                >
                                    + Ajouter une catégorie
                                </button>
                            )}

                            <div className="help-text">Ajoutez des catégories existantes ou créez-en.</div>
                        </div>

                        {/* TAGS FIELD */}
                        <div className="mb-4">
                            <label className="custom-label">Tags</label>
                            <textarea
                                className="styled-input w-100"
                                rows="3"
                                value={tagsStr}
                                onChange={(e) => setTagsStr(e.target.value)}
                                placeholder="ex: tech, actualité..."
                            ></textarea>
                            <div className="help-text">Séparez les tags par des virgules.</div>
                        </div>

                        {error && (
                            <div className="custom-alert custom-alert-danger mb-4 text-center justify-content-center">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* CONFIRM BUTTON */}
                        <button
                            className="btn-primary w-100 mb-3"
                            onClick={handleConfirm}
                            disabled={isLoading}
                        >
                            Confirmer & Sauvegarder
                        </button>

                        {/* CANCEL BUTTON */}
                        <button
                            className="btn-outline-danger w-100"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Annuler
                        </button>
                    </div>
                ) : (
                    <div className="text-center mt-5" style={{ color: '#94a3b8' }}>
                        En attente d'un lien...
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupervisionSidebar;