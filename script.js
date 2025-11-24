/* =================================================================
   FILE: script.js - Codice Completo e Funzionante
   ================================================================= */

/* -------------- FIREBASE CONFIG (DEVI SOSTITUIRE!) -------------- */
// SOSTITUISCI CON LA TUA CONFIGURAZIONE REALE DI FIREBASE!
const firebaseConfig = {
  apiKey: "AIzaSyCPHLvSRBt40Wloa0nnnAp5LVdUIOb9J40", 
  authDomain: "lista-spesa-db7f7.firebaseapp.com",
  projectId: "lista-spesa-db7f7",
  storageBucket: "lista-spesa-db7f7.firebasestorage.app",
  messagingSenderId: "736757613454",
  appId: "1:736757613454:web:50744d7ce9db9d3ebc5adf",
  measurementId: "G-64QH2WHH2X"
};

// Inizializzazione Firebase (Dipende dalle librerie nel tuo HTML!)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const dbRT = firebase.database(); 

// Variabili globali
let CURRENT_USER_ID = localStorage.getItem("user_unique_id") || null;
let CURRENT_USER_DATA = { firstName: "", lastName: "" };
const USER_COLLECTION_NAME = "registered_users"; 
const FREQUENT_PRODUCTS_COLLECTION = "prodotti_frequenti"; 

let pdfNote = ""; 
let shopping = []; 
let actionPending = '';

/* -------------- VARIABILI DOM (Elementi HTML) -------------- */
let loginGateEl, mainAppEl, loginButtonEl, inputFirstNameEl, inputLastNameEl, loggedInUserEl, logoutButtonEl, catalogListEl, shoppingItemsEl, itemCountEl, addManualInputEl, addManualBtnEl, clearBtnEl, saveBtnEl, loadBtnEl, savedListsEl, activeUsersListEl, pdfNoteContainerEl, pdfNoteInputEl, pdfNoteConfirmBtnEl, downloadBtnEl, shareBtnEl, searchInputEl; 

/* -------------- CATALOGO PRODOTTI ESTESO (INVARIANTI) -------------- */
const catalogo = [
    // --- FRUTTA E VERDURA ---
    { categoria: "Frutta fresca", nome: "Mele Golden", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Mela" },
    { categoria: "Frutta fresca", nome: "Banane", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Banana" },
    { categoria: "Frutta fresca", nome: "Arance", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Arancia" },
    { categoria: "Frutta secca", nome: "Noci (sacchetto)", imgUrl: "https://placehold.co/50x50/8B5CF6/FFFFFF?text=Noci" },
    { categoria: "Verdura (Foglia)", nome: "Insalata iceberg", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Insala" },
    { categoria: "Verdura (Tubero/Radice)", nome: "Patate", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Patate" },
    { categoria: "Verdura (Frutto)", nome: "Pomodori ramati", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Pomo" },
    { categoria: "Aromi/Erbe", nome: "Cipolle", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Cipolle" },
    
    // --- CARNE E PESCE ---
    { categoria: "Carne rossa", nome: "Bistecca di manzo", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Manzo" },
    { categoria: "Carne bianca", nome: "Petto di pollo", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Pollo" },
    { categoria: "Salumi/Affettati", nome: "Prosciutto cotto (vaschetta)", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Cotto" },
    { categoria: "Pesce fresco", nome: "Salmone (filetto)", imgUrl: "https://placehold.co/50x50/1D4ED8/FFFFFF?text=Salmon" },
    { categoria: "Pesce in scatola", nome: "Tonno sott'olio (scatola)", imgUrl: "https://placehold.co/50x50/1D4ED8/FFFFFF?text=Tonno" },

    // --- SURGELATI ---
    { categoria: "Surgelati (Verdura)", nome: "Piselli fini (sacchetto)", imgUrl: "https://placehold.co/50x50/14B8A6/FFFFFF?text=Piselli" },
    { categoria: "Surgelati (Pasti)", nome: "Pizza Margherita (surgelata)", imgUrl: "https://placehold.co/50x50/14B8A6/FFFFFF?text=Pizza" },
    { categoria: "Surgelati (Dolci)", nome: "Gelato alla crema (vaschetta)", imgUrl: "https://placehold.co/50x50/FCA5A5/000000?text=Gelato" },
    
    // --- LATTICINI E UOVA ---
    { categoria: "Latte e derivati", nome: "Latte intero", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Latte" },
    { categoria: "Formaggi freschi", nome: "Mozzarella (busta)", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Mozza" },
    { categoria: "Formaggi stagionati", nome: "Parmigiano Reggiano grattugiato", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Parmig" },
    { categoria: "Uova", nome: "Uova grandi (confezione da 6)", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Uova" },
    
    // --- PANE, PASTA E CEREALI ---
    { categoria: "Pane/Panificati", nome: "Pane fresco (tipo casereccio)", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Pane" },
    { categoria: "Pasta secca", nome: "Spaghetti", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Spag" },
    { categoria: "Riso", nome: "Riso Arborio", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Riso" },
    
    // --- BEVANDE ---
    { categoria: "Acqua", nome: "Acqua naturale (6x1.5L)", imgUrl: "https://placehold.co/50x50/10B981/FFFFFF?text=Acqua" },
    { categoria: "Succhi/Bibite", nome: "Coca-Cola (lattine)", imgUrl: "https://placehold.co/50x50/10B981/FFFFFF?text=Coca" },
    { categoria: "Caffè/Tè", nome: "Caffè macinato (moka)", imgUrl: "https://placehold.co/50x50/701A75/FFFFFF?text=CaffèM" },
    
    // --- DISPENSA E SCATOLAME ---
    { categoria: "Legumi secchi/scatolame", nome: "Fagioli in scatola", imgUrl: "https://placehold.co/50x50/F59E0B/000000?text=Fagioli" },
    { categoria: "Pomodori/Salse", nome: "Passata di pomodoro", imgUrl: "https://placehold.co/50x50/F59E0B/000000?text=Passat" },
    { categoria: "Olii/Aceti", nome: "Olio Extra Vergine di Oliva (1L)", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=OEVO" },
    
    // --- CONDIMENTI E INGREDIENTI BASE ---
    { categoria: "Condimenti", nome: "Sale fino", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Sale" },
    { categoria: "Salse", nome: "Maionese", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Maio" },
    
    // --- DOLCI E SNACK ---
    { categoria: "Biscotti/Merendine", nome: "Biscotti secchi", imgUrl: "https://placehold.co/50x50/EC4899/FFFFFF?text=Biscot" },
    { categoria: "Snack salati", nome: "Patatine (sacchetto grande)", imgUrl: "https://placehold.co/50x50/EC4899/FFFFFF?text=Chips" },

    // --- IGIENE PERSONALE E SALUTE ---
    { categoria: "Igiene orale", nome: "Dentifricio", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Denti" },
    { categoria: "Corpo/Capelli", nome: "Shampoo", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Shamp" },
    { categoria: "Carta/Fazzoletti", nome: "Carta igienica (rotoli)", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=CartaI" },
    
    // --- PULIZIA CASA E ACCESSORI ---
    { categoria: "Lavanderia", nome: "Detersivo lavatrice (liquido)", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Lavand" },
    { categoria: "Superfici/Pavimenti", nome: "Sgrassatore universale", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Sgrass" },
    { categoria: "Cucina/Lavastoviglie", nome: "Pastiglie lavastoviglie", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=LavaS" },

    // --- PETS E VARIE ---
    { categoria: "Cibo per Animali", nome: "Crocchette per cane (sacchetto)", imgUrl: "https://placehold.co/50x50/475569/FFFFFF?text=Dog" },
    { categoria: "Cucina/Usa e Getta", nome: "Pellicola trasparente", imgUrl: "https://placehold.co/50x50/78716C/FFFFFF?text=Pelli" },
    { categoria: "Varie", nome: "Pile stilo AA", imgUrl: "https://placehold.co/50x50/78716C/FFFFFF?text=Pile" }
];

/* -------------- FUNZIONI BASE -------------- */

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function initializeApp() {
    if (CURRENT_USER_ID) {
        loginGateEl.style.display = 'none';
        mainAppEl.style.display = 'grid'; 
        loggedInUserEl.textContent = `${CURRENT_USER_DATA.firstName} ${CURRENT_USER_DATA.lastName}`;

        listenToActiveUsers();
        listenToActiveList();
        
        // Registra l'utente come attivo (con disconnessione automatica)
        dbRT.ref('active_users/' + CURRENT_USER_ID).onDisconnect().remove();
        dbRT.ref('active_users/' + CURRENT_USER_ID).set({
            firstName: CURRENT_USER_DATA.firstName,
            lastName: CURRENT_USER_DATA.lastName,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        
        const frequentProducts = await getFrequentProducts(); 
        renderCatalog(catalogo, frequentProducts); 
    } else {
        loginGateEl.style.display = 'flex'; 
        mainAppEl.style.display = 'none';
        if(loggedInUserEl) loggedInUserEl.textContent = "Offline";
        renderCatalog(catalogo);
    }

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
        
        initializeApp();
    } catch (error) {
         console.error("Errore durante il login/registrazione:", error);
        alert("Errore di connessione a Firebase. Controlla la tua configurazione e la console."); 
    }
}

function handleLogout() {
    if (CURRENT_USER_ID) {
        // Rimuove l'utente dal Realtime DB (utenti attivi)
        dbRT.ref('active_users/' + CURRENT_USER_ID).remove();
    }
    
    CURRENT_USER_ID = null;
    CURRENT_USER_DATA = { firstName: "", lastName: "" };
    localStorage.removeItem("user_unique_id");
    
    // Ritorna all'interfaccia di login
    loginGateEl.style.display = 'flex';
    mainAppEl.style.display = 'none';
    if(loggedInUserEl) loggedInUserEl.textContent = "Offline";
}


/* -------------- FUNZIONI DI AUTO-APPRENDIMENTO -------------- */

async function saveManualAddition(name) {
    if (!CURRENT_USER_ID) return;
    const docId = name.toLowerCase().replace(/[^a-z0-9]/g, '');

    try {
        const docRef = db.collection(FREQUENT_PRODUCTS_COLLECTION).doc(docId);
        
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);

            if (doc.exists) {
                const newCount = (doc.data().count || 0) + 1;
                transaction.update(docRef, { 
                    count: newCount, 
                    lastUsed: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                transaction.set(docRef, {
                    name: name,
                    count: 1,
                    imgUrl: 'https://placehold.co/50x50/60A5FA/FFFFFF?text=Manuale',
                    lastUsed: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        });
    } catch (e) {
        console.error("Errore nel salvataggio dell'aggiunta manuale: ", e);
    }
}

async function getFrequentProducts() {
    try {
        const snapshot = await db.collection(FREQUENT_PRODUCTS_COLLECTION)
            .where('count', '>', 0)
            .orderBy('count', 'desc') 
            .orderBy('lastUsed', 'desc') 
            .limit(10)
            .get();

        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Errore nel recupero dei prodotti frequenti:", error);
        return [];
    }
}

/* -------------- FUNZIONI CATALOGO -------------- */

function renderCatalog(itemsToRender, frequentProducts = []) {
    let html = '';
    let currentCategory = '';

    // 1. Sezione "Frequenti"
    if (frequentProducts.length > 0) {
        html += `<h3 class="catalog-category">⭐ FREQUENTEMENTE USATI</h3>`;
        
        frequentProducts.forEach(item => {
             html += `<div class="catalog-item frequent-item" data-name="${item.name}" data-img-url="${item.imgUrl}">
                        <img src="${item.imgUrl}" alt="${item.name}" class="product-photo">
                        <span>${item.name} <small>(${item.count}x)</small></span>
                    </div>`;
        });
    }

    // 2. Sezione "Catalogo Completo"
    const sortedItems = [...itemsToRender].sort((a, b) => {
        if (a.categoria !== b.categoria) {
            return a.categoria.localeCompare(b.categoria);
        }
        return a.nome.localeCompare(b.nome);
    });

    html += `<h3 class="catalog-category">CATALOGO COMPLETO</h3>`;

    sortedItems.forEach(item => {
        if (item.categoria !== currentCategory) {
            // Evita di ripetere la categoria se è vuota o già stampata
            if (currentCategory !== '' && html.slice(-20).indexOf('catalog-category') === -1) {
                // Aggiungi un separatore se necessario, ma di solito la categoria basta
            }
            html += `<h3 class="catalog-category">${item.categoria}</h3>`;
            currentCategory = item.categoria;
        }
        html += `<div class="catalog-item" data-name="${item.nome}" data-img-url="${item.imgUrl}">
                    <img src="${item.imgUrl}" alt="${item.nome}" class="product-photo">
                    <span>${item.nome}</span>
                </div>`;
    });

    if(catalogListEl) catalogListEl.innerHTML = html;
}

async function handleSearch() {
    const searchTerm = searchInputEl.value.toLowerCase().trim();
    const frequentProducts = await getFrequentProducts();

    const filteredCatalog = catalogo.filter(item => 
        item.nome.toLowerCase().includes(searchTerm) || 
        item.categoria.toLowerCase().includes(searchTerm)
    );
    
    const filteredFrequent = frequentProducts.filter(item => 
        item.name.toLowerCase().includes(searchTerm)
    );

    // Se la ricerca è vuota, mostra tutto il catalogo con i frequenti in cima
    if (searchTerm === "") {
        renderCatalog(catalogo, frequentProducts);
    } else {
         // Altrimenti mostra i risultati filtrati (dando precedenza ai frequenti filtrati)
        renderCatalog(filteredCatalog, filteredFrequent);
    }
    
    catalogListEl.scrollTop = 0; 
}


/* -------------- FUNZIONI LISTA SPESA E SINCRONIZZAZIONE -------------- */

function renderShopping() {
    const sortedShopping = [...shopping].sort((a, b) => {
        if (a.done === b.done) return 0;
        return a.done ? 1 : -1; // Metodo 1: gli elementi fatti vanno in fondo
        // return a.done ? -1 : 1; // Metodo 2: gli elementi fatti vanno in cima
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
        // Sincronizza la lista corrente con il Realtime Database
        dbRT.ref('active_list/').set(shopping)
            .catch(error => console.error("Errore sincronizzazione Realtime:", error));
    }
}

function addItem(name, imgUrl, isManual = false) {
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
    
    // Auto-apprendimento: se aggiunto manualmente, salva l'evento.
    if (isManual) {
        saveManualAddition(name);
        // Dopo l'aggiunta manuale, ricarica il catalogo per mostrare subito il prodotto frequente
        getFrequentProducts().then(frequent => renderCatalog(catalogo, frequent));
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

    if (target.type === 'checkbox' && action === 'toggle-done') {
         item.done = target.checked; 
    } else {
        switch(action) {
            case 'increase': item.qty += 1; break;
            case 'decrease':
                item.qty -= 1;
                if (item.qty <= 0) { shopping.splice(itemIndex, 1); }
                break;
            case 'delete':
                if (confirm(`Sei sicuro di voler eliminare "${item.nome}"?`)) { shopping.splice(itemIndex, 1); }
                break;
        }
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
                        <span class="list-name">${data.name}</span>
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

/* -------------- FUNZIONI PDF e CONDIVISIONE (STILIZZATE) -------------- */

function generateStyledListHTML(list, note) {
    // Funzione per la mappatura colori dei badge (estratta dalle categorie del catalogo)
    const getColor = (name) => {
        if (name.includes("Biscotti") || name.includes("Cioccolato") || name.includes("Merendine")) return "#EC4899"; // Rosa (Dolci)
        if (name.includes("Burro") || name.includes("Panna") || name.includes("Latte") || name.includes("Yogurt") || name.includes("Formaggi") || name.includes("Uova")) return "#FBBF24"; // Giallo (Latticini)
        if (name.includes("Manzo") || name.includes("Pollo") || name.includes("Carne") || name.includes("Prosciutto") || name.includes("Salumi") || name.includes("Pesce")) return "#EF4444"; // Rosso (Carne/Pesce)
        if (name.includes("Acqua") || name.includes("Coca-Cola") || name.includes("Succo") || name.includes("The") || name.includes("Birra") || name.includes("Vino")) return "#10B981"; // Verde (Bevande)
        if (name.includes("Mele") || name.includes("Pomodori") || name.includes("Insalata") || name.includes("Frutta") || name.includes("Verdura")) return "#34D399"; // Verde chiaro (F/V)
        if (name.includes("Detersivo") || name.includes("Sgrassatore") || name.includes("Shampoo") || name.includes("Carta") || name.includes("Igiene")) return "#059669"; // Verde scuro (Casa/Igiene)
        return "#60A5FA"; // Blu predefinito (Manuale/Varie)
    };

    let listHtml = list.map((item) => {
        const itemClass = item.done ? 'pdf-done-item' : 'pdf-pending-item';
        const color = getColor(item.nome);
        const iconText = item.nome.length >= 4 ? item.nome.substring(0, 4).toUpperCase() : item.nome.toUpperCase(); 
        
        // Stili in linea per la Dark Mode compatibile con html2canvas
        return `
            <div class="${itemClass}" style="
                display: flex; 
                align-items: center; 
                padding: 6px 0; 
                border-bottom: 1px solid #333; 
                color: ${item.done ? '#999' : '#fff'};
                font-family: Arial, sans-serif;
                font-size: 11px; 
            ">
                <div style="
                    width: 18px; 
                    height: 18px; 
                    border: 1px solid ${item.done ? '#999' : color}; 
                    border-radius: 50%; 
                    margin-right: 8px; 
                    flex-shrink: 0;
                    text-align: center;
                    line-height: 18px;
                    font-size: 9px;
                ">${item.done ? '✓' : ''}</div>
                <div style="
                    width: 35px; 
                    height: 35px; 
                    border-radius: 50%; 
                    background-color: ${color}; 
                    color: #fff;
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    font-size: 8px; 
                    margin-right: 10px;
                    flex-shrink: 0;
                ">${iconText}</div>
                <span style="flex-grow: 1; text-decoration: ${item.done ? 'line-through' : 'none'};">${item.nome}</span>
                <span style="font-weight: bold; color: ${item.done ? '#999' : '#fff'}; flex-shrink: 0;">(x ${item.qty})</span>
            </div>
        `;
    }).join('');

    // Stile del container principale (Dark Mode)
    return `
        <div style="padding: 10px; background: #1a1a1a; color: #fff; font-family: Arial, sans-serif;">
            <h1 style="font-size: 18px; text-align: center; margin-bottom: 5px; color: #60A5FA;">Lista Spesa Condivisa</h1>
            ${note ? `<p style="font-size: 9px; text-align: center; color: #aaa; margin-bottom: 10px;">Nota: ${note}</p>` : ''}
            <div style="border: 1px solid #333; padding: 5px; border-radius: 5px;">
                ${listHtml}
            </div>
        </div>
    `;
}

function downloadStyledPDF() {
    if (!window.jspdf || !window.html2canvas) {
        alert("Librerie jsPDF/html2canvas non caricate. Assicurati che siano incluse nell'HTML.");
        return;
    }

    const printArea = document.getElementById("pdfPrintArea");
    
    // 1. Inietta l'HTML stilizzato
    printArea.innerHTML = generateStyledListHTML(shopping, pdfNote);
    
    const { jsPDF } = window.jspdf;
    
    // 2. Converto l'HTML in un'immagine (canvas)
    html2canvas(printArea, { 
        backgroundColor: '#1a1a1a', 
        scale: 2 
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        const pdfWidth = 210; 
        const pdfHeight = 297; 
        const margin = 10;
        
        const imgWidth = pdfWidth - (2 * margin); 
        const imgHeight = canvas.height * imgWidth / canvas.width; 
        
        let heightLeft = imgHeight; 
        
        const doc = new jsPDF('p', 'mm', [pdfWidth, Math.max(pdfHeight, imgHeight + (2 * margin))]); 
        
        let position = 0;

        // 3. Aggiungo l'immagine al PDF (gestendo le pagine lunghe)
        doc.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - margin);

        while (heightLeft > 0) {
            position = - (imgHeight - heightLeft); 
            doc.addPage();
            doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - margin);
        }

        doc.save("ListaSpesaStilizzata.pdf");
        
        // Pulisce l'area di stampa e la nota
        pdfNote = ""; 
        pdfNoteInputEl.value = "";
        pdfNoteContainerEl.style.display = 'none'; 
        printArea.innerHTML = ''; 
    });
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
                console.error('Errore durante la condivisione web:', error);
                alert("Condivisione fallita. Verrà scaricato il PDF stilizzato.");
                downloadStyledPDF(); 
            });
    } else {
        alert("Il tuo browser non supporta l'API di condivisione nativa. Verrà scaricato il PDF stilizzato.");
        downloadStyledPDF(); 
    }
    
    pdfNote = ""; 
    pdfNoteInputEl.value = "";
    pdfNoteContainerEl.style.display = 'none';
}


/* -------------- FUNZIONI REALTIME (UTENTI ATTIVI E LISTA) -------------- */

async function fetchAllRegisteredUsers() {
    try {
        const snapshot = await db.collection(USER_COLLECTION_NAME).get();
        const users = {};
        snapshot.forEach(doc => {
            users[doc.id] = { ...doc.data(), id: doc.id }; 
        });
        return users;
    } catch (error) {
        console.error("Errore nel recupero di tutti gli utenti registrati:", error);
        return {};
    }
}

async function listenToActiveUsers() {
    if (!CURRENT_USER_ID) return; 

    const allUsers = await fetchAllRegisteredUsers();
    
    dbRT.ref('active_users/').on('value', (snapshot) => {
        const activeUsers = snapshot.val() || {};
        
        const finalUsersList = Object.values(allUsers).map(user => {
            const isActive = activeUsers.hasOwnProperty(user.id); 
            
            return {
                ...user,
                isOnline: isActive
            };
        }).sort((a, b) => {
            if (a.isOnline === b.isOnline) {
                return a.firstName.localeCompare(b.firstName);
            }
            return a.isOnline ? -1 : 1;
        });

        let html = '';
        if (finalUsersList.length > 0) {
            finalUsersList.forEach(user => {
                const isMe = user.id === CURRENT_USER_ID;
                const statusClass = user.isOnline ? 'status-online' : 'status-offline';
                
                html += `<li class="${isMe ? 'me' : ''}">
                            ${user.firstName} ${user.lastName} 
                            <span class="status-indicator ${statusClass}"></span>
                        </li>`;
            });
        } else {
            html = '<li>Nessun utente registrato.</li>';
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
    // Collega tutti gli ID necessari dal DOM
    loginGateEl = document.getElementById("loginGate");
    mainAppEl = document.getElementById("mainApp");
    loginButtonEl = document.getElementById("loginButton");
    inputFirstNameEl = document.getElementById("inputFirstName");
    inputLastNameEl = document.getElementById("inputLastName");
    loggedInUserEl = document.getElementById("loggedInUser");
    logoutButtonEl = document.getElementById("logoutButton");
    
    catalogListEl = document.getElementById("catalogList");
    searchInputEl = document.getElementById("searchInput"); 
    
    shoppingItemsEl = document.getElementById("shoppingItems");
    itemCountEl = document.getElementById("itemCount");
    addManualInputEl = document.getElementById("manualInput"); 
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
    
    return true; 
}

function addAllEventListeners() {
    // EVENTI APP
    catalogListEl.addEventListener("click", (e) => {
        const itemEl = e.target.closest(".catalog-item");
        if (itemEl) {
            const name = itemEl.dataset.name;
            const imgUrl = itemEl.dataset.imgUrl;
            addItem(name, imgUrl); 
        }
    });
    
    searchInputEl.addEventListener("input", handleSearch); 
    shoppingItemsEl.addEventListener("click", handleListClick);
    
    addManualBtnEl.addEventListener("click", () => {
        const name = addManualInputEl.value.trim();
        if (name) {
            addItem(name, 'https://placehold.co/50x50/60A5FA/FFFFFF?text=Manuale', true); 
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
    
    // EVENTI PDF/CONDIVISIONE
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

    // EVENTI LOGIN/LOGOUT
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
            console.error("Errore nel recupero dati utente:", err);
            handleLogout(); 
        }
    } else {
        initializeApp();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // La funzione getDOMElements DEVE essere chiamata per collegare gli elementi HTML
    if (!getDOMElements()) return; 
    addAllEventListeners();
    checkLoginStatus(); 
});
