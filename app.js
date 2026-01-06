import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
console.log('App.js loaded'); // Debug
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
const DEADLINE = new Date(2026, 4, 5); // 05.05.2026 (Mai ist 4, 0-basiert)
const writingDays = [
  new Date(2026, 0, 9), new Date(2026, 0, 10), new Date(2026, 0, 11),
  new Date(2026, 0, 16), new Date(2026, 0, 17), new Date(2026, 0, 18),
  new Date(2026, 0, 23), new Date(2026, 0, 24), new Date(2026, 0, 25),
  new Date(2026, 0, 30), new Date(2026, 1, 6), new Date(2026, 1, 7), new Date(2026, 1, 8),
  new Date(2026, 1, 13), new Date(2026, 1, 14), new Date(2026, 1, 15),
  new Date(2026, 1, 23), new Date(2026, 1, 24), new Date(2026, 1, 25), 
  new Date(2026, 1, 26), new Date(2026, 1, 27), new Date(2026, 1, 28), 
  new Date(2026, 2, 1),
  new Date(2026, 2, 6), new Date(2026, 2, 7), new Date(2026, 2, 8),
  new Date(2026, 2, 20), new Date(2026, 2, 27),
  new Date(2026, 3, 3), new Date(2026, 3, 4), new Date(2026, 3, 5)
];
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
  10: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnYzZW1hOXZkcXg0d2dya2M0aHpyejJ2Y3BsN21wdWY0bm00YzFhdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IwYzRHOA0bTtbx4VBd/giphy.gif', 
  20: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzBrODc1ZjliZnFscW1zdTkxc25hNnR4ZHR2YXQ5cjBnenR4MG0yeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5FfjsWfdbJcXu/giphy.gif',
  30: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHJrcnNucTBpZHo5ZDdnY3h0ZjdlYWlnaWhqcDRyb2l2NjdlbTVhdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5UAofAl6g5t1GL5nO8/giphy.gif',
  50: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
  70: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGp5MTUxbjBjZHBtdXd3MjYzcW9yZGhjMnJ6YTdhc3Y0MWIwbjhmZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/czubJ08i7deuKGJE9A/giphy.gif',
  80: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWxvYXhha2QxNDJ4Ym5qbWk3dG0yaWhtMjJ6aTAxcnd4OXFwNTRwOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ebFG4jcnC1Ny8/giphy.gif',
  over80: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExejhjcWc0d2NleHBxbGxyaGs2ajZ5enJhOXN0aW03azJ6M3EwOGtuYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/EdRgVzb2X3iJW/giphy.gif'
};
let triggeredGifs = []; // Um Wiederholungen zu verhindern
const pageMotivations = ["Wowii!", "Wida a seital :D", "Amazing!", "YAASS!", "Let's Gooo!", "Task: geh mal a runde ums haus.", "💪", "🚀", "🌟", "🔥", "👍"];

let lastPages = 0; // Um zu tracken, ob Seiten erhöht wurden


// Edit-Modus nur mit ?edit=true
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("edit") === "true") {
document.getElementById("editControls").style.display = "block";
}

// Live-Listener (alle sehen Updates)
onSnapshot(docRef, (docSnap) => {
  console.log('Firebase data loaded:', docSnap.data()); // Debug: Prüfe, ob Daten kommen
  const data = docSnap.data();
  if (!data) {
    console.error('No data in Firebase!');
    return;
  }
  // Seiten
  document.getElementById("pages").innerText = data.pages;

  // Neue Funktion: Motivations-Popup und Effekte bei jeder Seitenerhöhung
  if (data.pages > lastPages) {
    const randomMotivation = pageMotivations[Math.floor(Math.random() * pageMotivations.length)];
    showPageMotivation(randomMotivation);
    
    // Kombinierte Effekte der Seitenzahl
    const pagesElement = document.getElementById("pages");
    pagesElement.classList.add("pageEffect");
    setTimeout(() => {
      pagesElement.classList.remove("pageEffect");
    }, 1000); // Nach 1 Sekunde entfernen
  }
  lastPages = data.pages; // Update

  // Fortschritt
  const progress = Math.min(100, (data.pages / TOTAL_PAGES) * 100);
  document.getElementById("progress").style.width = progress + "%";

  // Deadline
  const deadline = DEADLINE;
  const today = new Date();
  const days = Math.ceil((deadline - today) / (1000*60*60*24));
  
  document.getElementById("deadline").innerText = deadline.toLocaleDateString('de-DE');
  // Entfernt: document.getElementById("days").innerText = days; – Nicht mehr gebraucht, da wir Arbeitstage verwenden

  // Neu: Seiten pro Tag berechnen basierend auf verbleibenden Schreib-Tagen
  const remainingPages = TOTAL_PAGES - data.pages;
  const remainingWritingDays = writingDays.filter(d => d >= today).length;
  document.getElementById("remainingDays").innerText = remainingWritingDays;
  let pagesPerDayText = "– Seiten pro Arbeitstag, dann schaffst du's!";
  if (remainingWritingDays > 0 && remainingPages > 0) {
    const pagesPerDay = (remainingPages / remainingWritingDays).toFixed(2);
    pagesPerDayText = `${pagesPerDay} Seiten pro Arbeitstag, dann schaffst du's!`;
  } else if (remainingPages <= 0) {
    pagesPerDayText = "Ziel erreicht! 🎉";
  } else {
    pagesPerDayText = "Keine Schreib-Tage mehr – Deadline überschritten!";
  }
  document.getElementById("pagesPerDay").innerText = pagesPerDayText;

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

  // GIF-Popup prüfen
  if (gifMilestones.includes(data.pages) && !triggeredGifs.includes(data.pages)) {
    triggeredGifs.push(data.pages);
    const gifUrl = gifUrls[data.pages];
    showGifMilestone(gifUrl);
  } else if (data.pages > 80) {
    triggeredGifs.push('over80');
    const gifUrl = gifUrls.over80;
    showGifMilestone(gifUrl);
  }

  // Entferne aus triggeredGifs, wenn Seiten sinken (für über 80)
  if (data.pages <= 80 && triggeredGifs.includes('over80')) {
    triggeredGifs.splice(triggeredGifs.indexOf('over80'), 1);
  }

  // Kalender aktualisieren (für vergangene Tage)
  const spans = document.querySelectorAll('#calendarGrid span');
  if (spans.length > 0) {
    writingDays.forEach((day, index) => {
      if (day < today) {
        spans[index].style.color = 'green';
      } else {
        spans[index].style.color = ''; // Reset
      }
    });
  }

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

// Angepasste Funktion für kleines Motivations-Popup (jede Seite)
function showPageMotivation(message) {
  const card = document.querySelector(".card"); // Zur Card hinzufügen
  const popup = document.createElement('div');
  popup.className = 'page-motivation-popup';
  popup.innerText = message;
  card.appendChild(popup);
  
  // Nach 0.3s sichtbar machen (für Animation)
  setTimeout(() => {
    popup.style.opacity = '1';
  }, 10);
  
  setTimeout(() => {
    popup.remove(); // Nach 1 Sekunde entfernen
  }, 1000);
}

});

// Kalender und Markierungen erstellen
const progressBar = document.getElementById('progressBar');
if (progressBar) {
    const milestones = [0, 10, 20, 30, 40, 50, 60, 70, 80];
    milestones.forEach(milestone => {
        const percent = (milestone / TOTAL_PAGES) * 100;
        const marker = document.createElement('div');
        marker.className = 'milestone-marker';
        marker.style.left = percent + '%';

        const label = document.createElement('div');
        label.className = 'milestone-label';
        label.innerText = milestone;
        marker.appendChild(label);

        progressBar.appendChild(marker);
    });
    console.log('Milestones created');
}

const grid = document.getElementById('calendarGrid');
if (grid) {
    grid.innerHTML = ''; // Clear
    const today = new Date();
    writingDays.forEach(day => {
        const span = document.createElement('span');
        span.innerText = day.toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit'});
        if (day < today) {
            span.style.color = 'orange';
        }
        grid.appendChild(span);
        grid.appendChild(document.createTextNode(' ')); // Space
    });
    console.log('Calendar spans created');
} else {
    console.error('calendarGrid not found');
}
