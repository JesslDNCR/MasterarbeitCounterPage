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

// Gemeinsame Konstanten für Timna (Jasmin hat keine writingDays)
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

// Funktion für Progress Tracker
function setupProgressTracker(person) {
  const docRef = doc(db, "progress", `status${person.charAt(0).toUpperCase() + person.slice(1)}`);
  const suffix = `-${person}`;

  onSnapshot(docRef, (docSnap) => {
    console.log(`Firebase data for ${person}:`, docSnap.data());
    const data = docSnap.data();
    if (!data) {
      console.error(`No data for ${person}!`);
      return;
    }

    console.log(`Raw deadline for ${person}:`, data.deadline, typeof data.deadline);
    const totalPages = data.totalPages; // Direkt aus Firebase lesen
    let deadline;
    if (typeof data.deadline === 'string') {
      deadline = new Date(data.deadline);
    } else if (data.deadline && data.deadline.toDate) {
      // Firebase Timestamp
      deadline = data.deadline.toDate();
    } else {
      deadline = new Date(data.deadline);
    }
    console.log(`Parsed deadline for ${person}:`, deadline, deadline.toString());
    const today = new Date();

    // Progress Bar Markierungen erstellen
    const progressBar = document.getElementById(`progressBar${suffix}`);
    if (progressBar) {
      // Entferne alte Marker
      // const existingMarkers = progressBar.querySelectorAll('.milestone-marker');
      // existingMarkers.forEach(marker => marker.remove());
      
      const milestones = [];
      for (let i = 0; i <= totalPages; i += 10) {
        milestones.push(i);
      }
      if (milestones[milestones.length - 1] !== totalPages) {
        milestones.push(totalPages);
      }
      milestones.forEach(milestone => {
        const percent = (milestone / totalPages) * 100;
        const marker = document.createElement('div');
        marker.className = 'milestone-marker';
        marker.style.left = percent + '%';

        const label = document.createElement('div');
        label.className = 'milestone-label';
        label.innerText = milestone;
        marker.appendChild(label);

        progressBar.appendChild(marker);
      });
      console.log(`Milestones created for ${person} (total: ${totalPages})`);
    }

    // Initialisiere triggered Arrays pro Person
    if (!triggeredConfetti[person]) triggeredConfetti[person] = [];
    if (!triggeredQuotes[person]) triggeredQuotes[person] = [];
    if (!triggeredGifs[person]) triggeredGifs[person] = [];
    if (!lastPages[person]) lastPages[person] = 0;

    // Seiten
    document.getElementById(`pages${suffix}`).innerText = data.pages;

    // Fortschritt
    const progress = Math.min(100, (data.pages / totalPages) * 100);
    document.getElementById(`progress${suffix}`).style.width = progress + "%";

    // Deadline anzeigen
    document.getElementById(`deadline${suffix}`).innerText = deadline.toLocaleDateString('de-DE');

    // Tage berechnen
    const remainingPages = totalPages - data.pages;
    let remainingDays;
    if (remainingPages <= 0) {
      remainingDays = "SCHAISEGAL";
    } else if (writingDays.length > 0 && writingDays.some(d => d >= today)) {
      remainingDays = writingDays.filter(d => d >= today).length;
    } else {
      remainingDays = Math.ceil((deadline - today) / (1000*60*60*24));
    }
    document.getElementById(`remainingDays${suffix}`).innerText = remainingDays;

    // Seiten pro Tag
    let pagesPerDayText = "– Seiten pro Tag, dann schaffst du's!";
    if (remainingDays > 0 && remainingPages > 0) {
      const pagesPerDay = (remainingPages / remainingDays).toFixed(2);
      pagesPerDayText = `${pagesPerDay} Seiten pro Tag, dann schaffst du's!`;
    } else if (remainingPages <= 0) {
      pagesPerDayText = "Ziel erreicht! 🎉";
    } else {
      pagesPerDayText = "Deadline überschritten!";
    }
    document.getElementById(`pagesPerDay${suffix}`).innerText = pagesPerDayText;

    // Neue Funktion: Motivations-Popup und Effekte bei jeder Seitenerhöhung
    if (data.pages > lastPages[person]) {
      const randomMotivation = pageMotivations[Math.floor(Math.random() * pageMotivations.length)];
      showPageMotivation(randomMotivation, person);
      
      // Kombinierte Effekte der Seitenzahl
      const pagesElement = document.getElementById(`pages${suffix}`);
      pagesElement.classList.add("pageEffect");
      setTimeout(() => {
        pagesElement.classList.remove("pageEffect");
      }, 2000); // Nach 2 Sekunde entfernen
    }
    lastPages[person] = data.pages; // Update

    // Konfetti prüfen (alle 5 Seiten)
    if (!triggeredConfetti[person].includes(data.pages) && confettiMilestones.includes(data.pages)) {
      triggeredConfetti[person].push(data.pages);
      showCardConfetti(person);
    }

    // Spruch prüfen (alle 10 Seiten) und hinzufügen
    quoteMilestones.forEach((milestone, index) => {
      if (data.pages >= milestone && !triggeredQuotes[person].includes(milestone)) {
        triggeredQuotes[person].push(milestone);
        const quote = formatQuote(quotes[index], person);
        const quoteCard = document.createElement('div');
        quoteCard.className = 'quote-card';
        quoteCard.innerText = quote;
        quoteCard.setAttribute('data-pages', milestone); // Für Entfernung markieren
        quoteCard.style.backgroundColor = quoteColors[Math.floor(Math.random() * quoteColors.length)]; // Zufällige bunte Farbe
        quoteCard.style.padding = '8px';
        quoteCard.style.marginBottom = '8px';
        quoteCard.style.maxWidth = '180px';
        quoteCard.style.borderRadius = '8px';

        const card = document.getElementById(`${person}-card`);
        if (card) {
          card.style.position = 'relative'; // Basis für absolute Sidebars

          let leftSidebar = card.querySelector('.quote-sidebar-left');
          let rightSidebar = card.querySelector('.quote-sidebar-right');

          if (!leftSidebar || !rightSidebar) {
            leftSidebar = document.createElement('div');
            leftSidebar.className = 'quote-sidebar-left';
            leftSidebar.style.position = 'absolute';
            leftSidebar.style.top = '20px';
            leftSidebar.style.left = '-210px';
            leftSidebar.style.display = 'flex';
            leftSidebar.style.flexDirection = 'column';
            leftSidebar.style.gap = '6px';
            leftSidebar.style.width = '200px';

            rightSidebar = document.createElement('div');
            rightSidebar.className = 'quote-sidebar-right';
            rightSidebar.style.position = 'absolute';
            rightSidebar.style.top = '20px';
            rightSidebar.style.right = '-210px';
            rightSidebar.style.display = 'flex';
            rightSidebar.style.flexDirection = 'column';
            rightSidebar.style.gap = '6px';
            rightSidebar.style.width = '200px';

            card.appendChild(leftSidebar);
            card.appendChild(rightSidebar);
          }

          if (triggeredQuotes[person].length % 2 === 1) {
            leftSidebar.appendChild(quoteCard);
          } else {
            rightSidebar.appendChild(quoteCard);
          }
        }
      }
    });

    // GIF-Popup prüfen
    if (gifMilestones.includes(data.pages) && !triggeredGifs[person].includes(data.pages)) {
      triggeredGifs[person].push(data.pages);
      const gifUrl = gifUrls[data.pages];
      showCardGifMilestone(person, gifUrl);
    } else if (data.pages > 80) {
      if (!triggeredGifs[person].includes('over80')) {
        triggeredGifs[person].push('over80');
        const gifUrl = gifUrls.over80;
        showCardGifMilestone(person, gifUrl);
      }
    }

    // Entferne aus triggeredGifs, wenn Seiten sinken (für über 80)
    if (data.pages <= 80 && triggeredGifs[person].includes('over80')) {
      triggeredGifs[person].splice(triggeredGifs[person].indexOf('over80'), 1);
    }

    // Kalender für Timna
    if (person === 'timna' && writingDays.length > 0) {
      const grid = document.getElementById(`calendarGrid${suffix}`);
      if (grid && grid.children.length === 0) { // Nur wenn noch nicht erstellt
        writingDays.forEach(day => {
          const span = document.createElement('span');
          span.innerText = day.toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit'});
          grid.appendChild(span);
          grid.appendChild(document.createTextNode(' ')); // Space
        });
        console.log('Calendar spans created for ', person);
      }
      // Farben aktualisieren
      const spans = grid.querySelectorAll('span');
      if (spans.length > 0) {
        writingDays.forEach((day, index) => {
          if (day < today) {
            spans[index].style.color = 'green';
          } else {
            spans[index].style.color = '';
          }
        });
      }
    }

    // Buttons für Edit
    const plusBtn = document.getElementById(`plus${suffix}`);
    const minusBtn = document.getElementById(`minus${suffix}`);
    if (plusBtn && minusBtn) {
      plusBtn.onclick = async () => {
        const snap = await getDoc(docRef);
        const pages = Math.max(0, snap.data().pages + 1);
        await updateDoc(docRef, { pages });
      };
      minusBtn.onclick = async () => {
        const snap = await getDoc(docRef);
        const pages = Math.max(0, snap.data().pages - 1);
        await updateDoc(docRef, { pages });
      };
    }
  });
}

const confettiMilestones = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]; // Alle 5 Seiten: Konfetti
const quoteMilestones = [10, 20, 30, 40, 50, 60, 70, 80]; // Alle 10 Seiten: Spruch
const quotes = [    
    "JEA! 10 Seiten is schau mal a bissal was. Let's GOO! 💪",
    "20 Seiten done. SO PROUD. :D 🚀",
    "HAWARA {name} LET'S FEEEETZ! 30 Seiten is quasi schon halbzeit und halbzeit is quasi schon fertig. 🌟",
    "Hoibzeid. I cry. Amazing work 🏆",
    "Go giirl go giirl go giirl! 🔑",
    "Heast jetzt is nimma viel. Griagst an Regenbogen dafia! 🌈",
    "OMG! 70! Jetzt hean ma aba nimma auf! Des schaffst jetzt a nu! 🎯",
    "You are AMAZING! YOU DID IT! Hat ja nur a bissi dauert aba es is done. so proud. 🎉"
];
const quoteColors = ['#d41844ff', '#C1E1C1', '#FFFACD', '#DDA0DD', '#AFEEEE', '#F0E68C', '#140eb3ff', '#98FB98']; // Bunte Pastellfarben
let triggeredConfetti = {};
let triggeredQuotes = {};
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
let triggeredGifs = {}; // Um Wiederholungen zu verhindern
const pageMotivations = ["Wowii!", "Wida a seital :D", "Amazing!", "YAASS!", "Let's Gooo!", "Task: geh mal a runde ums haus.", "💪", "🚀", "🌟", "🔥", "👍"];

let lastPages = {}; // Um zu tracken, ob Seiten erhöht wurden

// Neue Funktion für GIF-Popup
function showCardGifMilestone(person, gifUrl) {
  const card = document.getElementById(`${person}-card`);
  if (!card) return;

  const gifPopup = document.createElement('div');
  gifPopup.className = 'gif-milestone-card';
  gifPopup.style.position = 'absolute';
  gifPopup.style.top = '50%';
  gifPopup.style.left = '50%';
  gifPopup.style.transform = 'translate(-50%, -50%)';
  gifPopup.style.width = '250px';
  gifPopup.style.height = '220px';
  gifPopup.style.padding = '8px';
  gifPopup.style.borderRadius = '14px';
  gifPopup.style.boxShadow = '0 12px 24px rgba(0,0,0,0.25)';
  gifPopup.style.background = 'rgba(255,255,255,0.95)';
  gifPopup.style.zIndex = '20';
  gifPopup.style.opacity = '0';
  gifPopup.style.transition = 'opacity 200ms ease';

  gifPopup.innerHTML = `<img src="${gifUrl}" alt="Motivations-GIF" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;" />`;

  card.style.position = 'relative';
  card.appendChild(gifPopup);

  setTimeout(() => {
    gifPopup.style.opacity = '1';
  }, 10);

  showCardConfetti(person);

  setTimeout(() => {
    gifPopup.remove();
  }, 5000);
}

function showCardConfetti(person) {
  const card = document.getElementById(`${person}-card`);
  if (!card) {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    return;
  }

  const rect = card.getBoundingClientRect();
  const origin = {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  };

  confetti({ particleCount: 120, spread: 80, origin });
}

// Angepasste Funktion für kleines Motivations-Popup (jede Seite)
function showPageMotivation(message, person) {
  const pagesElement = document.getElementById(`pages-${person}`); // Neben der Seitenanzahl hinzufügen
  const popup = document.createElement('div');
  popup.className = 'page-motivation-popup';
  popup.innerText = message;
  pagesElement.style.position = 'relative'; // Damit das absolute Popup relativ dazu positioniert wird
  pagesElement.appendChild(popup); // Zum Seitenanzahl-Element hinzufügen
  
  // Nach 0.3s sichtbar machen (für Animation)
  setTimeout(() => {
    popup.style.opacity = '1';
  }, 10);
  
  setTimeout(() => {
    popup.remove(); // Nach 1 Sekunde entfernen
  }, 1000);
}

// Setup für beide Personen
setupProgressTracker('timna');
setupProgressTracker('jasmin');
setupProgressTracker('carina');
setupProgressTracker('josef');

// Edit-Modus nur mit ?edit=true
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("edit") === "true") {
  document.getElementById("editControls-timna").style.display = "block";
  document.getElementById("editControls-jasmin").style.display = "block";
  document.getElementById("editControls-carina").style.display = "block";
  document.getElementById("editControls-josef").style.display = "block";
}

function formatQuote(quote, person) {
  const name = person.toUpperCase();
  return quote.replace(/{name}/gi, name);
}




