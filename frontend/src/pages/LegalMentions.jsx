// frontend/src/pages/LegalMentions.jsx
import React from 'react';
import './LegalMentions.css';

const LegalMentions = () => {
    return (
        <div className="legal-container">
            <div className="glass-card legal-content">
                <h1 className="legal-title">Mentions Légales</h1>
                
                <section className="legal-section">
                    <h2>1. Éditeur du site</h2>
                    <p>
                        Le site Omnisave est édité par <strong>Mula Anthony</strong>.<br />
                        Adresse : Lyon <br />
                        Email : anthony.mula.pro@gmail.com <br />
                    </p>
                </section>

                <section className="legal-section">
                    <h2>2. Hébergement</h2>
                    <p>
                        Ce site est hébergé par <strong>[EN COURS DE SÉLECTION]</strong>.<br />
                        Adresse de l'hébergeur : [Adresse complète de l'hébergeur]<br />
                        Site web : <a href="[Lien de l'hébergeur]" target="_blank" rel="noopener noreferrer">[Lien de l'hébergeur]</a>
                    </p>
                </section>

                <section className="legal-section">
                    <h2>3. Propriété intellectuelle</h2>
                    <p>
                        L'ensemble du contenu du site Omnisave (textes, images, architecture, logo) est protégé par le droit de la propriété intellectuelle. Toute reproduction, modification ou distribution, totale ou partielle, est strictement interdite sans l'autorisation préalable de l'éditeur.
                    </p>
                </section>

                <section className="legal-section">
                    <h2>4. Données personnelles</h2>
                    <p>
                        Pour plus d'informations sur la collecte, le traitement et la protection de vos données personnelles, veuillez consulter notre <a href="/privacy-policy">Politique de Confidentialité</a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default LegalMentions;