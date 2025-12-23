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