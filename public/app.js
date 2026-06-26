const API_URL = 'http://localhost:5000/api';
let authMode = 'login';
let currentTag = '';
let authToken = localStorage.getItem('token');

// ===== THEME =====
function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}
const savedTheme = localStorage.getItem('theme') || 'forest';
document.getElementById('themeSelect').value = savedTheme;
document.documentElement.setAttribute('data-theme', savedTheme);

// ===== TOAST =====
function showToast(msg, type = 'info') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast ${type}`;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}

// ===== AUTH =====
const tokenFromUrl = new URLSearchParams(window.location.search).get('token');
if (tokenFromUrl) {
    localStorage.setItem('token', tokenFromUrl);
    authToken = tokenFromUrl;
    window.history.replaceState({}, document.title, '/');
    checkAuth();
}
if (authToken) checkAuth();

function toggleAuthMode() {
    authMode = authMode === 'login' ? 'register' : 'login';
    document.getElementById('authTitle').textContent = authMode === 'login' ? 'Welcome Back' : 'Create Account';
    document.getElementById('authButton').innerHTML = authMode === 'login' ? '<span>Sign In</span> <i class="fas fa-arrow-right"></i>' : '<span>Create Account</span> <i class="fas fa-arrow-right"></i>';
    document.getElementById('authSwitchText').innerHTML = authMode === 'login' ? `Don't have an account? <strong>Create one</strong>` : `Already have an account? <strong>Sign in</strong>`;
    document.getElementById('authError').style.display = 'none';
}

async function submitAuth() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const err = document.getElementById('authError');
    if (!email || !password) { err.textContent = 'Please enter email and password'; err.style.display = 'block'; return; }
    try {
        const res = await fetch(`${API_URL}/auth/${authMode === 'login' ? 'login' : 'register'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            authToken = data.token;
            showToast(authMode === 'login' ? 'Welcome back!' : 'Account created!', 'success');
            showMainApp(email);
        } else {
            err.textContent = data.error || 'Authentication failed';
            err.style.display = 'block';
        }
    } catch (e) {
        err.textContent = 'Network error. Please try again.';
        err.style.display = 'block';
    }
}

async function checkAuth() {
    try {
        const res = await fetch(`${API_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (res.ok) {
            const user = await res.json();
            showMainApp(user.email);
            if (user.avatar) { document.getElementById('userAvatar').src = user.avatar; document.getElementById('userAvatar').style.display = 'inline-block'; }
            if (user.name) document.getElementById('userEmail').textContent = user.name;
        } else showAuthForm();
    } catch (e) { showAuthForm(); }
}

function showMainApp(email) {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    document.getElementById('userEmail').textContent = email || 'User';
    loadNotes();
}

function showAuthForm() {
    localStorage.removeItem('token');
    authToken = null;
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('emailInput').value = '';
    document.getElementById('passwordInput').value = '';
}

function logout() { localStorage.removeItem('token'); authToken = null; showAuthForm(); showToast('Logged out', 'info'); }
function getHeaders() { return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }; }
function toggleAddNote() {
    const f = document.getElementById('addNoteForm');
    f.style.display = f.style.display === 'none' ? 'block' : 'none';
    if (f.style.display === 'block') document.getElementById('titleInput').focus();
}

// ===== NOTES =====
async function loadNotes() {
    try {
        let url = `${API_URL}/notes`;
        const search = document.getElementById('searchInput').value;
        const p = [];
        if (search) p.push(`search=${encodeURIComponent(search)}`);
        if (currentTag) p.push(`tag=${encodeURIComponent(currentTag)}`);
        if (p.length) url += `?${p.join('&')}`;
        const res = await fetch(url, { headers: getHeaders() });
        const notes = await res.json();
        displayNotes(notes);
        loadTagFilters();
        document.getElementById('noteCount').textContent = `${notes.length} notes`;
    } catch (e) { console.error(e); }
}

async function loadTagFilters() {
    try {
        const res = await fetch(`${API_URL}/notes/tags`, { headers: getHeaders() });
        const tags = await res.json();
        const c = document.getElementById('tagFilters');
        if (!tags.length) { c.innerHTML = '<span style="color:var(--text-light);font-size:0.85rem;">No tags</span>'; return; }
        c.innerHTML = tags.map(t => `<span class="tag-btn ${currentTag === t ? 'active' : ''}" onclick="filterByTag('${t}')">#${t}</span>`).join('');
    } catch (e) { console.error(e); }
}

function filterByTag(tag) { currentTag = currentTag === tag ? '' : tag; loadNotes(); }
function searchNotes() { loadNotes(); }
function clearSearch() { document.getElementById('searchInput').value = ''; currentTag = ''; loadNotes(); }

function displayNotes(notes) {
    const c = document.getElementById('notesList');
    if (!notes.length) {
        c.innerHTML = `<div class="empty-state"><i class="fas fa-feather-alt"></i><h3>No notes found</h3><p>Create your first note</p></div>`;
        return;
    }
    c.innerHTML = notes.map(n => `
        <div class="note-card">
            <div class="note-title">${escapeHtml(n.title)}</div>
            <div class="note-content">${escapeHtml(n.content)}</div>
            <div class="note-tags">${n.tags && n.tags.length ? n.tags.map(t => `<span class="note-tag">#${escapeHtml(t)}</span>`).join('') : ''}</div>
            <div class="note-actions">
                <button class="edit-btn" onclick="editNote('${n._id}','${escapeHtml(n.title)}','${escapeHtml(n.content)}','${n.tags ? n.tags.join(',') : ''}')"><i class="fas fa-pen"></i> Edit</button>
                <button class="delete-btn" onclick="deleteNote('${n._id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

async function createNote() {
    const title = document.getElementById('titleInput').value.trim();
    const content = document.getElementById('contentInput').value.trim();
    const tags = document.getElementById('tagsInput').value.trim();
    if (!title || !content) { showToast('Please enter title and content', 'error'); return; }
    try {
        await fetch(`${API_URL}/notes`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ title, content, tags }) });
        document.getElementById('titleInput').value = '';
        document.getElementById('contentInput').value = '';
        document.getElementById('tagsInput').value = '';
        document.getElementById('addNoteForm').style.display = 'none';
        showToast('Note created!', 'success');
        loadNotes();
    } catch (e) { showToast('Failed to create note', 'error'); }
}

function editNote(id, title, content, tags) {
    const newTitle = prompt('Edit title:', title);
    if (newTitle === null) return;
    const newContent = prompt('Edit content:', content);
    if (newContent === null) return;
    const newTags = prompt('Edit tags (comma-separated):', tags);
    updateNote(id, newTitle || title, newContent || content, newTags !== null ? newTags : tags);
}

async function updateNote(id, title, content, tags) {
    try {
        await fetch(`${API_URL}/notes/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ title, content, tags }) });
        showToast('Note updated!', 'success');
        loadNotes();
    } catch (e) { showToast('Failed to update note', 'error'); }
}

async function deleteNote(id) {
    if (!confirm('Delete this note?')) return;
    try {
        await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE', headers: getHeaders() });
        showToast('Note deleted', 'info');
        loadNotes();
    } catch (e) { showToast('Failed to delete note', 'error'); }
}

// ===== EXPORT / IMPORT =====
async function exportNotes() {
    try {
        const res = await fetch(`${API_URL}/notes/export`, { headers: getHeaders() });
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notes-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`Exported ${data.count} notes`, 'success');
    } catch (e) { showToast('Export failed', 'error'); }
}

async function importNotes(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        const res = await fetch(`${API_URL}/notes/import`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        const result = await res.json();
        showToast(`Imported ${result.count} notes`, 'success');
        loadNotes();
    } catch (e) {
        showToast('Import failed: Invalid file', 'error');
    }
    event.target.value = '';
}

// ===== HELPERS =====
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Enter key search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchNotes();
        });
    }
});