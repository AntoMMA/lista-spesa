// ============ CONFIGURAZIONE FIREBASE (LA TUA) ============
const firebaseConfig = {
  apiKey: "AIzaSyCPHLvSRBt40Wloa0nnnAp5LVdUIOb9J40",
  authDomain: "lista-spesa-db7f7.firebaseapp.com",
  projectId: "lista-spesa-db7f7",
  storageBucket: "lista-spesa-db7f7.firebasestorage.app",
  messagingSenderId: "736757613454",
  appId: "1:736757613454:web:50744d7ce9db9d3ebc5adf",
  measurementId: "G-64QH2WHH2X"
};

// Inizializzazione Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// ============ SALVA LISTA SU FIRESTORE ============
function saveList() {
    const text = document.getElementById("shoppingList").value;

    if (!text.trim()) {
        alert("La lista è vuota!");
        return;
    }

    db.collection("liste_spesa").add({
        testo: text,
        timestamp: new Date()
    }).then(() => {
        alert("Lista salvata!");
        document.getElementById("shoppingList").value = "";
    });
}


// ============ CARICA LISTE SALVATE ============
function loadLists() {
    db.collection("liste_spesa")
      .orderBy("timestamp", "desc")
      .get()
      .then(snapshot => {
        const container = document.getElementById("savedLists");
        container.innerHTML = "";

        snapshot.forEach(doc => {
            const data = doc.data();

            const div = document.createElement("div");
            div.classList.add("item");
            div.innerHTML = `
                <p>${data.testo.replace(/\n/g, "<br>")}</p>
                <small>${data.timestamp.toDate().toLocaleString()}</small>
            `;

            container.appendChild(div);
        });
    });
}


// ============ CREA E SCARICA PDF ============
function downloadPDF() {
    const text = document.getElementById("shoppingList").value;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text(text, 10, 10);
    doc.save("lista_spesa.pdf");
}


// ============ CONDIVIDI PDF ============
async function sharePDF() {
    const text = document.getElementById("shoppingList").value;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text(text, 10, 10);

    const pdfBlob = doc.output("blob");

    if (navigator.share) {
        await navigator.share({
            title: "Lista della Spesa",
            files: [new File([pdfBlob], "lista_spesa.pdf", { type: "application/pdf" })]
        });
    } else {
        alert("La condivisione non è supportata sul tuo dispositivo.");
    }
}