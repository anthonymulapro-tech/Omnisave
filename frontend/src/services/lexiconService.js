/**
 * Silently sends category tags to the backend lexicon API.
 *
 * @param {string} category - The category validated by the user
 * @param {Array<string>} tags - The tags to process
 * @param {boolean} isEdit - True if this is an edit action, false if it's a new link creation
 * @param {Array<string>} originalTags - (Only required if isEdit=true) The tags before editing
 */
export const sendLexiconSuggestions = (category, tags, isEdit = false, originalTags = []) => {
    if (!category || !tags || tags.length === 0) return;

    let tagsToSend = tags;

    // If it's an edit, we apply the delta rule: keep ONLY newly added tags
    if (isEdit) {
        const normalizedOriginals = originalTags.map(t => t.trim().toLowerCase());
        tagsToSend = tags.filter(
            tag => !normalizedOriginals.includes(tag.trim().toLowerCase())
        );
    }

    // If no tags to send after filtering, stop here
    if (tagsToSend.length === 0) return;

    const BACKEND_URL = 'http://localhost:5000';
    const token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('jwt');

    tagsToSend.forEach(tag => {
        fetch(`${BACKEND_URL}/api/lexicon/suggest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
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