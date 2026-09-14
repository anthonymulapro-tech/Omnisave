/**
 * Silently sends user-modified categories and tags to the backend lexicon API.
 * This runs in the background so it doesn't block the user experience.
 *
 * @param {string} category - The category validated by the user
 * @param {Array<string>} tags - The array of tags validated by the user
 */
export const sendLexiconSuggestions = (category, tags) => {
    if (!category || !tags || tags.length === 0) return;

    const BACKEND_URL = 'http://localhost:5000';

    // Check multiple common key names just in case
    const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('jwt');

    // If no token found and your route requires it, you can either return or let it try anyway
    if (!token) {
        console.warn("No auth token found for lexicon suggestion.");
        return;
    }

    tags.forEach(tag => {
        fetch(`${BACKEND_URL}/api/lexicon/suggest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                word: tag,
                category: category
            })
        }).catch(error => {
            console.error("Silent suggestion error:", error);
        });
    });
};