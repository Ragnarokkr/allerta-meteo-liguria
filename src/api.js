async function parsePage(html) {
  const parser = new DOMParser();
  return parser.parseFromString(html, "text/html");
}

function getAlertMap(dom) {
  return dom.querySelector("#al-map-liguria-panel img")?.src ?? "";
}

function mapStatusToColor(status) {
  switch ("vgar".indexOf(status.toLowerCase())) {
    case 0:
      return "green";
    case 1:
      return "yellow";
    case 2:
      return "orange";
    case 3:
      return "red";
    default:
      return "error";
  }
}

function getZonesStatus(dom) {
  const alertMap = getAlertMap(dom);
  if (alertMap) {
    const matching = alertMap.match(
      /(?<zoneA>[vgar])_(?<zoneB>[vgar])_(?<zoneC>[vgar])_(?<zoneD>[vgar])_(?<zoneE>[vgar])\.(?:png|jpg|webp)$/i
    );
    if (matching) {
      return {
        zoneA: mapStatusToColor(matching.groups.zoneA),
        zoneB: mapStatusToColor(matching.groups.zoneB),
        zoneC: mapStatusToColor(matching.groups.zoneC),
        zoneD: mapStatusToColor(matching.groups.zoneD),
        zoneE: mapStatusToColor(matching.groups.zoneE),
      };
    } else {
      return {};
    }
  }
}

function successResponse(data) {
  return { target: "serviceworker", success: true, ...data };
}

function errorResponse(data) {
  return { target: "serviceworker", success: false, ...data };
}

async function messagesHandler(message, sender, sendResponse) {
  if (sender.id !== chrome.runtime.id && message.target !== "api") return;

  try {
    switch (message.action) {
      case "get_alert_map":
        {
          const dom = await parsePage(message.data.html);
          const mapPath = new URL(getAlertMap(dom)).pathname;
          sendResponse(successResponse({ alertMap: mapPath }));
        }
        break;
      case "get_zones_status":
        {
          const dom = await parsePage(message.data.html);
          const statuses = getZonesStatus(dom);
          sendResponse(successResponse({ zones: statuses }));
        }
        break;
      default: {
        sendResponse(errorResponse({ error: "Invalid request" }));
      }
    }
  } catch (err) {
    chrome.runtime.sendMessage(errorResponse({ error: err.message }));
  }
}

chrome.runtime.onMessage.addListener(messagesHandler);
