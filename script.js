/* =================================================================
   FILE: script.js - Codice Completo e Funzionante
   ================================================================= */

/* -------------- FIREBASE CONFIG (DEVI SOSTITUIRE!) -------------- */
const firebaseConfig = {
  // SOSTITUISCI CON LA TUA CONFIGURAZIONE REALE!
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

// Variabili globali
let CURRENT_USER_ID = localStorage.getItem("user_unique_id") || null;
let CURRENT_USER_DATA = { firstName: "", lastName: "" };
const USER_COLLECTION_NAME = "registered_users"; 
let pdfNote = ""; 
let shopping = []; 
let actionPending = '';

/* -------------- VARIABILI DOM (Elementi HTML) -------------- */
let loginGateEl, mainAppEl, loginButtonEl, inputFirstNameEl, inputLastNameEl, loggedInUserEl, logoutButtonEl, catalogListEl, shoppingItemsEl, itemCountEl, addManualInputEl, addManualBtnEl, clearBtnEl, saveBtnEl, loadBtnEl, savedListsEl, activeUsersListEl, pdfNoteContainerEl, pdfNoteInputEl, pdfNoteConfirmBtnEl, downloadBtnEl, shareBtnEl, searchInputEl; 

/* -------------- CATALOGO PRODOTTI ESTESO -------------- */
const catalogo = [
    { categoria: "Frutta fresca", nome: "Mele Golden", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Mela" },
    { categoria: "Frutta fresca", nome: "Banane", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Banana" },
    { categoria: "Frutta fresca", nome: "Arance", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Arancia" },
    { categoria: "Frutta fresca", nome: "Uva (bianca/nera)", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Uva" },
    { categoria: "Frutta secca", nome: "Noci (sacchetto)", imgUrl: "https://placehold.co/50x50/8B5CF6/FFFFFF?text=Noci" },
    { categoria: "Frutta secca", nome: "Mandorle", imgUrl: "https://placehold.co/50x50/8B5CF6/FFFFFF?text=Mand" },
    { categoria: "Verdura (Foglia)", nome: "Insalata iceberg", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Insala" },
    { categoria: "Verdura (Foglia)", nome: "Spinaci freschi", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Spinaci" },
    { categoria: "Verdura (Tubero/Radice)", nome: "Patate", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Patate" },
    { categoria: "Verdura (Frutto)", nome: "Pomodori ramati", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Pomo" },
    { categoria: "Verdura (Frutto)", nome: "Zucchine", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Zucch" },
    { categoria: "Aromi/Erbe", nome: "Cipolle", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Cipolle" },
    { categoria: "Aromi/Erbe", nome: "Aglio", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Aglio" },
    { categoria: "Carne rossa", nome: "Bistecca di manzo", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Manzo" },
    { categoria: "Carne bianca", nome: "Petto di pollo", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Pollo" },
    { categoria: "Salumi/Affettati", nome: "Prosciutto cotto (vaschetta)", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Cotto" },
    { categoria: "Salumi/Affettati", nome: "Fesa di tacchino", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Tacch" },
    { categoria: "Pesce fresco", nome: "Salmone (filetto)", imgUrl: "https://placehold.co/50x50/1D4ED8/FFFFFF?text=Salmon" },
    { categoria: "Pesce fresco", nome: "Orata", imgUrl: "https://placehold.co/50x50/1D4ED8/FFFFFF?text=Orata" },
    { categoria: "Pesce in scatola", nome: "Tonno sott'olio (scatola)", imgUrl: "https://placehold.co/50x50/1D4ED8/FFFFFF?text=Tonno" },
    { categoria: "Surgelati (Verdura)", nome: "Piselli fini (sacchetto)", imgUrl: "https://placehold.co/50x50/14B8A6/FFFFFF?text=Piselli" },
    { categoria: "Surgelati (Pasti)", nome: "Pizza Margherita (surgelata)", imgUrl: "https://placehold.co/50x50/14B8A6/FFFFFF?text=Pizza" },
    { categoria: "Surgelati (Pasti)", nome: "Bastoncini di pesce", imgUrl: "https://placehold.co/50x50/14B8A6/FFFFFF?text=Basto" },
    { categoria: "Latte e derivati", nome: "Latte intero", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Latte" },
    { categoria: "Latte e derivati", nome: "Yogurt (bianco/frutta)", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Yogurt" },
    { categoria: "Formaggi freschi", nome: "Mozzarella (busta)", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Mozza" },
    { categoria: "Formaggi stagionati", nome: "Parmigiano Reggiano grattugiato", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Parmig" },
    { categoria: "Formaggi freschi", nome: "Ricotta", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Ricotta" },
    { categoria: "Uova", nome: "Uova grandi (confezione da 6)", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Uova" },
    { categoria: "Burro/Panna", nome: "Burro", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Burro" },
    { categoria: "Burro/Panna", nome: "Panna da cucina", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Panna" },
    { categoria: "Pane/Panificati", nome: "Pane fresco (tipo casereccio)", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Pane" },
    { categoria: "Pane/Panificati", nome: "Fette biscottate", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Fette" },
    { categoria: "Pasta secca", nome: "Spaghetti", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Spag" },
    { categoria: "Pasta secca", nome: "Penne Rigate", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Penne" },
    { categoria: "Riso", nome: "Riso Arborio", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Riso" },
    { categoria: "Cereali colazione", nome: "Corn flakes", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Cereali" },
    { categoria: "Acqua", nome: "Acqua naturale (6x1.5L)", imgUrl: "https://placehold.co/50x50/10B981/FFFFFF?text=Acqua" },
    { categoria: "Succhi/Bibite", nome: "Succo d'arancia (cartone)", imgUrl: "https://placehold.co/50x50/10B981/FFFFFF?text=Succo" },
    { categoria: "Succhi/Bibite", nome: "Coca-Cola (lattine)", imgUrl: "https://placehold.co/50x50/10B981/FFFFFF?text=Coca" },
    { categoria: "Birra", nome: "Birra Lager (confezione)", imgUrl: "https://placehold.co/50x50/DC2626/FFFFFF?text=Birra" },
    { categoria: "Vino", nome: "Vino rosso (Tavola)", imgUrl: "https://placehold.co/50x50/DC2626/FFFFFF?text=VinoR" },
    { categoria: "Legumi secchi/scatolame", nome: "Fagioli in scatola", imgUrl: "https://placehold.co/50x50/F59E0B/000000?text=Fagioli" },
    { categoria: "Legumi secchi/scatolame", nome: "Ceci in scatola", imgUrl: "https://placehold.co/50x50/F59E0B/000000?text=Ceci" },
    { categoria: "Pomodori/Salse", nome: "Passata di pomodoro", imgUrl: "https://placehold.co/50x50/F59E0B/000000?text=Passat" },
    { categoria: "Sottaceti/Sottolio", nome: "Olive snocciolate", imgUrl: "https://placehold.co/50x50/F59E0B/000000?text=Olive" },
    { categoria: "Olii", nome: "Olio Extra Vergine di Oliva (1L)", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=OEVO" },
    { categoria: "Condimenti", nome: "Sale fino", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Sale" },
    { categoria: "Condimenti", nome: "Zucchero semolato", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Zucch" },
    { categoria: "Salse", nome: "Maionese", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Maio" },
    { categoria: "Spezie", nome: "Origano", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Spezie" },
    { categoria: "Biscotti/Merendine", nome: "Biscotti secchi", imgUrl: "https://placehold.co/50x50/EC4899/FFFFFF?text=Biscot" },
    { categoria: "Cioccolato", nome: "Tavoletta di cioccolato al latte", imgUrl: "https://placehold.co/50x50/EC4899/FFFFFF?text=Ciocc" },
    { categoria: "Snack salati", nome: "Patatine (sacchetto grande)", imgUrl: "https://placehold.co/50x50/EC4899/FFFFFF?text=Chips" },
    { categoria: "Confetture/Creme", nome: "Marmellata di fragole", imgUrl: "https://placehold.co/50x50/EC4899/FFFFFF?text=Marmel" },
    { categoria: "Igiene orale", nome: "Dentifricio", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Denti" },
    { categoria: "Igiene orale", nome: "Spazzolino", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Spazz" },
    { categoria: "Corpo/Capelli", nome: "Shampoo", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Shamp" },
    { categoria: "Corpo/Capelli", nome: "Bagnoschiuma", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Bagno" },
    { categoria: "Carta/Fazzoletti", nome: "Carta igienica (rotoli)", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=CartaI" },
    { categoria: "Assorbenti/Protezioni", nome: "Assorbenti igienici", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Prot" },
    { categoria: "Lavanderia", nome: "Detersivo lavatrice (liquido)", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Lavand" },
    { categoria: "Lavanderia", nome: "Ammorbidente", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Am morb" },
    { categoria: "Superfici/Pavimenti", nome: "Detersivo pavimenti", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Pavim" },
    { categoria: "Superfici/Pavimenti", nome: "Sgrassatore universale", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Sgrass" },
    { categoria: "Cucina", nome: "Detersivo piatti (a mano)", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Piatti" },
    { categoria: "Accessori Pulizia", nome: "Spugne", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Spugne" },
    { categoria: "Rifiuti", nome: "Sacchetti per immondizia (grandi)", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Sacchet" },
    { categoria: "Cibo per Animali", nome: "Crocchette per cane (sacchetto)", imgUrl: "https://placehold.co/50x50/475569/FFFFFF?text=Dog" },
    { categoria: "Cibo per Animali", nome: "Bocconcini per gatto (lattine)", imgUrl: "https://placehold.co/50x50/475569/FFFFFF?text=Cat" },
    { categoria: "Cartoleria", nome: "Penna (blu/nera)", imgUrl: "https://placehold.co/50x50/F472B6/FFFFFF?text=Penna" },
    { categoria: "Cartoleria", nome: "Quaderno A4", imgUrl: "https://placehold.co/50x50/F472B6/FFFFFF?text=Quad" },
    { categoria: "Salute", nome: "Cerotti", imgUrl: "https://placehold.co/50x50/374151/FFFFFF?text=Cero" },
    { categoria: "Salute", nome: "Paracetamolo (Tachipirina/Efferalgan)", imgUrl: "https://placehold.co/50x50/374151/FFFFFF?text=Para" },
    { categoria: "Cucina/Usa e Getta", nome: "Pellicola trasparente", imgUrl: "https://placehold.co/50x50/78716C/FFFFFF?text=Pelli" },
    { categoria: "Cucina/Usa e Getta", nome: "Tovaglioli di carta", imgUrl: "https://placehold.co/50x50/78716C/FFFFFF?text=Tova" },
    { categoria: "Varie", nome: "Pile stilo AA", imgUrl: "https://placehold.co/50x50/78716C/FFFFFF?text=Pile" }
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
        if(loggedInUserEl) loggedInUserEl.textContent = "Offline";
    }

    renderCatalog(catalogo); 
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
        
        dbRT.ref('active_users/' + CURRENT_USER_ID).set({
            firstName: firstName,
            lastName: lastName,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        initializeApp();
    } catch (error) {
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
    if(loggedInUserEl) loggedInUserEl.textContent = "Offline";
}


/* -------------- FUNZIONI CATALOGO (RENDER e RICERCA) -------------- */

function renderCatalog(itemsToRender) {
    let html = '';
    let currentCategory = '';

    const sortedItems = [...itemsToRender].sort((a, b) => {
        if (a.categoria !== b.categoria) {
            return a.categoria.localeCompare(b.categoria);
        }
        return a.nome.localeCompare(b.nome);
    });

    sortedItems.forEach(item => {
        if (item.categoria !== currentCategory) {
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

function handleSearch() {
    const searchTerm = searchInputEl.value.toLowerCase().trim();
    
    if (searchTerm.length < 2 && searchTerm !== "") {
        // Se la ricerca è breve, mostriamo solo l'intero catalogo.
        renderCatalog(catalogo);
        return;
    }
    
    const filteredCatalog = catalogo.filter(item => 
        item.nome.toLowerCase().includes(searchTerm) || 
        item.categoria.toLowerCase().includes(searchTerm)
    );

    renderCatalog(filteredCatalog);

    catalogListEl.scrollTop = 0; 
}


/* -------------- FUNZIONI LISTA SPESA (RENDER e LOGICA) -------------- */

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
    
    doc.setFontSize(18);
    doc.text("Lista Spesa Condivisa", pageWidth / 2, y, { align: "center" });
    y += 8;
    
    if (pdfNote) {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150); 
        const noteLines = doc.splitTextToSize(`Nota: ${pdfNote}`, pageWidth - 2 * margin);
        doc.text(noteLines, pageWidth / 2, y, { align: "center" });
        y += noteLines.length * 5 + 5;
    }
    
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
    // Funzione per ottenere tutti gli elementi DOM necessari
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
            addItem(name, 'https://placehold.co/50x50/60A5FA/FFFFFF?text=Manuale'); 
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
    if (!getDOMElements()) return; 
    addAllEventListeners();
    checkLoginStatus(); 
});
