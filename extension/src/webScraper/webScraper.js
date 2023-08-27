// Copyright (c) 2023 Marco Trulla <marco.trulla+dev@gmail.com>
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// ---- Page Scraping ----

function evalute(dom, xpath) {
  return document.evaluate(xpath, dom, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
}

function normalize(url) {
  return url.replace(/^.+\/webScraper\//i, '')
}

function getAlert(dom) {
  const sectionCursor = dom.querySelector('.al-news-ticker-bar') === null ? 3 : 4;
  // XPath: /html/body/section[3]/div/a/div
  const query = evalute(dom, `//section[${sectionCursor}]/div/a/div`);
  if (query.snapshotLength == 0) return 'unknown';
  return query.snapshotItem(0).className.split('al-msgbar-')[1] ?? 'unknown';
}
function getRisk(dom) {
  const sectionCursor = dom.querySelector('.al-news-ticker-bar') === null ? 3 : 4;
  // XPath: /html/body/section[3]/div/a/div/h1
  const query = evalute(dom, `//section[${sectionCursor}]/div/a/div/h1`);
  if (query.snapshotLength == 0) return 'unknown';
  return query.snapshotItem(0).innerText.toLocaleLowerCase() ?? 'unknown';
}
function getInfo(dom) {
  const sectionCursor = dom.querySelector('.al-news-ticker-bar') === null ? 3 : 4;
  // XPath: /html/body/section[3]/div/a/div/h2[2]
  const query = evalute(dom, `//section[${sectionCursor}]/div/a/div/h2[2]`);
  if (query.snapshotLength == 0) return 'unknown';
  return query.snapshotItem(0).innerText.toLocaleLowerCase() ?? 'unknown';
}
function getDate(dom) {
  const sectionCursor = dom.querySelector('.al-news-ticker-bar') === null ? 3 : 4;
  // XPath: /html/body/section[3]/div/a/div/h2[1]
  const query = evalute(dom, `//section[${sectionCursor}]/div/a/div/h2[1]`);
  if (query.snapshotLength == 0) return new Date().now();
  const re = /.*(?<day>\d{2}).(?<month>\d{2}).(?<year>\d{4}).*(?<hours>\d{2}):(?<minutes>\d{2})/;
  const { day, month, year, hours, minutes } = re.exec(query.snapshotItem(0).textContent).groups;
  return new Date(year, month - 1, day, hours, minutes).getTime();
}
function getLinks(dom) {
  const offsetCursor = dom.querySelector('.al-news-ticker-bar') === null ? 0 : 1;
  const links = {};

  // XPath: /html/body/section[5]/div/div/div/div[2]/div/div[6]/div/a
  const alertBulletin = evalute(dom, `//section[${5 + offsetCursor}]/div/div/div/div[2]/div/div[6]/div/a`);
  links['alert'] = alertBulletin.snapshotLength == 0 ? null : normalize(alertBulletin.snapshotItem(0).href);

  // XPath: /html/body/section[5]/div/div/div/div[3]/div/div[4]/div/a
  const forecastBulletin = evalute(dom, `//section[${5 + offsetCursor}]/div/div/div/div[3]/div/div[4]/div/a`);
  links['forecast'] = forecastBulletin.snapshotLength == 0 ? null : normalize(forecastBulletin.snapshotItem(0).href);

  // XPath: /html/body/section[4]/div/div[1]/div/div[2]/div/img
  const alertMap = evalute(dom, `//section[${4 + offsetCursor}]/div/div[1]/div/div[2]/div/img`);
  links['map'] = alertMap.snapshotLength == 0 ? null : normalize(alertMap.snapshotItem(0).src);

  return links;
}

// ---- Messaging SW <-> OSP -----
function successResponse(data) {
  return { target: "serviceworker", success: true, ...data };
}

function errorResponse(data) {
  return { target: "serviceworker", success: false, ...data };
}

function messagesHandler(message, sender, sendResponse) {
  if (sender.id !== chrome.runtime.id && message.target !== "webScraper") return;

  const dom = (new DOMParser()).parseFromString(message.data.html, 'text/html');

  try {
    switch (message.action) {
      case 'scrape': {
        const response = {
          alert: getAlert(dom),
          risk: getRisk(dom),
          info: getInfo(dom),
          date: getDate(dom),
          links: getLinks(dom),
        }
        sendResponse(successResponse({ response }));
      } break;

      default: {
        sendResponse(errorResponse({ error: "Invalid request" }));
      }
    }
  } catch (err) {
    chrome.runtime.sendMessage(errorResponse({ error: err.message }));
  }
}

chrome.runtime.onMessage.addListener(messagesHandler);