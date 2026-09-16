import React, { useState, useMemo } from 'react';
import LinkCard from './LinkCard';
import './LinksDashboard.css';

const LinksDashboard = ({ initialLinks, onDelete, onEdit, onToggleFavorite }) => {
    // --- STATES ---
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [sortOrder, setSortOrder] = useState('DESC');
    const [selectedPlatform, setSelectedPlatform] = useState('all');

    // Extract unique categories
    const uniqueCategories = useMemo(() => {
        const allCategories = initialLinks.flatMap(link => link.categories || []);
        const validCategories = allCategories.filter(category => category && category.trim() !== "");
        return [...new Set(validCategories)].sort();
    }, [initialLinks]);

    // Extract unique platforms
    const availablePlatforms = useMemo(() => {
        return [...new Set(initialLinks.map(link => link.platform))].filter(Boolean);
    }, [initialLinks]);

    // Format platform name
    const formatPlatformName = (domain) => {
        if (!domain) return 'Other';
        const name = domain.split('.')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    // Filtering and sorting logic
    const processedLinks = useMemo(() => {
        let filtered = initialLinks.filter((link) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                link.title?.toLowerCase().includes(query) ||
                link.tags?.some(tag => tag.toLowerCase().includes(query));

            const matchesCategory =
                categoryFilter === 'ALL' ||
                (link.categories && link.categories.some(cat =>
                    cat.toLowerCase().trim() === categoryFilter.toLowerCase().trim()
                ));

            const matchesPlatform = selectedPlatform === 'all' || link.platform === selectedPlatform;

            let matchesDate = true;
            if (dateFilter !== 'ALL') {
                const linkDate = new Date(link.saved_at);
                const today = new Date();
                const diffTime = Math.abs(today - linkDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (dateFilter === 'TODAY') matchesDate = diffDays <= 1;
                else if (dateFilter === 'THIS_WEEK') matchesDate = diffDays <= 7;
                else if (dateFilter === 'LAST_MONTH') matchesDate = diffDays > 7 && diffDays <= 30;
                else if (dateFilter === 'OLDER_THAN_6_MONTHS') matchesDate = diffDays > 180;
                else if (dateFilter === 'OLDER_THAN_1_YEAR') matchesDate = diffDays > 365;
            }

            const matchesFavorite = showFavoritesOnly ? link.is_favorite === true : true;

            return matchesSearch && matchesCategory && matchesPlatform && matchesDate && matchesFavorite;
        });

        return filtered.sort((a, b) => {
            const dateA = new Date(a.saved_at).getTime();
            const dateB = new Date(b.saved_at).getTime();
            return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
        });

    }, [initialLinks, searchQuery, categoryFilter, selectedPlatform, dateFilter, showFavoritesOnly, sortOrder]);


    return (
        <div className="links-dashboard-wrapper">

            {/* HEADER: SEARCH AND FILTERS (Using surface-card for the glassmorphism look) */}
            <div className="surface-card filters-container">

                {/* SEARCH & FAVORITES */}
                <div className="search-group">
                    <input
                        type="text"
                        className="styled-input search-input" /* Inherits from Dashboard.css */
                        placeholder="Rechercher par tag ou titre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        className={`btn-icon ${showFavoritesOnly ? 'active' : ''}`}
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        title="Afficher uniquement les favoris"
                    >
                        {showFavoritesOnly ? '❤️' : '🤍'}
                    </button>
                </div>

                {/* DROPDOWNS */}
                <div className="dropdown-group">
                    {/* CATEGORIES */}
                    <select className="styled-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="ALL">Toutes les catégories</option>
                        {uniqueCategories.map((category, index) => (
                            <option key={index} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>

                    {/* PLATFORM */}
                    <select className="styled-select" value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
                        <option value="all">Plateformes</option>
                        {availablePlatforms.map((platform, index) => (
                            <option key={index} value={platform}>
                                {formatPlatformName(platform)}
                            </option>
                        ))}
                    </select>

                    {/* DATES */}
                    <select className="styled-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                        <option value="ALL">Toutes les dates</option>
                        <option value="TODAY">Aujourd'hui</option>
                        <option value="THIS_WEEK">Cette semaine</option>
                        <option value="LAST_MONTH">Mois dernier</option>
                        <option value="OLDER_THAN_6_MONTHS">+ 6 mois</option>
                        <option value="OLDER_THAN_1_YEAR">+ 1 an</option>
                    </select>

                    {/* SORTING */}
                    <select className="styled-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="DESC">Plus récents</option>
                        <option value="ASC">Plus anciens</option>
                    </select>
                </div>
            </div>

            {/* LINKS GRID */}
            <div className="links-grid">
                {processedLinks.length > 0 ? (
                    processedLinks.map(link => (
                        <LinkCard
                            key={link.link_id}
                            link={link}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            onToggleFavorite={onToggleFavorite}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                        <h4>Aucun lien trouvé</h4>
                        <p>Essayez de modifier vos filtres de recherche.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinksDashboard;