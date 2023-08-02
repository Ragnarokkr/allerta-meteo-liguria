const MIN_INTERVAL = 5 * 60 * 1000;
const MAX_INTERVAL = 60 * 60 * 1000;

const form = document.getElementById('options');
const submit = document.getElementById('submit');
const dialog = document.getElementById('dialog');
const manifest = chrome.runtime.getManifest();
const license = fetch(chrome.runtime.getURL('license.txt'));

async function updateForm(form) {
  submit.setAttribute('disabled', '');
  const { settings } = await chrome.storage.local.get(['settings']);

  form['urlAlert'].value = settings.scrapeWebPageURL;
  form['urlArpal'].value = settings.arpalWebsite;
  form['updateInterval'].value = settings.updateTimeInterval / 60 / 1000;
  submit.removeAttribute('disabled');
}

function updateHTML() {
  Array.from(document.querySelectorAll('[data-ref="title"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_title', manifest.name);
  });

  // Settings
  Array.from(document.querySelectorAll('[data-ref="caption-settings"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_captionSettings');
  });

  Array.from(document.querySelectorAll('[data-ref="settings-urlAlert"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_settings_urlAlert');
  });
  Array.from(document.querySelectorAll('[data-ref="settings-urlAlert-help"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_settings_urlAlert_help');
  });

  Array.from(document.querySelectorAll('[data-ref="settings-urlArpal"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_settings_urlArpal');
  });
  Array.from(document.querySelectorAll('[data-ref="settings-urlArpal-help"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_settings_urlArpal_help');
  });

  Array.from(document.querySelectorAll('[data-ref="settings-updateInterval"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_settings_updateInterval');
  });
  Array.from(document.querySelectorAll('[data-ref="settings-updateInterval-help"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_settings_updateInterval_help', [5, 60]);
  });

  Array.from(document.querySelectorAll('[data-ref="settings-submit"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_settings_submit');
  });

  // About
  Array.from(document.querySelectorAll('[data-ref="caption-about"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_captionAbout');
  });

  Array.from(document.querySelectorAll('[data-ref="version"]')).forEach(item => {
    item.innerText = manifest.version;
  });

  Array.from(document.querySelectorAll('[data-ref="about-text"]')).forEach(item => {
    item.innerText = manifest.description;
  });

  // Disclaimer
  Array.from(document.querySelectorAll('[data-ref="caption-disclaimer"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_captionDisclaimer');
  });

  Array.from(document.querySelectorAll('[data-ref="disclaimer-text"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_disclaimer_text');
  });

  // License
  Array.from(document.querySelectorAll('[data-ref="caption-license"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_captionLicense');
  });

  Array.from(document.querySelectorAll('[data-ref="license"]')).forEach(async item => {
    item.innerText = (await (await license).text());
  });

  // Error reports
  Array.from(document.querySelectorAll('[data-ref="caption-reports"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_captionReports');
  });

  Array.from(document.querySelectorAll('[data-ref="reports-text"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_reports_text');
  });

  // Dialog
  Array.from(document.querySelectorAll('[data-ref="settings-dialog-saved"]')).forEach(item => {
    item.innerText = chrome.i18n.getMessage('options_settings_dialog_saved');
  });

}

form.addEventListener('submit', async e => {
  e.preventDefault();

  const formData = new FormData(e.target);

  const settings = {
    scrapeWebPageURL: formData.get('urlAlert'),
    arpalWebsite: formData.get('urlArpal'),
    updateTimeInterval: parseInt(formData.get('updateInterval')) * 60 * 1000,
  };

  submit.setAttribute('disabled', '');
  if (settings.updateTimeInterval >= MIN_INTERVAL && settings.updateTimeInterval <= MAX_INTERVAL) {
    await chrome.storage.local.set({ settings });
    submit.removeAttribute('disabled');
    dialog.showModal();
    setTimeout(() => { dialog.close() }, 5000);
  }
});

updateHTML();
updateForm(form);
