import React, { useState, useEffect } from 'react';
import './EditSidebar.css';
import { sendLexiconSuggestions } from '../services/lexiconService';

const EditSidebar = ({ isOpen, linkData, error, onClose, onSave }) => {
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
        const currentPrimaryCategory = validCategories.length > 0 ? validCategories[0] : '';
        const hasPrimaryCategoryChanged = currentPrimaryCategory !== originalPrimaryCategory;
        const tagsToCompare = hasPrimaryCategoryChanged ? [] : originalTags;

        if (currentPrimaryCategory) {
            sendLexiconSuggestions(currentPrimaryCategory, tagsArray, true, tagsToCompare);
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
            {/* OVERLAY*/}
            {isOpen && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
                    style={{
                        zIndex: 1040, // Juste en dessous de la sidebar
                        opacity: 0.5, // Semi-transparent
                        cursor: 'pointer' // Le curseur montre que c'est cliquable
                    }}
                    onClick={onClose}
                    title="Cliquer pour fermer"
                ></div>
            )}

            {/* SIDEBAR */}
            <div
                className={`edit-sidebar d-flex flex-column shadow-lg ${isOpen ? 'is-open' : 'is-closed'}`}
                style={{
                    width: '90vw',
                    maxWidth: '400px',
                    zIndex: 1050
                }}
            >
                {/* HEADER */}
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                    <h5 className="m-0 fw-bold">Modifier le lien</h5>
                    <button type="button" className="btn-close p-3" onClick={onClose} aria-label="Fermer"></button>
                </div>

                {/* BODY */}
                <div className="p-4 flex-grow-1 overflow-auto">
                    {linkData ? (
                        <div>
                            {/* THUMBNAIL PREVIEW */}
                            {thumbnailUrl && (
                                <div className="mb-4 text-center">
                                    <img
                                        src={thumbnailUrl}
                                        alt="Preview"
                                        className="img-fluid rounded shadow-sm w-100"
                                        style={{ height: '180px', objectFit: 'cover' }}
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x180?text=Image+Invalide' }}
                                    />
                                </div>
                            )}

                            {/* IMAGE URL INPUT */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">URL de l'image</label>
                                {/* form-control-lg pour une meilleure saisie tactile */}
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    value={thumbnailUrl}
                                    onChange={(e) => setThumbnailUrl(e.target.value)}
                                />
                                <div className="form-text mt-1">Modifiez l'image en collant un nouveau lien.</div>
                            </div>

                            {/* TITLE INPUT */}
                            <div className="mb-4">
                                <label className="form-label fw-bold">Titre</label>
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* DYNAMIC CATEGORIES SECTION */}
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

                            {/* TAGS INPUT */}
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

                            {/* ERROR ALERT */}
                            {error && <div className="alert alert-danger py-2">{error}</div>}

                            {/* SUBMIT BUTTON */}
                            <button className="btn btn-primary btn-lg w-100 py-3 mt-3 fw-bold shadow-sm" onClick={handleConfirm}>
                                Mettre à jour le lien
                            </button>
                        </div>
                    ) : (
                        <div className="text-muted text-center mt-5">Aucun lien sélectionné.</div>
                    )}
                </div>
            </div>
        </>
    );
};

export default EditSidebar;