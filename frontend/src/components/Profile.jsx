import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();

    // --- STATE: PROFILE INFO ---
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        pseudo: '',
        country: '',
        fast_save: false
    });
    const [profileMessage, setProfileMessage] = useState(null);
    const [profileMessageType, setProfileMessageType] = useState('');

    // Stores specific errors for fields (to display red borders)
    const [fieldErrors, setFieldErrors] = useState({});

    // --- STATE: PASSWORD UPDATE ---
    const [pwdData, setPwdData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [pwdMessage, setPwdMessage] = useState(null);
    const [pwdMessageType, setPwdMessageType] = useState('');

    // Toggles for password visibility
    const [showOldPwd, setShowOldPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);

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
                setFormData({
                    email: data.email || '',
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

    // --- HANDLERS: PROFILE FORM ---
    const handleProfileChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Remove the red border as soon as the user starts typing again
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: null });
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileMessage(null);
        setFieldErrors({}); // Reset previous errors

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
                setProfileMessageType('success');
                setProfileMessage('Profile mis à jour !');
            } else {
                // Analyze the error string to map it to specific fields
                const errorStr = (data.error || '').toLowerCase();
                const newFieldErrors = {};
                let hasSpecificError = false;

                if (errorStr.includes('email')) {
                    newFieldErrors.email = "Cet email est déjà utilisé.";
                    hasSpecificError = true;
                }
                if (errorStr.includes('pseudo') || errorStr.includes('duplicate') || errorStr.includes('1062')) {
                    newFieldErrors.pseudo = "Ce pseudo est déjà pris, veuillez en choisir un autre.";
                    hasSpecificError = true;
                }

                setFieldErrors(newFieldErrors);

                // If a specific field error was found, hide the ugly raw database error at the top
                if (hasSpecificError) {
                    setProfileMessage(null);
                } else {
                    // Only show the top alert if it's an unknown server error
                    setProfileMessageType('danger');
                    setProfileMessage(data.error || 'An error occurred while updating.');
                }
            }
        } catch (error) {
            setProfileMessageType('danger');
            setProfileMessage('Server connection error.');
        }
    };

    // --- HANDLERS: PASSWORD FORM ---
    const handlePwdChange = (e) => {
        const { name, value } = e.target;
        setPwdData({ ...pwdData, [name]: value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPwdMessage(null);

        // Client-side validation for matching passwords
        if (pwdData.new_password !== pwdData.confirm_password) {
            setPwdMessageType('danger');
            setPwdMessage("Les nouveaux mots de passe ne correspondent pas.");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/profile/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_password: pwdData.old_password,
                    new_password: pwdData.new_password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setPwdMessageType('success');
                setPwdMessage('Mot de passe mis à jour avec succès !');
                // Reset password form fields
                setPwdData({ old_password: '', new_password: '', confirm_password: '' });
            } else {
                setPwdMessageType('danger');
                setPwdMessage(data.error || 'Erreur lors du changement de mot de passe.');
            }
        } catch (error) {
            setPwdMessageType('danger');
            setPwdMessage('Server connection error.');
        }
    };

    // --- HANDLER: DELETE ACCOUNT ---
    const handleDeleteAccount = async () => {
        const isConfirmed = window.confirm(
            "Are you sure you want to delete your account? This action is irreversible."
        );
        if (!isConfirmed) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };

    return (
        <div className="container mt-5 profile-container">
            {/* --- SECTION 1: PROFILE INFORMATION --- */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-white pb-0 border-bottom-0 pt-4 px-4">
                    <h4 className="mb-0">Informations Générales</h4>
                </div>

                <div className="card-body p-4">
                    {profileMessage && (
                        <div className={`alert alert-${profileMessageType}`} role="alert">
                            {profileMessage}
                        </div>
                    )}

                    <form onSubmit={handleProfileSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Adresse Email</label>
                            <input
                                type="email"
                                // Adds a red border if fieldErrors.email exists
                                className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                                name="email"
                                value={formData.email}
                                onChange={handleProfileChange}
                            />
                            {fieldErrors.email && (
                                <div className="invalid-feedback">{fieldErrors.email}</div>
                            )}
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Prénom</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleProfileChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nom</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleProfileChange}
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Pseudo</label>
                            <input
                                type="text"
                                className={`form-control ${fieldErrors.pseudo ? 'is-invalid' : ''}`}
                                name="pseudo"
                                value={formData.pseudo}
                                onChange={handleProfileChange}
                            />
                            {fieldErrors.pseudo && (
                                <div className="invalid-feedback">{fieldErrors.pseudo}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold">Pays</label>
                            <input
                                type="text"
                                className="form-control"
                                name="country"
                                value={formData.country}
                                onChange={handleProfileChange}
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
                                    onChange={handleProfileChange}
                                />
                                <label className="form-check-label fw-bold" htmlFor="fastSaveSwitch">
                                    Activer le Fast-Save
                                </label>
                            </div>
                            <small className="text-muted d-block mt-1">
                                Si activé, les liens seront sauvegardés automatiquement sans passer par le tiroir de validation.
                            </small>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 fw-bold">
                            Sauvegarder les modifications
                        </button>
                    </form>
                </div>
            </div>

            {/* --- SECTION 2: SECURITY & PASSWORD --- */}
            <div className="card shadow-sm border-danger border-opacity-25 mb-5">
                <div className="card-header bg-white pb-0 border-bottom-0 pt-4 px-4">
                    <h4 className="mb-0 text-danger">Sécurité</h4>
                </div>

                <div className="card-body p-4">
                    {pwdMessage && (
                        <div className={`alert alert-${pwdMessageType}`} role="alert">
                            {pwdMessage}
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Ancien mot de passe</label>
                            <div className="input-group">
                                <input
                                    type={showOldPwd ? "text" : "password"}
                                    className="form-control"
                                    name="old_password"
                                    value={pwdData.old_password}
                                    onChange={handlePwdChange}
                                    required
                                />
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => setShowOldPwd(!showOldPwd)}
                                >
                                    {showOldPwd ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Nouveau mot de passe</label>
                            <div className="input-group">
                                <input
                                    type={showNewPwd ? "text" : "password"}
                                    className="form-control"
                                    name="new_password"
                                    value={pwdData.new_password}
                                    onChange={handlePwdChange}
                                    required
                                />
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => setShowNewPwd(!showNewPwd)}
                                >
                                    {showNewPwd ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold">Confirmer le nouveau mot de passe</label>
                            <div className="input-group">
                                <input
                                    type={showConfirmPwd ? "text" : "password"}
                                    className="form-control"
                                    name="confirm_password"
                                    value={pwdData.confirm_password}
                                    onChange={handlePwdChange}
                                    required
                                />
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                                >
                                    {showConfirmPwd ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-outline-danger w-100 fw-bold mb-4">
                            Changer le mot de passe
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