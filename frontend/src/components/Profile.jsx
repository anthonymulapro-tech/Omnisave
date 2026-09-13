import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css'; // <-- CSS imported here!

const Profile = () => {
    const navigate = useNavigate();

    // State to hold form data
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        pseudo: '',
        country: '',
        fast_save: false
    });

    // State for UI feedback (success/error messages)
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(''); // 'success' or 'danger'

    // Fetch user profile on component mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                // Pre-fill the form, falling back to empty strings if null
                setFormData({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    pseudo: data.pseudo || '',
                    country: data.country || '',
                    fast_save: data.fast_save || false
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Handle profile update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessageType('success');
                setMessage('Profile successfully updated!');
            } else {
                setMessageType('danger');
                setMessage(data.error || 'An error occurred while updating.');
            }
        } catch (error) {
            setMessageType('danger');
            setMessage('Server connection error.');
        }
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
        // Native browser confirmation popup
        const isConfirmed = window.confirm(
            "Are you sure you want to delete your account? This action is irreversible and will delete all your saved links."
        );

        if (!isConfirmed) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Clear local storage and redirect to login
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setMessageType('danger');
                setMessage('Failed to delete account.');
            }
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };

    return (
        <div className="container mt-5 profile-container">
            <div className="card shadow-sm">
                <div className="card-header bg-white pb-0 border-bottom-0 pt-4 px-4">
                    <h3 className="mb-0">Mon Profil</h3>
                </div>

                <div className="card-body p-4">
                    {message && (
                        <div className={`alert alert-${messageType}`} role="alert">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Prénom</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nom</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Pseudo</label>
                            <input
                                type="text"
                                className="form-control"
                                name="pseudo"
                                value={formData.pseudo}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold">Pays</label>
                            <input
                                type="text"
                                className="form-control"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-4 fast-save-box">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id="fastSaveSwitch"
                                    name="fast_save"
                                    checked={formData.fast_save}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label fw-bold" htmlFor="fastSaveSwitch">
                                    Activer le Fast-Save
                                </label>
                            </div>
                            <small className="text-muted d-block mt-1">
                                Si activé, les liens seront sauvegardés automatiquement sans passer par le tiroir de validation.
                            </small>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 fw-bold mb-4">
                            Sauvegarder les modifications
                        </button>

                        <hr />

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                className="btn btn-sm btn-delete-account"
                                onClick={handleDeleteAccount}
                            >
                                Supprimer mon compte définitivement
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;