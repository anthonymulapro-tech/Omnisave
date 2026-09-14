import React, { useState, useEffect } from 'react';
import './EditSidebar.css';
import { sendLexiconSuggestions } from '../services/lexiconService';

const EditSidebar = ({ isOpen, linkData, error, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [tagsStr, setTagsStr] = useState('');

    // State to keep track of the original tags when the sidebar opened
    const [originalTags, setOriginalTags] = useState([]);

    // Pre-fill the form when a link is passed to the sidebar
    useEffect(() => {
        if (linkData) {
            setTitle(linkData.title || '');
            setCategory(linkData.category_name || '');

            const initialTags = linkData.tags ? linkData.tags : [];
            setTagsStr(initialTags.join(', '));

            // Store original tags for delta comparison later
            setOriginalTags(initialTags);
        }
    }, [linkData]);

    const handleConfirm = () => {
        // 1. Convert the comma-separated string back into a clean array
        const tagsArray = tagsStr
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');

        // 2. SILENT CROWDSOURCING (EDIT MODE) 🚀
        // Pass category, current tags, isEdit = true, and original tags for delta filtering
        sendLexiconSuggestions(category, tagsArray, true, originalTags);

        // 3. Prepare the payload for the PUT request
        const updatedData = {
            ...linkData,
            title: title,
            category: category,
            tags: tagsArray
        };

        // 4. Proceed with normal saving/updating
        onSave(updatedData);
    };

    const isCategoryError = error === "Nous ne connaissons pas cette catégorie";

    return (
        <div className={`edit-sidebar d-flex flex-column ${isOpen ? 'is-open' : 'is-closed'}`}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                <h5 className="m-0">Modifier le lien</h5>
                <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="p-4 flex-grow-1">
                {linkData ? (
                    <div>
                        {linkData.thumbnail_url && (
                            <div className="mb-4 text-center">
                                <img
                                    src={linkData.thumbnail_url}
                                    alt="Preview"
                                    className="img-fluid rounded shadow-sm"
                                    style={{ maxHeight: '180px', objectFit: 'cover' }}
                                />
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label fw-bold">Titre</label>
                            <input
                                type="text"
                                className="form-control"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

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
                            <textarea
                                className="form-control"
                                rows="3"
                                value={tagsStr}
                                onChange={(e) => setTagsStr(e.target.value)}
                            ></textarea>
                            <div className="form-text">Séparez les tags par des virgules (ex: recette, sport, actualité).</div>
                        </div>

                        <button className="btn btn-primary w-100 py-2 fw-bold" onClick={handleConfirm}>
                            Mettre à jour le lien
                        </button>
                    </div>
                ) : (
                    <div className="text-muted text-center mt-5">Aucun lien sélectionné.</div>
                )}
            </div>
        </div>
    );
};

export default EditSidebar;