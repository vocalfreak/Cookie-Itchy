chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeEvents') {
    chrome.scripting.executeScript({
      target: { tabId: request.tabId },
      files: ['content.js']
    }).then(() => {
      chrome.tabs.sendMessage(request.tabId, { action: 'fetchEvents' }, (response) => {
        sendResponse(response);
      });
    });
    return true;
  }
  
  if (request.action === 'eventsScraped') {
    chrome.storage.local.set({ events: request.events });
  }

  if (request.action === 'saveToBackend') {
    fetch('https://cookie-itchy-production.up.railway.app/events/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: request.events })
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Saved to API:', data);
      chrome.storage.local.set({ events: request.events });
      sendResponse({ success: true, data });
    })
    .catch(err => {
      console.error('API Error:', err);
      sendResponse({ success: false, error: err.message });
    });
    return true; 
  }
});