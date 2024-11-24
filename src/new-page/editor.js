const titleInput = document.getElementById('title-input');
const contentInput = document.getElementById('content-input');
const saveButton = document.querySelector('.save-button');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');

// Theme handling
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

// Initialize theme
initializeTheme();
themeToggle.addEventListener('click', toggleTheme);

async function saveContent(isAutoSave = false) {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title && !content) return;

    const urlParams = new URLSearchParams(window.location.search);
    const editingId = urlParams.get('id');
    const timestamp = new Date().toISOString();

    const entry = {
        id: editingId || Date.now().toString(),
        title: title || 'Untitled',
        content,
        created_at: editingId ? undefined : timestamp,
        updated_at: timestamp
    };

    try {
        const url = editingId 
            ? `http://localhost:3000/api/entries/${editingId}`
            : 'http://localhost:3000/api/entries';

        const response = await fetch(url, {
            method: editingId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
        });

        if (!response.ok) throw new Error('Failed to save entry');

        showNotification(isAutoSave ? 'Auto-saved!' : 'Saved successfully!', 'success');

        if (!isAutoSave) {
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
        }
    } catch (error) {
        console.error('Error saving entry:', error);
        showNotification('Failed to save entry', 'error');
    }
}

function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 2000);
}

async function loadEntry() {
    const urlParams = new URLSearchParams(window.location.search);
    const editingId = urlParams.get('id');

    if (!editingId) {
        titleInput.value = '';
        contentInput.value = '';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/entries/${editingId}`);
        if (!response.ok) {
            throw new Error(`Failed to load entry: ${response.status}`);
        }

        const entry = await response.json();
        
        titleInput.value = entry.title || '';
        contentInput.value = entry.content || '';
        
        document.title = `Editing: ${entry.title || 'Untitled'} | Code Journey`;
        
        const editorContainer = document.querySelector('.editor-container');
        editorContainer.classList.add('editing-existing');
        
    } catch (error) {
        console.error('Error loading entry:', error);
        showNotification('Failed to load entry', 'error');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
    }
}

// Event Listeners
saveButton.addEventListener('click', () => saveContent(false));
window.addEventListener('load', loadEntry);