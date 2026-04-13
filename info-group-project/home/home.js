
const menuToggle = document.getElementById('toggle-menu');
const sideMenu = document.getElementById('side-menu');

if (menuToggle && sideMenu) {
    menuToggle.addEventListener('click', () => {
        sideMenu.classList.toggle('collapsed');
    });
}


document.querySelectorAll('.snapshot, #side-menu ul li').forEach(item => {
    item.addEventListener('click', () => {
       
        const titleElement = item.querySelector('h3') || item.querySelector('.text');
        if (!titleElement) return;

        const pageName = titleElement.innerText.trim();

       
        if (pageName === "Home") window.location.href = "home.html";
        if (pageName === "Library") window.location.href = "library.html";
        if (pageName === "Your Books") window.location.href = "books.html";
        if (pageName === "Assignments") window.location.href = "assignments.html";
    });
});


const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const slider1 = document.querySelector('#book-slider-1 .book-slider');

async function fetchBooks(query = "textbooks") {
    if (!slider1) return;

    
    slider1.innerHTML = "<p style='color: #1a2b56; padding: 20px;'>Fetching books...</p>";
    if (searchBtn) searchBtn.innerText = "Searching...";
    
    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8`);
        const data = await response.json();
        
        slider1.innerHTML = ""; 

        if (data.docs.length === 0) {
            slider1.innerHTML = "<p style='padding: 20px;'>No books found.</p>";
            return;
        }

        data.docs.forEach(book => {
            
            if (book.cover_i) {
                const bookDiv = document.createElement('div');
                bookDiv.className = 'book-item';
                
                const coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
                
                bookDiv.innerHTML = `
                    <img src="${coverUrl}" alt="${book.title}">
                    <p class="book-label" style="font-size: 12px; margin-top: 8px; color: #1a2b56; font-weight: bold;">
                        ${book.title.length > 18 ? book.title.substring(0, 15) + '...' : book.title}
                    </p>
                `;
                slider1.appendChild(bookDiv);
            }
        });
    } catch (error) {
        console.error("API Error:", error);
        slider1.innerHTML = "<p style='padding: 20px;'>Error loading books. Please try again.</p>";
    } finally {
        if (searchBtn) searchBtn.innerText = "Search";
    }
}


if (searchBtn) {
    searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        
        window.location.href = `library.html?search=${encodeURIComponent(query)}`;
    }
});
}


if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value) {
            fetchBooks(searchInput.value);
        }
    });
}


document.querySelectorAll('.book-slider-section').forEach(section => {
    const slider = section.querySelector('.book-slider');
    const leftBtn = section.querySelector('.arrow.left');
    const rightBtn = section.querySelector('.arrow.right');

    if (slider && leftBtn && rightBtn) {
        leftBtn.addEventListener('click', () => {
            slider.scrollBy({ left: -300, behavior: 'smooth' });
        });
        rightBtn.addEventListener('click', () => {
            slider.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
});


window.addEventListener('DOMContentLoaded', () => {
    fetchBooks("college textbooks");
});