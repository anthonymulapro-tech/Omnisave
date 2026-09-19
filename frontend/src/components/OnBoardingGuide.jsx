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
                    {/* SLIDE 1: Concept */}
                    <SwiperSlide className="onboarding-slide">
                        <div className="slide-content">
                            <h3>Bienvenue sur Omnisave 🚀</h3>
                            <p>
                                Fini les liens perdus ! Omnisave centralise toutes vos vidéos, articles et posts favoris d'Instagram, TikTok, YouTube et X au même endroit.
                            </p>
                        </div>
                    </SwiperSlide>

                    {/* SLIDE 2: PC Usage */}
                    <SwiperSlide className="onboarding-slide">
                        <div className="slide-content">
                            <h3>Utilisation sur Ordinateur 💻</h3>
                            <p>
                                Naviguez sur vos réseaux préférés, copiez le lien d'un contenu et collez-le simplement dans votre Dashboard. Notre IA se charge de catégoriser le contenu pour vous !
                            </p>
                        </div>
                    </SwiperSlide>

                    {/* SLIDE 3: Mobile (iOS/Android) */}
                    <SwiperSlide className="onboarding-slide">
                        <div className="slide-content">
                            <h3>Le pouvoir du Mobile 📱</h3>
                            <p>
                                Sur votre téléphone, utilisez le bouton "Partager" directement depuis Instagram ou TikTok. Choisissez "Omnisave" via notre raccourci iOS, et le lien sera importé automatiquement.
                            </p>
                        </div>
                    </SwiperSlide>

                    {/* SLIDE 4: Fast Save */}
                    <SwiperSlide className="onboarding-slide">
                        <div className="slide-content">
                            <h3>Sauvegarde Rapide ⚡</h3>
                            <p>
                                Activez l'option "Fast Save" dans votre profil. Plus besoin de valider chaque lien : collez-le, et l'IA l'enregistre en arrière-plan instantanément.
                            </p>
                            <button className="btn-primary mt-4" onClick={onClose}>
                                Commencer à sauvegarder
                            </button>
                        </div>
                    </SwiperSlide>
                </Swiper>
            </div>
        </div>
    );
};

export default OnboardingGuide;