import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAYASIoV6Ah3H-RyRoBJt0sXFJQWdz8rm8",
    authDomain: "masterarbeitcounterpage.firebaseapp.com",
    projectId: "masterarbeitcounterpage",
    storageBucket: "masterarbeitcounterpage.firebasestorage.app",
    messagingSenderId: "551808681406",
    appId: "1:551808681406:web:8f0cad5f98cc248b25a5ef"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const docRef = doc(db, "progress", "status");
const TOTAL_PAGES = 80;

// Edit-Modus nur mit ?edit=true
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("edit") === "true") {
document.getElementById("editControls").style.display = "block";
}

// Live-Listener (alle sehen Updates)
onSnapshot(docRef, (docSnap) => {
  const data = docSnap.data();
  // Seiten
  document.getElementById("pages").innerText = data.pages;

  // Fortschritt
  const progress = Math.min(100, (data.pages / TOTAL_PAGES) * 100);
  document.getElementById("progress").style.width = progress + "%";

  // Deadline
  const deadline = data.deadline.toDate();
  const today = new Date();
  const days = Math.ceil((deadline - today) / (1000*60*60*24));
  
  document.getElementById("deadline").innerText = deadline.toLocaleDateString('de-DE');
  document.getElementById("days").innerText = days;
});

// Buttons
async function changePages(delta) {
    const snap = await getDoc(docRef);
    const pages = Math.max(0, snap.data().pages + delta);
    await updateDoc(docRef, { pages });
}

const plus = document.getElementById("plus");
const minus = document.getElementById("minus");

if (plus && minus) {
    plus.onclick = () => changePages(1);
    minus.onclick = () => changePages(-1);
}

//document.getElementById("minus").onclick = async () => {
//  const snap = await getDoc(docRef);
//  await updateDoc(docRef, { pages: Math.max(0, snap.data().pages - 1) });
//};