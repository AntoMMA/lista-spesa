
// ----------------------------
// FIREBASE INIT
// ----------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPHLvSRBt40Wloa0nnnAp5LVdUIOb9J40",
  authDomain: "lista-spesa-db7f7.firebaseapp.com",
  projectId: "lista-spesa-db7f7",
  storageBucket: "lista-spesa-db7f7.firebasestorage.app",
  messagingSenderId: "736757613454",
  appId: "1:736757613454:web:50744d7ce9db9d3ebc5adf",
  measurementId: "G-64QH2WHH2X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// CATALOGO CON CATEGORIE
let catalogo = [
  {name:"Pane", category:"Cibo"}, {name:"Pasta", category:"Cibo"}, {name:"Riso", category:"Cibo"},
  {name:"Latte", category:"Bevande"}, {name:"Acqua", category:"Bevande"}, {name:"Coca Cola", category:"Bevande"}, {name:"Birra", category:"Bevande"},
  {name:"Mela", category:"Frutta"}, {name:"Banana", category:"Frutta"}, {name:"Arancia", category:"Frutta"},
  {name:"Insalata", category:"Verdura"}, {name:"Pomodori", category:"Verdura"}, {name:"Patate", category:"Verdura"},
  {name:"Pollo", category:"Carne"}, {name:"Manzo", category:"Carne"}, {name:"Prosciutto", category:"Carne"},
  {name:"Tonno", category:"Pesce"}, {name:"Salmone", category:"Pesce"},
  {name:"Dentifricio", category:"Casa"}, {name:"Shampoo", category:"Casa"}, {name:"Sapone", category:"Casa"}, {name:"Carta igienica", category:"Casa"},
  {name:"Biscotti", category:"Snack"}, {name:"Cioccolato", category:"Snack"}, {name:"Succo di frutta", category:"Bevande"}
];

let lista = [];
let savedLists = [];

function cleanName(name){return name.replace(/\(.*?\)/g,'').trim();}
async function saveCatalogFirestore(){const ref = doc(db,"data","catalogo");return setDoc(ref,{prodotti:catalogo});}
async function loadCatalogFirestore(){const ref = doc(db,"data","catalogo");const snap = await getDoc(ref);if(snap.exists()){catalogo = snap.data().prodotti;}else{await saveCatalogFirestore();}renderCatalog();}

function renderCatalog(filter=""){
  const catalogEl = document.getElementById("catalogList");
  catalogEl.innerHTML="";
  catalogo.filter(p=>p.name.toLowerCase().includes(filter.toLowerCase())).forEach(item=>{
    const div = document.createElement("div");
    div.classList.add("prod");
    div.textContent = `${item.name} (${item.category})`;
    div.onclick = ()=>addToList(item.name);
    catalogEl.appendChild(div);
  });
}

function renderList(){
  const ul = document.getElementById("shoppingItems");
  ul.innerHTML="";
  lista.forEach((item,idx)=>{
    const li = document.createElement("li");
    li.innerHTML = `<div class="left"><input type="checkbox" id="chk${idx}"><span class="name">${item.name}</span></div><div class="qty">x${item.qty}</div>`;
    ul.appendChild(li);
  });
  document.getElementById("itemCount").textContent = lista.length;
}

async function addToList(name){
  name = cleanName(name);
  if(!catalogo.some(p=>p.name===name)){catalogo.push({name:name,category:"Altro"});await saveCatalogFirestore();renderCatalog();}
  const idx = lista.findIndex(p=>p.name===name);
  if(idx>-1){lista[idx].qty+=1;}else{lista.push({name:name,qty:1});}
  renderList();
}

document.getElementById("addManualBtn").onclick = ()=>{const val=document.getElementById("manualInput").value.trim();if(val){addToList(val);document.getElementById("manualInput").value="";}}
document.getElementById("searchInput").oninput = ()=>{renderCatalog(document.getElementById("searchInput").value);}
document.getElementById("downloadBtn").onclick = ()=>{const { jsPDF } = window.jspdf; const pdf = new jsPDF(); pdf.setFontSize(22); pdf.text("Lista della Spesa",20,20); pdf.setFontSize(14); let y=35; lista.forEach(item=>{pdf.text(`- ${cleanName(item.name)} x${item.qty}`,20,y);y+=10;if(y>280){pdf.addPage();y=20;}}); pdf.save("lista_spesa.pdf");}
document.getElementById("shareBtn").onclick = ()=>{alert("Funzione di condivisione: salva PDF e invia tramite WhatsApp o Email.");}
document.getElementById("clearBtn").onclick = ()=>{if(confirm("Vuoi pulire tutta la lista?")){lista=[];renderList();}}

document.getElementById("saveBtn").onclick = async ()=>{
  if(lista.length===0){alert("Lista vuota");return;}
  const nomeLista = prompt("Nome lista:"); if(!nomeLista) return;
  const ref = doc(db,"data",nomeLista); await setDoc(ref,{items:lista});
  alert("Lista salvata su Firestore!"); renderSavedLists();
}

async function renderSavedLists(){
  const container = document.getElementById("savedLists");
  container.innerHTML="";
  const coll = collection(db,"data"); const snaps = await getDocs(coll);
  snaps.forEach(docSnap=>{if(docSnap.id==="catalogo") return;
    const div=document.createElement("div"); div.classList.add("saved-item");
    div.innerHTML=`<span class="meta">${docSnap.id}</span><div class="btns"><button onclick="loadSaved('${docSnap.id}')">Carica</button></div>`;
    container.appendChild(div);
  });
}

window.loadSaved = async function(name){
  const ref=doc(db,"data",name); const snap = await getDoc(ref);
  if(snap.exists()){lista = snap.data().items; renderList();}else{alert("Lista non trovata.");}
}

loadCatalogFirestore();
renderList();
renderSavedLists();
