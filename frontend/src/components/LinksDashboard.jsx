import React, { useState, useMemo } from 'react';
import LinkCard from './LinkCard';

const LinksDashboard = ({ initialLinks, onDelete, onEdit, onToggleFavorite }) => {
    // --- STATES ---
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [sortOrder, setSortOrder] = useState('DESC'); // DESC = Newest first

    /**
     * Extract unique categories from all the user's links to populate the filter dynamically.
     * Uses flatMap to merge all category arrays, Set to remove duplicates, and sorts them.
     */
    const uniqueCategories = useMemo(() => {
        // 1. Flatten all categories from all links into a single array
        const allCategories = initialLinks.flatMap(link => link.categories || []);

        // 2. Filter out null, undefined, or empty strings
        const validCategories = allCategories.filter(category => category && category.trim() !== "");

        // 3. Return unique categories sorted alphabetically
        return [...new Set(validCategories)].sort();
    }, [initialLinks]);

    const processedLinks = useMemo(() => {
        // 1. FILTERING
        let filtered = initialLinks.filter((link) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                link.title?.toLowerCase().includes(query) ||
                link.tags?.some(tag => tag.toLowerCase().includes(query));

            // NEW: Check if the link's categories array includes the selected filter
            const matchesCategory =
                categoryFilter === 'ALL' ||
                (link.categories && link.categories.some(cat =>
                    cat.toLowerCase().trim() === categoryFilter.toLowerCase().trim()
                ));

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

            return matchesSearch && matchesCategory && matchesDate && matchesFavorite;
        });

        // 2. SORTING (Newest/Oldest)
        return filtered.sort((a, b) => {
            const dateA = new Date(a.saved_at).getTime();
            const dateB = new Date(b.saved_at).getTime();
            return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
        });

    }, [initialLinks, searchQuery, categoryFilter, dateFilter, showFavoritesOnly, sortOrder]);

    return (
        <div className="container mt-4">
            <div className="row mb-4 g-3 bg-light p-3 rounded shadow-sm">
                {/* SEARCH AND FAVORITES */}
                <div className="col-md-5 d-flex gap-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher par tag ou titre (e.g., burger, vege)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        className={`btn d-flex align-items-center gap-2 ${showFavoritesOnly ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    >
                        {showFavoritesOnly ? '❤️' : '🤍'}
                    </button>
                </div>

                {/* CATEGORIES */}
                <div className="col-md-2">
                    <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="ALL">Toutes les categories</option>

                        {/* Dynamically render user categories */}
                        {uniqueCategories.map((category, index) => (
                            <option key={index} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                {/* DATES */}
                <div className="col-md-3">
                    <select className="form-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                        <option value="ALL">Tout</option>
                        <option value="TODAY">Aujourd'hui</option>
                        <option value="THIS_WEEK">Cette semaine</option>
                        <option value="LAST_MONTH">Mois dernier</option>
                        <option value="OLDER_THAN_6_MONTHS">Il y a plus de 6 mois</option>
                        <option value="OLDER_THAN_1_YEAR">Il y a plus d'1 an</option>
                    </select>
                </div>

                {/* SORTING */}
                <div className="col-md-2">
                    <select className="form-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="DESC">Plus récents</option>
                        <option value="ASC">Plus anciens</option>
                    </select>
                </div>
            </div>

            <div className="row">
                {processedLinks.length > 0 ? (
                    processedLinks.map(link => (
                        <div className="col-md-4" key={link.link_id}>
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
                        <h5>No links found for these filters.</h5>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinksDashboard;