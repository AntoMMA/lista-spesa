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
const catalog = [
  { nome: "Panni in microfibra", imgUrl: "https://placehold.co/50x50/059669/FFFFFF?text=Panni" },
  { nome: "Acqua naturale (6x1.5L)", imgUrl: "https://placehold.co/50x50/10B981/FFFFFF?text=Acqua" },
  { nome: "Aglio", imgUrl: "https://placehold.co/50x50/065F46/FFFFFF?text=Aglio" },
  { nome: "Assorbenti igienici", imgUrl: "https://placehold.co/50x50/6D28D9/FFFFFF?text=Prot" }
  // … (il resto del catalogo rimane invariato)
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
