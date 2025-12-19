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
const confettiMilestones = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]; // Alle 5 Seiten: Konfetti
const quoteMilestones = [10, 20, 30, 40, 50, 60, 70, 80]; // Alle 10 Seiten: Spruch
const quotes = [    
    "JEA! 10 Seiten is schau mal a bissal was. Let's GOO! 💪",
    "20 Seiten done. SO PROUD. :D 🚀",
    "HAWARA TIMNA LET'S FEEEETZ! 30 Seiten is quasi schon halbzeit und halbzeit is quasi schon fertig. 🌟",
    "Hoibzeid. I cry. Amazing work 🏆",
    "Go giirl go giirl go giirl! 🔑",
    "Heast jetzt is nimma viel. Griagst an Regenbogen dafia! 🌈",
    "OMG! 70! Jetzt hean ma aba nimma auf! Des schaffst jetzt a nu! 🎯",
    "You are AMAZING! YOU DID IT! Hat ja nur a bissi dauert aba es is done. so proud. 🎉"
];
const quoteColors = ['#d41844ff', '#C1E1C1', '#FFFACD', '#DDA0DD', '#AFEEEE', '#F0E68C', '#140eb3ff', '#98FB98']; // Bunte Pastellfarben
let triggeredConfetti = [];
let triggeredQuotes = [];
const gifMilestones = [10, 20, 30, 50, 70, 80]; // Meilensteine für GIF-Popups
const gifUrls = {
  10: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnYzZW1hOXZkcXg0d2dya2M0aHpyejJ2Y3BsN21wdWY0bm00YzFhdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IwYzRHOA0bTtbx4VBd/giphy.gif', // Ersetze mit deinem GIF für 10 Seiten
  20: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzBrODc1ZjliZnFscW1zdTkxc25hNnR4ZHR2YXQ5cjBnenR4MG0yeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5FfjsWfdbJcXu/giphy.gif', // Ersetze mit deinem GIF für 20 Seiten
  30: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHJrcnNucTBpZHo5ZDdnY3h0ZjdlYWlnaWhqcDRyb2l2NjdlbTVhdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5UAofAl6g5t1GL5nO8/giphy.gif', // Ersetze mit deinem GIF für 30 Seiten
  50: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', // Ersetze mit deinem GIF für 50 Seiten
  70: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGp5MTUxbjBjZHBtdXd3MjYzcW9yZGhjMnJ6YTdhc3Y0MWIwbjhmZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/czubJ08i7deuKGJE9A/giphy.gif', // Ersetze mit deinem GIF für 70 Seiten
  80: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWxvYXhha2QxNDJ4Ym5qbWk3dG0yaWhtMjJ6aTAxcnd4OXFwNTRwOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ebFG4jcnC1Ny8/giphy.gif', // Ersetze mit deinem GIF für 80 Seiten (und über 80)
  over80: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExejhjcWc0d2NleHBxbGxyaGs2ajZ5enJhOXN0aW03azJ6M3EwOGtuYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/EdRgVzb2X3iJW/giphy.gif' // Optionales separates GIF für über 80 (hier dasselbe wie 80)
};
let triggeredGifs = []; // Um Wiederholungen zu verhindern


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

  // Konfetti prüfen (alle 5 Seiten)
  if (!triggeredConfetti.includes(data.pages) && confettiMilestones.includes(data.pages)) {
    triggeredConfetti.push(data.pages);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }

  // Spruch prüfen (alle 10 Seiten) und hinzufügen
  quoteMilestones.forEach((milestone, index) => {
    if (data.pages >= milestone && !triggeredQuotes.includes(milestone)) {
      triggeredQuotes.push(milestone);
      const quote = quotes[index];
      const quoteCard = document.createElement('div');
      quoteCard.className = 'quote-card';
      quoteCard.innerText = quote;
      quoteCard.setAttribute('data-pages', milestone); // Für Entfernung markieren
      quoteCard.style.backgroundColor = quoteColors[Math.floor(Math.random() * quoteColors.length)]; // Zufällige bunte Farbe
      
      // Abwechselnd links oder rechts hinzufügen
      const leftContainer = document.getElementById('leftQuotes');
      const rightContainer = document.getElementById('rightQuotes');
      if (triggeredQuotes.length % 2 === 1) {
        leftContainer.appendChild(quoteCard);
      } else {
        rightContainer.appendChild(quoteCard);
      }
    }
  });

  // GIF-Popup prüfen (bei 30,50,70,80 und über 80)
  if (gifMilestones.includes(data.pages) && !triggeredGifs.includes(data.pages)) {
    triggeredGifs.push(data.pages);
    const gifUrl = gifUrls[data.pages];
    showGifMilestone(gifUrl);
  } else if (data.pages > 80 && !triggeredGifs.includes('over80')) {
    triggeredGifs.push('over80');
    const gifUrl = gifUrls.over80;
    showGifMilestone(gifUrl);
  }

  // Entferne aus triggeredGifs, wenn Seiten sinken (für über 80)
  if (data.pages <= 80 && triggeredGifs.includes('over80')) {
    triggeredGifs.splice(triggeredGifs.indexOf('over80'), 1);
  }

  // Entferne Quote-Cards, wenn Meilensteine nicht mehr erreicht sind
  triggeredQuotes.forEach((milestone) => {
    if (data.pages < milestone) {
      const card = document.querySelector(`.quote-card[data-pages="${milestone}"]`);
      if (card) {
        card.remove();
        triggeredQuotes.splice(triggeredQuotes.indexOf(milestone), 1); // Aus Array entfernen
      }
    }
  });
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


function showMilestone(message) {
    const popup = document.getElementById("milestonePopup");
    popup.innerText = message;
    popup.style.display = "block";
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => { popup.style.display = "none"; }, 3000);
}

// Neue Funktion für GIF-Popup
function showGifMilestone(gifUrl) {
  const popup = document.getElementById("milestonePopup");
  popup.innerHTML = `<img src="${gifUrl}" alt="Motivations-GIF" style="max-width: 100%; max-height: 100%; border-radius: 10px;">`;
  popup.style.display = "block";
  confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); // Zusätzliches Konfetti
  setTimeout(() => {
    popup.style.display = "none";
    popup.innerHTML = ''; // Zurücksetzen
  }, 5000); // 5 Sekunden
}
