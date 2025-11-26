x/* =================================================================
   FILE: script.js - Codice Aggiornato con Soluzione Persistenza & Bug Offline
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
// ðŸš MODIFICATO: Inizializza l'ID per tentare il recupero dello stato salvato
let CURRENT_USER_ID = localStorage.getItem("user_unique_id") || null; 
let CURRENT_USER_DATA = { firstName: "", lastName: "" };
const USER_COLLECTION_NAME = "registered_users"; 
const FREQUENT_PRODUCTS_COLLECTION = "prodotti_frequenti"; 

let pdfNote = ""; 
let shopping = []; 
let actionPending = '';

/* -------------- VARIABILI DOM (Elementi HTML) -------------- */
let loginGateEl, mainAppEl, loginButtonEl, inputFirstNameEl, inputLastNameEl, loggedInUserEl, logoutButtonEl, catalogListEl, shoppingItemsEl, itemCountEl, addManualInputEl, addManualBtnEl, clearBtnEl, saveBtnEl, loadBtnEl, savedListsEl, activeUsersListEl, pdfNoteContainerEl, pdfNoteInputEl, pdfNoteConfirmBtnEl, downloadBtnEl, shareBtnEl, searchInputEl; 

/* -------------- CATALOGO PRODOTTI ESTESO E AGGIORNATO (INVARIATO) -------------- */
// ... (Catalogo invariato, omesso per brevità)
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
    { categoria: "Carne Rossa", nome: "Hamburger", imgUrl:"https://share.google/7XCOA7CE91RAA3hQ7" },

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
    { categoria: "Caffé/TÉ", nome: "Caffé macinato (moka)", imgUrl: "https://placehold.co/50x50/701A75/FFFFFF?text=Caffé" },
    { categoria: "Caffé/TÉ", nome: "Capsule/Cialde per caffé", imgUrl: "https://placehold.co/50x50/701A75/FFFFFF?text=Caffé" },
    { categoria: "Caffé/TÉ", nome: "TÉ nero (bustine)", imgUrl: "https://placehold.co/50x50/701A75/FFFFFF?text=TÉ" },
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


/* -------------- FUNZIONI BASE (INVARIANTI) -------------- */

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Funzione di inizializzazione principale.
 */
async function initializeApp() {
    if (CURRENT_USER_ID) {
        loginGateEl.style.display = 'none';
        mainAppEl.style.display = 'grid'; 
        loggedInUserEl.textContent = `${CURRENT_USER_DATA.firstName} ${CURRENT_USER_DATA.lastName}`;

        // ðŸš NUOVO: Imposta l'utente come ONLINE
        setActiveUserStatus(true);
        listenToActiveUsers();
        listenToActiveList();
        
        // Rimosso dbRT.ref('active_users/' + CURRENT_USER_ID).onDisconnect().remove(); 
        // per prevenire il bug offline al refresh/uscita accidentale.
        
        const frequentProducts = await getFrequentProducts(); 
        renderCatalog(catalogo, frequentProducts); 
    } else {
        // Se non c'è ID in localStorage, mostra la schermata di login
        loginGateEl.style.display = 'flex'; 
        mainAppEl.style.display = 'none';
        if(loggedInUserEl) loggedInUserEl.textContent = "Offline";
        
        renderCatalog(catalogo);
    }

    renderShopping();
    loadLists(); 
}

/* -------------- FUNZIONI UTENTE E AUTENTICAZIONE (Modificate per Persistenza/Stato) -------------- */

/**
 * Funzione per gestire lo stato di online/offline nel Realtime DB.
 * @param {boolean} isOnline - true per online, false per offline.
 */
function setActiveUserStatus(isOnline) {
    if (!CURRENT_USER_ID) return;
    
    // Usiamo un nodo specifico per lo stato
    const userStatusRef = dbRT.ref('user_status/' + CURRENT_USER_ID);

    if (isOnline) {
        userStatusRef.set({
            isOnline: true,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
        // Non usiamo onDisconnect().remove() qui, ma lo gestiamo noi alla chiusura/logout
    } else {
        userStatusRef.set({
            isOnline: false,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }
}

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
            // Salva l'ID per la persistenza
            localStorage.setItem("user_unique_id", CURRENT_USER_ID); 
        } else {
            CURRENT_USER_ID = generateUUID();
            CURRENT_USER_DATA = { firstName, lastName };
            // Salva l'ID per la persistenza
            localStorage.setItem("user_unique_id", CURRENT_USER_ID);
            await db.collection(USER_COLLECTION_NAME).doc(CURRENT_USER_ID).set(CURRENT_USER_DATA);
        }
        
        // Prima del log-in, assicurati che la lista di utenti attivi (per il nome) sia aggiornata
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
    // Imposta l'utente offline
    setActiveUserStatus(false);

    // Pulisci i dati di sessione
    CURRENT_USER_ID = null;
    CURRENT_USER_DATA = { firstName: "", lastName: "" };
    localStorage.removeItem("user_unique_id");
    
    loginGateEl.style.display = 'flex';
    mainAppEl.style.display = 'none';
    if(loggedInUserEl) loggedInUserEl.textContent = "Offline";
}

/**
 * Gestisce l'evento di chiusura della pagina/tab.
 * Imposta l'utente offline *solo* se la chiusura è intenzionale (o si simula che lo sia), 
 * ma l'accesso è comunque salvato.
 * Il browser cercherà di eseguire questa chiamata se l'utente chiude attivamente la pagina.
 */
function handleBeforeUnload(e) {
    if (CURRENT_USER_ID) {
        // Imposta immediatamente lo stato offline
        setActiveUserStatus(false);
        // dbRT.ref('active_users/' + CURRENT_USER_ID).remove(); // Rimosso per non distruggere l'active_users
    }
    // Non restituire nulla, o restituire un messaggio per un prompt standard (non raccomandato oggi)
}


/* -------------- FUNZIONI DI AUTO-APPRENDIMENTO (INVARIANTI) -------------- */
// ... (saveManualAddition e getFrequentProducts invariate, omesse per brevità)
/**
 * Salva o aggiorna il conteggio di un prodotto aggiunto manualmente.
 * @param {string} name - Nome del prodotto.
 */
async function saveManualAddition(name) {
    if (!CURRENT_USER_ID) return;

    // Crea un ID di documento normalizzato dal nome del prodotto
    const docId = name.toLowerCase().replace(/[^a-z0-9]/g, '');

    try {
        const docRef = db.collection(FREQUENT_PRODUCTS_COLLECTION).doc(docId);
        
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);

            if (doc.exists) {
                // Se il prodotto esiste, incrementa il conteggio (contatore condiviso)
                const newCount = (doc.data().count || 0) + 1;
                transaction.update(docRef, { 
                    count: newCount, 
                    lastUsed: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Se è la prima volta che viene aggiunto, crea il documento
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

/**
 * Recupera i prodotti più frequenti dal database.
 * @returns {Array<Object>} Lista di prodotti usati frequentemente.
 */
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


/* -------------- FUNZIONI CATALOGO (RENDER e RICERCA INVARIANTI) -------------- */
// ... (renderCatalog, handleSearch, renderShopping, syncShoppingList, addItem, handleListClick invariate, omesse per brevità)
/**
 * Renderizza il catalogo con l'opzione dei prodotti frequenti in cima.
 * @param {Array<Object>} itemsToRender - Prodotti standard del catalogo da renderizzare.
 * @param {Array<Object>} frequentProducts - Prodotti da mostrare nella sezione 'Frequenti'.
 */
function renderCatalog(itemsToRender, frequentProducts = []) {
    let html = '';
    let currentCategory = '';

    // 1. Aggiungi la sezione "Frequenti" solo se ci sono prodotti
    if (frequentProducts.length > 0) {
        html += `<h3 class="catalog-category">⭐️ FREQUENTEMENTE USATI</h3>`;
        
        frequentProducts.forEach(item => {
             html += `<div class="catalog-item frequent-item" data-name="${item.name}" data-img-url="${item.imgUrl}">
                        <img src="${item.imgUrl}" alt="${item.name}" class="product-photo">
                        <span>${item.name} <small>(${item.count}x)</small></span>
                    </div>`;
        });
    }

    // 2. Aggiungi la sezione "Catalogo Completo"
    const sortedItems = [...itemsToRender].sort((a, b) => {
        if (a.categoria !== b.categoria) {
            return a.categoria.localeCompare(b.categoria);
        }
        return a.nome.localeCompare(b.nome);
    });

    html += `<h3 class="catalog-category">CATALOGO COMPLETO</h3>`;

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

// MODIFICATA: Ora gestisce i prodotti frequenti durante la ricerca
async function handleSearch() {
    const searchTerm = searchInputEl.value.toLowerCase().trim();
    const frequentProducts = await getFrequentProducts(); // Carica i prodotti frequenti

    if (searchTerm.length < 2 && searchTerm !== "") {
        // Se la ricerca è breve, mostra il catalogo intero con i frequenti in cima
        renderCatalog(catalogo, frequentProducts);
        return;
    }
    
    const filteredCatalog = catalogo.filter(item => 
        item.nome.toLowerCase().includes(searchTerm) || 
        item.categoria.toLowerCase().includes(searchTerm)
    );
    
    // Filtra anche i prodotti frequenti
    const filteredFrequent = frequentProducts.filter(item => 
        item.name.toLowerCase().includes(searchTerm)
    );

    // Quando cerchi, mostra solo i risultati filtrati (dando precedenza ai frequenti)
    renderCatalog(filteredCatalog, filteredFrequent);

    catalogListEl.scrollTop = 0; 
}


/* -------------- FUNZIONI LISTA SPESA (addItem MODIFICATA) -------------- */

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

// MODIFICATA: Aggiunge il flag isManual per tracciare le aggiunte manuali
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
    
    // ðŸš NUOVO: Chiama la funzione di auto-apprendimento se è un'aggiunta manuale
    if (isManual) {
        saveManualAddition(name);
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

/* -------------- FUNZIONI SALVATAGGIO/CARICAMENTO FIRESTORE (Invariate) -------------- */
// ... (saveList, loadLists, generateStyledListHTML, downloadStyledPDF, sharePDF invariate, omesse per brevità)
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


/* -------------- FUNZIONI PDF e CONDIVISIONE (AGGIORNATE PER STILE) -------------- */

/**
 * Genera l'HTML stilizzato (mockup) della lista spesa per la conversione PDF.
 * Questo è il cuore dello stile Dark Mode.
 * @param {Array<Object>} list - La lista della spesa corrente.
 * @param {string} note - La nota utente da includere.
 * @returns {string} L'HTML completo e stilizzato.
 */
function generateStyledListHTML(list, note) {
    // Mappatura semplificata dei colori per i badge (basata sull'estensione del catalogo)
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
        // Usa le prime 4 lettere del prodotto per il badge (se lungo almeno 4)
        const iconText = item.nome.length >= 4 ? item.nome.substring(0, 4).toUpperCase() : item.nome.toUpperCase(); 
        
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

    return `
        <div style="padding: 10px; background: #1a1a1a; color: #fff; font-family: Arial, sans-serif;">
            <h1 style="font-size: 18px; text-align: center; margin-bottom: 5px; color: #60A5FA;">Lista Spesa Condivisa</h1>
            ${note ? `<p style="font-size: 9px; text-align: center; color: #aaa; margin-bottom: 10px;">Note: ${note}</p>` : ''}
            <div style="border: 1px solid #333; padding: 5px; border-radius: 5px;">
                ${listHtml}
            </div>
        </div>
    `;
}


function downloadStyledPDF() {
    // Verifica che entrambe le librerie siano caricate
    if (!window.jspdf || !window.html2canvas) {
        alert("Librerie jsPDF/html2canvas non caricate. Assicurati che siano incluse nell'HTML.");
        return;
    }

    const printArea = document.getElementById("pdfPrintArea");
    
    // 1. Genera l'HTML stilizzato e iniettalo nell'area nascosta
    printArea.innerHTML = generateStyledListHTML(shopping, pdfNote);
    
    const { jsPDF } = window.jspdf;
    
    // 2. Converti l'HTML in un canvas (immagine) con alta risoluzione
    html2canvas(printArea, { 
        backgroundColor: '#1a1a1a', 
        scale: 2 
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        const pdfWidth = 210; // Larghezza A4 in mm
        const pdfHeight = 297; // Altezza A4 in mm
        const margin = 10;
        
        // Calcola le dimensioni proporzionali dell'immagine nel PDF
        const imgWidth = pdfWidth - (2 * margin); 
        const imgHeight = canvas.height * imgWidth / canvas.width; 
        
        let heightLeft = imgHeight; // Altezza totale da stampare
        
        // Crea il documento PDF. L'altezza iniziale è l'altezza standard A4 o l'altezza del contenuto (la maggiore)
        const doc = new jsPDF('p', 'mm', [pdfWidth, Math.max(pdfHeight, imgHeight + (2 * margin))]); 
        
        let position = 0;

        // 3. Aggiungi l'immagine al PDF
        doc.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - margin);

        // Gestisce pagine multiple per liste molto lunghe (anti-taglio)
        while (heightLeft > 0) {
            // Calcola la posizione per il ritaglio sulla pagina successiva
            position = - (imgHeight - heightLeft); 
            doc.addPage();
            doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - margin);
        }

        doc.save("ListaSpesaStilizzata.pdf");
        
        // Pulisci l'area di stampa e la nota PDF
        pdfNote = ""; 
        pdfNoteInputEl.value = "";
        pdfNoteContainerEl.style.display = 'none'; 
        printArea.innerHTML = ''; 
    });
}


function sharePDF() {
    // La funzione di Condividi ora tenta la condivisione testuale, ma se fallisce, 
    // ricade nel download del PDF stilizzato.
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
                downloadStyledPDF(); // Ricade nel download stilizzato
            });
    } else {
        alert("Il tuo browser non supporta l'API di condivisione nativa. Verrà scaricato il PDF stilizzato.");
        downloadStyledPDF(); // Ricade nel download stilizzato
    }
    
    // Pulisci la nota
    pdfNote = ""; 
    pdfNoteInputEl.value = "";
    pdfNoteContainerEl.style.display = 'none';
}


/* -------------- FUNZIONI REALTIME (UTENTI ATTIVI E LISTA - MODIFICATE) -------------- */

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

/**
 * Ascolta i cambiamenti di stato (online/offline) degli utenti.
 * ðŸš MODIFICATO: Ora combina i dati di tutti gli utenti registrati con il loro stato in 'user_status'.
 */
async function listenToActiveUsers() {
    if (!CURRENT_USER_ID) return; 

    const allUsers = await fetchAllRegisteredUsers();
    
    // Ascolta i cambiamenti di stato
    dbRT.ref('user_status/').on('value', (snapshot) => {
        const userStatus = snapshot.val() || {}; // Mappa di {userId: {isOnline: true/false, ...}}
        
        const finalUsersList = Object.values(allUsers).map(user => {
            const statusData = userStatus[user.id] || { isOnline: false }; 
            
            return {
                ...user,
                isOnline: statusData.isOnline || false // Stato di default offline
            };
        }).sort((a, b) => {
            // Metti gli utenti online in cima
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


/* -------------- GESTIONE EVENTI E AVVIO IN SICUREZZA (Modificate per Persistenza) -------------- */

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
            // Aggiunta da catalogo (isManual = false)
            addItem(name, imgUrl); 
        }
    });
    
    // MODIFICATA: la ricerca ora gestisce i prodotti frequenti
    searchInputEl.addEventListener("input", handleSearch); 
    
    shoppingItemsEl.addEventListener("click", handleListClick);
    
    // MODIFICATA: L'aggiunta manuale ora registra l'evento per l'auto-apprendimento
    addManualBtnEl.addEventListener("click", () => {
        const name = addManualInputEl.value.trim();
        if (name) {
            // ðŸš NUOVO: Passiamo true per indicare che è un'aggiunta manuale
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

    // ðŸš NUOVO: Listener per la chiusura della pagina
    window.addEventListener('beforeunload', handleBeforeUnload);
}


async function checkLoginStatus() {
    if (CURRENT_USER_ID) {
        try {
            const doc = await db.collection(USER_COLLECTION_NAME).doc(CURRENT_USER_ID).get();
            if (doc.exists) {
                CURRENT_USER_DATA = doc.data();
                // Persistenza riuscita, passa all'app principale
                initializeApp();
            } else {
                // ID in localStorage ma utente non esiste più (caso raro), forziamo il logout
                handleLogout(); 
            }
        } catch (err) {
            console.error("Errore nel recupero dati utente:", err);
            // In caso di errore di connessione, l'ID resta in memoria e si tenta il ri-login al prossimo avvio
            initializeApp(); 
        }
    } else {
        initializeApp();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    if (!getDOMElements()) return; 
    addAllEventListeners();
    checkLoginStatus(); // Inizia controllando lo stato di login salvato
});
