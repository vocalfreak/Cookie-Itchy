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
});