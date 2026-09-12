import React, { useState, useMemo } from 'react';
import LinkCard from './LinkCard';

const LinksDashboard = ({ initialLinks }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');

    const filteredLinks = useMemo(() => {
        return initialLinks.filter((link) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                link.title?.toLowerCase().includes(query) ||
                link.tags?.some(tag => tag.toLowerCase().includes(query));

            const matchesCategory =
                categoryFilter === 'ALL' ||
                link.category_name?.toLowerCase().trim() === categoryFilter.toLowerCase().trim();

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

            return matchesSearch && matchesCategory && matchesDate;
        });
    }, [initialLinks, searchQuery, categoryFilter, dateFilter]);

    return (
        <div className="container mt-4">
            <div className="row mb-4 g-3 bg-light p-3 rounded shadow-sm">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher par tag ou titre (e.g., burger, vege)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="col-md-3">
                    <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="ALL">Toutes les categories</option>
                        <option value="Cooking">Cuisine</option>
                        <option value="Sports">Sports</option>
                    </select>
                </div>
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
            </div>

            <div className="row">
                {filteredLinks.length > 0 ? (
                    filteredLinks.map(link => (
                        <div className="col-md-4" key={link.link_id}>
                            <LinkCard link={link} />
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