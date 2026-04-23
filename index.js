// Hello Kitty Dress Up Game
(function () {
    'use strict';

    // --- Defaults ---
    const DEFAULT_HEAD = 'assest/options-icons/pin bow.png';
    const DEFAULT_BODY = 'assest/options-icons/pink dress.png';

    // --- Themes ---
    const themes = [
        { name: 'morning', bg: 'assest/Background/morning.png', color: '#FBF0B2' },
        { name: 'night',   bg: 'assest/Background/night.png',   color: '#0F1535' },
        { name: 'beach',   bg: 'assest/Background/beach.png',   color: '#7EC8E3' }
    ];

    // --- State ---
    let currentThemeIndex = 0;
    let currentHead = DEFAULT_HEAD;
    let currentBody = DEFAULT_BODY;

    // --- DOM ---
    const body = document.body;
    const charSection = document.getElementById('character-section');
    const dropZone = document.getElementById('kitty-drop-zone');
    const kittyHead = document.getElementById('kitty-head');
    const kittyBody = document.getElementById('kitty-body');
    const bgLeft = document.getElementById('bg-left');
    const bgRight = document.getElementById('bg-right');
    const tabs = document.querySelectorAll('.tab-btn[data-category]');
    const resetBtn = document.getElementById('reset-btn');
    const cards = document.querySelectorAll('.option-card');
    const rows = document.querySelectorAll('.options-row');

    // ===== THEME SWITCHING =====
    function setTheme(i) {
        const t = themes[i];
        body.setAttribute('data-theme', t.name);
        body.style.backgroundColor = t.color;
        body.style.backgroundImage = `url('${t.bg}')`;
        charSection.style.backgroundImage = `url('${t.bg}')`;
    }

    bgLeft.addEventListener('click', () => {
        currentThemeIndex = (currentThemeIndex - 1 + themes.length) % themes.length;
        setTheme(currentThemeIndex);
    });
    bgRight.addEventListener('click', () => {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        setTheme(currentThemeIndex);
    });

    // ===== CATEGORY TABS =====
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            tabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            rows.forEach(r => r.classList.remove('active'));
            const target = document.getElementById(`${btn.dataset.category}-options`);
            if (target) target.classList.add('active');
        });
    });

    // ===== WEAR ITEM =====
    // Bows = head replacements, Dresses/Tunics = body replacements
    function wearItem(slot, src) {
        if (slot === 'bow') {
            kittyHead.src = src;
            currentHead = src;
            animatePop(kittyHead);
        } else {
            kittyBody.src = src;
            currentBody = src;
            animatePop(kittyBody);
        }
        highlightSelected();
    }

    function animatePop(el) {
        el.classList.remove('item-pop');
        void el.offsetWidth;
        el.classList.add('item-pop');
    }

    function highlightSelected() {
        cards.forEach(card => {
            const src = card.dataset.src;
            const slot = card.dataset.slot;
            const current = (slot === 'bow') ? currentHead : currentBody;
            card.classList.toggle('selected', current === src);
        });
    }

    // ===== RESET =====
    resetBtn.addEventListener('click', () => {
        kittyHead.src = DEFAULT_HEAD;
        kittyBody.src = DEFAULT_BODY;
        currentHead = DEFAULT_HEAD;
        currentBody = DEFAULT_BODY;
        highlightSelected();
        showSparkles();
    });

    function showSparkles() {
        const burst = document.createElement('div');
        burst.className = 'star-burst';
        dropZone.appendChild(burst);

        const overlay = document.createElement('div');
        overlay.className = 'sparkle-overlay';
        dropZone.appendChild(overlay);

        const colors = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD', '#FFA07A'];
        for (let i = 0; i < 12; i++) {
            const s = document.createElement('div');
            s.className = 'sparkle';
            s.style.left = `${10 + Math.random() * 80}%`;
            s.style.top = `${10 + Math.random() * 80}%`;
            s.style.background = colors[Math.floor(Math.random() * colors.length)];
            s.style.animationDelay = `${Math.random() * 0.4}s`;
            const sz = 4 + Math.random() * 7;
            s.style.width = s.style.height = `${sz}px`;
            overlay.appendChild(s);
        }
        setTimeout(() => { overlay.remove(); burst.remove(); }, 1200);
    }

    // ===== MOUSE DRAG & DROP =====
    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('application/json', JSON.stringify({
                slot: card.dataset.slot, src: card.dataset.src
            }));
            e.dataTransfer.effectAllowed = 'copy';
            card.classList.add('dragging');
        });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));

        // Click to wear
        card.addEventListener('click', () => wearItem(card.dataset.slot, card.dataset.src));
    });

    // Drop zone
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        dropZone.classList.add('drop-hover');
    });
    dropZone.addEventListener('dragleave', (e) => {
        if (!dropZone.contains(e.relatedTarget)) dropZone.classList.remove('drop-hover');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drop-hover');
        try {
            const d = JSON.parse(e.dataTransfer.getData('application/json'));
            wearItem(d.slot, d.src);
        } catch (err) { console.warn(err); }
    });

    // ===== TOUCH DRAG & DROP =====
    cards.forEach(card => {
        let ghost = null, startX = 0, startY = 0, dragging = false;

        card.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            startX = t.clientX; startY = t.clientY;
            dragging = false;
        }, { passive: true });

        card.addEventListener('touchmove', (e) => {
            const t = e.touches[0];
            const dx = t.clientX - startX, dy = t.clientY - startY;
            if (!dragging && Math.sqrt(dx*dx + dy*dy) > 10) {
                dragging = true;
                card.classList.add('dragging');
                ghost = document.createElement('div');
                ghost.className = 'drag-ghost';
                ghost.appendChild(card.querySelector('img').cloneNode(true));
                document.body.appendChild(ghost);
            }
            if (dragging && ghost) {
                e.preventDefault();
                ghost.style.left = `${t.clientX - 32}px`;
                ghost.style.top = `${t.clientY - 32}px`;
                const el = document.elementFromPoint(t.clientX, t.clientY);
                dropZone.classList.toggle('drop-hover', dropZone.contains(el));
            }
        }, { passive: false });

        card.addEventListener('touchend', (e) => {
            if (ghost) { ghost.remove(); ghost = null; }
            card.classList.remove('dragging');
            dropZone.classList.remove('drop-hover');
            if (dragging) {
                const t = e.changedTouches[0];
                const el = document.elementFromPoint(t.clientX, t.clientY);
                if (dropZone.contains(el)) wearItem(card.dataset.slot, card.dataset.src);
                e.preventDefault();
            }
            dragging = false;
        });
    });

    // ===== INIT =====
    setTheme(0);
    highlightSelected();

    // Preload backgrounds
    themes.forEach(t => { const img = new Image(); img.src = t.bg; });

    console.log('🎀 Hello Kitty Dress Up Game loaded!');
})();
