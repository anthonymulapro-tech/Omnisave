// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="glass-footer">
            <div className="footer-content">
                {/* Brand Section */}
                <div className="footer-brand">
                    <h3 className="footer-logo">Omnisave</h3>
                    <p className="footer-description">
                        Sauvegardez, catégorisez et retrouvez tous vos contenus favoris grâce à l'IA.
                    </p>
                </div>

                {/* Links Section */}
                <div className="footer-links">
                    <div className="footer-column">
                        <h4>Légal</h4>
                        <ul>
                            <li><Link to="/legal-mentions">Mentions Légales</Link></li>
                            <li><Link to="/privacy-policy">Politique de Confidentialité</Link></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Navigation</h4>
                        <ul>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/profile">Mon Profil</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="footer-bottom">
                <p>&copy; {currentYear} Omnisave. Tous droits réservés.</p>
            </div>
        </footer>
    );
};

export default Footer;