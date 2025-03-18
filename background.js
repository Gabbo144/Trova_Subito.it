chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ hideSold: true });
  console.log("Subito Hide Sold Items installed");
});