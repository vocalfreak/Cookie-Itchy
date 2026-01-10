document.getElementById('scrapeBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  const resultsDiv = document.getElementById('results');
  
  statusDiv.textContent = 'Scraping...';
  resultsDiv.textContent = '';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('ebwise.mmu.edu.my')) {
      statusDiv.textContent = 'Error: Please navigate to ebwise.mmu.edu.my first';
      return;
    }
    
    chrome.runtime.sendMessage({ action: 'scrapeEvents', tabId: tab.id }, (response) => {
      if (response && response.success) {
        statusDiv.textContent = `Success! Found ${response.events.length} events`;
        resultsDiv.textContent = JSON.stringify(response.events, null, 2);
      } else {
        statusDiv.textContent = `Error: ${response?.error || 'Unknown error'}`;
      }
    });
    
  } catch (error) {
    statusDiv.textContent = `Error: ${error.message}`;
  }
});

document.getElementById('syncCalendarBtn').addEventListener('click', async () => {
  const statusDiv = document.getElementById('status');
  
  try {
    const stored = await chrome.storage.local.get(['googleAccessToken']);
    
    if (!stored.googleAccessToken) {
      statusDiv.textContent = 'Opening Google authentication...';
      chrome.runtime.sendMessage({ action: 'startGoogleAuth' });
      return;
    }
    
    statusDiv.textContent = 'Syncing events to calendar...';
    chrome.runtime.sendMessage({ 
      action: 'syncToCalendar',
      accessToken: stored.googleAccessToken 
    }, (response) => {
      if (response.success) {
        statusDiv.textContent = ` Synced ${response.data.synced} events! (${response.data.failed} failed)`;
      } else {
        statusDiv.textContent = ` Sync failed: ${response.error}`;
      }
    });
    
  } catch (error) {
    statusDiv.textContent = `Error: ${error.message}`;
  }
});