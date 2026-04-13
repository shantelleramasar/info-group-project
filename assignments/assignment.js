let currentSubject = ""; 
let allData = JSON.parse(localStorage.getItem('studyHubData')) || {};


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
    
    subjectDetail.style.display = 'none'; 
}

function openSubjectDetails(name) {
    currentSubject = name; 
    detailTitle.innerText = name;
    addAssignBtn.style.display = 'block';

    const items = assignmentList.querySelectorAll('.assignment-item');
    items.forEach(item => item.remove());

    if (allData[name] && allData[name].tasks) {
        allData[name].tasks.forEach(task => {
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

    Object.keys(allData).forEach(function(subjectName) {
        const tasks = allData[subjectName].tasks || [];
        tasks.forEach(function(task) {
            const dueDate = new Date(task.dateValue);
            dueDate.setHours(0, 0, 0, 0);

            const timeDiff = dueDate - today;
            const daysLeft = Math.round(timeDiff / (1000 * 60 * 60 * 24));

            if (daysLeft === 1 || daysLeft === 0) {
                urgentCount++;
            }
        });
    });

    if (urgentCount > 0) {
        notifMessage.innerText = "Heads up! " + urgentCount + " assignment(s) due tomorrow.";
        notifBanner.classList.remove('hidden');
    } else {
        notifBanner.classList.add('hidden');
    }
}

function renderSubjectCard(name, color) {
    const newCard = document.createElement('div');
    newCard.className = 'subject-card';
    newCard.dataset.subject = name;
    newCard.style.borderTop = `5px solid ${color}`;
    
    const taskCount = (allData[name] && allData[name].tasks) ? allData[name].tasks.length : 0;

    newCard.innerHTML = `
        <div class="subject-icon-circle" style="background-color: ${color}22; color: ${color}">
            🎓
        </div>
        <h3>${name}</h3>
        <p class="assignment-count">${taskCount} Assignment${taskCount === 1 ? '' : 's'}</p> 
    `;

    newCard.addEventListener('click', function() { 
        openSubjectDetails(name); 
    });

    subjectGrid.insertBefore(newCard, addSubjectBtn);
}

function saveSubject(event) {
    event.preventDefault();
    const name = subjectNameInput.value;
    const color = colorInput.value;

    if (name.trim() === "") return alert("Please enter a subject name!");

    allData[name] = {
        color: color,
        tasks: []
    };

    renderSubjectCard(name, color);
    saveToLocalStorage();
    subjectForm.reset();
    colorDisplay.style.backgroundColor = '#f8bbd0'; 
    closeModal();
}

function renderAssignment(name, dateValue, subjectName = "") {
    const today = new Date();
    const dueDate = new Date(dateValue);
    const timeDiff = dueDate - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    
    let barPercent = (daysLeft / 14) * 100;
    if (barPercent > 100) barPercent = 100;
    if (barPercent < 0) barPercent = 0; 

    let statusColor = daysLeft <= 3 ? "#ff4d4d" : "#f48fb1";
    let statusText = daysLeft <= 0 ? "Due Today!" : `${daysLeft} Days Left`;
    const formattedDate = dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const newItem = document.createElement('div');
    newItem.className = 'assignment-item';
    
    
    const sColor = (subjectName && allData[subjectName]) ? allData[subjectName].color : "#f8bbd0";
    const subjectTag = subjectName ? `<div class="subject-tag" style="background:${sColor}22; color:${sColor}; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; display: inline-block; margin-bottom: 5px;">${subjectName}</div>` : "";

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

    // Ensure we are adding to the list properly
    if (assignmentList) {
        // We prepend or insert before the "Add" button if it exists inside the list
        if (addAssignBtn && assignmentList.contains(addAssignBtn)) {
            assignmentList.insertBefore(newItem, addAssignBtn);
        } else {
            assignmentList.appendChild(newItem);
        }
    }
}

function saveToLocalStorage() {
    localStorage.setItem('studyHubData', JSON.stringify(allData));
}


assignForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const selectedSubject = document.getElementById('assignSubject').value;
    const name = document.getElementById('assignName').value;
    const dateValue = document.getElementById('assignDate').value;

    if (!selectedSubject || !name || !dateValue) {
        alert("Fill all fields!");
        return;
    }

    if (!allData[selectedSubject]) {
        allData[selectedSubject] = { color: "#f8bbd0", tasks: [] }; 
    }
    
    allData[selectedSubject].tasks.push({ name: name, dateValue: dateValue });

    const card = document.querySelector(`.subject-card[data-subject="${selectedSubject}"]`);
    if (card) {
        const countText = card.querySelector('.assignment-count');
        const total = allData[selectedSubject].tasks.length;
        countText.innerText = `${total} Assignment${total === 1 ? '' : 's'}`;
    }

    saveToLocalStorage();

    if (currentSubject === selectedSubject || currentSubject === "All Assignments") {
        const tag = (currentSubject === "All Assignments") ? selectedSubject : "";
        renderAssignment(name, dateValue, tag);
    }

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

addAssignBtn.addEventListener('click', function() {
    document.getElementById('subject-select-group').classList.add('hidden-field');
    subjectSelect.innerHTML = `<option value="${currentSubject}" selected>${currentSubject}</option>`;
    subjectSelect.value = currentSubject;
    assignModal.style.display = 'flex';
});

closeAssignBtn.addEventListener('click', function() {
    assignModal.style.display = 'none';
});

window.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
    if (e.target === assignModal) assignModal.style.display = 'none';
});

const sidebarSubjects = document.getElementById('nav-subjects');
const sidebarAssignments = document.getElementById('nav-assignments');

sidebarSubjects.addEventListener('click', showDashboard);

sidebarAssignments.addEventListener('click', function() {
    currentSubject = "All Assignments";
    detailTitle.innerText = "All Assignments";
    addAssignBtn.style.display = 'none';

    const items = assignmentList.querySelectorAll('.assignment-item');
    items.forEach(item => item.remove());

    Object.keys(allData).forEach(subjectName => {
        const subjectObject = allData[subjectName];
        if (subjectObject.tasks) {
            subjectObject.tasks.forEach(task => {
                renderAssignment(task.name, task.dateValue, subjectName);
            });
        }
    });

    subjectsSection.classList.add('hidden');
    subjectDetail.classList.add('active-view');
});

qaNewSubject.addEventListener('click', openModal);

qaQuickAdd.addEventListener('click', function() {
    const group = document.getElementById('subject-select-group');
    if(group) group.classList.remove('hidden-field');
    
    subjectSelect.innerHTML = '<option value="" disabled selected>Choose a subject...</option>';
    
    Object.keys(allData).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        subjectSelect.appendChild(option);
    });

    assignModal.style.display = 'flex'; 
});

function loadSavedUI() {
    const existingCards = document.querySelectorAll('.subject-card');
    existingCards.forEach(card => card.remove());

    Object.keys(allData).forEach(name => {
        const subject = allData[name];
        renderSubjectCard(name, subject.color || "#f8bbd0");
    });
    
    checkUpcomingDeadlines();
}


loadSavedUI();