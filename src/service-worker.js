// Toggle the side panel when the user clicks the extension icon.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

function setActiveTabUrl(tabId) {
  if (!tabId) return;
  chrome.tabs.get(tabId, function(tab) {
    if (tab && tab.url) {
      chrome.storage.session.set({['active-tab-url']: tab.url});
    }
  });
}

// Set the active-tab-url in the session storage whenever the active tab
// changes.
chrome.tabs.onActivated.addListener(({tabId}) => setActiveTabUrl(tabId));

// Set the active-tab-url key in the session storage whenever a tab is updated.
// TODO: only set the active-tab-url key when the active tab is updated.
chrome.tabs.onUpdated.addListener(async () => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    if (tabs.length === 0) return;
    setActiveTabUrl(tabs[0].id);
  });
});