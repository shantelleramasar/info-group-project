let currentSubject = ""; 
let allData = {}; // This is your "Filing Cabinet"

// 1. Select Elements
const sideMenu = document.getElementById('side-menu');
const toggleBtn = document.getElementById('toggle-menu');
const modal = document.getElementById('subjectModal');
const addSubjectBtn = document.querySelector('.add-subject-card');
const cancelBtn = document.querySelector('.btn-cancel');
const colorInput = document.getElementById('subjectColor');
const colorDisplay = document.querySelector('.custom-color-circle');

const subjectsSection = document.querySelector('.subjects-section');
const subjectDetail = document.getElementById('subjectDetail');
const detailTitle = document.querySelector('.detail-header h2');
const backBtn = document.querySelector('.back-btn');

const subjectForm = document.querySelector('#subjectModal form');
const subjectGrid = document.querySelector('.subject-grid');
const subjectNameInput = document.getElementById('subjectName');

const assignModal = document.getElementById('assignmentModal');
const addAssignBtn = document.querySelector('.add-assignment-btn');
const closeAssignBtn = document.getElementById('closeAssignModal');
const assignForm = document.getElementById('assignmentForm');
const assignmentList = document.querySelector('.assignment-list');
const qaNewSubject = document.getElementById('qa-new-subject');
const qaQuickAdd = document.getElementById('qa-quick-add');
const subjectSelect = document.getElementById('assignSubject');
const notifBanner = document.getElementById('notification-banner');
const notifMessage = document.getElementById('notif-message');
const closeNotif = document.getElementById('close-notif');

// 2. Define the Functions
function handleSidebar() {
    sideMenu.classList.toggle('expanded');
}

function openModal() {
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

function updateColorDisplay(event) {
    colorDisplay.style.backgroundColor = event.target.value;
}

function showDashboard() {
    subjectsSection.classList.remove('hidden');
    subjectDetail.classList.remove('active-view');
}

// THIS FUNCTION NOW FILTERS ASSIGNMENTS
function openSubjectDetails(name) {
    currentSubject = name; 
    detailTitle.innerText = name;
    
    // THE FIX: Make sure the button is visible here!
    addAssignBtn.style.display = 'block';

    // Clear the UI list
    const items = assignmentList.querySelectorAll('.assignment-item');
    items.forEach(item => item.remove());

    // Load only assignments belonging to this subject
    if (allData[name]) {
        allData[name].forEach(task => {
            renderAssignment(task.name, task.dateValue);
        });
    }

    subjectsSection.classList.add('hidden');
    subjectDetail.classList.add('active-view');
}

function checkUpcomingDeadlines() {
    let urgentCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    Object.keys(allData).forEach(function(subject) {
        allData[subject].forEach(function(task) {
            const dueDate = new Date(task.dateValue);
            dueDate.setHours(0, 0, 0, 0);

            const timeDiff = dueDate - today;
            const daysLeft = Math.round(timeDiff / (1000 * 60 * 60 * 24));

            // Change this to >= 0 just to TEST if text appears
            if (daysLeft === 1 || daysLeft === 0) {
                urgentCount++;
            }
        });
    });

    if (urgentCount > 0) {
        // We set the text FIRST, then show the banner
        notifMessage.innerText = "Heads up! " + urgentCount + " assignment(s) due tomorrow.";
        notifBanner.classList.remove('hidden');
    } else {
        notifBanner.classList.add('hidden');
    }
}

function saveSubject(event) {
    event.preventDefault();
    const name = subjectNameInput.value;
    const color = colorInput.value;

    if (name.trim() === "") return alert("Please enter a subject name!");

    
const newCard = document.createElement('div');
newCard.className = 'subject-card';
newCard.dataset.subject = name; // This "tags" the card with the subject name
newCard.style.borderTop = `5px solid ${color}`;
newCard.innerHTML = `
    <div class="subject-icon-circle" style="background-color: ${color}22; color: ${color}">
        🎓
    </div>
    <h3>${name}</h3>
    <p class="assignment-count">0 Assignments</p> 
`;

    // CHANGED TO STANDARD FUNCTION
    newCard.addEventListener('click', function() { 
        openSubjectDetails(name); 
    });

    subjectGrid.insertBefore(newCard, addSubjectBtn);

    subjectForm.reset();
    colorDisplay.style.backgroundColor = '#f8bbd0'; 
    closeModal();

    if (!allData[name]) {
        allData[name] = [];
    }
}

// HELPER FUNCTION: Draws the assignment card
function renderAssignment(name, dateValue, subjectName = "") {
    const today = new Date();
    const dueDate = new Date(dateValue);
    const timeDiff = dueDate - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    let barPercent = (daysLeft / 14) * 100;
    if (barPercent > 100) barPercent = 100;
    if (barPercent < 5) barPercent = 5;

    let statusColor = daysLeft <= 3 ? "#ff4d4d" : "#f48fb1";
    let statusText = daysLeft <= 0 ? "Due Today!" : `${daysLeft} Days Left`;
    const formattedDate = dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const newItem = document.createElement('div');
    newItem.className = 'assignment-item';
    
    // Create the subject tag ONLY if a subject name is provided
    const subjectTag = subjectName ? `<div class="subject-tag">${subjectName}</div>` : "";

    newItem.innerHTML = `
        <div class="assignment-info">
            ${subjectTag}
            <h3>${name}</h3>
            <p>Due: ${formattedDate}</p>
            <div class="countdown-bar-container">
                <div class="bar-track">
                    <span class="countdown-text">${statusText}</span>
                    <div class="countdown-bar" style="width: ${barPercent}%; background-color: ${statusColor};"></div> 
                </div>
            </div>
        </div>
        <div class="assignment-notes"><textarea placeholder="Add notes..."></textarea></div>
    `;
    assignmentList.insertBefore(newItem, addAssignBtn);
}

// 3. Assign Event Listeners
assignForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const selectedSubject = document.getElementById('assignSubject').value;
    const name = document.getElementById('assignName').value;
    const dateValue = document.getElementById('assignDate').value;

    if (!selectedSubject || !name || !dateValue) {
        alert("Fill all fields!");
        return;
    }

    // 1. Save the data
    if (!allData[selectedSubject]) {
        allData[selectedSubject] = [];
    }
    allData[selectedSubject].push({ name: name, dateValue: dateValue });

    const card = document.querySelector(`.subject-card[data-subject="${selectedSubject}"]`);
    if (card) {
        const countText = card.querySelector('.assignment-count');
        const total = allData[selectedSubject].length;
        countText.innerText = `${total} Assignment${total === 1 ? '' : 's'}`;
    }

    // 2. Draw it on screen
    if (currentSubject === selectedSubject || currentSubject === "All Assignments" || currentSubject === "Global View") {
        const tag = (currentSubject === "All Assignments" || currentSubject === "Global View") ? selectedSubject : "";
        renderAssignment(name, dateValue, tag);
    }

    // --- THE TRIGGER ---
    // 3. Check deadlines immediately after saving!
    checkUpcomingDeadlines();

    assignForm.reset();
    assignModal.style.display = 'none';
});

toggleBtn.addEventListener('click', handleSidebar);
addSubjectBtn.addEventListener('click', openModal);
cancelBtn.addEventListener('click', closeModal);
backBtn.addEventListener('click', showDashboard);
colorInput.addEventListener('input', updateColorDisplay);
subjectForm.addEventListener('submit', saveSubject);

// 1. Opening the modal from within a Subject
// 1. Opening the modal from within a Subject
addAssignBtn.addEventListener('click', function() {
    // Hide the subject selector group
    document.getElementById('subject-select-group').classList.add('hidden-field');
    
    // THE FIX: We must create an option so the select box has a value to hold
    subjectSelect.innerHTML = '<option value="' + currentSubject + '" selected>' + currentSubject + '</option>';
    subjectSelect.value = currentSubject;
    
    assignModal.style.display = 'flex';
});

// 2. Closing the modal with the Cancel button
closeAssignBtn.addEventListener('click', function() {
    assignModal.style.display = 'none';
});

// 3. Closing the modal by clicking the dark background
window.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
    if (e.target === assignModal) {
        assignModal.style.display = 'none';
    }
});

// 1. Select the new sidebar elements
const sidebarSubjects = document.getElementById('nav-subjects');
const sidebarAssignments = document.getElementById('nav-assignments');

// 2. Link them to your existing functions
sidebarSubjects.addEventListener('click', showDashboard);

sidebarAssignments.addEventListener('click', function() {
    currentSubject = "All Assignments";
    detailTitle.innerText = "All Assignments";
    addAssignBtn.style.display = 'none';

    const items = assignmentList.querySelectorAll('.assignment-item');
    items.forEach(item => item.remove());

    Object.keys(allData).forEach(subject => {
        allData[subject].forEach(task => {
            // PASS THE SUBJECT NAME HERE -----------------v
            renderAssignment(task.name, task.dateValue, subject);
        });
    });

    subjectsSection.classList.add('hidden');
    subjectDetail.classList.add('active-view');
});

// --- QUICK ACTIONS SECTION ---

// 1. Shortcut to open the Subject Creation Modal
qaNewSubject.addEventListener('click', function() {
    openModal();
});

// 2. Shortcut to open the Assignment Modal with the Subject Dropdown
qaQuickAdd.addEventListener('click', function() {
    // Show the subject dropdown group
    document.getElementById('subject-select-group').classList.remove('hidden-field');

    // ... your existing code to clear and fill subjectSelect ...
    subjectSelect.innerHTML = '<option value="" disabled selected>Choose a subject...</option>';
    const subjectNames = Object.keys(allData);

    if (subjectNames.length === 0) {
        alert("Please create a subject first!");
        return;
    }

    subjectNames.forEach(function(name) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        subjectSelect.appendChild(option);
    });

    // Pre-select if we are currently in a subject view
    if (currentSubject && currentSubject !== "All Assignments") {
        subjectSelect.value = currentSubject;
    }

    assignModal.style.display = 'flex';
});

