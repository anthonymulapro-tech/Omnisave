// frontend/src/pages/PrivacyPolicy.jsx
import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    return (
        <div className="privacy-container">
            <div className="glass-card privacy-content">
                <h1 className="privacy-title">Politique de Confidentialité</h1>

                <section className="privacy-section">
                    <h2>1. Collecte des données</h2>
                    <p>
                        Dans le cadre de l'utilisation de l'application Omnisave, nous sommes amenés à collecter certaines données personnelles vous concernant (ex: adresse email, nom d'utilisateur, liens sauvegardés). Ces données sont collectées lorsque vous créez un compte ou utilisez notre extension.
                    </p>
                </section>

                <section className="privacy-section">
                    <h2>2. Utilisation des données</h2>
                    <p>
                        Les informations que nous recueillons sont utilisées pour :
                    </p>
                    <ul>
                        <li>Fournir, exploiter et maintenir notre service.</li>
                        <li>Améliorer, personnaliser et développer Omnisave (notamment via l'analyse IA de vos liens).</li>
                        <li>Vous permettre de vous connecter et de gérer votre profil.</li>
                    </ul>
                </section>

                <section className="privacy-section">
                    <h2>3. Sécurité des données</h2>
                    <p>
                        Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre tout accès, modification, divulgation ou destruction non autorisés. Vos mots de passe sont cryptés et sécurisés.
                    </p>
                </section>

                <section className="privacy-section">
                    <h2>4. Vos droits</h2>
                    <p>
                        Conformément à la réglementation en vigueur (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition concernant vos données personnelles. Pour exercer ces droits, vous pouvez nous contacter à l'adresse suivante : <strong>anthony.mula.pro@gmail.com</strong>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;