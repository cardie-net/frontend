const API_BASE = 'http://localhost:8000';
let currentToken = null;

function logResponse(data) {
    const output = document.getElementById('output');
    output.textContent = JSON.stringify(data, null, 2);
}

function setToken(token) {
    currentToken = token;
    document.getElementById('token-display').textContent = token ? token.substring(0, 20) + '...' : 'None';
}

function getHeaders(contentType = 'application/json') {
    const headers = {};
    if (contentType) headers['Content-Type'] = contentType;
    if (currentToken) headers['Authorization'] = `Bearer ${currentToken}`;
    return headers;
}

async function loginGuest() {
    try {
        const res = await fetch(`${API_BASE}/auth/guest`, {
            method: 'POST',
        });
        const data = await res.json();
        if (data.access_token) {
            setToken(data.access_token);
        }
        logResponse(data);
    } catch (e) {
        logResponse({ error: e.message });
    }
}

async function register() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, is_guest: false })
        });
        const data = await res.json();
        logResponse(data);
    } catch (e) {
        logResponse({ error: e.message });
    }
}

async function login() {
    const username = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
        const res = await fetch(`${API_BASE}/auth/jwt/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
        const data = await res.json();
        if (data.access_token) {
            setToken(data.access_token);
        }
        logResponse(data);
    } catch (e) {
        logResponse({ error: e.message });
    }
}

async function createDeck() {
    const name = document.getElementById('deck-name').value;
    const slug = document.getElementById('deck-slug').value;
    const privacy = document.getElementById('deck-privacy').value;

    try {
        const res = await fetch(`${API_BASE}/decks/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name, slug, privacy })
        });
        const data = await res.json();
        logResponse(data);
    } catch (e) {
        logResponse({ error: e.message });
    }
}

async function listDecks() {
    try {
        const res = await fetch(`${API_BASE}/decks/`, {
            method: 'GET',
            headers: getHeaders(null)
        });
        const data = await res.json();
        logResponse(data);
    } catch (e) {
        logResponse({ error: e.message });
    }
}

async function createCard() {
    const deckId = document.getElementById('card-deck-id').value;
    const frontText = document.getElementById('card-front').value;
    const backText = document.getElementById('card-back').value;

    const payload = {
        front: [{ type: "text", content: frontText }],
        back: [{ type: "text", content: backText }]
    };

    try {
        const res = await fetch(`${API_BASE}/decks/${deckId}/cards/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        logResponse(data);
    } catch (e) {
        logResponse({ error: e.message });
    }
}

async function listCards() {
    const deckId = document.getElementById('list-card-deck-id').value;
    if (!deckId) return logResponse({ error: "Deck ID is required" });

    try {
        const res = await fetch(`${API_BASE}/decks/${deckId}/cards/`, {
            method: 'GET',
            headers: getHeaders(null)
        });
        const data = await res.json();
        logResponse(data);
    } catch (e) {
        logResponse({ error: e.message });
    }
}
