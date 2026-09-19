import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';

// Import Swiper core and required modules styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './OnboardingGuide.css';

/**
 * OnboardingGuide Component
 * Displays a swipeable carousel to explain the app's core features to new users.
 * Uses Swiper.js for native-like mobile swiping and desktop navigation.
 *
 * @param {function} onClose - Function to close the onboarding modal/view
 */
const OnboardingGuide = ({ onClose }) => {
    return (
        <div className="onboarding-overlay">
            <div className="onboarding-container surface-card">
                <button className="close-btn" onClick={onClose} aria-label="Close guide">
                    &times;
                </button>

                <Swiper
                    modules={[Pagination, Navigation]}
                    spaceBetween={30}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    navigation={true}
                    className="onboarding-swiper"
                >
                    {/* SLIDE 1: Welcome & Filters */}
                    <SwiperSlide className="onboarding-slide">
                        <div className="slide-content">
                            <h3>Bienvenue sur Omnisave 🚀</h3>
                            <p>
                                Centralisez tous vos contenus favoris (Instagram, TikTok, YouTube...)
                                 <br />
                                    <strong>Recherchez, filtrez, éditez.</strong>
                            </p>
                            {/* Placeholder for an image or short demo video of the filters */}
                            <div className="media-placeholder">
                                <video src="/videos/onboarding-slide-1.mp4" autoPlay loop muted playsInline className="guide-video" />
                            </div>
                        </div>
                    </SwiperSlide>

                    {/* SLIDE 2: PC - Manual Link Addition */}
                    <SwiperSlide className="onboarding-slide">
                        <div className="slide-content">
                            <h3>Sur Ordinateur (1/2) 💻</h3>
                            <p>
                                Copiez un lien et collez-le dans le Dashboard. Notre IA analyse le contenu, génère les tags et la catégorie. Vous pouvez éditer ces infos maintenant ou plus tard !
                            </p>
                            <div className="media-placeholder">
                                <video src="/videos/onboarding-slide-2.mp4" autoPlay loop muted playsInline className="guide-video" />
                            </div>
                        </div>
                    </SwiperSlide>

                    {/* SLIDE 3: PC - Extension & Fast Save */}
                    <SwiperSlide className="onboarding-slide">
                        <div className="slide-content">
                            <h3>L'Extension Chrome (2/2) 🧩</h3>
                            <p>
                                Activez le <strong>Fast Save</strong> dans votre profil. Sur YouTube ou X, cliquez simplement sur notre extension pour sauvegarder en arrière-plan.
                            </p>

                            {/* NOUVEAU : Bouton de téléchargement */}
                            <a
                                href="/downloads/omnisave-extension.zip"
                                download="omnisave-extension.zip"
                                className="btn-primary mt-2 mb-3"
                                style={{ textDecoration: 'none', display: 'inline-block' }}
                            >
                                📥 Télécharger l'Extension (.zip)
                            </a>

                            <div className="media-placeholder">
                                <video src="/videos/onboarding-slide-3.mp4" autoPlay loop muted playsInline className="guide-video" />
                            </div>
                        </div>
                    </SwiperSlide>

                    {/* SLIDE 4: Mobile - PWA Installation & Shortcut Setup */}
                    <SwiperSlide className="onboarding-slide">
                        <div className="slide-content">
                            <h3>Configuration Mobile (1/2) 📱</h3>
                            <p>
                                Sur iOS, installez notre <strong>Raccourci de partage</strong> pour envoyer vos liens vers Omnisave directement depuis Instagram ou TikTok !
                            </p>

                            {/* NOUVEAU : Bouton lien iCloud */}
                            <a
                                href="https://www.icloud.com/shortcuts/d4db78d78dc740c3b4a0f61e6a7629eb"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary mt-2 mb-3"
                                style={{ textDecoration: 'none', display: 'inline-block' }}
                            >
                                🍎 Ajouter le Raccourci iOS
                            </a>

                            <div className="media-placeholder">
                                <video src="/videos/demo-mobile-setup.mp4" autoPlay loop muted playsInline className="guide-video" />
                            </div>
                        </div>
                    </SwiperSlide>

                    {/* SLIDE 5: Mobile - Native Usage with/without Fast Save */}
                    <SwiperSlide className="onboarding-slide">
                        <div className="slide-content">
                            <h3>Partagez en un clic (2/2) ⚡</h3>
                            <p>
                                Depuis Instagram ou TikTok, utilisez le bouton "Partager" vers Omnisave.
                                <br/><br/>
                                <strong>Sans Fast Save :</strong> Éditez vos tags avant de valider.<br/>
                                <strong>Avec Fast Save :</strong> Restez sur votre app, l'IA sauvegarde tout en silence !
                            </p>
                            {/* Call to action button to close the guide and start using the app */}
                            <button className="btn-primary mt-3" onClick={onClose}>
                                J'ai compris, c'est parti !
                            </button>
                        </div>
                    </SwiperSlide>
                </Swiper>
            </div>
        </div>
    );
};

export default OnboardingGuide;