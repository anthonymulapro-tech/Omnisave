import React, { useState, useEffect } from 'react';
import './EditSidebar.css';
import { sendLexiconSuggestions } from '../services/lexiconService';

const EditSidebar = ({ isOpen, linkData, error, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState('');
    // Replaced single string category with an array to support up to 5 categories
    const [categories, setCategories] = useState(['']);
    const [tagsStr, setTagsStr] = useState('');

    const [originalTags, setOriginalTags] = useState([]);
    // Keeping track of original primary category for lexicon delta tracking
    const [originalPrimaryCategory, setOriginalPrimaryCategory] = useState('');

    const [thumbnailUrl, setThumbnailUrl] = useState('');

    // Pre-fill the form when linkData is loaded
    useEffect(() => {
        if (linkData) {
            setTitle(linkData.title || '');
            setThumbnailUrl(linkData.thumbnail_url || '');

            // Populate the categories array dynamically
            if (linkData.categories && linkData.categories.length > 0) {
                setCategories(linkData.categories);
                setOriginalPrimaryCategory(linkData.categories[0]);
            } else {
                setCategories(['']);
                setOriginalPrimaryCategory('');
            }

            const initialTags = linkData.tags ? linkData.tags : [];
            setTagsStr(initialTags.join(', '));
            setOriginalTags(initialTags);
        }
    }, [linkData]);

    // --- DELETE ---
    const handleDeleteClick = async () => {
        const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ce lien définitivement ?");
        if (!isConfirmed) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://${window.location.hostname}:5000/api/links/${linkData.link_id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Si la suppression marche, on met à jour l'affichage et on ferme le menu
                onDelete(linkData.link_id);
                onClose();
            } else {
                alert("Erreur lors de la suppression du lien.");
            }
        } catch (err) {
            alert("Erreur de connexion au serveur.");
        }
    };

    // --- CATEGORY MANAGEMENT FUNCTIONS ---
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
    // -------------------------------------

    const handleConfirm = () => {
        // 1. Format tags into a clean array
        const tagsArray = tagsStr
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');

        // 2. Format categories into a clean array, removing empty fields
        const validCategories = categories
            .map(cat => cat.trim())
            .filter(cat => cat !== '');

        // 3. SILENT CROWDSOURCING (EDIT MODE)
        const originalCategories = linkData.categories || [];
        const hasCategoriesChanged = JSON.stringify(validCategories) !== JSON.stringify(originalCategories);
        const tagsToCompare = hasCategoriesChanged ? [] : originalTags;

        if (validCategories.length > 0) {
            sendLexiconSuggestions(validCategories, tagsArray, true, tagsToCompare);
        }

        // 4. Prepare updated data payload
        const updatedData = {
            ...linkData,
            title: title,
            categories: validCategories,
            tags: tagsArray,
            thumbnail_url: thumbnailUrl
        };

        // 5. Fire save event
        onSave(updatedData);
    };



    return (
        <>
            {/* OVERLAY */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                    title="Cliquer pour fermer"
                ></div>
            )}

            {/* SIDEBAR */}
            <div className={`edit-sidebar ${isOpen ? 'is-open' : 'is-closed'}`}>

                {/* --- HEADER --- */}
                <div className="sidebar-header">
                    <h5 className="brand-gradient-text">Modifier le lien</h5>
                    <button type="button" className="btn-close-custom" onClick={onClose} aria-label="Fermer">
                        ✕
                    </button>
                </div>

                {/* --- BODY --- */}
                <div className="sidebar-body">
                    {linkData ? (
                        <div>
                            {/* THUMBNAIL PREVIEW */}
                            {thumbnailUrl && (
                                <div className="mb-4 text-center">
                                    <img
                                        src={thumbnailUrl}
                                        alt="Aperçu"
                                        className="thumbnail-preview"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x180/1e293b/94a3b8?text=Image+Invalide' }}
                                    />
                                </div>
                            )}

                            {/* IMAGE URL INPUT */}
                            <div className="mb-4">
                                <label className="custom-label">URL de l'image</label>
                                <input
                                    type="text"
                                    className="styled-input w-100"
                                    value={thumbnailUrl}
                                    onChange={(e) => setThumbnailUrl(e.target.value)}
                                />
                                <div className="help-text">Modifiez l'image en collant un nouveau lien.</div>
                            </div>

                            {/* TITLE INPUT */}
                            <div className="mb-4">
                                <label className="custom-label">Titre</label>
                                <input
                                    type="text"
                                    className="styled-input w-100"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* CATEGORIES SECTION */}
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
                                <div className="help-text">Ajoutez des catégories existantes ou créez-en de nouvelles.</div>
                            </div>

                            {/* TAGS INPUT */}
                            <div className="mb-4">
                                <label className="custom-label">Tags</label>
                                <textarea
                                    className="styled-input w-100"
                                    rows="3"
                                    value={tagsStr}
                                    onChange={(e) => setTagsStr(e.target.value)}
                                    placeholder="ex: recette, sport, tech..."
                                ></textarea>
                                <div className="help-text">Séparez les tags par des virgules.</div>
                            </div>

                            {error && (
                                <div className="custom-alert custom-alert-danger mb-4 text-center justify-content-center">
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* ACTION BUTTONS */}
                            <button className="btn-primary w-100 mb-3" onClick={handleConfirm}>
                                Mettre à jour le lien
                            </button>

                            <button
                                className="btn-outline-danger w-100"
                                onClick={onClose}
                            >
                                Annuler
                            </button>

                            <hr className="sidebar-divider" />

                            <div className="delete-link-wrapper mt-2 mb-2">
                                <button
                                    type="button"
                                    className="btn-delete-link"
                                    onClick={handleDeleteClick}
                                >
                                    Supprimer ce lien définitivement
                                </button>
                            </div>

                        </div>
                    ) : (
                        <div className="text-center mt-5" style={{ color: '#94a3b8' }}>
                            Aucun lien sélectionné.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default EditSidebar;