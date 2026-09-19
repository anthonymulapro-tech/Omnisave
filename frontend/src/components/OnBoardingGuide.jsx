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
                                Centralisez toutes vos vidéos et articles favoris (Instagram, TikTok, YouTube...).
                                Surtout, <strong>retrouvez-les instantanément</strong> grâce à nos filtres intelligents de recherche et de catégorisation !
                            </p>
                            {/* Placeholder for an image or short demo video of the filters */}
                            <div className="media-placeholder">
                                <video src="/videos/demo-filters.mp4" autoPlay loop muted playsInline className="guide-video" />
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
                                <video src="/videos/demo-pc-manual.mp4" autoPlay loop muted playsInline className="guide-video" />
                            </div>
                        </div>
                    </SwiperSlide>

                    {/* SLIDE 3: PC - Chrome Extension & Fast Save */}
                    <SwiperSlide className="onboarding-slide">
                        <div className="slide-content">
                            <h3>L'Extension Chrome (2/2) 🧩</h3>
                            <p>
                                Activez le <strong>Fast Save</strong> dans votre profil. Sur YouTube ou X, cliquez simplement sur notre extension : le lien est sauvegardé instantanément en arrière-plan.
                            </p>
                            <div className="media-placeholder">
                                <video src="/videos/demo-pc-extension.mp4" autoPlay loop muted playsInline className="guide-video" />
                            </div>
                        </div>
                    </SwiperSlide>

                    {/* SLIDE 4: Mobile - PWA Installation & Shortcut Setup */}
                    <SwiperSlide className="onboarding-slide">
                        <div className="slide-content">
                            <h3>Configuration Mobile (1/2) 📱</h3>
                            <p>
                                Ajoutez Omnisave à votre écran d'accueil. Sur iOS, ajoutez également notre <strong>Raccourci de partage</strong> pour une intégration native. Sur Android, c'est automatique !
                            </p>
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