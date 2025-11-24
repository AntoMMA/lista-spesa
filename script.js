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

// GESTIONE ID LOCALE E INFORMAZIONI UTENTE
let CURRENT_USER_ID = localStorage.getItem("user_unique_id") || null;
let CURRENT_USER_DATA = { firstName: "", lastName: "" };
const USER_COLLECTION_NAME = "registered_users"; 
let pdfNote = ""; // Variabile per la nota del PDF

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


/* -------------- VARIABILI GLOBALI E CATTURA ELEMENTI DOM -------------- */
let shopping = []; // La lista spesa attiva

// Elementi di interfaccia utente
const loginGateEl = document.getElementById("loginGate");
const mainAppEl = document.getElementById("mainApp");
const loginButtonEl = document.getElementById("loginButton");
const inputFirstNameEl = document.getElementById("inputFirstName");
const inputLastNameEl = document.getElementById("inputLastName");
const loggedInUserEl = document.getElementById("loggedInUser");
const logoutButtonEl = document.getElementById("logoutButton");
const catalogEl = document.getElementById("catalog");
const shoppingItemsEl = document.getElementById("shoppingItems");
const itemCountEl = document.getElementById("itemCount");
const addManualInputEl = document.getElementById("addManualInput");
const addManualBtnEl = document.getElementById("addManualBtn");
const clearBtnEl = document.getElementById("clearBtn");
const saveBtnEl = document.getElementById("saveBtn");
const loadBtnEl = document.getElementById("loadBtn");
const savedListsEl = document.getElementById("savedLists");
const activeUsersListEl = document.getElementById("activeUsersList");
const pdfNoteContainerEl = document.getElementById("pdfNoteContainer");
const pdfNoteInputEl = document.getElementById("pdfNoteInput");
const pdfNoteConfirmBtnEl = document.getElementById("pdfNoteConfirmBtn");
const downloadBtnEl = document.getElementById("downloadBtn");
const shareBtnEl = document.getElementById("shareBtn");

/* -------------- CATALOGO PREIMPOSTATO AMPLIATO E CON IMMAGINI (Temporanee/Placeholder) -------------- */
// *** QUESTE IMMAGINI SONO TEMPORANEE. DOVRAI SOSTITUIRLE CON I TUOI URL STABILI (es. da Firebase Storage) ***
const catalogo = [
    // --- FRUTTA E VERDURA ---
    { categoria: "Frutta fresca", nome: "Mele Golden", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Frutta" },
    { categoria: "Frutta fresca", nome: "Banane", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Frutta" },
    { categoria: "Frutta fresca", nome: "Arance da tavola", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Frutta" },
    { categoria: "Frutta fresca", nome: "Uva bianca", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Frutta" },
    { categoria: "Verdura", nome: "Insalata iceberg", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Verdura" },
    { categoria: "Verdura", nome: "Pomodori ramati", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Verdura" },
    { categoria: "Verdura", nome: "Patate", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Verdura" },
    { categoria: "Erbe aromatiche", nome: "Basilico fresco", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Erbe" },
    
    // --- CARNE E PESCE ---
    { categoria: "Carne rossa", nome: "Bistecca di manzo", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Carne" },
    { categoria: "Carne bianca", nome: "Petto di pollo", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Carne" },
    { categoria: "Pesce fresco", nome: "Salmone", imgUrl: "https://placehold.co/50x50/1D4ED8/FFFFFF?text=Pesce" },
    { categoria: "Pesce fresco", nome: "Orata", imgUrl: "https://placehold.co/50x50/1D4ED8/FFFFFF?text=Pesce" },
    
    // --- LATTICINI E UOVA ---
    { categoria: "Latte e derivati", nome: "Latte intero", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Latte" },
    { categoria: "Formaggi freschi", nome: "Mozzarella", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Formaggio" },
    { categoria: "Formaggi stagionati", nome: "Parmigiano Reggiano", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Formaggio" },
    { categoria: "Uova", nome: "Uova grandi (confezione da 6)", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Uova" },

    // --- PASTA, PANE E CEREALI ---
    { categoria: "Pasta secca", nome: "Spaghetti", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Pasta" },
    { categoria: "Pane", nome: "Pane fresco (tipo casereccio)", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Pane" },
    { categoria: "Colazione", nome: "Cereali per la colazione", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Cereali" },

    // --- SURGELATI ---
    { categoria: "Verdure surgelate", nome: "Spinaci a cubetti", imgUrl: "https://placehold.co/50x50/06B6D4/FFFFFF?text=Surgelato" },
    { categoria: "Pasti pronti", nome: "Pizza surgelata", imgUrl: "https://placehold.co/50x50/06B6D4/FFFFFF?text=Surgelato" },

    // --- BEVANDE E ALCOLICI ---
    { categoria: "Acqua", nome: "Acqua naturale (6x1.5L)", imgUrl: "https://placehold.co/50x50/10B981/FFFFFF?text=Bevande" },
    { categoria: "Bevande zuccherate", nome: "Cola", imgUrl: "https://placehold.co/50x50/10B981/FFFFFF?text=Bevande" },
    { categoria: "Vino", nome: "Vino rosso (Tavola)", imgUrl: "https://placehold.co/50x50/DC2626/FFFFFF?text=Vino" },
    
    // --- IGIENE E CASA ---
    { categoria: "Igiene personale", nome: "Dentifricio", imgUrl: "https://placehold.co/50x50/F97316/FFFFFF?text=Igiene" },
    { categoria: "Pulizia casa", nome: "Detersivo pavimenti", imgUrl: "https://placehold.co/50x50/F97316/FFFFFF?text=Casa" },
];
/* -------------------------------------------------------- */


/* -------------- FUNZIONI UTENTE E AUTENTICAZIONE -------------- */

async function handleLogin() {
    const firstName = inputFirstNameEl.value.trim();
    const lastName = inputLastNameEl.value.trim();

    if (!firstName || !lastName) {
        alert("Inserisci Nome e Cognome per accedere.");
        return;
    }

    // Prova a trovare l'utente esistente (per persistenza)
    const userRef = db.collection(USER_COLLECTION_NAME).where("firstName", "==", firstName).where("lastName", "==", lastName).limit(1);
    const snapshot = await userRef.get();

    if (!snapshot.empty) {
        // Utente esistente
        const userData = snapshot.docs[0].data();
        CURRENT_USER_ID = snapshot.docs[0].id;
        CURRENT_USER_DATA = { firstName, lastName };
        localStorage.setItem("user_unique_id", CURRENT_USER_ID);
        
        // Aggiorna lo stato di login (es. 'online') nel database Realtime
        dbRT.ref('active_users/' + CURRENT_USER_ID).set({
            firstName: firstName,
            lastName: lastName,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

    } else {
        // Nuovo utente: registra e genera un nuovo ID
        CURRENT_USER_ID = generateUUID();
        CURRENT_USER_DATA = { firstName, lastName };
        localStorage.setItem("user_unique_id", CURRENT_USER_ID);

        try {
            await db.collection(USER_COLLECTION_NAME).doc(CURRENT_USER_ID).set(CURRENT_USER_DATA);

            // Aggiungi al database Realtime come utente attivo
            dbRT.ref('active_users/' + CURRENT_USER_ID).set({
                firstName: firstName,
                lastName: lastName,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });

        } catch (error) {
            console.error("Errore durante la registrazione:", error);
            alert("Errore durante la registrazione dell'utente.");
            return; 
        }
    }

    initializeApp();
}

function handleLogout() {
    if (CURRENT_USER_ID) {
        // Rimuovi l'utente da "active_users"
        dbRT.ref('active_users/' + CURRENT_USER_ID).remove();
    }
    
    CURRENT_USER_ID = null;
    CURRENT_USER_DATA = { firstName: "", lastName: "" };
    localStorage.removeItem("user_unique_id");
    
    // Ritorna alla schermata di login
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
        // Il data-img-url è fondamentale per aggiungere l'immagine all'elemento lista
        html += `<div class="catalog-item" data-name="${item.nome}" data-img-url="${item.imgUrl}">
                    <img src="${item.imgUrl}" alt="${item.nome}" class="product-photo">
                    <span>${item.nome}</span>
                </div>`;
    });

    catalogEl.innerHTML = html;
}

function renderShopping() {
    // Ordina: elementi da fare prima, poi elementi fatti
    const sortedShopping = [...shopping].sort((a, b) => {
        if (a.done === b.done) return 0;
        return a.done ? 1 : -1;
    });

    shoppingItemsEl.innerHTML = sortedShopping.map((item, index) => {
        const itemClass = item.done ? 'done' : '';
        
        return `<li class="${itemClass}" data-index="${index}" data-name="${item.nome}">
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

    // Aggiorna contatore
    itemCountEl.textContent = shopping.length;
    
    // Sincronizza su Firebase Realtime Database
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
        // Se l'elemento esiste già, aumenta la quantità e segnalo come da fare
        existingItem.qty += 1;
        existingItem.done = false;
    } else {
        // Altrimenti, aggiungi un nuovo elemento
        shopping.push({
            nome: name,
            qty: 1,
            done: false,
            imgUrl: imgUrl || 'https://placehold.co/40x40' 
        });
    }

    renderShopping();
}

// Funzione per gestire i click sulla lista spesa (aumento, diminuzione, eliminazione, fatto)
function handleListClick(e) {
    const target = e.target;
    const action = target.dataset.action;
    const listItem = target.closest('li');
    if (!listItem) return;
    
    // Trova l'indice dell'elemento (ricerca per nome è più sicuro in caso di riordino)
    const itemName = listItem.dataset.name;
    const itemIndex = shopping.findIndex(item => item.nome === itemName);
    if (itemIndex === -1) return;
    
    const item = shopping[itemIndex];

    switch(action) {
        case 'increase':
            item.qty += 1;
            break;
        case 'decrease':
            item.qty -= 1;
            if (item.qty <= 0) {
                // Rimuovi se la quantità è zero o meno
                shopping.splice(itemIndex, 1);
            }
            break;
        case 'delete':
            if (confirm(`Sei sicuro di voler eliminare "${item.nome}"?`)) {
                shopping.splice(itemIndex, 1);
            }
            break;
        case 'toggle-done':
            item.done = !item.done;
            break;
    }
    
    // Se l'azione non è stata l'eliminazione, il re-render
    // La re-render viene eseguita comunque per l'aggiornamento della quantità
    renderShopping();
}


/* -------------- FUNZIONI SALVATAGGIO/CARICAMENTO FIRESTORE -------------- */

async function saveList() {
    if (shopping.length === 0) {
        alert("La lista è vuota. Non c'è nulla da salvare.");
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
        loadLists(); // Aggiorna l'elenco delle liste salvate
    } catch (err) {
        console.error("Errore nel salvataggio della lista:", err);
        alert("Errore nel salvataggio della lista.");
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
        savedListsEl.innerHTML = '<p class="muted">Errore nel caricamento.</p>';
    }
}


/* -------------- FUNZIONI PDF e CONDIVISIONE (IMPLEMENTATE) -------------- */

function downloadStyledPDF() {
    // Verifica se l'API jsPDF è disponibile
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("Libreria jsPDF non caricata correttamente. Impossibile generare il PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Configurazione del layout
    let y = 15; // Posizione Y iniziale
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const doneItems = shopping.filter(i => i.done);
    const pendingItems = shopping.filter(i => !i.done);
    
    // --- Intestazione ---
    doc.setFontSize(18);
    doc.text("Lista Spesa Condivisa", pageWidth / 2, y, { align: "center" });
    y += 8;
    
    // --- Nota personalizzata ---
    if (pdfNote) {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150); // Grigio
        // Avvolge il testo per adattarlo alla larghezza della pagina
        const noteLines = doc.splitTextToSize(`Nota: ${pdfNote}`, pageWidth - 2 * margin);
        doc.text(noteLines, pageWidth / 2, y, { align: "center" });
        y += noteLines.length * 5 + 5;
    }
    
    // --- Titolo Articoli da fare ---
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0); // Nero
    doc.text("Articoli da Acquistare:", margin, y);
    y += 7;
    
    // --- Lista Articoli Pendenti ---
    doc.setFontSize(12);
    pendingItems.forEach(item => {
        const text = `[ ] ${item.nome} (${item.qty} ${item.qty > 1 ? 'unità' : 'unità'})`;
        doc.text(text, margin + 5, y);
        y += 7;
    });
    
    // --- Titolo Articoli Fatti ---
    if (doneItems.length > 0) {
        y += 10;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Articoli Già Acquistati:", margin, y);
        y += 7;
        
        // --- Lista Articoli Fatti ---
        doc.setFontSize(12);
        doc.setTextColor(150, 150, 150); // Grigio per gli articoli completati
        doneItems.forEach(item => {
            const text = `[X] ${item.nome} (${item.qty} ${item.qty > 1 ? 'unità' : 'unità'})`;
            doc.text(text, margin + 5, y);
            y += 7;
        });
    }

    // Esegui il download
    doc.save("ListaSpesa.pdf");
    pdfNote = ""; // Pulisci la nota dopo il download
    pdfNoteInputEl.value = "";
    pdfNoteContainerEl.style.display = 'none'; // Nasconde l'input della nota
}

function sharePDF() {
    // Prepara il testo della lista per la condivisione diretta (l'API Web Share non condivide direttamente i file generati al volo)

    const listText = shopping.map(item => 
        `[${item.done ? 'X' : ' '}] ${item.nome} (Qta: ${item.qty})`
    ).join('\n');

    const shareData = {
        title: 'Lista Spesa Condivisa',
        text: `Ecco la nostra lista della spesa:\n\n${pdfNote ? `Nota: ${pdfNote}\n\n` : ''}${listText}`,
        // URL da condividere se ne hai uno (es. l'URL della tua app)
        url: window.location.href, 
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Contenuto della lista condiviso con successo.'))
            .catch((error) => {
                console.error('Errore durante la condivisione:', error);
                // Fallback: scarica il PDF se la condivisione fallisce
                downloadStyledPDF();
            });
    } else {
        // Fallback per browser non supportati: scarica il PDF
        alert("Il tuo browser non supporta l'API di condivisione. Verrà scaricato il PDF.");
        downloadStyledPDF();
    }
    
    pdfNote = ""; // Pulisci la nota dopo l'azione
    pdfNoteInputEl.value = "";
    pdfNoteContainerEl.style.display = 'none';
}


/* -------------- EVENT LISTENERS -------------- */

// EVENTO CATALOGO: Aggiunge elemento alla lista
catalogEl.addEventListener("click", (e) => {
    const itemEl = e.target.closest(".catalog-item");
    if (itemEl) {
        const name = itemEl.dataset.name;
        const imgUrl = itemEl.dataset.imgUrl;
        addItem(name, imgUrl);
    }
});

// EVENTO LISTA SPESA: Gestisce aumento/diminuzione/eliminazione/fatto
shoppingItemsEl.addEventListener("click", handleListClick);

// EVENTO PULSANTE AGGIUNGI MANUALE
addManualBtnEl.addEventListener("click", () => {
    const name = addManualInputEl.value.trim();
    if (name) {
        // Usa un placeholder generico se l'immagine è aggiunta manualmente
        addItem(name, 'https://placehold.co/40x40/60A5FA/FFFFFF?text=Manuale'); 
        addManualInputEl.value = "";
    }
});
addManualInputEl.addEventListener("keypress", (e) => {
    if (e.key === 'Enter') {
        addManualBtnEl.click();
    }
});

// EVENTO PULSANTE PULISCI
clearBtnEl.addEventListener("click", () => {
    if (confirm("Sei sicuro di voler pulire l'intera lista?")) {
        shopping = [];
        renderShopping();
    }
});

// EVENTO PULSANTE SALVA
saveBtnEl.addEventListener("click", saveList);

// EVENTO PULSANTE CARICA
loadBtnEl.addEventListener("click", loadLists);

// EVENTO PULSANTE SCARICA PDF
downloadBtnEl.addEventListener("click", () => {
    // Mostra il campo della nota prima di avviare il download
    pdfNoteContainerEl.style.display = 'block';
    // Il download viene gestito dopo la conferma della nota
});

// EVENTO PULSANTE CONDIVIDI PDF
shareBtnEl.addEventListener("click", () => {
    // Mostra il campo della nota prima di avviare la condivisione
    pdfNoteContainerEl.style.display = 'block';
    // La condivisione viene gestita dopo la conferma della nota
});

// EVENTO CONFERMA NOTA PDF
pdfNoteConfirmBtnEl.addEventListener("click", () => {
    pdfNote = pdfNoteInputEl.value.trim();
    // Determina quale azione (download o share) deve seguire la conferma della nota
    // Utilizziamo il download come azione predefinita dopo la conferma.
    downloadStyledPDF(); 
});


// EVENTI LISTE SALVATE
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


// EVENTO LOGOUT
logoutButtonEl.addEventListener("click", handleLogout);


/* -------------- FUNZIONI REALTIME (UTENTI ATTIVI E LISTA) -------------- */

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
    });
}

function listenToActiveList() {
    dbRT.ref('active_list/').on('value', (snapshot) => {
        // Questa funzione si attiva OGNI VOLTA che la lista nel Realtime Database cambia
        const remoteList = snapshot.val();
        
        // Controlla se il cambiamento è stato innescato da te (potrebbe richiedere un controllo più sofisticato)
        // Per ora, sincronizziamo se la lista locale è diversa da quella remota (utile per la collaborazione)
        if (JSON.stringify(remoteList) !== JSON.stringify(shopping)) {
            shopping = remoteList || [];
            renderShopping();
        }
    });
}


/* -------------- INIZIALIZZAZIONE -------------- */

function initializeApp() {
    if (CURRENT_USER_ID) {
        // Utente loggato: mostra l'app
        loginGateEl.style.display = 'none';
        mainAppEl.style.display = 'grid';
        loggedInUserEl.textContent = `${CURRENT_USER_DATA.firstName} ${CURRENT_USER_DATA.lastName}`;

        // Avvia i listener di Firebase Realtime
        listenToActiveUsers();
        listenToActiveList();
        
        // Imposta la disconnessione automatica al reload/chiusura
        dbRT.ref('active_users/' + CURRENT_USER_ID).onDisconnect().remove();

    } else {
        // Utente non loggato: mostra il gate di login
        loginGateEl.style.display = 'flex';
        mainAppEl.style.display = 'none';
        loggedInUserEl.textContent = "Offline";
    }

    renderCatalog();
    renderShopping();
    loadLists(); // Carica le liste salvate al primo accesso
}


// Controlla il login all'avvio della pagina
async function checkLoginStatus() {
    if (CURRENT_USER_ID) {
        // Prova a recuperare i dati utente da Firestore in base all'ID locale
        try {
            const doc = await db.collection(USER_COLLECTION_NAME).doc(CURRENT_USER_ID).get();
            if (doc.exists) {
                CURRENT_USER_DATA = doc.data();
                initializeApp();
            } else {
                // ID locale obsoleto, forzo il re-login
                handleLogout(); 
            }
        } catch (err) {
            console.error("Errore nel recupero dati utente:", err);
            handleLogout(); 
        }
    } else {
        initializeApp();
    }
}

// Avvia l'app
checkLoginStatus();
