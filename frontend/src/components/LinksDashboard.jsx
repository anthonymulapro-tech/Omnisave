import React, { useState, useMemo } from 'react';
import LinkCard from './LinkCard';

const LinksDashboard = ({ initialLinks, onDelete, onEdit, onToggleFavorite }) => {
    // --- STATES ---
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [sortOrder, setSortOrder] = useState('DESC');
    const [selectedPlatform, setSelectedPlatform] = useState('all');

    /**
     * Extract unique categories from all the user's links to populate the filter dynamically.
     */
    const uniqueCategories = useMemo(() => {
        const allCategories = initialLinks.flatMap(link => link.categories || []);
        const validCategories = allCategories.filter(category => category && category.trim() !== "");
        return [...new Set(validCategories)].sort();
    }, [initialLinks]);

    /**
     * Extract a unique list of platforms from the user's saved links.
     * Wrapped in useMemo for performance (calculates only when initialLinks change).
     */
    const availablePlatforms = useMemo(() => {
        // CORRECTION: Reset to 'platform' (JSON key from Flask) instead of 'platforme'
        return [...new Set(initialLinks.map(link => link.platform))].filter(Boolean);
    }, [initialLinks]);

    // Utility function to format the platform name for the UI (e.g., "instagram.com" -> "Instagram")
    const formatPlatformName = (domain) => {
        if (!domain) return 'Other';
        const name = domain.split('.')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    /**
     * Main filtering and sorting logic
     */
    const processedLinks = useMemo(() => {
        // 1. FILTERING
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

            // CORRECTION: Reset to 'platform' here as well
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

            // Combine all filters including the new platform filter
            return matchesSearch && matchesCategory && matchesPlatform && matchesDate && matchesFavorite;
        });

        // 2. SORTING (Newest/Oldest)
        return filtered.sort((a, b) => {
            const dateA = new Date(a.saved_at).getTime();
            const dateB = new Date(b.saved_at).getTime();
            return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
        });

    }, [initialLinks, searchQuery, categoryFilter, selectedPlatform, dateFilter, showFavoritesOnly, sortOrder]);


    return (
        <div className="container mt-4">
            {/* HEADER: SEARCH AND FILTERS CONTAINER */}
            <div className="row mb-4 bg-light p-3 rounded shadow-sm mx-0">

                {/* SEARCH, FAVORITES, AND MOBILE FILTER BUTTON */}
                <div className="col-12 col-md-4 d-flex gap-2 p-0 mb-md-0 mb-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher par tag ou titre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {/* Toggle Favorites Button */}
                    <button
                        className={`btn d-flex align-items-center justify-content-center ${showFavoritesOnly ? 'btn-danger' : 'btn-outline-danger'}`}
                        style={{ minWidth: '45px' }}
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    >
                        {showFavoritesOnly ? '❤️' : '🤍'}
                    </button>

                    {/* MOBILE FILTER BUTTON (Visible on small screens only) */}
                    <button
                        className="btn btn-secondary d-md-none d-flex align-items-center justify-content-center"
                        style={{ minWidth: '45px' }}
                        data-bs-toggle="collapse"
                        data-bs-target="#mobileFilters"
                        aria-expanded="false"
                    >
                        ⚙️
                    </button>
                </div>

                {/* COLLAPSIBLE FILTERS AREA (Hidden on mobile, inline on desktop) */}
                <div className="col-12 col-md-8 collapse d-md-block p-0" id="mobileFilters">
                    <div className="row g-2 ms-md-2 mt-2 mt-md-0">

                        {/* CATEGORIES */}
                        <div className="col-12 col-sm-6 col-md-3">
                            <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                <option value="ALL">Toutes les catégories</option>
                                {uniqueCategories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* PLATFORM FILTER */}
                        <div className="col-12 col-sm-6 col-md-3">
                            <select className="form-select" value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}>
                                <option value="all">Plateformes</option>
                                {availablePlatforms.map((platform, index) => (
                                    <option key={index} value={platform}>
                                        {formatPlatformName(platform)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* DATES */}
                        <div className="col-12 col-sm-6 col-md-3">
                            <select className="form-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                                <option value="ALL">Dates</option>
                                <option value="TODAY">Aujourd'hui</option>
                                <option value="THIS_WEEK">Cette semaine</option>
                                <option value="LAST_MONTH">Mois dernier</option>
                                <option value="OLDER_THAN_6_MONTHS">+ 6 mois</option>
                                <option value="OLDER_THAN_1_YEAR">+ 1 an</option>
                            </select>
                        </div>

                        {/* SORTING */}
                        <div className="col-12 col-sm-6 col-md-3">
                            <select className="form-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                <option value="DESC">Plus récents</option>
                                <option value="ASC">Plus anciens</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* LINKS GRID */}
            <div className="row g-3">
                {processedLinks.length > 0 ? (
                    processedLinks.map(link => (
                        // RESPONSIVE GRID:
                        // col-12 = 1 card per row on mobile
                        // col-sm-6 = 2 cards per row on tablets
                        // col-lg-4 = 3 cards per row on large desktop screens
                        <div className="col-12 col-sm-6 col-lg-4" key={link.link_id}>
                            <LinkCard
                                link={link}
                                onDelete={onDelete}
                                onEdit={onEdit}
                                onToggleFavorite={onToggleFavorite}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center text-muted mt-5">
                        <h5>Aucun lien trouvé pour ces filtres.</h5>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinksDashboard;