// Listen for messages from the React popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'FAST_SAVE') {

        // 1. Query Chrome for the currently active tab in the current window
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];

            if (activeTab) {
                const pageUrl = activeTab.url;
                const pageTitle = activeTab.title;
                const userToken = request.token; // The JWT passed from React

                console.log("Intercepted URL:", pageUrl);
                console.log("Page Title:", pageTitle);

                // TODO in next step: Send this data to Flask backend using the token

                // 2. Reply to React popup that we got the URL successfully
                sendResponse({
                    success: true,
                    url: pageUrl,
                    message: "URL captured successfully"
                });
            } else {
                sendResponse({
                    success: false,
                    error: "Could not read active tab."
                });
            }
        });

        // 3. Return true to indicate we will respond asynchronously
        return true;
    }
});