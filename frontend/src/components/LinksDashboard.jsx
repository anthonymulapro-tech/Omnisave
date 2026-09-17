import React, { useState, useMemo } from 'react';
import Select from 'react-select';
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

    // NEW STATE: Toggle filters on mobile
    const [showFilters, setShowFilters] = useState(false);

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

    const formatPlatformName = (domain) => {
        if (!domain) return 'Other';
        const name = domain.split('.')[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    // --- REACT-SELECT OPTIONS ARRAYS ---
    const categoryOptions = [
        { value: 'ALL', label: 'Toutes les catégories' },
        ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
    ];

    const platformOptions = [
        { value: 'all', label: 'Toutes les plateformes' },
        ...availablePlatforms.map(plat => ({ value: plat, label: formatPlatformName(plat) }))
    ];

    const dateOptions = [
        { value: 'ALL', label: 'Toutes les dates' },
        { value: 'TODAY', label: "Aujourd'hui" },
        { value: 'THIS_WEEK', label: 'Cette semaine' },
        { value: 'LAST_MONTH', label: 'Mois dernier' },
        { value: 'OLDER_THAN_6_MONTHS', label: '+ 6 mois' },
        { value: 'OLDER_THAN_1_YEAR', label: '+ 1 an' }
    ];

    const sortOptions = [
        { value: 'DESC', label: 'Plus récents' },
        { value: 'ASC', label: 'Plus anciens' }
    ];

    // --- REACT-SELECT CUSTOM STYLES ---
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderColor: state.isFocused ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
            minWidth: '180px',
            borderRadius: '8px',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none',
            '&:hover': { borderColor: state.isFocused ? '#6366f1' : 'rgba(255, 255, 255, 0.2)' },
            cursor: 'pointer',
            padding: '2px'
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            zIndex: 50
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: state.isSelected ? '#ffffff' : '#f8fafc',
            cursor: 'pointer',
            '&:active': { backgroundColor: '#4f46e5' }
        }),
        singleValue: (provided) => ({ ...provided, color: '#f8fafc' }),
        input: (provided) => ({ ...provided, color: '#f8fafc' }),
        indicatorSeparator: () => ({ display: 'none' }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#6366f1' : '#94a3b8',
            '&:hover': { color: '#6366f1' }
        })
    };

    // Filtering and sorting logic
    const processedLinks = useMemo(() => {
        let filtered = initialLinks.filter((link) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch = link.title?.toLowerCase().includes(query) || link.tags?.some(tag => tag.toLowerCase().includes(query));
            const matchesCategory = categoryFilter === 'ALL' || (link.categories && link.categories.some(cat => cat.toLowerCase().trim() === categoryFilter.toLowerCase().trim()));
            const matchesPlatform = selectedPlatform === 'all' || link.platform === selectedPlatform;

            let matchesDate = true;
            if (dateFilter !== 'ALL') {
                const linkDate = new Date(link.saved_at);
                const diffDays = Math.ceil(Math.abs(new Date() - linkDate) / (1000 * 60 * 60 * 24));
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

    const handleResetFilters = () => {
        setSearchQuery('');
        setCategoryFilter('ALL');
        setSelectedPlatform('all');
        setDateFilter('ALL');
        setSortOrder('DESC');
        setShowFavoritesOnly(false);
    };

    return (
        <div className="links-dashboard-wrapper">
            <div className="surface-card filters-container">

                {/* SEARCH & QUICK ACTIONS (Always visible) */}
                <div className="search-group">
                    {/* FAVORITES BUTTON (Mobile Version - Hidden on Desktop) */}
                    <button
                        className={`btn-icon btn-favorite-mobile ${showFavoritesOnly ? 'active' : ''}`}
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        title="Afficher uniquement les favoris"
                    >
                        {showFavoritesOnly ? '❤️' : '🤍'}
                    </button>

                    <input
                        type="text"
                        className="styled-input search-input"
                        placeholder="Rechercher par tag ou titre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {/* TOGGLE FILTERS BUTTON (Visible only on mobile) */}
                    <button
                        className={`btn-icon btn-filter-toggle ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        title="Afficher/Masquer les filtres"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                    </button>
                </div>

                {/* DROPDOWNS (Hidden on mobile by default) */}
                <div className={`dropdown-group ${showFilters ? 'mobile-expanded' : ''}`}>
                   {/* FAVORITES BUTTON (Desktop Version - Hidden on Mobile) */}
                    <button
                        className={`btn-icon btn-favorite-desktop ${showFavoritesOnly ? 'active' : ''}`}
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        title="Afficher uniquement les favoris"
                    >
                        {showFavoritesOnly ? '❤️' : '🤍'}
                    </button>

                    <Select
                        options={categoryOptions}
                        value={categoryOptions.find(opt => opt.value === categoryFilter)}
                        onChange={(selected) => setCategoryFilter(selected.value)}
                        styles={customSelectStyles}
                        isSearchable={false}
                    />

                    <Select
                        options={platformOptions}
                        value={platformOptions.find(opt => opt.value === selectedPlatform)}
                        onChange={(selected) => setSelectedPlatform(selected.value)}
                        styles={customSelectStyles}
                        isSearchable={false}
                    />

                    <Select
                        options={dateOptions}
                        value={dateOptions.find(opt => opt.value === dateFilter)}
                        onChange={(selected) => setDateFilter(selected.value)}
                        styles={customSelectStyles}
                        isSearchable={false}
                    />

                    <Select
                        options={sortOptions}
                        value={sortOptions.find(opt => opt.value === sortOrder)}
                        onChange={(selected) => setSortOrder(selected.value)}
                        styles={customSelectStyles}
                        isSearchable={false}
                    />

                    <button
                        className="btn-reset-filters"
                        onClick={handleResetFilters}
                        title="Réinitialiser tous les filtres"
                    >
                        🔄
                    </button>
                </div>
            </div>

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