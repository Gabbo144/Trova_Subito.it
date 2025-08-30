// Variabili globali per contare gli elementi rimossi
let totalRemoved = 0;
let priceFilteredCount = 0;

// Funzione per creare l'interfaccia del filtro di prezzo
// Funzione per creare l'interfaccia del filtro di prezzo
function createPriceFilter() {
  let filterDiv = document.getElementById("priceFilterContainer");
  if (!filterDiv) {
    filterDiv = document.createElement("div");
    filterDiv.id = "priceFilterContainer";
    filterDiv.style.backgroundColor = "#f5f5f5";
    filterDiv.style.padding = "10px";
    filterDiv.style.marginBottom = "10px";
    filterDiv.style.borderRadius = "5px";
    filterDiv.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
    
    const html = `
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 10px;">
        <strong style="margin-right: 10px;">Filtro Prezzo:</strong>
        <div>
          <label for="minPrice">Min €:</label>
          <input type="number" id="minPrice" min="0" style="width: 80px; margin-right: 10px;">
        </div>
        <div>
          <label for="maxPrice">Max €:</label>
          <input type="number" id="maxPrice" min="0" style="width: 80px;">
        </div>
        <button id="applyPriceFilter" style="background-color: #66bb6a; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Applica</button>
        <button id="resetPriceFilter" style="background-color: #ff9800; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-left: 5px;">Reset</button>
      </div>
      <div id="priceFilteredCount" style="margin-top: 5px; margin-bottom: 10px; font-weight: bold; color: #ff5722;"></div>
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px;">
        <strong style="margin-right: 10px;">Vai alla pagina:</strong>
        <input type="number" id="pageNumber" min="1" style="width: 60px;">
        <button id="goToPage" style="background-color: #2196f3; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Vai</button>
      </div>
    `;
    
    filterDiv.innerHTML = html;
    document.body.insertBefore(filterDiv, document.body.firstChild);
    
    // Recupera valori salvati
    chrome.storage.sync.get(["minPrice", "maxPrice"], (data) => {
      if (data.minPrice) document.getElementById("minPrice").value = data.minPrice;
      if (data.maxPrice) document.getElementById("maxPrice").value = data.maxPrice;
    });
    
    // Eventi per i pulsanti del filtro prezzo
    document.getElementById("applyPriceFilter").addEventListener("click", () => {
      const minPrice = document.getElementById("minPrice").value;
      const maxPrice = document.getElementById("maxPrice").value;
      chrome.storage.sync.set({ minPrice, maxPrice });
      filterItems();
    });
    
    document.getElementById("resetPriceFilter").addEventListener("click", () => {
      document.getElementById("minPrice").value = "";
      document.getElementById("maxPrice").value = "";
      chrome.storage.sync.set({ minPrice: "", maxPrice: "" });
      filterItems();
    });
    
    // Eventi per i controlli di navigazione
    document.getElementById("goToPage").addEventListener("click", () => {
      const pageNumber = document.getElementById("pageNumber").value;
      if (pageNumber && parseInt(pageNumber) > 0) {
        navigateToPage(parseInt(pageNumber));
      }
    });
    
    // Permetti di premere "Enter" nel campo pagina per navigare
    document.getElementById("pageNumber").addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        const pageNumber = document.getElementById("pageNumber").value;
        if (pageNumber && parseInt(pageNumber) > 0) {
          navigateToPage(parseInt(pageNumber));
        }
      }
    });
  }
}

function navigateToPage(pageNumber) {
  const currentUrl = window.location.href;
  let newUrl;
  
  // Verifica se l'URL contiene già un parametro di paginazione
  if (currentUrl.includes('&o=')) {
    newUrl = currentUrl.replace(/&o=\d+/, `&o=${pageNumber}`);
  } else {
    // Aggiungi il parametro di paginazione se non esiste
    newUrl = currentUrl + `&o=${pageNumber}`;
  }
  
  // Naviga alla nuova URL
  window.location.href = newUrl;
}

function updateCounters() {
  let soldCounterDiv = document.getElementById("removedCount");
  if (!soldCounterDiv) {
    soldCounterDiv = document.createElement("div");
    soldCounterDiv.id = "removedCount";
    soldCounterDiv.style.backgroundColor = "#ffeb3b";
    soldCounterDiv.style.padding = "5px";
    soldCounterDiv.style.fontWeight = "bold";
    soldCounterDiv.style.marginBottom = "5px";
    document.body.insertBefore(soldCounterDiv, document.body.firstChild);
  }
  soldCounterDiv.textContent = "Annunci venduti eliminati: " + totalRemoved;

  let priceCounterDiv = document.getElementById("priceFilteredCount");
  if (priceCounterDiv) {
    priceCounterDiv.textContent = "Annunci filtrati per prezzo: " + priceFilteredCount;
  }
}

// Funzione per estrarre il prezzo da un elemento
function extractPrice(item) {
  const priceElement = item.querySelector(".index-module_price__N7M2x, .SmallCard-module_price__yERv7");
  if (!priceElement) return null;
  
  // Estrai il testo del prezzo e rimuovi caratteri non numerici
  const priceText = priceElement.textContent.trim();
  const priceMatch = priceText.match(/(\d+[.,]?\d*)/);
  if (priceMatch) {
    return parseFloat(priceMatch[0].replace(',', '.'));
  }
  return null;
}

// Funzione per nascondere gli annunci pubblicitari
// Funzione per nascondere gli annunci pubblicitari
function hideAdvertisements() {
  // Nascondi i container esterni delle pubblicità
  document.querySelectorAll(".SmartAdvItem_smart-adv-lira-wrapper___x_Ad").forEach(wrapper => {
    wrapper.style.display = "none";
  });
  
  // Nascondi i container delle pubblicità
  document.querySelectorAll(".index-module_lira-container__Nwzwo").forEach(container => {
    container.style.display = "none";
  });
  
  // Nascondi gli elementi item delle pubblicità
  document.querySelectorAll(".index-module_lira-item__yrwA6").forEach(item => {
    item.style.display = "none";
  });
  
  // Nascondi i placeholder delle pubblicità
  document.querySelectorAll(".index-module_lira-placeholder__XIz3d").forEach(placeholder => {
    placeholder.style.display = "none";
  });
}

// Funzione principale per filtrare gli elementi
function filterItems() {
  chrome.storage.sync.get(["hideSold", "minPrice", "maxPrice"], (data) => {
    let removedSoldCount = 0;
    let removedPriceCount = 0;
    
    // Resetta il contatore per il filtro prezzo
    priceFilteredCount = 0;
    
    const minPrice = data.minPrice ? parseFloat(data.minPrice) : null;
    const maxPrice = data.maxPrice ? parseFloat(data.maxPrice) : null;
    
    document.querySelectorAll(".ItemListContainer_container__D_wWL").forEach(container => {
      // Ottieni tutti gli elementi annuncio
      const items = container.querySelectorAll(".items__item");
      
      items.forEach(item => {
        const isSold = item.querySelector(".item-sold-badge") !== null;
        const price = extractPrice(item);
        let shouldRemove = false;
        
        // Verifica se nascondere per venduti
        if (data.hideSold && isSold) {
          shouldRemove = true;
          removedSoldCount++;
        }
        
        // Verifica se nascondere per filtro prezzo
        if (!shouldRemove && price !== null) {
          if ((minPrice !== null && price < minPrice) || (maxPrice !== null && price > maxPrice)) {
            if (minPrice !== null || maxPrice !== null) {
              shouldRemove = true;
              removedPriceCount++;
            }
          }
        }
        
        // Applica le modifiche
        if (shouldRemove) {
          item.style.display = "none";
        } else {
          item.style.display = ""; // Ripristina la visualizzazione se necessario
        }
      });
    });
    
    // Nascondi gli elementi pubblicitari
    hideAdvertisements();
    
    totalRemoved = removedSoldCount;
    priceFilteredCount = removedPriceCount;
    updateCounters();
    
    // Applica il compattamento dopo il filtro
    compactView();
  });
}

// Inizializzazione
function init() {
  createPriceFilter();
  filterItems();
  
  // Osserva cambiamenti nel DOM
  const observer = new MutationObserver(() => {
    createPriceFilter();
    filterItems();
    hideAdvertisements(); // Assicuriamoci che le pubblicità vengano nascoste anche dopo i cambiamenti del DOM
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

// Funzione per compattare la visualizzazione dopo la rimozione degli elementi
function compactView() {
  // Trova tutti i contenitori principali degli annunci
  document.querySelectorAll(".ItemListContainer_container__D_wWL").forEach(container => {
    // Aggiungi una classe personalizzata per il layout
    container.classList.add("compacted-view");
    
    // Aggiungi uno stile personalizzato se necessario
    if (!document.getElementById("compact-style")) {
      const style = document.createElement("style");
      style.id = "compact-style";
      style.textContent = `
        .compacted-view .items__item {
          margin-bottom: 8px !important;
        }
        .compacted-view > div {
          gap: 8px !important;
          display: flex !important;
          flex-wrap: wrap !important;
        }
        /* Rimuovi tutti gli spazi vuoti tra gli elementi */
        .index-module_lira-container__Nwzwo,
        .SmartAdvItem_smart-adv-lira-wrapper___x_Ad,
        .index-module_lira-placeholder__XIz3d,
        .index-module_lira-item__yrwA6 {
          display: none !important;
          margin: 0 !important;
          padding: 0 !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
        }
        
        /* Forza il re-layout dei contenitori */
        .ItemListContainer_container__D_wWL .items-container {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 8px !important;
        }
      `;
      document.head.appendChild(style);
    }
  });
  
  // Pulizia aggiuntiva: rimuovi elementi pubblicitari e relativi container
  document.querySelectorAll(".index-module_lira-container__Nwzwo, .SmartAdvItem_smart-adv-lira-wrapper___x_Ad").forEach(elem => {
    // Rimuovi completamente invece di nascondere
    elem.remove();
  });
}

// Aggiungi la chiamata a compactView nell'init e nel MutationObserver
function init() {
  createPriceFilter();
  filterItems();
  compactView();
  
  // Osserva cambiamenti nel DOM
  const observer = new MutationObserver(() => {
    createPriceFilter();
    filterItems();
    hideAdvertisements();
    compactView();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

// Avvia la funzionalità
init();