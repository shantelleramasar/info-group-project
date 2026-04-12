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

function createCard(item) {
  const coverId = item.cover_i;

  const imageUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : `https://via.placeholder.com/188x241?text=No+Image`;

  return `
    <div class="card">
      <div class="card-content" 
           style="background-image: url('${imageUrl}')">
      </div>

      <div class="card-title">${item.title}</div>

      <div class="heart">❤️</div>
    </div>
  `;
}

document.getElementById("cardGrid").addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;

  card.classList.toggle("favorited");
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

loadDefaultBooks();