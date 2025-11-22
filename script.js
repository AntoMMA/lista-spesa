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

/* -------------- STATO -------------- */
let shopping = []; // array di oggetti {nome, qty, done}

/* -------------- INIZIALIZZA UI -------------- */
renderCatalog(catalogo);
updateCount();
renderShopping();

/* -------------- EVENTI -------------- */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = catalogo.filter(p =>
    p.nome.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q)
  );
  renderCatalog(filtered);
});

addManualBtn.addEventListener("click", () => {
  const val = manualInput.value.trim();
  if (!val) return;
  addItemToShopping(val);
  manualInput.value = "";
});

saveBtn.addEventListener("click", saveList);
loadBtn.addEventListener("click", loadLists);
downloadBtn.addEventListener("click", downloadPDF);
shareBtn.addEventListener("click", sharePDF);
clearBtn.addEventListener("click", () => {
  if (!confirm("Vuoi davvero svuotare la lista corrente?")) return;
  shopping = [];
  renderShopping();
});

/* -------------- FUNZIONI UI -------------- */
function renderCatalog(items) {
  // raggruppa per categoria
  const groups = items.reduce((acc, cur) => {
    (acc[cur.categoria] = acc[cur.categoria] || []).push(cur);
    return acc;
  }, {});
  catalogList.innerHTML = "";
  for (const cat of Object.keys(groups)) {
    const section = document.createElement("div");
    section.className = "cat-section";
    section.innerHTML = `<div class="cat-title">${cat}</div>`;
    groups[cat].forEach(prod => {
      const el = document.createElement("div");
      el.className = "prod";
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
    shopping.push({ nome: name, qty: 1, done: false });
  }
  renderShopping();
}

function renderShopping() {
  shoppingItemsEl.innerHTML = "";
  shopping.forEach((it, i) => {
    const li = document.createElement("li");
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
    // eventi
    li.querySelector('input[type="checkbox"]').addEventListener("change", e => {
      const idx = +e.target.dataset.index;
      shopping[idx].done = e.target.checked;
      renderShopping();
    });
    li.querySelector('button[data-action="dec"]').addEventListener("click", e => {
      const idx = +e.target.dataset.index;
      if (shopping[idx].qty > 1) shopping[idx].qty--;
      else shopping.splice(idx,1);
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
    const doc = await db.collection("liste_spesa").add({
      items: shopping,
      createdAt: new Date()
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
      const date = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : new Date();
      div.innerHTML = `
        <div>
          <div><strong>${date.toLocaleString()}</strong></div>
          <div class="meta">${(data.items || []).length} articoli</div>
        </div>
        <div class="btns">
          <button data-load="${id}">Carica</button>
          <button data-delete="${id}">Elimina</button>
        </div>
      `;
      div.querySelector('[data-load]').addEventListener("click", async () => {
        shopping = (data.items || []).map(x => ({ ...x })); // clone
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
    if (!savedListsEl.hasChildNodes()) savedListsEl.innerHTML = "<div style='color:var(--muted);padding:8px'>Nessuna lista salvata</div>";
  } catch (err) {
    console.error(err);
    alert("Errore nel caricamento: " + (err.message || err));
  }
}

/* -------------- PDF: DOWNLOAD E SHARE -------------- */
function buildTextFromShopping() {
  if (shopping.length === 0) return "Lista vuota";
  return shopping.map(it => `- ${it.nome} x${it.qty}${it.done ? " (Da prendere)" : ""}`).join("\n");
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const title = "Lista Spesa";
  doc.setFontSize(16);
  doc.text(title, 14, 16);
  doc.setFontSize(12);
  const body = buildTextFromShopping();
  const lines = doc.splitTextToSize(body, 180);
  doc.text(lines, 14, 28);
  doc.save("lista_spesa.pdf");
}

async function sharePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Lista Spesa", 14, 16);
  doc.setFontSize(12);
  const body = buildTextFromShopping();
  const lines = doc.splitTextToSize(body, 180);
  doc.text(lines, 14, 28);

  const blob = doc.output("blob");
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], "lista_spesa.pdf", { type: "application/pdf" })] })) {
    try {
      await navigator.share({
        title: "Lista Spesa",
        files: [new File([blob], "lista_spesa.pdf", { type: "application/pdf" })]
      });
    } catch (err) {
      console.warn("share error", err);
      alert("Condivisione annullata o non possibile.");
    }
  } else if (navigator.share) {
    // fallback: try with no files
    try {
      await navigator.share({ title: "Lista della Spesa", text: buildTextFromShopping() });
    } catch (err) {
      alert("Condivisione non completata.");
    }
  } else {
    alert("La condivisione non è supportata sul tuo dispositivo.");
  }
}

/* -------------- UTILITY: persistenza locale (facoltativa) -------------- */
// salva automaticamente in localStorage per mantenere la lista tra refresh
function persistLocal() {
  try { localStorage.setItem("shopping_local_v1", JSON.stringify(shopping)); } catch(e){}
}
function restoreLocal() {
  try {
    const s = localStorage.getItem("shopping_local_v1");
    if (s) { shopping = JSON.parse(s); renderShopping(); }
  } catch(e){}
}
window.addEventListener("beforeunload", persistLocal);
restoreLocal();

/* -------------- Aggiorna count quando shopping cambia -------------- */
// usa un semplice observer via renderShopping che chiama updateCount => persist
const origRender = renderShopping;
renderShopping = function(){
  shoppingItemsEl.innerHTML = "";
  shopping.forEach((it, i) => {
    const li = document.createElement("li");
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
    li.querySelector('input[type="checkbox"]').addEventListener("change", e => {
      const idx = +e.target.dataset.index;
      shopping[idx].done = e.target.checked;
      renderShopping();
    });
    li.querySelector('button[data-action="dec"]').addEventListener("click", e => {
      const idx = +e.target.dataset.index;
      if (shopping[idx].qty > 1) shopping[idx].qty--;
      else shopping.splice(idx,1);
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
  persistLocal();
};

/* inizializza render dopo override */
renderShopping();
