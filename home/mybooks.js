
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let readingTimes = JSON.parse(localStorage.getItem("readingTimes")) || {}; 
let activeTimer = null;
let secondsElapsed = 0;
let currentBookId = null;


const sideMenu = document.getElementById("side-menu");
const toggleMenuBtn = document.getElementById("toggle-menu");
const favoritesTrigger = document.getElementById("menu");
const favoritesSidebar = document.getElementById("sidebar");
const closeFavoritesBtn = document.getElementById("closeSidebar");
const favoritesList = document.getElementById("favoritesList");

const favBooksGrid = document.getElementById("favBooksGrid");
const recentBooksGrid = document.getElementById("recentBooksGrid");
const top5List = document.getElementById("top5List");

const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const timerDisplay = document.getElementById("timerDisplay");



function initPage() {
favorites = JSON.parse(localStorage.getItem("favorites")) || [];
readingTimes = JSON.parse(localStorage.getItem("readingTimes")) || {};

renderGrids();
renderSidebarFavorites();
}



function renderGrids() {
favBooksGrid.innerHTML = favorites.length 
? favorites.map(book => createBookCard(book)).join("") 
: `<p class="empty-state">No books saved.</p>`;

const recent = [...favorites].reverse().slice(0, 5);
recentBooksGrid.innerHTML = recent.length 
? recent.map(book => createBookCard(book)).join("") 
: `<p class="empty-state">No recent activity.</p>`;

document.getElementById("favCount").textContent = `${favorites.length} books`;
document.getElementById("recentCount").textContent = `${recent.length} books`;

renderTop5();
}

function createBookCard(book) {
const time = readingTimes[book.key] || 0;


const coverUrl = book.cover_i 
? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
: `https://via.placeholder.com/150x220?text=No+Cover`;


const author = (book.author_name && book.author_name.length > 0) 
? book.author_name[0] 
: "Unknown Author";

return `
<div class="book-card" data-id="${book.key}" data-title="${book.title}" data-author="${author}">
<div class="book-cover-area">
<img src="${coverUrl}" alt="${book.title}">
</div>
<div class="book-card-body">
<div class="book-card-title">${book.title}</div>
<div class="book-card-author">${author}</div>
<div style="font-size: 11px; color: #4a90d9; margin-top: 5px; font-weight: 500;">
${formatTime(time)} recorded
</div>
</div>
</div>
`;
}

function renderTop5() {
const sorted = [...favorites]
.map(b => ({ ...b, time: readingTimes[b.key] || 0 }))
.sort((a, b) => b.time - a.time)
.slice(0, 5);

if (sorted.length === 0 || sorted[0].time === 0) {
top5List.innerHTML = `<p class="empty-state">Start the timer to rank books!</p>`;
return;
}

top5List.innerHTML = sorted.map((book, i) => `
<div class="top5-item">
<span class="top5-rank rank-${i+1}">${i+1}</span>
<div class="top5-info">
<div class="top5-name">${book.title}</div>
<div class="top5-time">${formatTime(book.time)}</div>
</div>
</div>
`).join("");
}



document.addEventListener("click", (e) => {
const card = e.target.closest(".book-card");
if (!card) return;

currentBookId = card.dataset.id;

document.getElementById("modalTitle").textContent = card.dataset.title;
document.getElementById("modalAuthor").textContent = card.dataset.author;
document.getElementById("modalCover").src = card.querySelector('img').src;


const openLibraryLink = `https://openlibrary.org${currentBookId}`;
document.getElementById("modalDescription").innerHTML = `
<p style="margin-bottom: 20px; font-size: 0.9rem; opacity: 0.8;">Use the timer to track your study sessions for this title.</p>
<a href="${openLibraryLink}" target="_blank" style="display: inline-block; padding: 10px 15px; background: #4a90d9; color: white; text-decoration: none; border-radius: 8px; font-size: 0.85rem; font-weight: bold;">
View on Open Library ↗
</a>
`;

updateModalTimes();
modalOverlay.classList.add("active");
});



const startBtn = document.getElementById("timerStart");
const stopBtn = document.getElementById("timerStop");

startBtn.addEventListener("click", () => {
startBtn.disabled = true;
stopBtn.disabled = false;
secondsElapsed = 0;
activeTimer = setInterval(() => {
secondsElapsed++;
timerDisplay.textContent = new Date(secondsElapsed * 1000).toISOString().substr(11, 8);
}, 1000);
});

stopBtn.addEventListener("click", () => {
if (!activeTimer) return;
clearInterval(activeTimer);
activeTimer = null;
startBtn.disabled = false;
stopBtn.disabled = true;

readingTimes[currentBookId] = (readingTimes[currentBookId] || 0) + secondsElapsed;
localStorage.setItem("readingTimes", JSON.stringify(readingTimes));

document.getElementById("sessionTime").textContent = formatTime(secondsElapsed);
updateModalTimes();
renderGrids(); 
});



function formatTime(s) {
const h = Math.floor(s / 3600);
const m = Math.floor((s % 3600) / 60);
const sec = s % 60;
return `${h}h ${m}m ${sec}s`;
}

function updateModalTimes() {
const total = readingTimes[currentBookId] || 0;
document.getElementById("totalTimeDisplay").textContent = formatTime(total);
}

function renderSidebarFavorites() {
const favs = JSON.parse(localStorage.getItem("favorites")) || [];
favoritesList.innerHTML = favs.length 
? favs.map(b => `<p style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.8rem;">${b.title}</p>`).join("") 
: "<p>No favorites yet.</p>";
}


toggleMenuBtn.addEventListener("click", () => sideMenu.classList.toggle("collapsed"));
favoritesTrigger.addEventListener("click", (e) => { e.preventDefault(); favoritesSidebar.classList.add("active"); });
closeFavoritesBtn.addEventListener("click", () => favoritesSidebar.classList.remove("active"));
modalClose.addEventListener("click", () => { 
if(activeTimer) stopBtn.click();
modalOverlay.classList.remove("active"); 
});

document.getElementById("timerClear").addEventListener("click", () => {
if(confirm("Reset lifetime progress for this book?")) {
readingTimes[currentBookId] = 0;
localStorage.setItem("readingTimes", JSON.stringify(readingTimes));
updateModalTimes();
renderGrids();
}
});

initPage();