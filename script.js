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

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


async function saveCatalogFirestore() {
  try {
    // Il catalogo deve essere salvato, ma prima puliamo l'imgUrl per i nuovi elementi manuali
    const cleanedCatalogo = catalogo.map(item => {
        const { imgUrl, ...rest } = item;
        // Non salviamo l'imgUrl nel caso di aggiunte manuali (così la prossima volta non avranno un URL casuale)
        return imgUrl ? item : rest;
    });
    
    const sortedCatalogo = cleanedCatalogo.sort((a, b) => a.nome.localeCompare(b.nome));
    await db.collection("catalogo").doc("prodotti").set({ items: sortedCatalogo });
    console.log("Catalogo aggiornato su Firestore");
  } catch (err) {
    console.error("Errore salvataggio catalogo:", err);
  }
}


/* -------------- CATALOGO PREIMPOSTATO AMPLIATO E CON IMMAGINI (Placeholder) -------------- */
// ⚠️ SOSTITUISCI QUESTI URL CON I LINK ALLE TUE IMMAGINI REALI! 
// Ho usato 'https://picsum.photos/seed/[parola chiave]/50/50' per immagini realistiche di esempio.
const catalogo = [
  // --- FRUTTA E VERDURA ---
  { categoria: "Frutta fresca", nome: "Mele Golden", imgUrl: "https://picsum.photos/seed/mela/50/50" },
  { categoria: "Frutta fresca", nome: "Banane", imgUrl: "https://picsum.photos/seed/banana/50/50" },
  { categoria: "Frutta fresca", nome: "Arance da tavola", imgUrl: "https://picsum.photos/seed/arancia/50/50" },
  { categoria: "Frutta fresca", nome: "Uva bianca", imgUrl: "https://picsum.photos/seed/uva/50/50" },
  { categoria: "Frutta fresca", nome: "Fragole", imgUrl: "https://picsum.photos/seed/fragola/50/50" },
  { categoria: "Frutta fresca", nome: "Limoni", imgUrl: "https://picsum.photos/seed/limone/50/50" },
  { categoria: "Frutta fresca", nome: "Kiwi", imgUrl: "https://picsum.photos/seed/kiwi/50/50" },

  { categoria: "Verdura a foglia", nome: "Insalata iceberg", imgUrl: "https://picsum.photos/seed/insalata/50/50" },
  { categoria: "Verdura a foglia", nome: "Spinaci freschi", imgUrl: "https://picsum.photos/seed/spinaci/50/50" },
  { categoria: "Verdura a foglia", nome: "Rucola", imgUrl: "https://picsum.photos/seed/rucola/50/50" },
  { categoria: "Verdura base", nome: "Pomodori ramati", imgUrl: "https://picsum.photos/seed/pomodori/50/50" },
  { categoria: "Verdura base", nome: "Zucchine", imgUrl: "https://picsum.photos/seed/zucchine/50/50" },
  { categoria: "Verdura base", nome: "Carote", imgUrl: "https://picsum.photos/seed/carote/50/50" },
  { categoria: "Verdura base", nome: "Cetrioli", imgUrl: "https://picsum.photos/seed/cetrioli/50/50" },
  { categoria: "Verdura base", nome: "Peperoni gialli", imgUrl: "https://picsum.photos/seed/peperoni/50/50" },
  { categoria: "Verdura base", nome: "Cipolle dorate", imgUrl: "https://picsum.photos/seed/cipolle/50/50" },
  { categoria: "Verdura base", nome: "Aglio", imgUrl: "https://picsum.photos/seed/aglio/50/50" },
  { categoria: "Verdura base", nome: "Patate a pasta gialla", imgUrl: "https://picsum.photos/seed/patate/50/50" },
  { categoria: "Verdura base", nome: "Melanzane", imgUrl: "https://picsum.photos/seed/melanzane/50/50" },

  // --- PANETTERIA E CEREALI ---
  { categoria: "Pane fresco", nome: "Pane casereccio", imgUrl: "https://picsum.photos/seed/pane/50/50" },
  { categoria: "Pane fresco", nome: "Baguette", imgUrl: "https://picsum.photos/seed/baguette/50/50" },
  { categoria: "Pane fresco", nome: "Fette biscottate integrali", imgUrl: "https://picsum.photos/seed/fette/50/50" },
  { categoria: "Cereali colazione", nome: "Fiocchi d'avena", imgUrl: "https://picsum.photos/seed/avena/50/50" },
  { categoria: "Cereali colazione", nome: "Muesli", imgUrl: "https://picsum.photos/seed/muesli/50/50" },
  { categoria: "Prodotti da forno", nome: "Grissini", imgUrl: "https://picsum.photos/seed/grissini/50/50" },
  { categoria: "Prodotti da forno", nome: "Crackers salati", imgUrl: "https://picsum.photos/seed/crackers/50/50" },

  // --- LATTICINI E UOVA ---
  { categoria: "Latte e Panna", nome: "Latte intero UHT", imgUrl: "https://picsum.photos/seed/latte/50/50" },
  { categoria: "Latte e Panna", nome: "Latte parzialmente scremato", imgUrl: "https://picsum.photos/seed/latte-scremato/50/50" },
  { categoria: "Latte e Panna", nome: "Panna fresca", imgUrl: "https://picsum.photos/seed/panna/50/50" },
  { categoria: "Latte e Panna", nome: "Panna da cucina", imgUrl: "https://picsum.photos/seed/panna-cucina/50/50" },
  { categoria: "Yogurt", nome: "Yogurt bianco naturale", imgUrl: "https://picsum.photos/seed/yogurt/50/50" },
  { categoria: "Yogurt", nome: "Yogurt alla frutta", imgUrl: "https://picsum.photos/seed/yogurt-frutta/50/50" },
  { categoria: "Uova", nome: "Uova fresche grandi (conf. 6)", imgUrl: "https://picsum.photos/seed/uova/50/50" },
  
  // --- FORMAGGI E BURRO ---
  { categoria: "Formaggi freschi", nome: "Mozzarella di bufala", imgUrl: "https://picsum.photos/seed/mozzarella/50/50" },
  { categoria: "Formaggi freschi", nome: "Ricotta fresca", imgUrl: "https://picsum.photos/seed/ricotta/50/50" },
  { categoria: "Formaggi stagionati", nome: "Parmigiano Reggiano grattugiato", imgUrl: "https://picsum.photos/seed/parmigiano/50/50" },
  { categoria: "Formaggi stagionati", nome: "Emmentaler a fette", imgUrl: "https://picsum.photos/seed/emmentaler/50/50" },
  { categoria: "Formaggi stagionati", nome: "Gorgonzola piccante", imgUrl: "https://picsum.photos/seed/gorgonzola/50/50" },
  { categoria: "Burro e Margarina", nome: "Burro tradizionale", imgUrl: "https://picsum.photos/seed/burro/50/50" },
  { categoria: "Burro e Margarina", nome: "Margarina vegetale", imgUrl: "https://picsum.photos/seed/margarina/50/50" },
  
  // --- CARNE E PESCE ---
  { categoria: "Carne bovina", nome: "Fettine di Manzo", imgUrl: "https://picsum.photos/seed/manzo/50/50" },
  { categoria: "Carne bovina", nome: "Carne macinata scelta", imgUrl: "https://picsum.photos/seed/macinato/50/50" },
  { categoria: "Carne suina", nome: "Salsiccia fresca", imgUrl: "https://picsum.photos/seed/salsiccia/50/50" },
  { categoria: "Carne suina", nome: "Costine di maiale", imgUrl: "https://picsum.photos/seed/costine/50/50" },
  { categoria: "Pollame", nome: "Petto di pollo a fette", imgUrl: "https://picsum.photos/seed/pollo/50/50" },
  { categoria: "Pollame", nome: "Fusi di tacchino", imgUrl: "https://picsum.photos/seed/tacchino/50/50" },
  { categoria: "Pesce fresco", nome: "Filetti di merluzzo", imgUrl: "https://picsum.photos/seed/merluzzo/50/50" },
  { categoria: "Pesce fresco", nome: "Salmone affumicato (vaschetta)", imgUrl: "https://picsum.photos/seed/salmone/50/50" },
  
  // --- SALUMI E AFFETTATI ---
  { categoria: "Salumi", nome: "Prosciutto cotto a fette", imgUrl: "https://picsum.photos/seed/prosciutto-cotto/50/50" },
  { categoria: "Salumi", nome: "Prosciutto crudo", imgUrl: "https://picsum.photos/seed/prosciutto-crudo/50/50" },
  { categoria: "Salumi", nome: "Salame milano", imgUrl: "https://picsum.photos/seed/salame/50/50" },
  { categoria: "Salumi", nome: "Mortadella", imgUrl: "https://picsum.photos/seed/mortadella/50/50" },
  
  // --- SURGELATI ---
  { categoria: "Surgelati: Verdure", nome: "Piselli fini surgelati", imgUrl: "https://picsum.photos/seed/piselli-surgelati/50/50" },
  { categoria: "Surgelati: Verdure", nome: "Spinaci cubetti surgelati", imgUrl: "https://picsum.photos/seed/spinaci-surgelati/50/50" },
  { categoria: "Surgelati: Pesce", nome: "Bastoncini di pesce", imgUrl: "https://picsum.photos/seed/bastoncini/50/50" },
  { categoria: "Surgelati: Pasti Pronti", nome: "Pizza margherita surgelata", imgUrl: "https://picsum.photos/seed/pizza-surgelata/50/50" },
  { categoria: "Surgelati: Dessert", nome: "Gelato alla vaniglia", imgUrl: "https://picsum.photos/seed/gelato/50/50" },
  
  // --- PASTA, RISO E LEGUMI SECCHI ---
  { categoria: "Pasta secca", nome: "Spaghetti n°5", imgUrl: "https://picsum.photos/seed/spaghetti/50/50" },
  { categoria: "Pasta secca", nome: "Penne rigate", imgUrl: "https://picsum.photos/seed/penne/50/50" },
  { categoria: "Riso", nome: "Riso Carnaroli", imgUrl: "https://picsum.photos/seed/riso/50/50" },
  { categoria: "Legumi secchi", nome: "Lenticchie secche", imgUrl: "https://picsum.photos/seed/lenticchie/50/50" },
  { categoria: "Legumi secchi", nome: "Fagioli secchi cannellini", imgUrl: "https://picsum.photos/seed/fagioli/50/50" },
  
  // --- CONSERVE, SALSE E OLII ---
  { categoria: "Conserve pomodoro", nome: "Passata di pomodoro", imgUrl: "https://picsum.photos/seed/passata/50/50" },
  { categoria: "Conserve pomodoro", nome: "Pelati in scatola", imgUrl: "https://picsum.photos/seed/pelati/50/50" },
  { categoria: "Conserve ittiche", nome: "Tonno sott'olio (vasetto)", imgUrl: "https://picsum.photos/seed/tonno/50/50" },
  { categoria: "Conserve ittiche", nome: "Sgombro in scatola", imgUrl: "https://picsum.photos/seed/sgombro/50/50" },
  { categoria: "Olii e Condimenti", nome: "Olio extra vergine d'oliva", imgUrl: "https://picsum.photos/seed/olio/50/50" },
  { categoria: "Olii e Condimenti", nome: "Aceto di vino bianco", imgUrl: "https://picsum.photos/seed/aceto/50/50" },
  { categoria: "Salse", nome: "Maionese in tubetto", imgUrl: "https://picsum.photos/seed/maionese/50/50" },
  { categoria: "Salse", nome: "Ketchup", imgUrl: "https://picsum.photos/seed/ketchup/50/50" },
  { categoria: "Salse", nome: "Senape", imgUrl: "https://picsum.photos/seed/senape/50/50" },
  { categoria: "Cibi pronti", nome: "Brodo vegetale in dado", imgUrl: "https://picsum.photos/seed/dado/50/50" },
  
  // --- SPEZIE, SALE E ZUCCHERO ---
  { categoria: "Spezie e Aromi", nome: "Pepe nero macinato", imgUrl: "https://picsum.photos/seed/pepe/50/50" },
  { categoria: "Spezie e Aromi", nome: "Origano secco", imgUrl: "https://picsum.photos/seed/origano/50/50" },
  { categoria: "Sale e Zucchero", nome: "Sale fino iodato", imgUrl: "https://picsum.photos/seed/sale/50/50" },
  { categoria: "Sale e Zucchero", nome: "Zucchero semolato", imgUrl: "https://picsum.photos/seed/zucchero/50/50" },
  { categoria: "Sale e Zucchero", nome: "Miele di acacia", imgUrl: "https://picsum.photos/seed/miele/50/50" },
  
  // --- BEVANDE ---
  { categoria: "Acqua", nome: "Acqua naturale (bottiglie da 1.5L)", imgUrl: "https://picsum.photos/seed/acqua/50/50" },
  { categoria: "Acqua", nome: "Acqua frizzante (bottiglie da 1.5L)", imgUrl: "https://picsum.photos/seed/acqua-frizzante/50/50" },
  { categoria: "Soft Drinks", nome: "Coca Cola Zero", imgUrl: "https://picsum.photos/seed/coca-cola/50/50" },
  { categoria: "Soft Drinks", nome: "Gazzosa", imgUrl: "https://picsum.photos/seed/gazzosa/50/50" },
  { categoria: "Succhi", nome: "Succo d'arancia 100%", imgUrl: "https://picsum.photos/seed/succo/50/50" },
  { categoria: "Succhi", nome: "Thè al limone", imgUrl: "https://picsum.photos/seed/the/50/50" },
  { categoria: "Vini", nome: "Vino rosso Chianti", imgUrl: "https://picsum.photos/seed/vino-rosso/50/50" },
  { categoria: "Vini", nome: "Vino bianco frizzante", imgUrl: "https://picsum.photos/seed/vino-bianco/50/50" },
  { categoria: "Birre", nome: "Birra bionda lager (conf. 6)", imgUrl: "https://picsum.photos/seed/birra/50/50" },
  
  // --- DROGHERIA E PULIZIA ---
  { categoria: "Igiene personale", nome: "Sapone liquido mani", imgUrl: "https://picsum.photos/seed/sapone/50/50" },
  { categoria: "Igiene personale", nome: "Shampoo neutro", imgUrl: "https://picsum.photos/seed/shampoo/50/50" },
  { categoria: "Igiene personale", nome: "Dentifricio al fluoro", imgUrl: "https://picsum.photos/seed/dentifricio/50/50" },
  { categoria: "Carta e Monouso", nome: "Carta igienica (rotoli)", imgUrl: "https://picsum.photos/seed/carta-igienica/50/50" },
  { categoria: "Carta e Monouso", nome: "Tovaglioli di carta", imgUrl: "https://picsum.photos/seed/tovaglioli/50/50" },
  { categoria: "Pulizia casa", nome: "Detersivo pavimenti", imgUrl: "https://picsum.photos/seed/detersivo/50/50" },
  { categoria: "Pulizia casa", nome: "Detersivo per piatti a mano", imgUrl: "https://picsum.photos/seed/piatti/50/50" },
  { categoria: "Pulizia casa", nome: "Candeggina", imgUrl: "https://picsum.photos/seed/candeggina/50/50" },
  { categoria: "Bucato", nome: "Detersivo lavatrice liquido", imgUrl: "https://picsum.photos/seed/lavatrice/50/50" },
  { categoria: "Bucato", nome: "Ammorbidente concentrato", imgUrl: "https://picsum.photos/seed/ammorbidente/50/50" },
  
  // --- PET FOOD E VARIE ---
  { categoria: "Animali domestici", nome: "Crocchette per cani adulti", imgUrl: "https://picsum.photos/seed/crocchette/50/50" },
  { categoria: "Animali domestici", nome: "Cibo umido per gatti", imgUrl: "https://picsum.photos/seed/cibo-gatti/50/50" },
  { categoria: "Altro", nome: "Sacchetti per immondizia grandi", imgUrl: "https://picsum.photos/seed/sacchetti/50/50" },
  { categoria: "Altro", nome: "Pile stilo AA", imgUrl: "https://picsum.photos/seed/pile/50/50" },
];
/* -------------------------------------------------------- */


/* -------------- ELEMENTI DOM (invariato) -------------- */
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

const loginGateEl = document.getElementById("loginGate");
const mainAppEl = document.getElementById("mainApp"); 
const inputFirstNameEl = document.getElementById("inputFirstName");
const inputLastNameEl = document.getElementById("inputLastName");
const loginButtonEl = document.getElementById("loginButton");


let pdfNote = ""; 

/* -------------- STATO GLOBALE (invariato) -------------- */
let shopping = []; 
let usersCache = {}; 
let presenceCache = {}; 

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

function persistLocal() {
  localStorage.setItem("shoppingList", JSON.stringify(shopping));
}

function restoreLocal() {
  const localShopping = localStorage.getItem("shoppingList");
  if (localShopping) {
    shopping = JSON.parse(localShopping);
  }
}

/* -------------- FUNZIONI UI AGGIORNATE PER LE IMMAGINI -------------- */

// AGGIORNATA: Recupera l'URL dell'immagine e la mostra nella lista
function renderShopping() {
  shoppingItemsEl.innerHTML = "";

  // Mappa per recuperare velocemente l'URL dell'immagine dal nome del prodotto
  const productMap = catalogo.reduce((acc, p) => {
    acc[p.nome.toLowerCase()] = p.imgUrl;
    return acc;
  }, {});

  shopping.forEach((item, index) => {
    const itemImgUrl = productMap[item.nome.toLowerCase()] || 'https://via.placeholder.com/50/888/FFFFFF?text=?';
    
    const li = document.createElement("li");
    li.classList.toggle("done", item.done);
    li.dataset.index = index;

    li.innerHTML = `
      <div class="left">
        <input type="checkbox" ${item.done ? "checked" : ""} data-action="toggle" />
        <img src="${itemImgUrl}" alt="${item.nome}" class="product-photo-list">
        <div>
            <span class="name">${item.nome}</span>
            <span class="qty">${item.qty > 1 ? `Quantità: ${item.qty}` : ""}</span>
        </div>
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

// AGGIORNATA: Aggiunge l'immagine al catalogo
function renderCatalog(items) {
  catalogList.innerHTML = "";
  let currentCategory = "";

  // Raggruppa gli elementi per categoria
  const groups = items.reduce((acc, item) => {
    if (!acc[item.categoria]) acc[item.categoria] = [];
    acc[item.categoria].push(item);
    return acc;
  }, {});
  
  const sortedCategories = Object.keys(groups).sort();
  
  sortedCategories.forEach(cat => {
    const categoryEl = document.createElement("div");
    categoryEl.className = "catalog-category";
    categoryEl.textContent = cat;
    catalogList.appendChild(categoryEl);

    // Ordina i prodotti all'interno della categoria
    groups[cat].sort((a, b) => a.nome.localeCompare(b.nome)).forEach(item => {
      const itemEl = document.createElement("div");
      itemEl.className = "catalog-item";
      
      const itemImgUrl = item.imgUrl || 'https://via.placeholder.com/50/888/FFFFFF?text=PROD';
      
      itemEl.innerHTML = `
        <img src="${itemImgUrl}" alt="${item.nome}" class="product-photo-catalog">
        <div class="meta">
          <strong>${item.nome}</strong>
        </div>
        `;
      
      itemEl.addEventListener("click", () => addItemToShopping(item.nome));
      catalogList.appendChild(itemEl);
    });
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


/* -------------- FUNZIONI UTENTI ATTIVI E PRESENZA (invariato) -------------- */
function renderUsers() {
    activeUsersListEl.innerHTML = "";
    
    const allUserIDs = Object.keys(usersCache).filter(id => usersCache[id]?.firstName);
    
    const sortedUserIDs = allUserIDs.sort((a, b) => {
        const statusA = presenceCache[a]?.state === 'online' ? 0 : 1;
        const statusB = presenceCache[b]?.state === 'online' ? 0 : 1;
        
        if (statusA !== statusB) return statusA - statusB; 
        
        const nameA = `${usersCache[a].firstName} ${usersCache[a].lastName}`;
        const nameB = `${usersCache[b].firstName} ${usersCache[b].lastName}`;
        return nameA.localeCompare(nameB);
    });
    
    sortedUserIDs.forEach(userID => {
        const user = usersCache[userID];
        const status = presenceCache[userID] || { state: 'offline' };
        
        const li = document.createElement("li");
        
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

function setupPresence() {
    if (!CURRENT_USER_ID) return;

    const userRef = dbRT.ref('presence/' + CURRENT_USER_ID);

    userRef.onDisconnect().set({
        state: 'offline',
        last_seen: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        userRef.set({
            state: 'online',
            last_seen: firebase.database.ServerValue.TIMESTAMP
        });
    }).catch(err => {
        console.error("Errore setupPresence:", err);
    });

    window.addEventListener('beforeunload', () => {
        userRef.set({ state: 'offline', last_seen: Date.now() });
    });
}


async function loadAndWatchUsers() {
    db.collection(USER_COLLECTION_NAME).onSnapshot((snapshot) => {
        snapshot.forEach(doc => {
            usersCache[doc.id] = doc.data();
        });
        renderUsers(); 
    }, (error) => {
        console.error("Errore nell'ascolto degli utenti da Firestore:", error);
    });

    dbRT.ref('presence').on('value', (snapshot) => {
        const newPresenceData = snapshot.val() || {};
        presenceCache = newPresenceData;
        renderUsers();
    }, (error) => {
        console.error("Errore nell'ascolto della presenza RTDB:", error);
    });
}


/* -------------- GESTIONE ACCESSO (invariato) -------------- */
function handleLogin() {
    const firstName = inputFirstNameEl.value.trim();
    const lastName = inputLastNameEl.value.trim();

    if (!firstName) {
        alert("Inserisci il tuo nome.");
        return;
    }
    
    if (!CURRENT_USER_ID) {
        CURRENT_USER_ID = generateUUID();
        localStorage.setItem("user_unique_id", CURRENT_USER_ID);
    }
    
    saveUserData(CURRENT_USER_ID, firstName, lastName);

    loginGateEl.style.display = 'none';
    mainAppEl.style.display = 'block';

    setupPresence();
}

function checkLocalLogin() {
    if (CURRENT_USER_ID) {
        db.collection(USER_COLLECTION_NAME).doc(CURRENT_USER_ID).get()
            .then(doc => {
                if (doc.exists) {
                    CURRENT_USER_DATA = doc.data();
                    loginGateEl.style.display = 'none';
                    mainAppEl.style.display = 'block';
                    inputFirstNameEl.value = CURRENT_USER_DATA.firstName || '';
                    inputLastNameEl.value = CURRENT_USER_DATA.lastName || '';
                    setupPresence(); 
                } else {
                    loginGateEl.style.display = 'block';
                    mainAppEl.style.display = 'none';
                }
            })
            .catch(() => {
                loginGateEl.style.display = 'block';
                mainAppEl.style.display = 'none';
            });
    } else {
        loginGateEl.style.display = 'block';
        mainAppEl.style.display = 'none';
    }
}


/* -------------- FIRESTORE: SALVA / CARICA / ELIMINA (invariato) -------------- */
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
    loadLists(); 
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

/* -------------- FUNZIONI PDF e CONDIVISIONE (AGGIUNTE) -------------- */

function downloadStyledPDF() {
    // 1. Inizializza jsPDF
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

    // 2. Esegui il download
    doc.save("ListaSpesa.pdf");
    pdfNote = ""; // Pulisci la nota dopo il download
    pdfNoteInput.value = "";
}

function sharePDF() {
    // 1. Chiama la funzione di download per generare il PDF
    downloadStyledPDF(); 
    // Nota: Il download avviene localmente. L'API Web Share richiede un URL del file.
    // L'unica possibilità è condividere un link al PDF se fosse su un server,
    // o semplicemente condividere il testo della lista, come fallback.

    const listText = shopping.map(item => 
        `[${item.done ? 'X' : ' '}] ${item.nome} (Qta: ${item.qty})`
    ).join('\n');

    const shareData = {
        title: 'Lista Spesa',
        text: `Ecco la nostra lista della spesa:\n\n${pdfNote ? `Nota: ${pdfNote}\n\n` : ''}${listText}`,
    };

    // 2. Usa l'API Web Share
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Contenuto della lista condiviso con successo.'))
            .catch((error) => console.error('Errore durante la condivisione', error));
    } else {
        // Fallback per browser non supportati
        alert("L'API di condivisione non è supportata dal tuo browser. Copia il testo:\n\n" + shareData.text);
    }
    
    pdfNote = ""; // Pulisci la nota dopo la condivisione
    pdfNoteInput.value = "";
}
// Ho incluso la funzione downloadStyledPDF qui sopra per farla funzionare, 
// ma la devi anche rimuovere da dove l'ho messa in questo commento e 
// metterla nel file script.js in una zona appropriata.


/* -------------- INIZIALIZZAZIONE -------------- */

window.addEventListener("beforeunload", persistLocal);
restoreLocal(); 

loadAndWatchUsers(); 

checkLocalLogin(); 

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

  const normalizedVal = val.toLowerCase();

  if (!catalogo.some(p => p.nome.toLowerCase() === normalizedVal)) {
    // Aggiunto senza imgUrl. Il render userà l'icona placeholder '?'
    catalogo.push({ categoria: "Altro", nome: val });

    await saveCatalogFirestore();

    renderCatalog(catalogo);
  }

  addItemToShopping(val);
  manualInput.value = "";
});

// Gestione degli eventi di aumento/diminuzione/cancellazione della lista
shoppingItemsEl.addEventListener("click", async (e) => {
    const target = e.target;
    const action = target.dataset.action;
    
    // Per toggle, usiamo l'input checkbox
    if (target.type === 'checkbox' && action === 'toggle') {
        const li = target.closest('li');
        const index = parseInt(li.dataset.index);
        if (isNaN(index)) return;

        shopping[index].done = !shopping[index].done;
        renderShopping();
        return;
    }

    // Per i bottoni, l'indice è sull'elemento button
    const li = target.closest('li');
    if (!li) return;

    const index = parseInt(li.dataset.index);
    if (isNaN(index)) return;


    if (action === "increase") {
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
