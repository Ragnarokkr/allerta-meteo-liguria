// Copyright (c) 2023 Marco Trulla <marco.trulla+dev@gmail.com>
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const map = document.getElementById('map');
const actionsPrimary = document.getElementById('actions-primary');
const actionsSecondary = document.getElementById('actions-secondary');

const { settings } = await chrome.storage.local.get(['settings']);
const { lastUpdate } = await chrome.storage.local.get(['lastUpdate']);

// loads the alert map
const image = new Image();
image.src = lastUpdate.links.map;
map.appendChild(image);

// creates action links
const civProtLink = document.createElement('a');
civProtLink.href = settings.scrapeWebPageURL;
civProtLink.textContent = chrome.i18n.getMessage('notification_button1');
civProtLink.classList.add('action');
actionsPrimary.appendChild(civProtLink);

const arpalLink = document.createElement('a');
arpalLink.href = settings.arpalWebsite;
arpalLink.textContent = chrome.i18n.getMessage('notification_button2');
arpalLink.classList.add('action');
actionsPrimary.appendChild(arpalLink);

if (lastUpdate.links.alert) {
  const alertLink = document.createElement('a');
  alertLink.href = lastUpdate.links.alert;
  alertLink.textContent = chrome.i18n.getMessage('action_button1');
  alertLink.classList.add('action');
  actionsSecondary.appendChild(alertLink);
}

if (lastUpdate.links.forecast) {
  const forecastLink = document.createElement('a');
  forecastLink.href = lastUpdate.links.forecast;
  forecastLink.textContent = chrome.i18n.getMessage('action_button2');
  forecastLink.classList.add('action');
  actionsSecondary.appendChild(forecastLink);
}

// listens for clicks on the action links    
[actionsPrimary, actionsSecondary]
  .forEach(elm => elm.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') {
      event.preventDefault();
      chrome.tabs.create({ url: event.target.href });
    }
  }));
