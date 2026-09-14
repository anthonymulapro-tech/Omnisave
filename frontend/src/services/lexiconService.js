/**
 * Silently sends user-modified categories and tags to the backend lexicon API.
 * This runs in the background so it doesn't block the user experience.
 *
 * @param {string} category - The category validated by the user
 * @param {Array<string>} tags - The array of tags validated by the user
 */
export const sendLexiconSuggestions = (category, tags) => {
    // We only send if we have valid data
    if (!category || !tags || tags.length === 0) return;

    tags.forEach(tag => {
        // Fire and forget: We don't 'await' here because we want this to be invisible and fast
        fetch('/api/lexicon/suggest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                word: tag,
                category: category
            })
        }).catch(error => {
            // Silently ignore errors so the user's UI doesn't break
            console.error("Silent suggestion error:", error);
        });
    });
};