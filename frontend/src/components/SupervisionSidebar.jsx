import React, { useState, useEffect } from 'react';
import './SupervisionSidebar.css'; // Import the external CSS file

const SupervisionSidebar = ({ isOpen, isLoading, previewData, onClose, onSave }) => {
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

    return (
        <div className={sidebarClasses}>
            {/* Header */}
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                <h5 className="m-0">AI Supervision</h5>
                <button
                    type="button"
                    className="btn-close"
                    onClick={onClose}
                    aria-label="Close"
                    disabled={isLoading}
                ></button>
            </div>

            {/* Body */}
            <div className="p-4 flex-grow-1">
                {isLoading ? (
                    <div className="h-100 d-flex flex-column justify-content-center align-items-center text-primary">
                        <div className="spinner-border mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h5>Analysis in progress...</h5>
                        <p className="text-muted text-center mt-2">
                            Our AI is extracting data and generating tags. Please wait.
                        </p>
                    </div>
                ) : previewData ? (
                    <div>
                        <div className="alert alert-success py-2 mb-4">
                            <strong>Analysis complete!</strong> Review and edit before saving.
                        </div>

                        {previewData.thumbnail_url && (
                            <div className="mb-4 text-center">
                                <img
                                    src={previewData.thumbnail_url}
                                    alt="Preview thumbnail"
                                    className="img-fluid rounded shadow-sm"
                                    style={{ maxHeight: '180px', objectFit: 'cover' }}
                                />
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label fw-bold">Title</label>
                            <input
                                type="text"
                                className="form-control"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Category</label>
                            <input
                                type="text"
                                className="form-control"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            />
                            <div className="form-text">Ensure this matches an existing category.</div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold">Tags</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                value={tagsStr}
                                onChange={(e) => setTagsStr(e.target.value)}
                            ></textarea>
                            <div className="form-text">Separate tags with commas (e.g., recipe, healthy, chicken).</div>
                        </div>

                        <button className="btn btn-success w-100 py-2 fw-bold" onClick={handleConfirm}>
                            Confirm & Save Link
                        </button>
                    </div>
                ) : (
                    <div className="text-muted text-center mt-5">Waiting for a link...</div>
                )}
            </div>
        </div>
    );
};

export default SupervisionSidebar;