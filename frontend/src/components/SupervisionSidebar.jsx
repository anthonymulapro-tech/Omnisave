import React, { useState, useEffect } from 'react';
import './SupervisionSidebar.css';
import { sendLexiconSuggestions } from '../services/lexiconService';

const SupervisionSidebar = ({ isOpen, isLoading, previewData, error, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [categories, setCategories] = useState(['']);
    const [tagsStr, setTagsStr] = useState('');

    useEffect(() => {
        if (previewData) {
            setTitle(previewData.title || '');

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
            tags: tagsArray
        };

        onSave(finalizedData);
    };

    const sidebarClasses = `supervision-sidebar d-flex flex-column ${
        isOpen ? 'is-open' : 'is-closed'
    } ${
        isLoading ? 'is-loading' : 'is-ready'
    }`;

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

                        <div className="mb-3">
                            <label className="form-label fw-bold">Catégories (Max 5)</label>

                            {categories.map((cat, index) => (
                                <div key={index} className="d-flex mb-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={cat}
                                        onChange={(e) => handleCategoryChange(index, e.target.value)}
                                        placeholder={index === 0 ? "Catégorie principale" : `Catégorie ${index + 1}`}
                                    />
                                    {categories.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger ms-2"
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
                                    className="btn btn-sm btn-outline-secondary mt-1"
                                    onClick={addCategory}
                                >
                                    + Ajouter une catégorie
                                </button>
                            )}

                            {/* TEXTE DE REMPLACEMENT PLUS PERTINENT */}
                            <div className="form-text mt-1">Vous pouvez ajouter des catégories existantes ou en créer de nouvelles.</div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold">Tags</label>
                            <textarea className="form-control" rows="3" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)}></textarea>
                            <div className="form-text">Séparez les tags par des virgules (ex: recette, sport, actualité).</div>
                        </div>

                        {/* Affichage d'une erreur serveur générale s'il y en a une */}
                        {error && <div className="alert alert-danger py-2">{error}</div>}

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