// Local Storage anahtarları
const STORAGE_KEY = 'clickCounters';

// DOM elemanlarını seç
const addCounterBtn = document.getElementById('addCounterBtn');
const counterInput = document.getElementById('counterInput');
const countersContainer = document.getElementById('countersContainer');
const totalClicksDisplay = document.getElementById('totalClicks');
const totalSection = document.getElementById('totalSection');

// Sayaçlar objesi
let counters = {};

// Uygulamayı başlat
function initApp() {
    loadCounters();
    attachEventListeners();
    renderCounters();
}

// Sayaçları local storage'dan yükle
function loadCounters() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            counters = JSON.parse(stored);
        } catch (e) {
            counters = {};
        }
    }
}

// Sayaçları local storage'a kaydet
function saveCounters() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
    updateTotalDisplay();
}

// Toplam tıklamaları göster/gizle
function updateTotalDisplay() {
    const total = Object.values(counters).reduce((sum, counter) => sum + counter.count, 0);
    totalClicksDisplay.textContent = total;
    
    if (Object.keys(counters).length > 0) {
        totalSection.style.display = 'block';
    } else {
        totalSection.style.display = 'none';
    }
}

// Event listener'ları ekle
function attachEventListeners() {
    addCounterBtn.addEventListener('click', addNewCounter);
    counterInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNewCounter();
        }
    });
}

// Yeni sayaç ekle
function addNewCounter() {
    const name = counterInput.value.trim();
    
    if (!name) {
        alert('Lütfen sayaç adı girin!');
        return;
    }

    if (counters[name]) {
        alert('Bu isimde bir sayaç zaten var!');
        return;
    }

    counters[name] = {
        count: 0,
        createdAt: new Date().toISOString()
    };

    counterInput.value = '';
    saveCounters();
    renderCounters();
}

// Sayaçları render et
function renderCounters() {
    countersContainer.innerHTML = '';

    if (Object.keys(counters).length === 0) {
        countersContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px 20px;">Henüz sayaç eklenmedi. Yukarıdan başlayın!</p>';
        return;
    }

    Object.entries(counters).forEach(([name, data]) => {
        const card = createCounterCard(name, data);
        countersContainer.appendChild(card);
    });
}

// Sayaç kartını oluştur
function createCounterCard(name, data) {
    const card = document.createElement('div');
    card.className = 'counter-card';
    card.innerHTML = `
        <div class="counter-card-header">
            <div class="counter-name">${escapeHtml(name)}</div>
            <button class="delete-btn" onclick="deleteCounter('${escapeHtml(name)}')">Sil</button>
        </div>
        <div class="counter-display-large">
            <div class="counter-display-value">${data.count}</div>
        </div>
        <div class="counter-actions">
            <button class="counter-btn increment-btn" onclick="incrementCounter('${escapeHtml(name)}')">➕ Artır</button>
            <button class="counter-btn reset-counter-btn" onclick="resetCounter('${escapeHtml(name)}')">↺ Sıfırla</button>
        </div>
    `;
    return card;
}

// Sayacı artır
function incrementCounter(name) {
    if (counters[name]) {
        counters[name].count++;
        saveCounters();
        renderCounters();
        
        // Vibrasyon efekti
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
}

// Sayacı sıfırla
function resetCounter(name) {
    if (counters[name]) {
        if (confirm(`"${name}" sayacını sıfırlamak istediğinize emin misiniz?`)) {
            counters[name].count = 0;
            saveCounters();
            renderCounters();
        }
    }
}

// Sayacı sil
function deleteCounter(name) {
    if (confirm(`"${name}" sayacını silmek istediğinize emin misiniz?`)) {
        delete counters[name];
        saveCounters();
        renderCounters();
        alert('✅ Sayaç silindi!');
    }
}

// HTML özel karakterleri escape et
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Uygulama başlatıldığında çalıştır
document.addEventListener('DOMContentLoaded', initApp);
