/* =================================================================
   FILE: script.js - Codice Aggiornato con Soluzione Persistenza & Bug Offline
   ================================================================= */

/* -------------- FIREBASE CONFIG -------------- */
const firebaseConfig = {
  apiKey: "AIzaSyCPHLvSRBt40Wloa0nnnAp5LVdUIOb9J40",
  authDomain: "lista-spesa-db7f7.firebaseapp.com",
  projectId: "lista-spesa-db7f7",
  storageBucket: "lista-spesa-db7f7.firebasestorage.app",
  messagingSenderId: "736757613454",
  appId: "1:736757613454:web:50744d7ce9db9d3ebc5adf",
  measurementId: "G-64QH2WHH2X"
};

/* -------------- INIZIALIZZAZIONE FIREBASE -------------- */
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const realtimeDB = firebase.database();

/* -------------- COSTANTI -------------- */
const ACTIVE_USERS_KEY = "lista_spesa_activeUser";
const PERSONAL_HISTORY_COLLECTION = "storico_spese";

/* -------------- VARIABILI GLOBALI -------------- */
let CURRENT_USER_ID = null;
let CURRENT_USER_DATA = null;
let shopping = [];
let pdfNote = "";
let actionPending = "";

/* -------------- VARIABILI DOM -------------- */
let loginGateEl, mainAppEl, loginButtonEl, inputFirstNameEl, inputLastNameEl;
let loggedInUserEl, logoutButtonEl, catalogListEl, shoppingListEl;
let itemCountEl, clearBtnEl, saveBtnEl, loadBtnEl, savedListsEl;
let manualInputEl, addManualBtnEl, pdfNoteContainerEl, pdfNoteInputEl;
let pdfNoteConfirmBtnEl, downloadBtnEl, shareBtnEl, searchInputEl;

// 🔥 VARIABILI DOM PER LO STORICO (IMPORTANTE!)
let toggleHistoryBtnEl, personalHistoryGateEl, inputTotalCostEl;
let inputPurchaseNoteEl, savePurchaseBtnEl, personalHistoryListEl;

/* -----------------------------------------------------------------
   FUNZIONE: getDOMElements()
   ----------------------------------------------------------------- */

function getDOMElements() {
    loginGateEl = document.getElementById("loginGate");
    mainAppEl = document.getElementById("mainApp");
    loginButtonEl = document.getElementById("loginButton");
    inputFirstNameEl = document.getElementById("inputFirstName");
    inputLastNameEl = document.getElementById("inputLastName");
    loggedInUserEl = document.getElementById("loggedInUser");
    logoutButtonEl = document.getElementById("logoutButton");

    catalogListEl = document.getElementById("catalogList");
    shoppingListEl = document.getElementById("shoppingItems");
    itemCountEl = document.getElementById("itemCount");
    clearBtnEl = document.getElementById("clearBtn");
    saveBtnEl = document.getElementById("saveBtn");
    loadBtnEl = document.getElementById("loadBtn");
    savedListsEl = document.getElementById("savedLists");
    manualInputEl = document.getElementById("manualInput");
    addManualBtnEl = document.getElementById("addManualBtn");
    searchInputEl = document.getElementById("searchInput");

    pdfNoteContainerEl = document.getElementById("pdfNoteContainer");
    pdfNoteInputEl = document.getElementById("pdfNoteInput");
    pdfNoteConfirmBtnEl = document.getElementById("pdfNoteConfirmBtn");
    downloadBtnEl = document.getElementById("downloadBtn");
    shareBtnEl = document.getElementById("shareBtn");

    // ⭐ AGGIUNTA CHE MANCAVA → STORICO FUNZIONA
    toggleHistoryBtnEl = document.getElementById("toggleHistoryBtn");
    personalHistoryGateEl = document.getElementById("personalHistoryGate");
    inputTotalCostEl = document.getElementById("inputTotalCost");
    inputPurchaseNoteEl = document.getElementById("inputPurchaseNote");
    savePurchaseBtnEl = document.getElementById("savePurchaseBtn");

    // ⭐ QUESTA ERA LA CAUSA DEL TUO ERRORE
    personalHistoryListEl = document.getElementById("personalHistoryList");

    return true;
}

/* -----------------------------------------------------------------
   FUNZIONI DI LOGIN / LOGOUT
   ----------------------------------------------------------------- */

async function registerOrLoginUser(firstName, lastName) {
    const generatedId = crypto.randomUUID();
    const userData = { firstName, lastName };

    try {
        await db.collection("registered_users").doc(generatedId).set(userData);
        localStorage.setItem(ACTIVE_USERS_KEY, generatedId);

        CURRENT_USER_ID = generatedId;
        CURRENT_USER_DATA = userData;

        return true;
    } catch (err) {
        console.error("Errore registrazione:", err);
        return false;
    }
}

function logoutUser() {
    localStorage.removeItem(ACTIVE_USERS_KEY);
    CURRENT_USER_ID = null;
    CURRENT_USER_DATA = null;

    loginGateEl.style.display = "block";
    mainAppEl.style.display = "none";
}

/* -----------------------------------------------------------------
   GESTIONE LOGIN SALVATO
   ----------------------------------------------------------------- */

async function checkLoginStatus() {
    const savedUserId = localStorage.getItem(ACTIVE_USERS_KEY);

    if (!savedUserId) {
        loginGateEl.style.display = "block";
        mainAppEl.style.display = "none";
        return;
    }

    try {
        const doc = await db.collection("registered_users").doc(savedUserId).get();

        if (!doc.exists) {
            logoutUser();
            return;
        }

        CURRENT_USER_ID = savedUserId;
        CURRENT_USER_DATA = doc.data();

        loggedInUserEl.innerText = `${CURRENT_USER_DATA.firstName} ${CURRENT_USER_DATA.lastName}`;
        loginGateEl.style.display = "none";
        mainAppEl.style.display = "block";

        loadPersonalHistory();
        loadLists();
        loadActiveUsers();

    } catch (err) {
        console.error("Errore login:", err);
        logoutUser();
    }
}

/* -----------------------------------------------------------------
   AGGIUNTA UTENTE ATTIVO
   ----------------------------------------------------------------- */

async function addActiveUser(name) {
    try {
        await realtimeDB.ref("activeUsers/" + CURRENT_USER_ID).set({
            name,
            timestamp: Date.now()
        });
    } catch (err) {
        console.error("Errore nel DB realtime:", err);
    }
}

/* -----------------------------------------------------------------
   CATALOGO PRODOTTI (RESTO INVARIATO)
   ----------------------------------------------------------------- */

// Catalogo completo (accorciato per risparmiare spazio)
const catalogo = [
    // --- FRUTTA E VERDURA (Integrate) ---
    { categoria: "Frutta fresca", nome: "Mele Golden", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Mela" },
    { categoria: "Frutta fresca", nome: "Banane", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Banana" },
    { categoria: "Frutta fresca", nome: "Arance", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Arancia" },
    { categoria: "Frutta fresca", nome: "Limoni", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Limoni" },
    { categoria: "Frutta fresca", nome: "Kiwi", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Kiwi" },
    { categoria: "Frutta fresca", nome: "Uva (bianca/nera)", imgUrl: "https://placehold.co/50x50/34D399/FFFFFF?text=Uva" },
    { categoria: "Frutta secca", nome: "Noci (sacchetto)", imgUrl: "https://placehold.co/50x50/8B5CF6/FFFFFF?text=Noci" },
    { categoria: "Frutta secca", nome: "Mandorle", imgUrl: "https://placehold.co/50x50/8B5CF6/FFFFFF?text=Mand" },
    { categoria: "Verdura (Foglia)", nome: "Insalata iceberg", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Insala" },
    { categoria: "Verdura (Foglia)", nome: "Spinaci freschi", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Spinaci" },
    { categoria: "Verdura (Foglia)", nome: "Rucola (vaschetta)", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Rucola" },
    { categoria: "Verdura (Tubero/Radice)", nome: "Patate", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Patate" },
    { categoria: "Verdura (Tubero/Radice)", nome: "Carote (sacchetto)", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Carote" },
    { categoria: "Verdura (Frutto)", nome: "Pomodori ramati", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Pomo" },
    { categoria: "Verdura (Frutto)", nome: "Zucchine", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Zucch" },
    { categoria: "Verdura (Frutto)", nome: "Peperoni (rossi/gialli)", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Pepero" },
    { categoria: "Aromi/Erbe", nome: "Cipolle", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Cipolle" },
    { categoria: "Aromi/Erbe", nome: "Aglio", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Aglio" },
    { categoria: "Aromi/Erbe", nome: "Prezzemolo (mazzetto)", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Prezz" },
    
    // --- CARNE E PESCE (Integrate) ---
    { categoria: "Carne rossa", nome: "Bistecca di manzo", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Manzo" },
    { categoria: "Carne rossa", nome: "Carne macinata (bovino)", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Maci" },
    { categoria: "Carne bianca", nome: "Petto di pollo", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Pollo" },
    { categoria: "Carne bianca", nome: "Cosce di pollo", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Cosce" },
    { categoria: "Salumi/Affettati", nome: "Prosciutto cotto (vaschetta)", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Cotto" },
    { categoria: "Salumi/Affettati", nome: "Prosciutto crudo (vaschetta)", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Crudo" },
    { categoria: "Salumi/Affettati", nome: "Fesa di tacchino", imgUrl: "https://placehold.co/50x50/EF4444/FFFFFF?text=Tacch" },
    { categoria: "Pesce fresco", nome: "Salmone (filetto)", imgUrl: "https://placehold.co/50x50/1D4ED8/FFFFFF?text=Salmon" },
    { categoria: "Pesce fresco", nome: "Orata", imgUrl: "https://placehold.co/50x50/1D4ED8/FFFFFF?text=Orata" },
    { categoria: "Pesce in scatola", nome: "Tonno sott'olio (scatola)", imgUrl: "https://placehold.co/50x50/1D4ED8/FFFFFF?text=Tonno" },
    { categoria: "Pesce in scatola", nome: "Sgombro in scatola", imgUrl: "https://placehold.co/50x50/1D4ED8/FFFFFF?text=Sgomb" },

    // --- SURGELATI (Estesa) ---
    { categoria: "Surgelati (Verdura)", nome: "Piselli fini (sacchetto)", imgUrl: "https://placehold.co/50x50/14B8A6/FFFFFF?text=Piselli" },
    { categoria: "Surgelati (Verdura)", nome: "Spinaci in cubetti", imgUrl: "https://placehold.co/50x50/14B8A6/FFFFFF?text=SpinS" },
    { categoria: "Surgelati (Pasti)", nome: "Pizza Margherita (surgelata)", imgUrl: "https://placehold.co/50x50/14B8A6/FFFFFF?text=Pizza" },
    { categoria: "Surgelati (Pasti)", nome: "Bastoncini di pesce", imgUrl: "https://placehold.co/50x50/14B8A6/FFFFFF?text=Basto" },
    { categoria: "Surgelati (Dolci)", nome: "Gelato alla crema (vaschetta)", imgUrl: "https://placehold.co/50x50/FCA5A5/000000?text=Gelato" },
    { categoria: "Surgelati (Dolci)", nome: "Torta al cioccolato surgelata", imgUrl: "https://placehold.co/50x50/FCA5A5/000000?text=TortaS" },
    { categoria: "Ghiaccio", nome: "Ghiaccio in cubetti (sacchetto)", imgUrl: "https://placehold.co/50x50/9CA3AF/FFFFFF?text=Ghiaccio" },

    // --- LATTICINI E UOVA (Integrate) ---
    { categoria: "Latte e derivati", nome: "Latte intero", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Latte" },
    { categoria: "Latte e derivati", nome: "Latte parzialmente scremato", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=LattePS" },
    { categoria: "Latte e derivati", nome: "Yogurt (bianco/frutta)", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Yogurt" },
    { categoria: "Formaggi freschi", nome: "Mozzarella (busta)", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Mozza" },
    { categoria: "Formaggi freschi", nome: "Ricotta", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Ricotta" },
    { categoria: "Formaggi freschi", nome: "Stracchino/Crescenza", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=St racc" },
    { categoria: "Formaggi stagionati", nome: "Parmigiano Reggiano grattugiato", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Parmig" },
    { categoria: "Formaggi stagionati", nome: "Pecorino (fetta)", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Pecor" },
    { categoria: "Uova", nome: "Uova grandi (confezione da 6)", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Uova" },
    { categoria: "Burro/Panna", nome: "Burro", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Burro" },
    { categoria: "Burro/Panna", nome: "Panna da cucina", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=Panna" },
    { categoria: "Burro/Panna", nome: "Panna da montare", imgUrl: "https://placehold.co/50x50/FBBF24/000000?text=PannaM" },

    // --- PANE, PASTA E CEREALI (Estesa) ---
    { categoria: "Pane/Panificati", nome: "Pane fresco (tipo casereccio)", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Pane" },
    { categoria: "Pane/Panificati", nome: "Pane integrale (fetta)", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=PaneInt" },
    { categoria: "Pane/Panificati", nome: "Fette biscottate", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Fette" },
    { categoria: "Pane/Panificati", nome: "Piadine", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Piadine" },
    { categoria: "Pasta secca", nome: "Spaghetti", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Spag" },
    { categoria: "Pasta secca", nome: "Penne Rigate", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Penne" },
    { categoria: "Pasta secca", nome: "Fusilli", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Fusilli" },
    { categoria: "Pasta fresca", nome: "Pasta all'uovo (tagliatelle)", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=PastaF" },
    { categoria: "Riso", nome: "Riso Arborio", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Riso" },
    { categoria: "Cereali colazione", nome: "Corn flakes", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Cereali" },
    { categoria: "Cereali colazione", nome: "Muesli/Granola", imgUrl: "https://placehold.co/50x50/9333EA/FFFFFF?text=Muesli" },
    
    // --- BEVANDE (Estesa) ---
    { categoria: "Acqua", nome: "Acqua naturale (6x1.5L)", imgUrl: "https://placehold.co/50x50/10B981/FFFFFF?text=Acqua" },
    { categoria: "Acqua", nome: "Acqua frizzante (6x1.5L)", imgUrl: "https://placehold.co/50x50/10B981/FFFFFF?text=AcquaF" },
    { categoria: "Succhi/Bibite", nome: "Succo d'arancia (cartone)", imgUrl: "https://placehold.co/50x50/10B981/FFFFFF?text=Succo" },
    { categoria: "Succhi/Bibite", nome: "Coca-Cola (lattine)", imgUrl: "https://placehold.co/50x50/10B981/FFFFFF?text=Coca" },
    { categoria: "Succhi/Bibite", nome: "The freddo (limone/pesca)", imgUrl: "https://placehold.co/50x50/10B981/FFFFFF?text=The" },
    { categoria: "Caffé/THÉ", nome: "Caffé macinato (moka)", imgUrl: "https://placehold.co/50x50/701A75/FFFFFF?text=Caffé" },
    { categoria: "Caffé/THÉ", nome: "Capsule/Cialde per caffé", imgUrl: "https://placehold.co/50x50/701A75/FFFFFF?text=Caffé" },
    { categoria: "Caffé/THÉ", nome: "TÉ nero (bustine)", imgUrl: "https://placehold.co/50x50/701A75/FFFFFF?text=TÉ" },
    { categoria: "Birra", nome: "Birra Lager (confezione)", imgUrl: "https://placehold.co/50x50/DC2626/FFFFFF?text=Birra" },
    { categoria: "Vino", nome: "Vino rosso (Tavola)", imgUrl: "https://placehold.co/50x50/DC2626/FFFFFF?text=VinoR" },
    { categoria: "Vino", nome: "Vino bianco (Tavola)", imgUrl: "https://placehold.co/50x50/DC2626/FFFFFF?text=VinoB" },

    // --- DISPENSA E SCATOLAME (Estesa) ---
    { categoria: "Legumi secchi/scatolame", nome: "Fagioli in scatola", imgUrl: "https://placehold.co/50x50/F59E0B/000000?text=Fagioli" },
    { categoria: "Legumi secchi/scatolame", nome: "Ceci in scatola", imgUrl: "https://placehold.co/50x50/F59E0B/000000?text=Ceci" },
    { categoria: "Legumi secchi/scatolame", nome: "Lenticchie secche", imgUrl: "https://placehold.co/50x50/F59E0B/000000?text=Lenti" },
    { categoria: "Pomodori/Salse", nome: "Passata di pomodoro", imgUrl: "https://placehold.co/50x50/F59E0B/000000?text=Passat" },
    { categoria: "Pomodori/Salse", nome: "Pelati in scatola", imgUrl: "https://placehold.co/50x50/F59E0B/000000?text=Pelati" },
    { categoria: "Sottaceti/Sottolio", nome: "Olive snocciolate", imgUrl: "https://placehold.co/50x50/F59E0B/000000?text=Olive" },
    { categoria: "Sottaceti/Sottolio", nome: "Funghi sott'olio", imgUrl: "https://placehold.co/50x50/F59E0B/000000?text=Funghi" },
    { categoria: "Olii/Aceti", nome: "Olio Extra Vergine di Oliva (1L)", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=OEVO" },
    { categoria: "Olii/Aceti", nome: "Olio di semi (girasole)", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=OlioS" },
    { categoria: "Olii/Aceti", nome: "Aceto di vino bianco", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=AcetoB" },
    
    // --- CONDIMENTI E INGREDIENTI BASE (Estesa) ---
    { categoria: "Condimenti", nome: "Sale fino", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Sale" },
    { categoria: "Condimenti", nome: "Zucchero semolato", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Zucch" },
    { categoria: "Condimenti", nome: "Farina 00", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Farina" },
    { categoria: "Condimenti", nome: "Lievito di birra (cubetto)", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Lievit" },
    { categoria: "Salse", nome: "Maionese", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Maio" },
    { categoria: "Salse", nome: "Ketchup", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Ketch" },
    { categoria: "Salse", nome: "Senape", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Sena" },
    { categoria: "Spezie", nome: "Origano", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Spezie" },
    { categoria: "Spezie", nome: "Pepe nero (macinato)", imgUrl: "https://placehold.co/50x50/4B5563/FFFFFF?text=Pepe" },
    
    // --- DOLCI E SNACK (Integrate) ---
    { categoria: "Biscotti/Merendine", nome: "Biscotti secchi", imgUrl: "https://placehold.co/50x50/EC4899/FFFFFF?text=Biscot" },
    { categoria: "Biscotti/Merendine", nome: "Merendine confezionate", imgUrl: "https://placehold.co/50x50/EC4899/FFFFFF?text=Meren" },
    { categoria: "Cioccolato", nome: "Tavoletta di cioccolato al latte", imgUrl: "https://placehold.co/50x50/EC4899/FFFFFF?text=Ciocc" },
    { categoria: "Snack salati", nome: "Patatine (sacchetto grande)", imgUrl: "https://placehold.co/50x50/EC4899/FFFFFF?text=Chips" },
    { categoria: "Snack salati", nome: "Taralli/Crackers", imgUrl: "https://placehold.co/50x50/EC4899/FFFFFF?text=Crack" },
    { categoria: "Confetture/Creme", nome: "Marmellata di fragole", imgUrl: "https://placehold.co/50x50/EC4899/FFFFFF?text=Marmel" },
    { categoria: "Confetture/Creme", nome: "Crema spalmabile al cioccolato", imgUrl: "https://placehold.co/50x50/EC4899/FFFFFF?text=Crema" },

    // --- IGIENE PERSONALE E SALUTE (Estesa) ---
    { categoria: "Igiene orale", nome: "Dentifricio", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Denti" },
    { categoria: "Igiene orale", nome: "Spazzolino", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Spazz" },
    { categoria: "Corpo/Capelli", nome: "Shampoo", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Shamp" },
    { categoria: "Corpo/Capelli", nome: "Bagnoschiuma", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Bagno" },
    { categoria: "Corpo/Capelli", nome: "Balsamo per capelli", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Balsam" },
    { categoria: "Corpo/Capelli", nome: "Sapone per mani (liquido)", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Sapone" },
    { categoria: "Protezione/Cura Pelle", nome: "Crema idratante corpo", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=CremaI" },
    { categoria: "Protezione/Cura Pelle", nome: "Deodorante spray/roll-on", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Deodo" },
    { categoria: "Carta/Fazzoletti", nome: "Carta igienica (rotoli)", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=CartaI" },
    { categoria: "Carta/Fazzoletti", nome: "Fazzoletti di carta", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Fazzo" },
    { categoria: "Assorbenti/Protezioni", nome: "Assorbenti igienici", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Prot" },
    { categoria: "Salute", nome: "Cerotti", imgUrl: "https://placehold.co/50x50/374151/FFFFFF?text=Cero" },
    { categoria: "Salute", nome: "Paracetamolo (Tachipirina/Efferalgan)", imgUrl: "https://placehold.co/50x50/374151/FFFFFF?text=Para" },

    // --- PULIZIA CASA E ACCESSORI (Integrate) ---
    { categoria: "Lavanderia", nome: "Detersivo lavatrice (liquido)", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Lavand" },
    { categoria: "Lavanderia", nome: "Ammorbidente", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Am morb" },
    { categoria: "Lavanderia", nome: "Detersivo per capi delicati", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Delic" },
    { categoria: "Superfici/Pavimenti", nome: "Detersivo pavimenti", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Pavim" },
    { categoria: "Superfici/Pavimenti", nome: "Sgrassatore universale", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Sgrass" },
    { categoria: "Superfici/Pavimenti", nome: "Detergente per vetri", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Vetri" },
    { categoria: "Cucina/Lavastoviglie", nome: "Detersivo piatti (a mano)", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Piatti" },
    { categoria: "Cucina/Lavastoviglie", nome: "Pastiglie lavastoviglie", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=LavaS" },
    { categoria: "Accessori Pulizia", nome: "Spugne", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Spugne" },
    { categoria: "Accessori Pulizia", nome: "Panni in microfibra", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Panni" },
    { categoria: "Rifiuti", nome: "Sacchetti per immondizia (grandi)", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Sacchet" },
    { categoria: "Rifiuti", nome: "Sacchetti per umido", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=SacUm" },
    
    // --- PETS E VARIE (Integrate) ---
    { categoria: "Cibo per Animali", nome: "Crocchette per cane (sacchetto)", imgUrl: "https://placehold.co/50x50/475569/FFFFFF?text=Dog" },
    { categoria: "Cibo per Animali", nome: "Bocconcini per gatto (lattine)", imgUrl: "https://placehold.co/50x50/475569/FFFFFF?text=Cat" },
    { categoria: "Cucina/Usa e Getta", nome: "Pellicola trasparente", imgUrl: "https://placehold.co/50x50/78716C/FFFFFF?text=Pelli" },
    { categoria: "Cucina/Usa e Getta", nome: "Carta alluminio", imgUrl: "https://placehold.co/50x50/78716C/FFFFFF?text=Allum" },
    { categoria: "Cucina/Usa e Getta", nome: "Tovaglioli di carta", imgUrl: "https://placehold.co/50x50/78716C/FFFFFF?text=Tova" },
    { categoria: "Varie", nome: "Pile stilo AA", imgUrl: "https://placehold.co/50x50/78716C/FFFFFF?text=Pile" },
    { categoria: "Varie", nome: "Lampadine (E27)", imgUrl: "https://placehold.co/50x50/78716C/FFFFFF?text=Lamp" }
];

/* -----------------------------------------------------------------
   RENDER CATALOGO
   ----------------------------------------------------------------- */

function renderCatalog() {
    catalogListEl.innerHTML = "";

    catalog.forEach(item => {
        const div = document.createElement("div");
        div.className = "catalog-item";

        div.innerHTML = `
            <img src="${item.imgUrl}">
            <span>${item.nome}</span>
        `;

        div.onclick = () => addToShopping(item.nome, item.imgUrl);

        catalogListEl.appendChild(div);
    });
}

/* -----------------------------------------------------------------
   AGGIUNTA SHOPPING LIST
   ----------------------------------------------------------------- */

function addToShopping(name, imgUrl) {
    shopping.push({
        nome: name,
        imgUrl: imgUrl,
        qty: 1,
        done: false
    });

    renderShoppingList();
}

/* -----------------------------------------------------------------
   RENDER SHOPPING LIST
   ----------------------------------------------------------------- */

function renderShoppingList() {
    shoppingListEl.innerHTML = "";
    itemCountEl.innerText = shopping.length;

    shopping.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="item-left">
                <input type="checkbox" ${item.done ? "checked" : ""} data-index="${index}" class="check-done">
                <img src="${item.imgUrl}">
                <span class="${item.done ? "done" : ""}">${item.nome}</span>
            </div>

            <div class="item-right">
                <button class="qty-btn" data-action="minus" data-index="${index}">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" data-action="plus" data-index="${index}">+</button>
                <button class="delete-btn" data-index="${index}">🗑</button>
            </div>
        `;

        shoppingListEl.appendChild(li);
    });

    addShoppingListeners();
}

/* -----------------------------------------------------------------
   LISTENERS PER ITEMS DELLA LISTA SPESA
   ----------------------------------------------------------------- */

function addShoppingListeners() {
    document.querySelectorAll(".check-done").forEach(chk => {
        chk.onclick = () => {
            const i = chk.dataset.index;
            shopping[i].done = chk.checked;
            renderShoppingList();
        };
    });

    document.querySelectorAll(".qty-btn").forEach(btn => {
        btn.onclick = () => {
            const i = btn.dataset.index;
            const action = btn.dataset.action;

            if (action === "plus") shopping[i].qty++;
            else if (action === "minus" && shopping[i].qty > 1) shopping[i].qty--;

            renderShoppingList();
        };
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.onclick = () => {
            const i = btn.dataset.index;
            shopping.splice(i, 1);
            renderShoppingList();
        };
    });
}

/* -----------------------------------------------------------------
   SVUOTA LISTA SPESA
   ----------------------------------------------------------------- */

function clearShoppingList() {
    if (!confirm("Vuoi davvero svuotare la lista?")) return;
    shopping = [];
    renderShoppingList();
}

/* -----------------------------------------------------------------
   SALVA LISTA SPESA
   ----------------------------------------------------------------- */

async function saveShoppingList() {
    if (shopping.length === 0 || !CURRENT_USER_ID) {
        alert("Non puoi salvare una lista vuota.");
        return;
    }

    const listName = prompt("Nome della lista salvata:");

    if (!listName) return;

    try {
        const payload = {
            name: listName,
            items: shopping,
            userId: CURRENT_USER_ID,
            userName: `${CURRENT_USER_DATA.firstName} ${CURRENT_USER_DATA.lastName}`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("liste_salvate").add(payload);
        alert("Lista salvata!");
        loadLists();

    } catch (err) {
        console.error("Errore salvataggio lista:", err);
        alert("Errore nel salvataggio della lista.");
    }
}

/* -----------------------------------------------------------------
   CARICA LISTE SALVATE
   ----------------------------------------------------------------- */

async function loadLists() {
    try {
        const snapshot = await db
            .collection("liste_salvate")
            .orderBy("createdAt", "desc")
            .limit(10)
            .get();

        savedListsEl.innerHTML = "";

        if (snapshot.empty) {
            savedListsEl.innerHTML = "<p class='muted'>Nessuna lista salvata.</p>";
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();

            const div = document.createElement("div");
            div.className = "saved-list-item";

            div.innerHTML = `
                <strong>${data.name}</strong> <br>
                <small>${data.items.length} items</small>
                <button data-id="${doc.id}" class="load-list-btn">Carica</button>
            `;

            savedListsEl.appendChild(div);
        });

        document.querySelectorAll(".load-list-btn").forEach(btn => {
            btn.onclick = () => loadListById(btn.dataset.id);
        });

    } catch (err) {
        console.error("Errore caricamento liste:", err);
    }
}

/* -----------------------------------------------------------------
   CARICA LISTA SINGOLA
   ----------------------------------------------------------------- */

async function loadListById(id) {
    try {
        const doc = await db.collection("liste_salvate").doc(id).get();
        const data = doc.data();

        if (!data) return;

        shopping = data.items;
        renderShoppingList();

        alert(`Lista "${data.name}" caricata.`);

    } catch (err) {
        console.error("Errore caricamento lista:", err);
    }
}

/* -----------------------------------------------------------------
   SALVATAGGIO STORICO SPESA (STORICO_PERSONALE)
   ----------------------------------------------------------------- */

async function savePersonalPurchase() {
    if (shopping.length === 0 || !CURRENT_USER_ID) {
        alert("Lista vuota o non sei loggato.");
        return;
    }

    const totalCost = parseFloat(inputTotalCostEl.value);
    const purchaseNote = inputPurchaseNoteEl.value.trim();

    if (isNaN(totalCost) || totalCost <= 0) {
        alert("Inserisci un importo valido.");
        return;
    }

    const completedItems = shopping
        .filter(item => item.done)
        .map(item => ({
            nome: item.nome,
            qty: item.qty,
            imgUrl: item.imgUrl
        }));

    const payload = {
        userId: CURRENT_USER_ID,
        userName: `${CURRENT_USER_DATA.firstName} ${CURRENT_USER_DATA.lastName}`,
        totalCost: totalCost,
        note: purchaseNote || "",
        items: completedItems,
        itemsCount: completedItems.length,
        date: firebase.firestore.Timestamp.now()
    };

    try {
        await db.collection(PERSONAL_HISTORY_COLLECTION).add(payload);
        alert("Spesa salvata!");
        loadPersonalHistory();

        inputTotalCostEl.value = "";
        inputPurchaseNoteEl.value = "";

    } catch (err) {
        console.error("Errore salvataggio storico:", err);
        alert("Errore nel salvataggio dello storico.");
    }
}

/* -----------------------------------------------------------------
   LETTURA STORICO SPESA PERSONALE
   ----------------------------------------------------------------- */

async function loadPersonalHistory() {
    if (!CURRENT_USER_ID) {
        personalHistoryListEl.innerHTML =
            '<p class="muted">Accedi per vedere lo storico delle tue spese.</p>';
        return;
    }

    try {
        const snapshot = await db
            .collection(PERSONAL_HISTORY_COLLECTION)
            .where("userId", "==", CURRENT_USER_ID)
            .orderBy("date", "desc")
            .limit(10)
            .get();

        let html = "";

        if (snapshot.empty) {
            html = '<p class="muted">Nessuna spesa salvata nel tuo storico.</p>';
        } else {
            snapshot.forEach(doc => {
                const data = doc.data();

                const date = data.date
                    ? (data.date.toDate
                        ? data.date.toDate().toLocaleDateString("it-IT")
                        : "Data sconosciuta"
                      )
                    : "Data sconosciuta";

                const cost = data.totalCost?.toFixed(2) || "0.00";

                html += `
                    <div class="saved-list-item" style="flex-direction: column; align-items: flex-start;">
                        <span class="list-name" style="font-size: 1.1em; font-weight: bold;">
                            €${cost} 
                            <small style="font-weight: normal; color: #aaa;">(${data.itemsCount} item)</small>
                        </span>

                        <span class="muted-small" style="font-size: 0.9em; margin-top: 5px;">
                            ${data.note || "Nessuna nota"}
                        </span>

                        <span class="muted-small" style="font-size: 0.8em; color: var(--primary-color);">
                            Acquistato il ${date}
                        </span>
                    </div>
                `;
            });
        }

        personalHistoryListEl.innerHTML = html;

    } catch (err) {
        console.error("Errore caricamento storico:", err);
        personalHistoryListEl.innerHTML =
            '<p class="muted">Errore nel caricamento dello storico.</p>';
    }
}

/* -----------------------------------------------------------------
   MOSTRA/NASCONDI STORICO
   ----------------------------------------------------------------- */

function togglePersonalHistory() {
    if (personalHistoryGateEl.style.display === "none") {
        personalHistoryGateEl.style.display = "block";
        loadPersonalHistory();
    } else {
        personalHistoryGateEl.style.display = "none";
    }
}

/* -----------------------------------------------------------------
   PDF / DOWNLOAD LISTA
   ----------------------------------------------------------------- */

function preparePdf() {
    pdfNoteContainerEl.style.display = "block";
    actionPending = "download";
}

function prepareShare() {
    pdfNoteContainerEl.style.display = "block";
    actionPending = "share";
}

async function confirmPdfAction() {
    pdfNote = pdfNoteInputEl.value.trim();
    pdfNoteContainerEl.style.display = "none";

    if (actionPending === "download") generatePdf();
    if (actionPending === "share") sharePdf();
}

function generatePdf() {
    window.scrollTo(0, 0);

    const area = document.getElementById("pdfPrintArea");

    area.innerHTML = `
        <h2>Lista Spesa</h2>
        <p>${pdfNote || ""}</p>
        <ul>
            ${shopping.map(i => `<li>${i.nome} - x${i.qty}</li>`).join("")}
        </ul>
    `;

    html2canvas(area).then(canvas => {
        const img = canvas.toDataURL("image/png");
        const pdf = new jspdf.jsPDF({ unit: "pt", format: "a4" });

        pdf.addImage(img, "PNG", 20, 20, 560, 0);
        pdf.save("ListaSpesa.pdf");
    });
}

async function sharePdf() {
    try {
        const text = `Lista della spesa:\n\n${pdfNote}\n\n${shopping
            .map(i => `${i.nome} x${i.qty}`)
            .join("\n")}`;

        await navigator.share({ text: text });

    } catch (err) {
        console.error("Errore condivisione:", err);
        alert("La condivisione non è supportata su questo dispositivo.");
    }
}

/* -----------------------------------------------------------------
   UTENTI ATTIVI (Realtime DB)
   ----------------------------------------------------------------- */

function loadActiveUsers() {
    const usersRef = realtimeDB.ref("activeUsers");

    usersRef.on("value", snapshot => {
        const data = snapshot.val() || {};
        const list = document.getElementById("activeUsersList");

        list.innerHTML = "";

        Object.values(data).forEach(u => {
            const li = document.createElement("li");
            li.innerText = u.name;
            list.appendChild(li);
        });
    });
}

/* -----------------------------------------------------------------
   EVENT LISTENERS (TUTTE LE AZIONI)
   ----------------------------------------------------------------- */

function addAllEventListeners() {
    /* LOGIN */
    loginButtonEl.onclick = async () => {
        const nome = inputFirstNameEl.value.trim();
        const cognome = inputLastNameEl.value.trim();

        if (!nome || !cognome) {
            alert("Inserisci nome e cognome.");
            return;
        }

        const success = await registerOrLoginUser(nome, cognome);

        if (success) {
            loggedInUserEl.innerText = `${nome} ${cognome}`;
            loginGateEl.style.display = "none";
            mainAppEl.style.display = "block";

            addActiveUser(`${nome} ${cognome}`);
            renderCatalog();
            renderShoppingList();
            loadPersonalHistory();
            loadLists();
        }
    };

    /* LOGOUT */
    logoutButtonEl.onclick = logoutUser;

    /* LISTA SPESA */
    clearBtnEl.onclick = clearShoppingList;
    addManualBtnEl.onclick = () => {
        if (!manualInputEl.value.trim()) return;
        addToShopping(manualInputEl.value.trim(), "");
        manualInputEl.value = "";
    };

    /* SALVA LISTA */
    saveBtnEl.onclick = saveShoppingList;

    /* RICARICA LISTE */
    loadBtnEl.onclick = loadLists;

    /* PDF / CONDIVISIONE */
    downloadBtnEl.onclick = preparePdf;
    shareBtnEl.onclick = prepareShare;
    pdfNoteConfirmBtnEl.onclick = confirmPdfAction;

    /* STORICO SPESA */
    toggleHistoryBtnEl.onclick = togglePersonalHistory;
    savePurchaseBtnEl.onclick = savePersonalPurchase;

    /* ENTER negli input dello storico */
    inputTotalCostEl.addEventListener("keypress", e => {
        if (e.key === "Enter") savePersonalPurchase();
    });

    inputPurchaseNoteEl.addEventListener("keypress", e => {
        if (e.key === "Enter") savePersonalPurchase();
    });

    /* CERCA NEL CATALOGO */
    searchInputEl.oninput = () => {
        const q = searchInputEl.value.toLowerCase();
        catalogListEl.innerHTML = "";

        catalog
            .filter(item => item.nome.toLowerCase().includes(q))
            .forEach(item => {
                const div = document.createElement("div");
                div.className = "catalog-item";
                div.innerHTML = `
                    <img src="${item.imgUrl}">
                    <span>${item.nome}</span>
                `;
                div.onclick = () => addToShopping(item.nome, item.imgUrl);
                catalogListEl.appendChild(div);
            });
    };
}

/* -----------------------------------------------------------------
   AVVIO APP
   ----------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    getDOMElements();
    addAllEventListeners();
    checkLoginStatus();
});
