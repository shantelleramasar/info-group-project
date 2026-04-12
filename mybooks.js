
let myBooks      = JSON.parse(localStorage.getItem('sv_mybooks')      || '[]');
let readingTimes = JSON.parse(localStorage.getItem('sv_readingTimes') || '{}');
let favorites    = JSON.parse(localStorage.getItem('sv_favorites')    || '[]');

let timerInterval  = null;
let timerSeconds   = 0;
let currentBookKey = null;

const COVER_BASE = 'https://covers.openlibrary.org/b/id/';

const hamburger      = document.getElementById('hamburger');
const slideMenu      = document.getElementById('slideMenu');
const menuOverlay    = document.getElementById('menuOverlay');
const slideClose     = document.getElementById('slideClose');

const searchBtn      = document.getElementById('searchBtn');
const searchBarWrap  = document.getElementById('searchBarWrap');
const searchInput    = document.getElementById('searchInput');
const searchClear    = document.getElementById('searchClear');

const recentGrid     = document.getElementById('recentBooksGrid');
const recentEmpty    = document.getElementById('recentEmpty');
const recentCount    = document.getElementById('recentCount');

const top5List       = document.getElementById('top5List');
const top5Empty      = document.getElementById('top5Empty');

const favGrid        = document.getElementById('favBooksGrid');
const favEmpty       = document.getElementById('favEmpty');
const favCount       = document.getElementById('favCount');

const modalOverlay   = document.getElementById('modalOverlay');
const modalClose     = document.getElementById('modalClose');
const modalCover     = document.getElementById('modalCover');
const modalTitle     = document.getElementById('modalTitle');
const modalAuthor    = document.getElementById('modalAuthor');
const modalYear      = document.getElementById('modalYear');
const modalPublisher = document.getElementById('modalPublisher');
const modalDesc      = document.getElementById('modalDescription');
const modalSubjects  = document.getElementById('modalSubjects');

const timerDisplay   = document.getElementById('timerDisplay');
const timerStart     = document.getElementById('timerStart');
const timerStop      = document.getElementById('timerStop');
const timerClear     = document.getElementById('timerClear');
const sessionTimeEl  = document.getElementById('sessionTime');
const totalTimeEl    = document.getElementById('totalTimeDisplay');

function saveAll() {
  localStorage.setItem('sv_mybooks',      JSON.stringify(myBooks));
  localStorage.setItem('sv_readingTimes', JSON.stringify(readingTimes));
  localStorage.setItem('sv_favorites',    JSON.stringify(favorites));
}

function bookKey(book) {
  return book.key || String(book.cover_i) || book.title;
}

function formatHMS(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${h}h ${m}m ${s}s`;
}

function formatClock(secs) {
  const h = String(Math.floor(secs / 3600)).padStart(2,'0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2,'0');
  const s = String(secs % 60).padStart(2,'0');
  return `${h}:${m}:${s}`;
}

hamburger.addEventListener('click', () => {
  slideMenu.classList.add('open');
  menuOverlay.classList.add('active');
});
function closeMenu() {
  slideMenu.classList.remove('open');
  menuOverlay.classList.remove('active');
}
slideClose.addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', closeMenu);

document.querySelectorAll('.slide-nav a').forEach(a => {
  a.addEventListener('click', closeMenu);
});

searchBtn.addEventListener('click', () => {
  const open = searchBarWrap.classList.toggle('open');
  if (open) searchInput.focus();
  else {
    searchInput.value = '';
    renderAll();
  }
});
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchBarWrap.classList.remove('open');
  renderAll();
});
searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();
  renderRecent(q);
  renderFavorites(q);
});

function renderAll(filter = '') {
  renderRecent(filter);
  renderFavorites(filter);
  renderTop5();
}

function renderRecent(filter = '') {
  const list = filter
    ? myBooks.filter(b =>
        b.title.toLowerCase().includes(filter) ||
        (b.author_name || []).join(' ').toLowerCase().includes(filter))
    : myBooks;

  recentCount.textContent = `${list.length} book${list.length !== 1 ? 's' : ''}`;
  clearGrid(recentGrid);

  if (list.length === 0) { recentEmpty.style.display = 'flex'; return; }
  recentEmpty.style.display = 'none';
  list.forEach(b => recentGrid.appendChild(buildCard(b)));
}

function renderFavorites(filter = '') {
  const favBooks = myBooks.filter(b => favorites.includes(bookKey(b)));
  const list = filter
    ? favBooks.filter(b =>
        b.title.toLowerCase().includes(filter) ||
        (b.author_name || []).join(' ').toLowerCase().includes(filter))
    : favBooks;

  favCount.textContent = `${list.length} book${list.length !== 1 ? 's' : ''}`;
  clearGrid(favGrid);

  if (list.length === 0) { favEmpty.style.display = 'flex'; return; }
  favEmpty.style.display = 'none';
  list.forEach(b => favGrid.appendChild(buildCard(b)));
}

function renderTop5() {
  clearList(top5List);

  const sorted = [...myBooks]
    .filter(b => (readingTimes[bookKey(b)] || 0) > 0)
    .sort((a, b) => (readingTimes[bookKey(b)] || 0) - (readingTimes[bookKey(a)] || 0))
    .slice(0, 5);

  if (sorted.length === 0) { top5Empty.style.display = 'flex'; return; }
  top5Empty.style.display = 'none';

  const medals = ['🥇','🥈','🥉','4','5'];
  sorted.forEach((book, i) => {
    const key    = bookKey(book);
    const secs   = readingTimes[key] || 0;
    const author = (book.author_name || ['Unknown']).join(', ');
    const cover  = book.cover_i ? `${COVER_BASE}${book.cover_i}-S.jpg` : null;

    const item = document.createElement('div');
    item.className = 'top5-item';
    item.innerHTML = `
      <div class="top5-rank rank-${i+1}">${medals[i]}</div>
      ${cover
        ? `<img class="top5-thumb" src="${cover}" alt="${book.title}" onerror="this.outerHTML='<div class=top5-thumb-placeholder>📖</div>'">`
        : `<div class="top5-thumb-placeholder">📖</div>`}
      <div class="top5-info">
        <div class="top5-name">${book.title}</div>
        <div class="top5-author">${author}</div>
      </div>
      <div class="top5-time">${formatHMS(secs)}</div>
    `;
    item.addEventListener('click', () => openModal(book));
    top5List.appendChild(item);
  });
}

function buildCard(book) {
  const key    = bookKey(book);
  const author = (book.author_name || ['Unknown']).join(', ');
  const secs   = readingTimes[key] || 0;
  const isFav  = favorites.includes(key);
  const cover  = book.cover_i ? `${COVER_BASE}${book.cover_i}-M.jpg` : null;

  const card = document.createElement('div');
  card.className = 'book-card';
  card.innerHTML = `
    <div class="book-cover-area">
      ${cover
        ? `<img src="${cover}" alt="${book.title}" loading="lazy" onerror="this.outerHTML='<div class=book-cover-placeholder>📖</div>'">`
        : `<div class="book-cover-placeholder">📖</div>`}

      <!-- Heart: top-left -->
      <button class="btn-heart ${isFav ? 'active' : ''}" data-key="${key}" title="Favorite">
        ${isFav ? '❤️' : '🤍'}
      </button>

      <!-- Time icon: top-right with tooltip -->
      <div class="time-badge" title="Reading time">
        ⏱
        <div class="time-tooltip">
          <strong>Total reading time</strong><br>
          ${secs > 0 ? formatHMS(secs) : 'Not started yet'}
        </div>
      </div>
    </div>

    <div class="book-card-body">
      <div class="book-card-title">${book.title}</div>
      <div class="book-card-author">${author}</div>
    </div>
  `;

  card.addEventListener('click', (e) => {
    if (e.target.closest('.btn-heart')) return;
    openModal(book);
  });

  card.querySelector('.btn-heart').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFav(key, e.currentTarget);
  });

  return card;
}

function toggleFav(key, btn) {
  if (favorites.includes(key)) {
    favorites = favorites.filter(k => k !== key);
    btn.classList.remove('active');
    btn.textContent = '🤍';
  } else {
    favorites.push(key);
    btn.classList.add('active');
    btn.textContent = '❤️';
  }
  saveAll();
  renderFavorites(searchInput.value.toLowerCase());
}

function clearGrid(grid) {
  Array.from(grid.children).forEach(c => {
    if (!c.classList.contains('empty-state')) c.remove();
  });
}
function clearList(list) {
  Array.from(list.children).forEach(c => {
    if (!c.classList.contains('empty-state')) c.remove();
  });
}

async function openModal(book) {
  currentBookKey = bookKey(book);
  stopTimer();

  timerSeconds = 0;
  timerDisplay.textContent = '00:00:00';
  sessionTimeEl.textContent = '0h 0m 0s';
  totalTimeEl.textContent = formatHMS(readingTimes[currentBookKey] || 0);
  timerStart.disabled = false;
  timerStop.disabled  = true;

  const author = (book.author_name || ['Unknown']).join(', ');
  modalTitle.textContent  = book.title;
  modalAuthor.textContent = `by ${author}`;
  modalYear.textContent   = book.first_publish_year ? `First published: ${book.first_publish_year}` : '';
  modalPublisher.textContent = '';
  modalDesc.textContent   = 'Loading details…';
  modalSubjects.innerHTML = '';

  if (book.cover_i) {
    modalCover.src           = `${COVER_BASE}${book.cover_i}-L.jpg`;
    modalCover.style.display = 'block';
  } else {
    modalCover.src           = '';
    modalCover.style.display = 'none';
  }

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  try {
    if (book.key) {
      const res  = await fetch(`https://openlibrary.org${book.key}.json`);
      const data = await res.json();

      modalDesc.textContent = data.description
        ? (typeof data.description === 'string' ? data.description : data.description.value || '')
        : 'No description available.';

      if (data.subjects && data.subjects.length) {
        data.subjects.slice(0, 8).forEach(s => {
          const tag = document.createElement('span');
          tag.className   = 'modal-tag';
          tag.textContent = s;
          modalSubjects.appendChild(tag);
        });
      }
    } else {
      modalDesc.textContent = 'No additional details available.';
    }
  } catch {
    modalDesc.textContent = 'Could not load details.';
  }
}

function closeModal() {
  stopTimer();
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
  currentBookKey = null;
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

timerStart.addEventListener('click', () => {
  if (timerInterval) return;
  timerStart.disabled = true;
  timerStop.disabled  = false;
  timerInterval = setInterval(() => {
    timerSeconds++;
    timerDisplay.textContent  = formatClock(timerSeconds);
    sessionTimeEl.textContent = formatHMS(timerSeconds);
  }, 1000);
});

timerStop.addEventListener('click', stopTimer);

function stopTimer() {
  if (!timerInterval) return;
  clearInterval(timerInterval);
  timerInterval = null;
  timerStart.disabled = false;
  timerStop.disabled  = true;

  if (currentBookKey && timerSeconds > 0) {
    readingTimes[currentBookKey] = (readingTimes[currentBookKey] || 0) + timerSeconds;
    saveAll();
    totalTimeEl.textContent = formatHMS(readingTimes[currentBookKey]);
    renderAll(searchInput.value.toLowerCase());
  }

  timerSeconds = 0;
  timerDisplay.textContent  = '00:00:00';
  sessionTimeEl.textContent = '0h 0m 0s';
}

timerClear.addEventListener('click', () => {
  stopTimer();
  if (currentBookKey) {
    readingTimes[currentBookKey] = 0;
    saveAll();
    totalTimeEl.textContent = '0h 0m 0s';
    renderAll(searchInput.value.toLowerCase());
  }
});

// Library page calls: localStorage.setItem('sv_addBook', JSON.stringify(bookObj))
window.addEventListener('storage', e => {
  if (e.key === 'sv_addBook' && e.newValue) {
    try {
      addBook(JSON.parse(e.newValue));
      localStorage.removeItem('sv_addBook');
    } catch {}
  }
});


window.addBookToMyBooks = addBook;

function addBook(book) {
  const key = bookKey(book);
  if (!myBooks.some(b => bookKey(b) === key)) {
    myBooks.unshift(book);
    saveAll();
    renderAll(searchInput.value.toLowerCase());
  }
}

renderAll();
