
let allBooks = [];
let currentIndex = 0;
const batchSize = 20;
let isLoading = false;


const sideMenu = document.getElementById("side-menu");
const toggleMenuBtn = document.getElementById("toggle-menu");
const favoritesTrigger = document.getElementById("menu"); 
const favoritesSidebar = document.getElementById("sidebar");
const closeFavoritesBtn = document.getElementById("closeSidebar");

const searchContainer = document.querySelector(".search-container");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

const cardGrid = document.getElementById("cardGrid");
const favoritesList = document.getElementById("favoritesList");


toggleMenuBtn.addEventListener("click", () => {
sideMenu.classList.toggle("collapsed");
});


favoritesTrigger.addEventListener("click", (e) => {
e.preventDefault();
favoritesSidebar.classList.add("active");
});


closeFavoritesBtn.addEventListener("click", () => {
favoritesSidebar.classList.remove("active");
});



searchBtn.addEventListener("click", () => {
if (searchContainer.classList.contains("active") && searchInput.value.trim() !== "") {
handleSearch();
} else {
searchContainer.classList.toggle("active");
if (searchContainer.classList.contains("active")) searchInput.focus();
}
});

searchInput.addEventListener("keypress", (e) => {
if (e.key === "Enter") handleSearch();
});



function createCard(item) {
const coverId = item.cover_i;
const imageUrl = coverId
? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
: `https://via.placeholder.com/200x300?text=No+Cover`;

const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const isFavorited = favorites.some(f => f.key === item.key) ? "favorited" : "";

return `
<div class="card ${isFavorited}" data-id="${item.key}" data-title="${item.title}">
  <div class="card-content" style="background-image: url('${imageUrl}')"></div>
  <div class="card-title">${item.title}</div>
  <div class="heart">❤️</div>
</div>
`;
}

async function fetchBooks(query) {
isLoading = true;
try {
const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
const data = await response.json();
allBooks = data.docs;
currentIndex = 0;
cardGrid.innerHTML = "";
loadMoreCards();
} catch (error) {
console.error("Fetch error:", error);
cardGrid.innerHTML = "<p style='color:white;'>Failed to load books. Try again.</p>";
} finally {
isLoading = false;
}
}

function loadMoreCards() {
const nextBatch = allBooks.slice(currentIndex, currentIndex + batchSize);
let htmlBatch = "";

nextBatch.forEach(book => {
htmlBatch += createCard(book);
});

cardGrid.insertAdjacentHTML("beforeend", htmlBatch);
currentIndex += batchSize;
}

function handleSearch() {
const query = searchInput.value.trim();
if (query) fetchBooks(query);
}



cardGrid.addEventListener("click", (e) => {
const card = e.target.closest(".card");
if (!card) return;

const id = card.dataset.id;
const title = card.dataset.title;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const index = favorites.findIndex(f => f.key === id);

if (index !== -1) {
favorites.splice(index, 1);
card.classList.remove("favorited");
} else {
favorites.push({ key: id, title: title });
card.classList.add("favorited");
}

localStorage.setItem("favorites", JSON.stringify(favorites));
renderSidebarFavorites();
});

function renderSidebarFavorites() {
const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
if (favorites.length === 0) {
favoritesList.innerHTML = "<p>Your favorites will appear here.</p>";
} else {
favoritesList.innerHTML = favorites.map(book => `<p>${book.title}</p>`).join("");
}
}



window.addEventListener("scroll", () => {
if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800 && !isLoading) {
loadMoreCards();
}
});


fetchBooks("fiction");
renderSidebarFavorites();