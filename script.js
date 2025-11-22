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
// NUOVA INIZIALIZZAZIONE PER REALTIME DATABASE
const dbRT = firebase.database(); 

// ID UTENTE DI TEST: DA SOSTITUIRE CON UN VERO UTENTE AUTENTICATO
const CURRENT_USER_ID = "USER_TEST_1234";
// NOME E COGNOME DI TEST (per simulare i dati del DB)
const CURRENT_USER_NAME = "Marco Rossi (TU)";


async function saveCatalogFirestore() {
  try {
//... (resto della funzione saveCatalogFirestore)
    const sortedCatalogo = catalogo.sort((a, b) => a.nome.localeCompare(b.nome));
    await db.collection("catalogo").doc("prodotti").set({ items: sortedCatalogo });
    console.log("Catalogo aggiornato su Firestore");
  } catch (err) {
    console.error("Errore salvataggio catalogo:", err);
  }
}

/* -------------- CATALOGO PREIMPOSTATO -------------- */
//... (resto del catalogo)

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
// NUOVO ELEMENTO DOM
const activeUsersListEl = document.getElementById("activeUsersList");


let pdfNote = ""; // variabile globale che terrà il testo da inserire nel PDF
/* -------------- STATO -------------- */
let shopping = []; // array di oggetti {nome, qty, done}
// NUOVI STATI GLOBALI PER GLI UTENTI
let usersCache = {}; // Mappa per nome/cognome da Firestore: {userID: {firstName, lastName}}
let presenceCache = {}; // Mappa per lo stato online/offline

function showPDFNoteInput(callback) {
//... (resto della funzione showPDFNoteInput)
}

/* -------------- UTILITY: persistenza locale -------------- */
//... (resto delle funzioni di persistenza locale)

/* -------------- FUNZIONI UI -------------- */

function renderShopping() {
//... (resto della funzione renderShopping)
  updateCount();
  persistLocal(); // Salva dopo ogni modifica alla lista
}

function renderCatalog(items) {
//... (resto della funzione renderCatalog)
}

function addItemToShopping(name) {
//... (resto della funzione addItemToShopping)
}

function updateCount() {
//... (resto della funzione updateCount)
}


/* -------------- FUNZIONI UTENTI ATTIVI E PRESENZA -------------- */

// Funzione per aggiornare la UI della lista utenti
function renderUsers() {
    activeUsersListEl.innerHTML = "";
    
    // Ordina gli utenti: online prima di offline
    const sortedUserIDs = Object.keys(usersCache).sort((a, b) => {
        const statusA = presenceCache[a]?.state === 'online' ? 0 : 1;
        const statusB = presenceCache[b]?.state === 'online' ? 0 : 1;
        
        // Prima per stato (online/offline), poi per nome
        if (statusA !== statusB) return statusA - statusB; 
        
        const nameA = `${usersCache[a].firstName} ${usersCache[a].lastName}`;
        const nameB = `${usersCache[b].firstName} ${usersCache[b].lastName}`;
        return nameA.localeCompare(nameB);
    });
    
    sortedUserIDs.forEach(userID => {
        const user = usersCache[userID];
        const status = presenceCache[userID] || { state: 'offline' };
        
        const li = document.createElement("li");
        
        // Determina le classi CSS per il pallino
        const dotClass = `status-${status.state}`;
        const fullName = `${user.firstName} ${user.lastName}`;
        
        li.innerHTML = `
            <span id="dot-${userID}" class="status-dot ${dotClass}"></span>
            <span>${fullName}</span>
        `;
        
        activeUsersListEl.appendChild(li);
    });
    
    if (sortedUserIDs.length === 0) {
        activeUsersListEl.innerHTML = "<li style='color: var(--muted-color);'>Nessun utente disponibile.</li>";
    }
}


// 1. Logica di PRESENZA (onDisconnect) per l'utente corrente
function setupPresence() {
    // 1. Definisci il riferimento al nodo di presenza dell'utente corrente
    const userRef = dbRT.ref('presence/' + CURRENT_USER_ID);

    // 2. Imposta l'azione 'onDisconnect': se la connessione cade, setta lo stato a 'offline'
    userRef.onDisconnect().set({
        state: 'offline',
        last_seen: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        // 3. Imposta immediatamente lo stato 'online'
        userRef.set({
            state: 'online',
            last_seen: firebase.database.ServerValue.TIMESTAMP
        });
        console.log("Presenza online stabilita per:", CURRENT_USER_ID);
    });

    // 4. Se l'utente chiude volontariamente la finestra (opzionale ma consigliato)
    window.addEventListener('beforeunload', () => {
        userRef.set({ state: 'offline', last_seen: Date.now() });
    });
}


// 2. Recupera i Nomi e Cognomi da Firestore e inizia l'ascolto
async function loadAndWatchUsers() {
    // Simulazione di utenti registrati in Firestore
    // Nota: in un'app vera, useresti l'ID di autenticazione come ID del documento
    const mockUsers = [
        { id: CURRENT_USER_ID, firstName: CURRENT_USER_NAME, lastName: "" }, // L'utente corrente
        { id: "user_5678", firstName: "Anna", lastName: "Verdi" },
        { id: "user_9012", firstName: "Luca", lastName: "Bianchi" },
    ];
    
    mockUsers.forEach(u => {
        usersCache[u.id] = { firstName: u.firstName, lastName: u.lastName };
    });
    
    // 3. Ascolta i cambiamenti di stato da Realtime Database
    dbRT.ref('presence').on('value', (snapshot) => {
        const newPresenceData = snapshot.val() || {};
        
        // Aggiorna la cache di presenza
        presenceCache = newPresenceData;
        
        // Aggiorna la UI
        renderUsers();
    });
    
    // Qui puoi anche implementare il recupero vero da Firestore. Esempio concettuale:
    /*
    const snapshot = await db.collection("utenti_registrati").get();
    snapshot.forEach(doc => {
        usersCache[doc.id] = doc.data();
    });
    */
    
    renderUsers(); // Render iniziale
}


/* -------------- FIRESTORE: SALVA / CARICA / ELIMINA -------------- */
async function saveList() {
//... (resto della funzione saveList)
}

async function loadLists() {
//... (resto della funzione loadLists)
}


/* -------------- PDF: FUNZIONI UTILITY -------------- */
//... (resto delle funzioni PDF)

/* -------------- INIZIALIZZAZIONE -------------- */

// Esegui la persistenza locale all'avvio e all'uscita dalla pagina
window.addEventListener("beforeunload", persistLocal);
restoreLocal(); 

// INIZIALIZZAZIONE NUOVE FUNZIONALITÀ UTENTI
loadAndWatchUsers(); // Carica nomi e inizia l'ascolto della presenza
setupPresence(); // Imposta lo stato online/onDisconnect per l'utente corrente

// Inizializza UI
renderCatalog(catalogo);
renderShopping();

/* -------------- EVENTI -------------- */
//... (resto della gestione eventi)
