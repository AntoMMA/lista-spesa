/* -------------- FIREBASE CONFIG (LA TUA) -------------- */
const firebaseConfig = {
  apiKey: "AIzaSyCPHLvSRBt40Wloa0nnnAp5LVdUIOb9J40",
  authDomain: "lista-spesa-db7f7.firebaseapp.com",
  projectId: "lista-spesa-db7f7",
  storageBucket: "lista-spesa-db7f7.firebasestorage.app",
  messagingSenderId: "736757613454",
  appId: "1:736757613454:web:50744d7ce9db9d3ebc5adf",
  measurementId: "G-64QH2WHH2X"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function saveCatalogFirestore() {
  try {
    // Ordina il catalogo prima di salvarlo per mantenere l'ordine
    const sortedCatalogo = catalogo.sort((a, b) => a.nome.localeCompare(b.nome));
    await db.collection("catalogo").doc("prodotti").set({ items: sortedCatalogo });
    console.log("Catalogo aggiornato su Firestore");
  } catch (err) {
    console.error("Errore salvataggio catalogo:", err);
  }
}

/* -------------- CATALOGO PREIMPOSTATO -------------- */
const catalogo = [
  { categoria: "Frutta", nome: "Mele" },
  { categoria: "Frutta", nome: "Banane" },
  { categoria: "Frutta", nome: "Arance" },
  { categoria: "Frutta", nome: "Pere" },

  { categoria: "Verdura", nome: "Pomodori" },
  { categoria: "Verdura", nome: "Insalata" },
  { categoria: "Verdura", nome: "Zucchine" },
  { categoria: "Verdura", nome: "Patate" },

  { categoria: "Carne", nome: "Petto di pollo" },
  { categoria: "Carne", nome: "Pollo intero" },
  { categoria: "Carne", nome: "Manzo macinato" },

  { categoria: "Pesce", nome: "Salmone" },
  { categoria: "Pesce", nome: "Filetti di merluzzo" },
  { categoria: "Pesce", nome: "Tonno in scatola" },

  { categoria: "Cibo confezionato", nome: "Pasta" },
  { categoria: "Cibo confezionato", nome: "Riso" },
  { categoria: "Cibo confezionato", nome: "Farina" },
  { categoria: "Cibo confezionato", nome: "Biscotti" },

  { categoria: "Bevande", nome: "Acqua naturale" },
  { categoria: "Bevande", nome: "Acqua frizzante" },
  { categoria: "Bevande", nome: "Coca Cola" },
  { categoria: "Bevande", nome: "Succo d'arancia" },

  { categoria: "Snack", nome: "Patatine" },
  { categoria: "Snack", nome: "Noci" },

  { categoria: "Pulizia", nome: "Detersivo piatti" },
  { categoria: "Pulizia", nome: "Ammorbidente" },
  { categoria: "Pulizia", nome: "Spugne" },

  { categoria: "Casa", nome: "Carta igienica" },
  { categoria: "Casa", nome: "Sacchi immondizia" }
];

/* -------------- ELEMENTI DOM -------------- */
const catalogList = document.getElementById("catalogList");
const searchInput = document.getElementById("searchInput");
const manualInput = document.getElementById("manualInput");
const addManualBtn = document.getElementById("addManualBtn");
const shoppingItemsEl = document.getElementById("shoppingItems");
const itemCountEl = document.getElementById("itemCount");
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");
const clearBtn = document.getElementById("clearBtn");
const savedListsEl = document.getElementById("savedLists");
const pdfNoteContainer = document.getElementById("pdfNoteContainer");
const pdfNoteInput = document.getElementById("pdfNoteInput");
const pdfNoteConfirmBtn = document.getElementById("pdfNoteConfirmBtn");

let pdfNote = ""; // variabile globale che terrà il testo da inserire nel PDF
/* -------------- STATO -------------- */
let shopping = []; // array di oggetti {nome, qty, done}

function showPDFNoteInput(callback) {
  pdfNoteContainer.style.display = "block";
  pdfNoteInput.value = pdfNote; // mostra eventuale testo precedente
  pdfNoteInput.focus();

  const confirmHandler = () => {
    pdfNote = pdfNoteInput.value.trim();
    pdfNoteContainer.style.display = "none";
    pdfNoteConfirmBtn.removeEventListener("click", confirmHandler);
    callback();
  };
  
  // Rimuovi eventuali listener precedenti e aggiungi il nuovo
  pdfNoteConfirmBtn.onclick = null;
  pdfNoteConfirmBtn.addEventListener("click", confirmHandler);
}

/* -------------- UTILITY: persistenza locale -------------- */
// salva automaticamente in localStorage per mantenere la lista tra refresh
function persistLocal() {
  try { localStorage.setItem("shopping_local_v1", JSON.stringify(shopping)); } catch(e){}
}
function restoreLocal() {
  try {
    const s = localStorage.getItem("shopping_local_v1");
    if (s) { shopping = JSON.parse(s); } // non chiamare renderShopping qui, sarà chiamato dopo.
  } catch(e){}
}

/* -------------- FUNZIONI UI -------------- */

// Sovrascritta per includere l'aggiornamento del count e la persistenza locale
const originalRenderShopping = function() {
  shoppingItemsEl.innerHTML = "";
  shopping.forEach((it, i) => {
    const li = document.createElement("li");
    li.classList.toggle("done", it.done); // Aggiunge/Rimuove la classe CSS .done
    
    li.innerHTML = `
      <div class="left">
        <input type="checkbox" ${it.done ? "checked" : ""} data-index="${i}" />
        <div>
          <div class="name">${it.nome}</div>
          <div class="qty">Quantità: ${it.qty}</div>
        </div>
      </div>
      <div class="right">
        <button data-action="dec" data-index="${i}">-</button>
        <button data-action="inc" data-index="${i}">+</button>
        <button data-action="del" data-index="${i}">✖</button>
      </div>
    `;
    
    // Gestione eventi: l'indice viene gestito tramite data-attribute
    li.querySelector('input[type="checkbox"]').addEventListener("change", e => {
      const idx = +e.target.dataset.index;
      shopping[idx].done = e.target.checked;
      renderShopping(); // Ricarica la lista per applicare lo stile .done
    });
    li.querySelector('button[data-action="dec"]').addEventListener("click", e => {
      const idx = +e.target.dataset.index;
      if (shopping[idx].qty > 1) shopping[idx].qty--;
      else shopping.splice(idx,1); // Rimuovi se qty è 1 e decresce
      renderShopping();
    });
    li.querySelector('button[data-action="inc"]').addEventListener("click", e => {
      const idx = +e.target.dataset.index;
      shopping[idx].qty++;
      renderShopping();
    });
    li.querySelector('button[data-action="del"]').addEventListener("click", e => {
      const idx = +e.target.dataset.index;
      shopping.splice(idx,1);
      renderShopping();
    });
    
    shoppingItemsEl.appendChild(li);
  });
  
  updateCount();
  persistLocal(); // Salva dopo ogni modifica alla lista
};

// Funzione globale che viene utilizzata
function renderShopping() {
    originalRenderShopping();
}


function renderCatalog(items) {
  // raggruppa per categoria
  const groups = items.reduce((acc, cur) => {
    (acc[cur.categoria] = acc[cur.categoria] || []).push(cur);
    return acc;
  }, {});
  catalogList.innerHTML = "";
  
  // Ordina le categorie
  const sortedCategories = Object.keys(groups).sort((a,b) => {
    // Mette la categoria "Altro" alla fine
    if (a === "Altro") return 1;
    if (b === "Altro") return -1;
    return a.localeCompare(b);
  });
  
  for (const cat of sortedCategories) {
    const section = document.createElement("div");
    section.className = "cat-section";
    section.innerHTML = `<div class="cat-title">${cat}</div>`;
    
    // Ordina i prodotti all'interno della categoria
    groups[cat].sort((a, b) => a.nome.localeCompare(b.nome)).forEach(prod => {
      const el = document.createElement("div");
      el.className = "prod";
      // CORREZIONE: Aggiunto l'elemento .meta come previsto dal CSS
      el.innerHTML = `<div class="meta"><strong>${prod.nome}</strong><small>${prod.categoria}</small></div><div class="add">+</div>`;
      el.addEventListener("click", () => addItemToShopping(prod.nome));
      section.appendChild(el);
    });
    catalogList.appendChild(section);
  }
}

function addItemToShopping(name) {
  // se esiste incrementa qty
  const idx = shopping.findIndex(s => s.nome.toLowerCase() === name.toLowerCase());
  if (idx >= 0) {
    shopping[idx].qty += 1;
  } else {
    // Aggiungi un nuovo articolo non spuntato
    shopping.push({ nome: name, qty: 1, done: false });
  }
  renderShopping();
}

function updateCount() {
  const total = shopping.reduce((s, it) => s + it.qty, 0);
  itemCountEl.textContent = total;
}

/* -------------- FIRESTORE: SALVA / CARICA / ELIMINA -------------- */
async function saveList() {
  if (shopping.length === 0) {
    alert("La lista è vuota — aggiungi almeno un articolo.");
    return;
  }
  try {
    // Ordina la lista da salvare: prima non spuntati, poi spuntati
    const listToSave = [...shopping].sort((a, b) => (a.done === b.done) ? 0 : a.done ? 1 : -1);
    
    const doc = await db.collection("liste_spesa").add({
      items: listToSave,
      createdAt: firebase.firestore.FieldValue.serverTimestamp() // Usa il timestamp del server
    });
    alert("Lista salvata su Firestore!");
    loadLists(); // aggiorna elenco salvato
  } catch (err) {
    console.error(err);
    alert("Errore nel salvataggio: " + (err.message || err));
  }
}

async function loadLists() {
  try {
    const snapshot = await db.collection("liste_spesa").orderBy("createdAt", "desc").limit(30).get();
    savedListsEl.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const id = doc.id;
      const div = document.createElement("div");
      div.className = "saved-item";
      // Gestione sicura del campo data che può essere un oggetto Firebase Timestamp o un oggetto Data JS
      const date = (data.createdAt && data.createdAt.toDate) ? data.createdAt.toDate() : new Date();
      div.innerHTML = `
        <div>
          <div><strong>${date.toLocaleString()}</strong></div>
          <div class="meta">${(data.items || []).length} articoli</div>
        </div>
        <div class="btns">
          <button class="button" data-load="${id}">Carica</button>
          <button class="button danger" data-delete="${id}">Elimina</button>
        </div>
      `;
      div.querySelector('[data-load]').addEventListener("click", async () => {
        shopping = (data.items || []).map(x => ({ ...x })); // clone profonda
        renderShopping();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      div.querySelector('[data-delete]').addEventListener("click", async () => {
        if (!confirm("Eliminare questa lista definitivamente?")) return;
        try {
          await db.collection("liste_spesa").doc(id).delete();
          div.remove();
        } catch (err) {
          alert("Errore eliminazione: " + (err.message || err));
        }
      });
      savedListsEl.appendChild(div);
    });
    if (!savedListsEl.hasChildNodes()) savedListsEl.innerHTML = "<div style='color:var(--muted-color);padding:8px'>Nessuna lista salvata</div>";
  } catch (err) {
    console.error(err);
    alert("Errore nel caricamento: " + (err.message || err));
  }
}


/* -------------- PDF: FUNZIONI UTILITY -------------- */

/**
 * Costruisce l'array di linee per il PDF, raggruppando gli articoli per categoria.
 * @returns {string[]} Un array di stringhe, dove ogni stringa è una riga del PDF.
 */
function buildPDFContent() {
  if (shopping.length === 0) return ["Lista vuota"];

  // 1. Raggruppa per categoria
  const grouped = shopping.reduce((acc, item) => {
    const category = catalogo.find(c => c.nome.toLowerCase() === item.nome.toLowerCase())?.categoria || "Altro";
    (acc[category] = acc[category] || []).push(item);
    return acc;
  }, {});

  const lines = [];
  
  // 2. Ordina categorie (Altro per ultimo)
  const sortedCategories = Object.keys(grouped).sort((a,b) => {
    if (a === "Altro") return 1;
    if (b === "Altro") return -1;
    return a.localeCompare(b);
  });

  // 3. Formatta le linee
  for (const cat of sortedCategories) {
    lines.push(`-- ${cat.toUpperCase()} --`); // Inizio categoria
    grouped[cat].forEach(item => {
      const checkbox = item.done ? "[X]" : "[ ]";
      lines.push(`${checkbox} ${item.nome} x${item.qty}`);
    });
    lines.push(""); // Spazio dopo ogni categoria
  }
  
  return lines;
}

/* -------------- PDF: DOWNLOAD E SHARE -------------- */

function downloadStyledPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 30; // Coordinata Y iniziale per il contenuto

  // sfondo pagina
  doc.setFillColor(15, 23, 36);
  doc.rect(0, 0, 210, 297, "F");

  // titolo
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("🛒 Lista della Spesa", 105, 12, { align: "center" });

  // aggiungi testo personalizzato in cima al PDF, se presente
  if(pdfNote){
    doc.setFontSize(14);
    doc.setTextColor(255,200,50); // colore a contrasto
    doc.text(pdfNote, 14, y);
    y += 12; // lascia un po' di spazio tra testo e lista
  }
    
  // contenuto
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255); // Reset colore testo per la lista
  const lines = buildPDFContent();
  lines.forEach(line => {
    // Se è un titolo di categoria, usa un colore diverso
    if (line.startsWith("--")) {
        doc.setTextColor(0, 255, 255); // Ciano per le categorie
        doc.text(line, 14, y);
        doc.setTextColor(255, 255, 255); // Reset
    } else {
        doc.text(line, 14, y);
    }
    y += 8;
    if (y > 280) { doc.addPage(); y = 20; }
  });

  doc.save("lista_spesa.pdf");
}

async function sharePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 30; // Coordinata Y iniziale per il contenuto

  // sfondo pagina
  doc.setFillColor(15, 23, 36);
  doc.rect(0, 0, 210, 297, "F");

  // titolo
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("🛒 Lista della Spesa", 105, 12, { align: "center" });

  // aggiungi testo personalizzato in cima al PDF, se presente
  if(pdfNote){
    doc.setFontSize(14);
    doc.setTextColor(255,200,50); // colore a contrasto
    doc.text(pdfNote, 14, y);
    y += 12; // lascia un po' di spazio tra testo e lista
  }

  // contenuto
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255); // Reset colore testo
  const lines = buildPDFContent();
  lines.forEach(line => {
    if (line.startsWith("--")) {
        doc.setTextColor(0, 255, 255); 
        doc.text(line, 14, y);
        doc.setTextColor(255, 255, 255); 
    } else {
        doc.text(line, 14, y);
    }
    y += 8;
    if (y > 280) { 
      doc.addPage();
      y = 20;
    }
  });

  // genera il blob PDF
  const blob = doc.output("blob");

  // Costruisci una stringa di testo alternativa per la condivisione se il file non è supportato
  const textContent = (pdfNote ? pdfNote + "\n\n" : "") + buildPDFContent().join("\n");


  // verifica supporto navigator.share con file
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], "lista_spesa.pdf", { type: "application/pdf" })] })) {
    try {
      await navigator.share({
        title: "Lista della Spesa",
        text: textContent, // Aggiunto testo anche per la condivisione di file
        files: [new File([blob], "lista_spesa.pdf", { type: "application/pdf" })]
      });
    } catch (err) {
      console.warn("share error", err);
      alert("Condivisione annullata o non possibile.");
    }
  } else if (navigator.share) {
    // fallback: testo semplice se non supporta file
    try {
      await navigator.share({ title: "Lista della Spesa", text: textContent });
    } catch (err) {
      alert("Condivisione non completata.");
    }
  } else {
    alert("La condivisione non è supportata sul tuo dispositivo.");
  }
}


/* -------------- INIZIALIZZAZIONE -------------- */

// Esegui la persistenza locale all'avvio e all'uscita dalla pagina
window.addEventListener("beforeunload", persistLocal);
restoreLocal(); 

// Inizializza UI
renderCatalog(catalogo);
renderShopping(); // Chiama la versione sovrascritta che aggiorna count e persiste localmente

/* -------------- EVENTI -------------- */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = catalogo.filter(p =>
    p.nome.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q)
  );
  renderCatalog(filtered);
});

addManualBtn.addEventListener("click", async () => {
  const val = manualInput.value.trim();
  if (!val) return;

  // Normalizza il valore per il confronto
  const normalizedVal = val.toLowerCase();

  // Controlla se esiste già nel catalogo (ignorando maiuscole/minuscole)
  if (!catalogo.some(p => p.nome.toLowerCase() === normalizedVal)) {
    // Aggiungi automaticamente al catalogo con categoria "Altro"
    catalogo.push({ categoria: "Altro", nome: val });

    // Salva il catalogo aggiornato su Firestore
    await saveCatalogFirestore();

    // Aggiorna la UI del catalogo
    renderCatalog(catalogo);
  }

  // Aggiungi alla lista della spesa
  addItemToShopping(val);
  manualInput.value = "";
});

saveBtn.addEventListener("click", saveList);
loadBtn.addEventListener("click", loadLists);

// Aggiorna la variabile pdfNote prima di scaricare o condividere
downloadBtn.addEventListener("click", () => {
  showPDFNoteInput(downloadStyledPDF);
});

shareBtn.addEventListener("click", () => {
  showPDFNoteInput(sharePDF);
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Vuoi davvero svuotare la lista corrente?")) return;
  shopping = [];
  renderShopping();
});
