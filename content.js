// Variabile globale per contare gli elementi rimossi
let totalRemoved = 0;

function updateCounter() {
  let counterDiv = document.getElementById("removedCount");
  if (!counterDiv) {
    counterDiv = document.createElement("div");
    counterDiv.id = "removedCount";
    counterDiv.style.backgroundColor = "#ffeb3b";
    counterDiv.style.padding = "5px";
    counterDiv.style.fontWeight = "bold";
    document.body.insertBefore(counterDiv, document.body.firstChild);
  }
  counterDiv.textContent = "Annunci eliminati: " + totalRemoved;
}

function hideSoldItems() {
  chrome.storage.sync.get("hideSold", (data) => {
    if (!data.hideSold) return;
    let removedCount = 0;
    document.querySelectorAll(".ItemListContainer_container__D_wWL").forEach(container => {
      container.querySelectorAll(".item-sold-badge").forEach(badge => {
        let parentItem = badge.closest(".items__item");
        if (parentItem) {
          parentItem.remove();
          removedCount++;
        }
      });
    });
    totalRemoved += removedCount;
    updateCounter();
  });
}

new MutationObserver(hideSoldItems).observe(document.body, { childList: true, subtree: true });
hideSoldItems();