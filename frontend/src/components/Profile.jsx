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
    const [fieldErrors, setFieldErrors] = useState({});

    // --- STATE: PASSWORD UPDATE ---
    const [pwdData, setPwdData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [pwdMessage, setPwdMessage] = useState(null);
    const [pwdMessageType, setPwdMessageType] = useState('');

    // --- STATE: PASSWORD VISIBILITY TOGGLES ---
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
            const response = await fetch(`http://${window.location.hostname}:5000/api/profile`, {
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

        // Clear specific field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: null });
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileMessage(null);
        setFieldErrors({});

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://${window.location.hostname}:5000/api/profile`, {
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
                setProfileMessage('Profil mis à jour avec succès !');
            } else {
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

                if (hasSpecificError) {
                    setProfileMessage(null);
                } else {
                    setProfileMessageType('danger');
                    setProfileMessage(data.error || 'Une erreur est survenue lors de la mise à jour.');
                }
            }
        } catch (error) {
            setProfileMessageType('danger');
            setProfileMessage('Erreur de connexion au serveur.');
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

        if (pwdData.new_password !== pwdData.confirm_password) {
            setPwdMessageType('danger');
            setPwdMessage("Les nouveaux mots de passe ne correspondent pas.");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://${window.location.hostname}:5000/api/profile/password`, {
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
                setPwdData({ old_password: '', new_password: '', confirm_password: '' });
            } else {
                setPwdMessageType('danger');
                setPwdMessage(data.error || 'Erreur lors du changement de mot de passe.');
            }
        } catch (error) {
            setPwdMessageType('danger');
            setPwdMessage('Erreur de connexion au serveur.');
        }
    };

    // --- HANDLER: DELETE ACCOUNT ---
    const handleDeleteAccount = async () => {
        const isConfirmed = window.confirm(
            "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
        );
        if (!isConfirmed) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://${window.location.hostname}:5000/api/profile`, {
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
        <div className="profile-wrapper">
            <div className="profile-container">

                {/* --- SECTION 1: PROFILE INFORMATION --- */}
                <div className="surface-card profile-card mb-4">
                    <div className="brand-gradient-text">
                        <h4>Informations Générales</h4>
                    </div>

                    <div className="profile-body">
                        {profileMessage && (
                            <div className={`custom-alert custom-alert-${profileMessageType}`}>
                                {profileMessageType === 'success' && '✅ '}
                                {profileMessageType === 'danger' && '⚠️ '}
                                {profileMessage}
                            </div>
                        )}

                        <form onSubmit={handleProfileSubmit}>
                            <div className="form-group mb-3">
                                <label className="custom-label">Adresse Email</label>
                                <input
                                    type="email"
                                    className={`styled-input w-100 ${fieldErrors.email ? 'input-error' : ''}`}
                                    name="email"
                                    value={formData.email}
                                    onChange={handleProfileChange}
                                />
                                {fieldErrors.email && <div className="error-text">{fieldErrors.email}</div>}
                            </div>

                            <div className="form-row mb-3">
                                <div className="form-group half-width">
                                    <label className="custom-label">Prénom</label>
                                    <input
                                        type="text"
                                        className="styled-input w-100"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleProfileChange}
                                    />
                                </div>
                                <div className="form-group half-width">
                                    <label className="custom-label">Nom</label>
                                    <input
                                        type="text"
                                        className="styled-input w-100"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleProfileChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group mb-3">
                                <label className="custom-label">Pseudo</label>
                                <input
                                    type="text"
                                    className={`styled-input w-100 ${fieldErrors.pseudo ? 'input-error' : ''}`}
                                    name="pseudo"
                                    value={formData.pseudo}
                                    onChange={handleProfileChange}
                                />
                                {fieldErrors.pseudo && <div className="error-text">{fieldErrors.pseudo}</div>}
                            </div>

                            <div className="form-group mb-4">
                                <label className="custom-label">Pays</label>
                                <input
                                    type="text"
                                    className="styled-input w-100"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleProfileChange}
                                />
                            </div>

                            <div className="fast-save-box mb-4">
                                <div className="switch-wrapper">
                                    <input
                                        className="custom-switch"
                                        type="checkbox"
                                        id="fastSaveSwitch"
                                        name="fast_save"
                                        checked={formData.fast_save}
                                        onChange={handleProfileChange}
                                    />
                                    <label className="switch-label" htmlFor="fastSaveSwitch">
                                        Activer le Fast-Save ⚡
                                    </label>
                                </div>
                                <small className="fast-save-desc">
                                    Si activé, les liens seront sauvegardés automatiquement sans passer par le tiroir de validation.
                                </small>
                            </div>

                            <button type="submit" className="btn-primary w-100">
                                Sauvegarder les modifications
                            </button>
                        </form>
                    </div>
                </div>

                {/* --- SECTION 2: SECURITY & PASSWORD --- */}
                <div className="surface-card profile-card danger-card mb-5">
                    <div className="brand-gradient-text">
                        <h4>Sécurité</h4>
                    </div>

                    <div className="profile-body">
                        {pwdMessage && (
                            <div className={`custom-alert custom-alert-${pwdMessageType}`}>
                                {pwdMessageType === 'success' && '✅ '}
                                {pwdMessageType === 'danger' && '⚠️ '}
                                {pwdMessage}
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit}>
                            <div className="form-group mb-3">
                                <label className="custom-label">Ancien mot de passe</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showOldPwd ? "text" : "password"}
                                        className="styled-input w-100"
                                        name="old_password"
                                        value={pwdData.old_password}
                                        onChange={handlePwdChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn-toggle-pwd"
                                        onClick={() => setShowOldPwd(!showOldPwd)}
                                    >
                                        {showOldPwd ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group mb-3">
                                <label className="custom-label">Nouveau mot de passe</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showNewPwd ? "text" : "password"}
                                        className="styled-input w-100"
                                        name="new_password"
                                        value={pwdData.new_password}
                                        onChange={handlePwdChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn-toggle-pwd"
                                        onClick={() => setShowNewPwd(!showNewPwd)}
                                    >
                                        {showNewPwd ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group mb-4">
                                <label className="custom-label">Confirmer le nouveau mot de passe</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPwd ? "text" : "password"}
                                        className="styled-input w-100"
                                        name="confirm_password"
                                        value={pwdData.confirm_password}
                                        onChange={handlePwdChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn-toggle-pwd"
                                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                                    >
                                        {showConfirmPwd ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn-primary w-100 mb-4">
                                Changer le mot de passe
                            </button>

                            <hr className="custom-divider" />

                            <div className="delete-account-wrapper mt-4">
                                <button
                                    type="button"
                                    className="btn-delete-account"
                                    onClick={handleDeleteAccount}
                                >
                                    Supprimer mon compte définitivement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;