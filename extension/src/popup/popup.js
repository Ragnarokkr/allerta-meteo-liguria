const map = document.getElementById('map');
const actions = document.getElementById('actions');

const { lastUpdate } = await chrome.storage.local.get(['lastUpdate']);

// loads the alert map
const image = new Image();
image.src = lastUpdate.links.map;
map.appendChild(image);

// creates the action links
if (lastUpdate.links.alert) {
  const alertLink = document.createElement('a');
  alertLink.href = lastUpdate.links.alert;
  alertLink.textContent = chrome.i18n.getMessage('action_button1');
  alertLink.classList.add('action');
  actions.appendChild(alertLink);
}

if (lastUpdate.links.forecast) {
  const forecastLink = document.createElement('a');
  forecastLink.href = lastUpdate.links.forecast;
  forecastLink.textContent = chrome.i18n.getMessage('action_button2');
  forecastLink.classList.add('action');
  actions.appendChild(forecastLink);
}

// listens for clicks on the action links    
actions.addEventListener('click', (event) => {
  if (event.target.tagName === 'A') {
    event.preventDefault();
    chrome.tabs.create({ url: event.target.href });
  }
})
