let allBooks = [];
let currentIndex = 0;
const batchSize = 20;

const searchContainer = document.querySelector(".search-container");
const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", () => {
  searchContainer.classList.toggle("active");
});

const menuBtn = document.getElementById("menu");
const sidebar = document.getElementById("sidebar");

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

const closeBtn = document.getElementById("closeSidebar");

closeBtn.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

function createCard(item) {
  const coverId = item.cover_i;

  const imageUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : `https://via.placeholder.com/188x241?text=No+Image`;
  
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const isFavorited = favorites.some(f => f.key === item.key) ? "favorited" : "";

  return `
    <div class="card ${isFavorited}" 
         data-id="${item.key}" 
         data-title="${item.title}">

      <div class="card-content" 
           style="background-image: url('${imageUrl}')">
      </div>

      <div class="card-title">${item.title}</div>

      <div class="heart">❤️</div>

    </div>
  `;
}

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

document.getElementById("cardGrid").addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;

  const id = card.dataset.id;
  const title = card.dataset.title;

  const existing = favorites.find(f => f.key === id);

  if (existing) {
    favorites = favorites.filter(f => f.key !== id);
    card.classList.remove("favorited");
  } else {
    favorites.push({ key: id, title: title });
    card.classList.add("favorited");
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderSidebarFavorites(); 
});

function loadMoreCards() {
  const grid = document.getElementById("cardGrid");

  let cards = "";

  const nextBatch = allBooks.slice(currentIndex, currentIndex + batchSize);

  nextBatch.forEach(item => {
    cards += createCard(item);
  });

  grid.innerHTML += cards;

  currentIndex += batchSize;
}

async function loadDefaultBooks() {
  const response = await fetch("https://openlibrary.org/search.json?q=fiction");
  const data = await response.json();

  allBooks = data.docs;
  currentIndex = 0;

  document.getElementById("cardGrid").innerHTML = "";
  loadMoreCards();
}

window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
  ) {
    loadMoreCards();
  }
});

document.getElementById("searchInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});

async function handleSearch() {
  const query = document.getElementById("searchInput").value;

  const response = await fetch(`https://openlibrary.org/search.json?q=${query}`);
  const data = await response.json();

  allBooks = data.docs;
  currentIndex = 0;

  document.getElementById("cardGrid").innerHTML = "";
  loadMoreCards();
}

function renderSidebarFavorites() {
  const list = document.getElementById("favoritesList");

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  let html = "";

  favorites.forEach(book => {
    html += `<p>${book.title}</p>`;
  });

  list.innerHTML = html;
}

loadDefaultBooks();
renderSidebarFavorites();