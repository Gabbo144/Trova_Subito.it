document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("toggleHideSold");
    chrome.storage.sync.get("hideSold", (data) => {
      toggle.checked = data.hideSold;
    });
  
    toggle.addEventListener("change", () => {
      chrome.storage.sync.set({ hideSold: toggle.checked });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: () => location.reload()
          });
        }
      });
    });
  });