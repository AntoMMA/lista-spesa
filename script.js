/* =================================================================
   FILE: script.js - Codice Completo e Funzionante
   ================================================================= */

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
const dbRT = firebase.database(); 

// Variabili globali per lo stato e i dati
let CURRENT_USER_ID = localStorage.getItem("user_unique_id") || null;
let CURRENT_USER_DATA = { firstName: "", lastName: "" };
const USER_COLLECTION_NAME = "registered_users"; 
let pdfNote = ""; 
let shopping = []; 
let actionPending = ''; // Traccia l'azione PDF/Condividi

/* -------------- VARIABILI DOM (Elementi HTML) -------------- */
let loginGateEl, mainAppEl, loginButtonEl, inputFirstNameEl, inputLastNameEl, loggedInUserEl, logoutButtonEl, catalogEl, shoppingItemsEl, itemCountEl, addManualInputEl, addManualBtnEl, clearBtnEl, saveBtnEl, loadBtnEl, savedListsEl, activeUsersListEl, pdfNoteContainerEl, pdfNoteInputEl, pdfNoteConfirmBtnEl, downloadBtnEl, shareBtnEl;


/* -------------- CATALOGO PRODOTTI (Placeholder) -------------- */
const catalogo = [
    // FRUTTA E VERDURA
    { categoria: "Frutta fresca", nome: "Mele Golden", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Frutta" },
    { categoria: "Frutta fresca", nome: "Banane", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Frutta" },
    { categoria: "Frutta fresca", nome: "Arance da tavola", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Frutta" },
    { categoria: "Verdura", nome: "Insalata iceberg", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Verdura" },
    { categoria: "Verdura", nome: "Pomodori ramati", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Verdura" },
    
    // CARNE E PESCE
    { categoria: "Carne rossa", nome: "Bistecca di manzo", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Carne" },
    { categoria: "Carne bianca", nome: "Petto di pollo", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Carne" },
    { categoria: "Pesce fresco", nome: "Salmone", imgUrl: "https://placehold.co/50x50/1D4ED8/FFFFFF?text=Pesce" },
    
    // LATTICINI E UOVA
    { categoria: "Latte e derivati", nome: "Latte intero", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Latte" },
    { categoria: "Formaggi freschi", nome: "Mozzarella", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Formaggio" },
    { categoria: "Uova", nome: "Uova grandi (confezione da 6)", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Uova" },

    // PASTA, PANE E CEREALI
    { categoria: "Pasta secca", nome: "Spaghetti", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Pasta" },
    { categoria: "Pane", nome: "Pane fresco (tipo casereccio)", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Pane" },
    
    // BEVANDE E ALCOLICI
    { categoria: "Acqua", nome: "Acqua naturale (6x1.5L)", imgUrl: "https://placehold.co/50x50/10B981/FFFFFF?text=Bevande" },
    { categoria: "Vino", nome: "Vino rosso (Tavola)", imgUrl: "https://placehold.co/50x50/DC2626/FFFFFF?text=Vino" },
    
    // IGIENE E CASA
    { categoria: "Igiene personale", nome: "Dentifricio", imgUrl: "https://placehold.co/50x50/F97316/FFFFFF?text=Igiene" },
    { categoria: "Pulizia casa", nome: "Detersivo pavimenti", imgUrl: "https://placehold.co/50x50/F97316/FFFFFF?text=Casa" },
];


/* -------------- FUNZIONI BASE -------------- */

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function initializeApp() {
    if (CURRENT_USER_ID) {
        loginGateEl.style.display = 'none';
        mainAppEl.style.display = 'grid';
        loggedInUserEl.textContent = `${CURRENT_USER_DATA.firstName} ${CURRENT_USER_DATA.lastName}`;

        listenToActiveUsers();
        listenToActiveList();
        
        dbRT.ref('active_users/' + CURRENT_USER_ID).onDisconnect().remove();
    } else {
        loginGateEl.style.display = 'flex';
        mainAppEl.style.display = 'none';
        loggedInUserEl.textContent = "Offline";
    }

    renderCatalog();
    renderShopping();
    loadLists(); 
}

/* -------------- FUNZIONI UTENTE E AUTENTICAZIONE -------------- */

async function handleLogin() {
    const firstName = inputFirstNameEl.value.trim();
    const lastName = inputLastNameEl.value.trim();

    if (!firstName || !lastName) {
        alert("Inserisci Nome e Cognome per accedere.");
        return;
    }

    try {
        const userRef = db.collection(USER_COLLECTION_NAME).where("firstName", "==", firstName).where("lastName", "==", lastName).limit(1);
        const snapshot = await userRef.get();

        if (!snapshot.empty) {
            CURRENT_USER_ID = snapshot.docs[0].id;
            CURRENT_USER_DATA = { firstName, lastName };
            localStorage.setItem("user_unique_id", CURRENT_USER_ID);
        } else {
            CURRENT_USER_ID = generateUUID();
            CURRENT_USER_DATA = { firstName, lastName };
            localStorage.setItem("user_unique_id", CURRENT_USER_ID);
            await db.collection(USER_COLLECTION_NAME).doc(CURRENT_USER_ID).set(CURRENT_USER_DATA);
        }
        
        // Aggiungi/aggiorna lo stato di login (Realtime DB)
        dbRT.ref('active_users/' + CURRENT_USER_ID).set({
            firstName: firstName,
            lastName: lastName,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        initializeApp();
    } catch (error) {
         // Gestione errore di rete/firebase durante il login
        console.error("Errore durante il login/registrazione:", error);
        alert("Errore di connessione o autenticazione. Riprova più tardi."); 
    }
}

function handleLogout() {
    if (CURRENT_USER_ID) {
        dbRT.ref('active_users/' + CURRENT_USER_ID).remove();
    }
    
    CURRENT_USER_ID = null;
    CURRENT_USER_DATA = { firstName: "", lastName: "" };
    localStorage.removeItem("user_unique_id");
    
    loginGateEl.style.display = 'flex';
    mainAppEl.style.display = 'none';
    loggedInUserEl.textContent = "Offline";
}


/* -------------- FUNZIONI LISTA SPESA (RENDER e LOGICA) -------------- */

function renderCatalog() {
    let html = '';
    let currentCategory = '';

    catalogo.forEach(item => {
        if (item.categoria !== currentCategory) {
            html += `<h3>${item.categoria}</h3>`;
            currentCategory = item.categoria;
        }
        html += `<div class="catalog-item" data-name="${item.nome}" data-img-url="${item.imgUrl}">
                    <img src="${item.imgUrl}" alt="${item.nome}" class="product-photo">
                    <span>${item.nome}</span>
                </div>`;
    });

    catalogEl.innerHTML = html;
}

function renderShopping() {
    const sortedShopping = [...shopping].sort((a, b) => {
        if (a.done === b.done) return 0;
        return a.done ? 1 : -1;
    });

    shoppingItemsEl.innerHTML = sortedShopping.map((item) => {
        const itemClass = item.done ? 'done' : '';
        
        return `<li class="${itemClass}" data-name="${item.nome}">
                    <div class="left">
                        <input type="checkbox" ${item.done ? 'checked' : ''} data-action="toggle-done">
                        <img src="${item.imgUrl || 'https://placehold.co/40x40'}" alt="${item.nome}" class="product-photo-list">
                        <span class="name">${item.nome}</span>
                        <span class="qty">(x ${item.qty})</span>
                    </div>
                    <div class="right">
                        <button class="qty-btn" data-action="decrease">-</button>
                        <button class="qty-btn" data-action="increase">+</button>
                        <button class="delete-btn" data-action="delete">🗑️</button>
                    </div>
                </li>`;
    }).join('');

    itemCountEl.textContent = shopping.length;
    
    syncShoppingList();
}

function syncShoppingList() {
    if (CURRENT_USER_ID) {
        dbRT.ref('active_list/').set(shopping)
            .catch(error => console.error("Errore sincronizzazione Realtime:", error));
    }
}

function addItem(name, imgUrl) {
    const existingItem = shopping.find(item => item.nome === name);

    if (existingItem) {
        existingItem.qty += 1;
        existingItem.done = false;
    } else {
        shopping.push({
            nome: name,
            qty: 1,
            done: false,
            imgUrl: imgUrl || 'https://placehold.co/40x40' 
        });
    }

    renderShopping();
}

function handleListClick(e) {
    const target = e.target;
    const action = target.dataset.action;
    const listItem = target.closest('li');
    if (!listItem) return;
    
    const itemName = listItem.dataset.name;
    const itemIndex = shopping.findIndex(item => item.nome === itemName);
    if (itemIndex === -1) return;
    
    const item = shopping[itemIndex];

    switch(action) {
        case 'increase': item.qty += 1; break;
        case 'decrease':
            item.qty -= 1;
            if (item.qty <= 0) { shopping.splice(itemIndex, 1); }
            break;
        case 'delete':
            if (confirm(`Sei sicuro di voler eliminare "${item.nome}"?`)) { shopping.splice(itemIndex, 1); }
            break;
        case 'toggle-done': item.done = !item.done; break;
    }
    
    renderShopping();
}

/* -------------- FUNZIONI SALVATAGGIO/CARICAMENTO FIRESTORE -------------- */

async function saveList() {
    if (shopping.length === 0 || !CURRENT_USER_ID) {
        alert("Lista vuota o non sei loggato.");
        return;
    }

    const listName = prompt("Inserisci un nome per la lista da salvare:");
    if (!listName || listName.trim() === "") return;

    try {
        const payload = {
            name: listName.trim(),
            items: shopping,
            userId: CURRENT_USER_ID,
            userName: `${CURRENT_USER_DATA.firstName} ${CURRENT_USER_DATA.lastName}`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("liste_salvate").add(payload);
        alert(`Lista "${listName}" salvata con successo!`);
        loadLists(); 
    } catch (err) {
        console.error("Errore nel salvataggio della lista:", err);
        alert("Errore nel salvataggio della lista. Controlla la connessione.");
    }
}

async function loadLists() {
    try {
        const snapshot = await db.collection("liste_salvate").orderBy("createdAt", "desc").limit(10).get();
        let html = '';

        if (snapshot.empty) {
            savedListsEl.innerHTML = '<p class="muted">Nessuna lista salvata trovata.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.createdAt ? data.createdAt.toDate().toLocaleDateString("it-IT") : 'Data sconosciuta';
            html += `<div class="saved-list-item">
                        <span>${data.name}</span>
                        <span class="muted-small">Salvata da: ${data.userName} il ${date}</span>
                        <div class="actions">
                            <button data-action="load" data-id="${doc.id}">Carica</button>
                            <button data-action="delete" data-id="${doc.id}" class="danger">Elimina</button>
                        </div>
                    </div>`;
        });

        savedListsEl.innerHTML = html;

    } catch (err) {
        console.error("Errore nel caricamento delle liste salvate:", err);
        savedListsEl.innerHTML = '<p class="muted">Errore nel caricamento. Problema di rete o Firestore.</p>';
    }
}


/* -------------- FUNZIONI PDF e CONDIVISIONE -------------- */

function downloadStyledPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("Libreria jsPDF non caricata. Impossibile generare il PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let y = 15; 
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const doneItems = shopping.filter(i => i.done);
    const pendingItems = shopping.filter(i => !i.done);
    
    // Generazione PDF omessa per brevità, ma inclusa nel codice fornito sopra
    // ... (Logica PDF completa) ...
    
    // Intestazione
    doc.setFontSize(18);
    doc.text("Lista Spesa Condivisa", pageWidth / 2, y, { align: "center" });
    y += 8;
    
    // Nota personalizzata
    if (pdfNote) {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150); 
        const noteLines = doc.splitTextToSize(`Nota: ${pdfNote}`, pageWidth - 2 * margin);
        doc.text(noteLines, pageWidth / 2, y, { align: "center" });
        y += noteLines.length * 5 + 5;
    }
    
    // Articoli da fare
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0); 
    doc.text("Articoli da Acquistare:", margin, y);
    y += 7;
    
    doc.setFontSize(12);
    pendingItems.forEach(item => {
        const text = `[ ] ${item.nome} (x ${item.qty})`;
        doc.text(text, margin + 5, y);
        y += 7;
    });
    
    // Articoli Fatti
    if (doneItems.length > 0) {
        y += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Articoli Già Acquistati:", margin, y);
        y += 7;
        
        doc.setFontSize(12);
        doc.setTextColor(150, 150, 150); 
        doneItems.forEach(item => {
            const text = `[X] ${item.nome} (x ${item.qty})`;
            doc.text(text, margin + 5, y);
            y += 7;
        });
    }


    doc.save("ListaSpesa.pdf");
    pdfNote = ""; 
    pdfNoteInputEl.value = "";
    pdfNoteContainerEl.style.display = 'none'; 
}

function sharePDF() {
    const listText = shopping.map(item => 
        `[${item.done ? 'X' : ' '}] ${item.nome} (Qta: ${item.qty})`
    ).join('\n');

    const shareData = {
        title: 'Lista Spesa Condivisa',
        text: `Ecco la nostra lista della spesa:\n\n${pdfNote ? `Nota: ${pdfNote}\n\n` : ''}${listText}`,
        url: window.location.href, 
    };

    if (navigator.share) {
        navigator.share(shareData)
            .catch((error) => {
                console.error('Errore durante la condivisione:', error);
                downloadStyledPDF(); 
            });
    } else {
        alert("Il tuo browser non supporta l'API di condivisione. Verrà scaricato il PDF.");
        downloadStyledPDF();
    }
    
    pdfNote = ""; 
    pdfNoteInputEl.value = "";
    pdfNoteContainerEl.style.display = 'none';
}


/* -------------- FUNZIONI REALTIME (UTENTI ATTIVI E LISTA) -------------- */
// Queste funzioni sono la "connessione alla rete" che hai richiesto, implementate con gestione errori.

function listenToActiveUsers() {
    dbRT.ref('active_users/').on('value', (snapshot) => {
        const users = snapshot.val();
        let html = '';
        if (users) {
            Object.keys(users).forEach(id => {
                const user = users[id];
                const isMe = id === CURRENT_USER_ID;
                html += `<li class="${isMe ? 'me' : ''}">
                            ${user.firstName} ${user.lastName} 
                            <span class="online-indicator"></span>
                        </li>`;
            });
        } else {
            html = '<li>Nessun altro utente attivo.</li>';
        }
        activeUsersListEl.innerHTML = html;
    }, (error) => {
        console.error("Errore Realtime DB (utenti):", error);
        activeUsersListEl.innerHTML = `<li class="error-msg">❌ Errore di connessione: ${error.code}</li>`;
    });
}

function listenToActiveList() {
    dbRT.ref('active_list/').on('value', (snapshot) => {
        const remoteList = snapshot.val();
        if (JSON.stringify(remoteList) !== JSON.stringify(shopping)) {
            shopping = remoteList || [];
            renderShopping();
        }
    }, (error) => {
        console.error("Errore Realtime DB (lista):", error);
    });
}


/* -------------- GESTIONE EVENTI E AVVIO IN SICUREZZA -------------- */

function getDOMElements() {
    // Cattura tutti gli elementi DOM
    loginGateEl = document.getElementById("loginGate");
    mainAppEl = document.getElementById("mainApp");
    loginButtonEl = document.getElementById("loginButton");
    inputFirstNameEl = document.getElementById("inputFirstName");
    inputLastNameEl = document.getElementById("inputLastName");
    loggedInUserEl = document.getElementById("loggedInUser");
    logoutButtonEl = document.getElementById("logoutButton");
    catalogEl = document.getElementById("catalog");
    shoppingItemsEl = document.getElementById("shoppingItems");
    itemCountEl = document.getElementById("itemCount");
    addManualInputEl = document.getElementById("addManualInput");
    addManualBtnEl = document.getElementById("addManualBtn");
    clearBtnEl = document.getElementById("clearBtn");
    saveBtnEl = document.getElementById("saveBtn");
    loadBtnEl = document.getElementById("loadBtn");
    savedListsEl = document.getElementById("savedLists");
    activeUsersListEl = document.getElementById("activeUsersList");
    pdfNoteContainerEl = document.getElementById("pdfNoteContainer");
    pdfNoteInputEl = document.getElementById("pdfNoteInput");
    pdfNoteConfirmBtnEl = document.getElementById("pdfNoteConfirmBtn");
    downloadBtnEl = document.getElementById("downloadBtn");
    shareBtnEl = document.getElementById("shareBtn");
    
    // Verifica critica per l'interfaccia
    if (!loginGateEl || !mainAppEl) {
         console.error("ERRORE CRITICO: Elementi HTML essenziali (loginGate, mainApp) non trovati. Assicurati che index.html non sia vuoto.");
         document.body.innerHTML = "<h1 style='color:red;'>Errore: Impossibile caricare l'interfaccia. Controlla index.html.</h1>";
         return false;
    }
    return true;
}

function addAllEventListeners() {
    // EVENTI APP
    catalogEl.addEventListener("click", (e) => {
        const itemEl = e.target.closest(".catalog-item");
        if (itemEl) {
            const name = itemEl.dataset.name;
            const imgUrl = itemEl.dataset.imgUrl;
            addItem(name, imgUrl);
        }
    });
    shoppingItemsEl.addEventListener("click", handleListClick);
    addManualBtnEl.addEventListener("click", () => {
        const name = addManualInputEl.value.trim();
        if (name) {
            addItem(name, 'https://placehold.co/40x40/60A5FA/FFFFFF?text=Manuale'); 
            addManualInputEl.value = "";
        }
    });
    addManualInputEl.addEventListener("keypress", (e) => {
        if (e.key === 'Enter') { addManualBtnEl.click(); }
    });
    clearBtnEl.addEventListener("click", () => {
        if (confirm("Sei sicuro di voler pulire l'intera lista?")) {
            shopping = [];
            renderShopping();
        }
    });
    saveBtnEl.addEventListener("click", saveList);
    loadBtnEl.addEventListener("click", loadLists);
    
    // EVENTI PDF/CONDIVISIONE (uso di actionPending per la nota)
    downloadBtnEl.addEventListener("click", () => {
        pdfNoteContainerEl.style.display = 'block';
        actionPending = 'download';
    });
    shareBtnEl.addEventListener("click", () => {
        pdfNoteContainerEl.style.display = 'block';
        actionPending = 'share';
    });
    pdfNoteConfirmBtnEl.addEventListener("click", () => {
        pdfNote = pdfNoteInputEl.value.trim();
        if (actionPending === 'download') {
            downloadStyledPDF();
        } else if (actionPending === 'share') {
            sharePDF();
        }
        actionPending = '';
    });
    
    // EVENTI LISTE SALVATE e LOGIN/LOGOUT (Omessi per brevità, sono inclusi nel file completo)
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
                } else { alert("Lista non trovata."); }
            } catch (err) { console.error("Errore nel caricamento della lista:", err); alert("Errore nel caricamento della lista."); }
        } else if (action === "delete") {
            if (!confirm("Sei sicuro di voler eliminare questa lista salvata?")) return;
            try {
                await db.collection("liste_salvate").doc(id).delete();
                alert("Lista eliminata con successo.");
                loadLists();
            } catch (err) { console.error("Errore nell'eliminazione della lista:", err); alert("Errore nell'eliminazione della lista."); }
        }
    });

    loginButtonEl.addEventListener("click", handleLogin);
    inputLastNameEl.addEventListener("keypress", (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    logoutButtonEl.addEventListener("click", handleLogout);
}


async function checkLoginStatus() {
    if (CURRENT_USER_ID) {
        try {
            const doc = await db.collection(USER_COLLECTION_NAME).doc(CURRENT_USER_ID).get();
            if (doc.exists) {
                CURRENT_USER_DATA = doc.data();
                initializeApp();
            } else {
                handleLogout(); 
            }
        } catch (err) {
            // FUNZIONE CONNESSIONE ALLA RETE: Gestisce l'errore se Firebase non è raggiungibile
            console.error("Errore nel recupero dati utente (Firestore/Network):", err);
            alert("Errore di rete o di connessione al database. Riprova più tardi.");
            handleLogout(); 
        }
    } else {
        initializeApp();
    }
}


// AVVIO SICURO: Avvia l'app solo quando tutti gli elementi HTML sono caricati
document.addEventListener('DOMContentLoaded', () => {
    if (!getDOMElements()) return; 
    addAllEventListeners();
    checkLoginStatus(); 
});
