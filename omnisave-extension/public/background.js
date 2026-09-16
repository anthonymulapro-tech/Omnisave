// Listen for messages from the React popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'FAST_SAVE') {

        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const activeTab = tabs[0];

            if (activeTab) {
                const pageUrl = activeTab.url;
                const userToken = request.token;

                try {
                    console.log("1. Requesting AI Preview for:", pageUrl);

                    // --- STEP 1: CALL PREVIEW ENDPOINT ---
                    const previewResponse = await fetch('http://localhost:5000/api/links/preview', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${userToken}`
                        },
                        body: JSON.stringify({ url: pageUrl })
                    });

                    // --- SPECIFIC HANDLING FOR 401 (Token expired) ---
                    if (previewResponse.status === 401) {
                        return sendResponse({ success: false, isUnauthorized: true });
                    }

                    if (!previewResponse.ok) {
                        const errorData = await previewResponse.json().catch(() => ({}));
                        throw new Error(errorData.error || `Erreur d'analyse (${previewResponse.status})`);
                    }

                    const previewData = await previewResponse.json();
                    console.log("AI Analysis completed:", previewData);

                    // --- STEP 2: CALL SAVE ENDPOINT ---
                    console.log("2. Saving to database with AI tags/categories...");
                    const saveResponse = await fetch('http://localhost:5000/api/links', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${userToken}`
                        },
                        body: JSON.stringify({
                            url: previewData.url,
                            title: previewData.title,
                            thumbnail_url: previewData.thumbnail_url,
                            platform: previewData.platform,
                            categories: previewData.categories,
                            tags: previewData.tags
                        })
                    });

                    // --- SPECIFIC HANDLING FOR 401 (Token expired) ---
                    if (saveResponse.status === 401) {
                        return sendResponse({ success: false, isUnauthorized: true });
                    }

                    // --- CLEAN HANDLING OF OTHER ERRORS (including 409 Duplicate) ---
                    if (!saveResponse.ok) {
                        const errorData = await saveResponse.json().catch(() => ({}));
                        // Throw the exact error message sent by our Flask backend
                        throw new Error(errorData.error || `Erreur de sauvegarde (${saveResponse.status})`);
                    }

                    // --- SUCCESS NOTIFICATION ---
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "test.png",
                        title: "Omnisave - Fast-Save",
                        message: `Sauvegardé et catégorisé : ${previewData.title}`
                    });

                    sendResponse({ success: true, message: "Sauvegardé avec succès ! ✅" });

                } catch (error) {
                    console.error("Fast-Save Error:", error);

                    // --- CLEAN ERROR NOTIFICATION ---
                    // Will display the exact backend message (e.g., "Vous avez déjà sauvegardé ce lien.")
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "test.png",
                        title: "Omnisave - Information",
                        message: error.message
                    });

                    sendResponse({ success: false, error: error.message });
                }
            } else {
                sendResponse({ success: false, error: "Impossible de lire l'onglet actif." });
            }
        });

        return true; // Asynchronous response required for async/await in listener
    }
});