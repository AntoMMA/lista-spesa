/* -------------- FIREBASE CONFIG (LA TUA) -------------- */
const firebaseConfig = {
  apiKey: "AIzaSyCPHLvSRBt40Wloa0nnnAp5LVU0xYyP0",
  authDomain: "lista-spesa-db7f7.firebaseapp.com",
  projectId: "lista-spesa-db7f7",
  storageBucket: "lista-spesa-db7f7.firebasestorage.app",
  messagingSenderId: "736757613454",
  appId: "1:736757613454:web:50744d7ce9db9d3ebc5adf",
  measurementId: "G-64QH2WHH2X"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// NUOVA INIZIALIZZAZIONE PER REALTIME DATABASE
const dbRT = firebase.database(); 

// GESTIONE ID LOCALE E INFORMAZIONI UTENTE
let CURRENT_USER_ID = localStorage.getItem("user_unique_id") || null;
let CURRENT_USER_DATA = { firstName: "", lastName: "" };
const USER_COLLECTION_NAME = "registered_users"; // Collezione in Firestore per salvare i nomi

// Funzione per generare un ID univoco (UUID)
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


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
  { categoria: "Verdura", nome: "Pomodori" },
  { categoria: "Verdura", nome: "Lattuga" },
  { categoria: "Verdura", nome: "Patate" },
  { categoria: "Latticini", nome: "Latte" },
  { categoria: "Latticini", nome: "Uova" },
  { categoria: "Latticini", nome: "Yogurt" },
  { categoria: "Carne/Pesce", nome: "Pollo" },
  { categoria: "Carne/Pesce", nome: "Salmone" },
  { categoria: "Pane/Pasta", nome: "Pane fresco" },
  { categoria: "Pane/Pasta", nome: "Pasta" },
  { categoria: "Bevande", nome: "Acqua minerale" },
  { categoria: "Bevande", nome: "Succo d'arancia" },
  { categoria: "Altro", nome: "Zucchero" },
  { categoria: "Altro", nome: "Sale" },
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
const activeUsersListEl = document.getElementById("activeUsersList");

// NUOVI ELEMENTI DOM PER L'ACCESSO
const loginGateEl = document.getElementById("loginGate");
const mainAppEl = document.getElementById("mainApp"); // Assicurati che <main> abbia l'ID 'mainApp'
const inputFirstNameEl = document.getElementById("inputFirstName");
const inputLastNameEl = document.getElementById("inputLastName");
const loginButtonEl = document.getElementById("loginButton");


let pdfNote = ""; 

/* -------------- STATO GLOBALE -------------- */
let shopping = []; // array di oggetti {nome, qty, done}
let usersCache = {}; // Mappa per nome/cognome da Firestore: {userID: {firstName, lastName}}
let presenceCache = {}; // Mappa per lo stato online/offline


function showPDFNoteInput(callback) {
  // ... (funzione showPDFNoteInput - invariata)
  pdfNoteContainer.style.display = 'block';
  // ...
  pdfNoteConfirmBtn.onclick = () => {
    pdfNote = pdfNoteInput.value.trim();
    pdfNoteContainer.style.display = 'none';
    callback();
  };
}


/* -------------- UTILITY: persistenza locale -------------- */
function persistLocal() {
  localStorage.setItem("shoppingList", JSON.stringify(shopping));
}

function restoreLocal() {
  const localShopping = localStorage.getItem("shoppingList");
  if (localShopping) {
    shopping = JSON.parse(localShopping);
  }
}

/* -------------- FUNZIONI UI -------------- */

function renderShopping() {
  shoppingItemsEl.innerHTML = "";
  shopping.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.toggle("done", item.done);
    li.dataset.index = index;

    li.innerHTML = `
      <div class="left">
        <input type="checkbox" ${item.done ? "checked" : ""} data-action="toggle" />
        <span class="name">${item.nome}</span>
        <span class="qty">${item.qty > 1 ? `(${item.qty})` : ""}</span>
      </div>
      <div class="right">
        <button data-action="decrease" class="button">-</button>
        <button data-action="increase" class="button">+</button>
        <button data-action="delete" class="button danger">X</button>
      </div>
    `;
    shoppingItemsEl.appendChild(li);
  });
  updateCount();
  persistLocal();
}

function renderCatalog(items) {
  catalogList.innerHTML = "";
  let currentCategory = "";

  items.forEach(item => {
    if (item.categoria !== currentCategory) {
      const categoryEl = document.createElement("div");
      categoryEl.className = "catalog-category";
      categoryEl.textContent = item.categoria;
      catalogList.appendChild(categoryEl);
      currentCategory = item.categoria;
    }

    const itemEl = document.createElement("div");
    itemEl.className = "catalog-item";
    itemEl.textContent = item.nome;
    itemEl.addEventListener("click", () => addItemToShopping(item.nome));
    catalogList.appendChild(itemEl);
  });
}

function addItemToShopping(name) {
  const existingItem = shopping.find(i => i.nome === name && !i.done);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    shopping.unshift({ nome: name, qty: 1, done: false });
  }
  renderShopping();
}

function updateCount() {
  const activeCount = shopping.filter(i => !i.done).length;
  itemCountEl.textContent = activeCount;
}


/* -------------- FUNZIONI UTENTI ATTIVI E PRESENZA -------------- */

// Funzione per aggiornare la UI della lista utenti
function renderUsers() {
    activeUsersListEl.innerHTML = "";
    
    // Filtra e prepara gli utenti che hanno un nome e cognome
    const allUserIDs = Object.keys(usersCache).filter(id => usersCache[id]?.firstName);
    
    // Ordina gli utenti: online prima di offline
    const sortedUserIDs = allUserIDs.sort((a, b) => {
        const statusA = presenceCache[a]?.state === 'online' ? 0 : 1;
        const statusB = presenceCache[b]?.state === 'online' ? 0 : 1;
        
        // Priorità 1: per stato (online/offline)
        if (statusA !== statusB) return statusA - statusB; 
        
        // Priorità 2: per nome
        const nameA = `${usersCache[a].firstName} ${usersCache[a].lastName}`;
        const nameB = `${usersCache[b].firstName} ${usersCache[b].lastName}`;
        return nameA.localeCompare(nameB);
    });
    
    sortedUserIDs.forEach(userID => {
        const user = usersCache[userID];
        // Se l'ID non è in presenceCache (non ha mai fatto il setupPresence), è offline.
        const status = presenceCache[userID] || { state: 'offline' };
        
        const li = document.createElement("li");
        
        // Determina le classi CSS per il pallino
        const dotClass = `status-${status.state}`;
        const fullName = `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`;
        
        li.innerHTML = `
            <span class="status-dot ${dotClass}" title="${status.state === 'online' ? 'Online' : 'Offline'}"></span>
            <span>${fullName} ${userID === CURRENT_USER_ID ? '(Tu)' : ''}</span>
        `;
        
        activeUsersListEl.appendChild(li);
    });
    
    if (sortedUserIDs.length === 0) {
        activeUsersListEl.innerHTML = "<li style='color: var(--muted-color);'>Nessun utente attivo.</li>";
    }
}

// Aggiorna i dati dell'utente in Firestore (Nome/Cognome)
async function saveUserData(userID, firstName, lastName) {
    try {
        await db.collection(USER_COLLECTION_NAME).doc(userID).set({
            firstName: firstName,
            lastName: lastName,
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Dati utente salvati in Firestore:", { userID, firstName, lastName });
    } catch (err) {
        console.error("Errore salvataggio dati utente in Firestore:", err);
    }
}


// 1. Logica di PRESENZA (onDisconnect) per l'utente corrente
function setupPresence() {
    if (!CURRENT_USER_ID) return;

    const userRef = dbRT.ref('presence/' + CURRENT_USER_ID);

    // Imposta l'azione 'onDisconnect': se la connessione cade, setta lo stato a 'offline'
    userRef.onDisconnect().set({
        state: 'offline',
        last_seen: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        // Imposta immediatamente lo stato 'online'
        userRef.set({
            state: 'online',
            last_seen: firebase.database.ServerValue.TIMESTAMP
        });
        // Non è necessario fare il renderUsers qui, lo farà il listener RTDB.
    }).catch(err => {
        console.error("Errore setupPresence:", err);
    });

    // Se l'utente chiude volontariamente la finestra (consigliato)
    window.addEventListener('beforeunload', () => {
        // Un semplice set sincrono per provare a notificare l'uscita
        userRef.set({ state: 'offline', last_seen: Date.now() });
    });
}


// 2. Recupera tutti i Nomi/Cognomi da Firestore e ASCOLTA LO STATO RTDB
async function loadAndWatchUsers() {
    // 1. Ascolta i nomi e cognomi in tempo reale da Firestore
    db.collection(USER_COLLECTION_NAME).onSnapshot((snapshot) => {
        snapshot.forEach(doc => {
            usersCache[doc.id] = doc.data();
        });
        renderUsers(); 
    }, (error) => {
        console.error("Errore nell'ascolto degli utenti da Firestore:", error);
    });

    // 2. Ascolta i cambiamenti di stato da Realtime Database
    dbRT.ref('presence').on('value', (snapshot) => {
        const newPresenceData = snapshot.val() || {};
        presenceCache = newPresenceData;
        renderUsers();
    }, (error) => {
        console.error("Errore nell'ascolto della presenza RTDB:", error);
    });
}


/* -------------- GESTIONE ACCESSO -------------- */

function handleLogin() {
    const firstName = inputFirstNameEl.value.trim();
    const lastName = inputLastNameEl.value.trim();

    if (!firstName) {
        alert("Inserisci il tuo nome.");
        return;
    }
    
    // 1. Verifica/Genera ID Utente
    if (!CURRENT_USER_ID) {
        CURRENT_USER_ID = generateUUID();
        localStorage.setItem("user_unique_id", CURRENT_USER_ID);
    }
    
    // 2. Salva il nome e cognome in Firestore con l'ID univoco
    saveUserData(CURRENT_USER_ID, firstName, lastName);

    // 3. Nasconde il form e mostra l'app
    loginGateEl.style.display = 'none';
    mainAppEl.style.display = 'block';

    // 4. Avvia la logica di presenza
    setupPresence();
}

function checkLocalLogin() {
    if (CURRENT_USER_ID) {
        // Se l'ID esiste in localStorage, cerca i dati in Firestore
        db.collection(USER_COLLECTION_NAME).doc(CURRENT_USER_ID).get()
            .then(doc => {
                if (doc.exists) {
                    CURRENT_USER_DATA = doc.data();
                    loginGateEl.style.display = 'none';
                    mainAppEl.style.display = 'block';
                    // Pre-popola i campi in caso di logout/nuovo accesso
                    inputFirstNameEl.value = CURRENT_USER_DATA.firstName || '';
                    inputLastNameEl.value = CURRENT_USER_DATA.lastName || '';
                    setupPresence(); // Avvia la presenza
                } else {
                    // ID presente ma dati persi: richiede un nuovo accesso per registrare il nome
                    loginGateEl.style.display = 'block';
                    mainAppEl.style.display = 'none';
                }
            })
            .catch(() => {
                // Fallback in caso di errore di rete
                loginGateEl.style.display = 'block';
                mainAppEl.style.display = 'none';
            });
    } else {
        // Nessun ID: mostra il form di login
        loginGateEl.style.display = 'block';
        mainAppEl.style.display = 'none';
    }
}


/* -------------- FIRESTORE: SALVA / CARICA / ELIMINA -------------- */
async function saveList() {
  const listName = prompt("Inserisci un nome per la lista:");
  if (!listName) return;

  const listData = {
    name: listName,
    items: shopping,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("liste_salvate").add(listData);
    alert(`Lista "${listName}" salvata con successo!`);
    loadLists(); // Ricarica la lista salvata
  } catch (err) {
    console.error("Errore nel salvataggio:", err);
    alert("Errore nel salvataggio della lista.");
  }
}

async function loadLists() {
  savedListsEl.innerHTML = "<p>Caricamento...</p>";
  try {
    const snapshot = await db.collection("liste_salvate").orderBy("timestamp", "desc").get();
    savedListsEl.innerHTML = "";

    snapshot.forEach(doc => {
      const list = doc.data();
      const listItem = document.createElement("div");
      listItem.className = "saved-list-item";

      const date = list.timestamp ? list.timestamp.toDate().toLocaleDateString('it-IT', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Data sconosciuta';
      
      listItem.innerHTML = `
        <span>${list.name} (${list.items.length} articoli) - ${date}</span>
        <div>
          <button class="button" data-id="${doc.id}" data-action="load">Carica</button>
          <button class="button danger" data-id="${doc.id}" data-action="delete">Elimina</button>
        </div>
      `;
      savedListsEl.appendChild(listItem);
    });

    if (snapshot.empty) {
      savedListsEl.innerHTML = "<p>Nessuna lista salvata.</p>";
    }

  } catch (err) {
    console.error("Errore nel caricamento delle liste:", err);
    savedListsEl.innerHTML = "<p>Errore nel caricamento delle liste.</p>";
  }
}

// ... (resto delle funzioni di caricamento e eliminazione liste)
// ... (funzioni PDF - downloadStyledPDF, sharePDF)

/* -------------- INIZIALIZZAZIONE -------------- */

// Esegui la persistenza locale all'avvio e all'uscita dalla pagina
window.addEventListener("beforeunload", persistLocal);
restoreLocal(); 

// Avvia l'ascolto per la lista utenti (si aggiornerà quando i dati arrivano)
loadAndWatchUsers(); 

// CONTROLLO DI ACCESSO
checkLocalLogin(); 

// Inizializza UI
renderCatalog(catalogo);
renderShopping();

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

shoppingItemsEl.addEventListener("click", async (e) => {
    const target = e.target;
    const li = target.closest('li');
    if (!li) return;

    const index = parseInt(li.dataset.index);
    if (isNaN(index)) return;

    const action = target.dataset.action;

    if (action === "toggle") {
        shopping[index].done = !shopping[index].done;
    } else if (action === "increase") {
        shopping[index].qty += 1;
    } else if (action === "decrease") {
        shopping[index].qty = Math.max(1, shopping[index].qty - 1);
    } else if (action === "delete") {
        shopping.splice(index, 1);
    }

    renderShopping();
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
  if (!confirm("Sei sicuro di voler pulire l'intera lista della spesa?")) return;
  shopping = [];
  renderShopping();
});

// GESTIONE EVENTI LISTE SALVATE
savedListsEl.addEventListener("click", async (e) => {
    const target = e.target;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;

    if (action === "load") {
        if (shopping.length > 0 && !confirm("Caricando una nuova lista, quella corrente verrà sovrascritta. Continuare?")) return;
        try {
            const doc = await db.collection("liste_salvate").doc(id).get();
            if (doc.exists) {
                shopping = doc.data().items || [];
                renderShopping();
                alert("Lista caricata con successo.");
            } else {
                alert("Lista non trovata.");
            }
        } catch (err) {
            console.error("Errore nel caricamento della lista:", err);
            alert("Errore nel caricamento della lista.");
        }
    } else if (action === "delete") {
        if (!confirm("Sei sicuro di voler eliminare questa lista salvata?")) return;
        try {
            await db.collection("liste_salvate").doc(id).delete();
            alert("Lista eliminata con successo.");
            loadLists();
        } catch (err) {
            console.error("Errore nell'eliminazione della lista:", err);
            alert("Errore nell'eliminazione della lista.");
        }
    }
});


// EVENTO DI LOGIN
loginButtonEl.addEventListener("click", handleLogin);
inputLastNameEl.addEventListener("keypress", (e) => {
    if (e.key === 'Enter') handleLogin();
});
