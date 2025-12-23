const BASE_URL = "https://ebwise.mmu.edu.my";
const API_ENDPOINT = "/lib/ajax/service.php";

function extractSesskey() {
  try {
    if (typeof M !== "undefined" && M.cfg && M.cfg.sesskey) {
      return M.cfg.sesskey;
    }

    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
      if (script.textContent.includes('sesskey')) {
        const match = script.textContent.match(/["']sesskey["']\s*:\s*["']([^"']+)["']/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
      
    return null;
  } catch (error) {
      console.error("Error extracting sesskey:", error);
      return null;
  }
}

function buildEventPayload(limitnum = 50) {
  return [{
    index: 0,
    methodname: "core_calendar_get_action_events_by_timesort",
    args: {
      limitnum,
      timesortfrom: Math.floor(Date.now() / 1000),
      limittononsuspendedevents: true
    }
  }];
}

async function makeApiRequest(sesskey, method, payload) {
  const url = `${BASE_URL}${API_ENDPOINT}?sesskey=${sesskey}&info=${method}`;

  try {
    const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/javascript, */*; q=0.01",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`API request failed: ${error.message}`);
  }
}

async function fetchCalendarEvents() {
  const sesskey = extractSesskey();
  const payload = buildEventPayload();
  const data = await makeApiRequest(sesskey, 'core_calendar_get_action_events_by_timesort', payload);

  if (data && data[0] && !data[0].error) {
    return { success: true, events: data[0].data.events || [] };
  }

  throw new Error(data[0]?.exception?.message || 'Unknown error');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchEvents') {
    fetchCalendarEvents()
      .then(result => {
        chrome.runtime.sendMessage({ action: 'eventsScraped', events: result.events });
        
        fetch('https://cookie-itchy-production.up.railway.app/events/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: result.events })
        })
        .then(res => res.json())
        .then(data => console.log(' Saved to API:', data))
        .catch(err => console.error(' API Error:', err));
        
        sendResponse(result);
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});