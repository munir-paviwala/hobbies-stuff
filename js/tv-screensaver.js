let currentGlobalTimer = null;
let chaosLevel = 1;

const validImages = galleryData.filter(item => item.image && item.status !== "trash");
// Chaos level 5 gets everything — including the scrapyard
const allImages = galleryData.filter(item => item.image);

// --- Shuffled Playlist ---
// Instead of pure random (which allows A→B→A repeats), we shuffle the full
// list into a queue. Each call pops the next item. When the queue empties
// we reshuffle and refill, guaranteeing every piece is seen before any repeat.
let playQueue = [];
let lastPlayedId = null;

function fisherYatesShuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function refillQueue() {
    let shuffled = fisherYatesShuffle(validImages);
    // If the new queue starts with the same item we just showed, rotate it to the end
    if (lastPlayedId !== null && shuffled.length > 1 && shuffled[0].id === lastPlayedId) {
        shuffled.push(shuffled.shift());
    }
    playQueue = shuffled;
}

function getNextArt(forceFirst = false) {
    // Always start with Bouncy Ball on fresh boot
    if (forceFirst) {
        const intro = validImages.find(img => img.title.toLowerCase().includes('bouncy ball'));
        if (intro) {
            // Remove it from queue so it doesn't show up again right away
            playQueue = playQueue.filter(img => img.id !== intro.id);
            lastPlayedId = intro.id;
            return intro;
        }
    }

    if (playQueue.length === 0) refillQueue();
    const art = playQueue.shift();
    lastPlayedId = art.id;
    return art;
}

// Target screen counts per chaos level
const CHAOS_COUNTS = [1, 4, 9, 16, 16];

// Given how many screens we want, find the col/row split whose aspect ratio
// best matches the current viewport — so portrait phones get tall grids, etc.
function getOptimalGrid(targetCount) {
    const aspect = window.innerWidth / window.innerHeight;
    let bestCols = 1, bestRows = targetCount, bestDiff = Infinity;
    for (let cols = 1; cols <= targetCount; cols++) {
        const rows = Math.ceil(targetCount / cols);
        const diff = Math.abs((cols / rows) - aspect);
        if (diff < bestDiff) {
            bestDiff = diff;
            bestCols = cols;
            bestRows = rows;
        }
    }
    return { cols: bestCols, rows: bestRows, count: bestCols * bestRows };
}

// Spawns nodes and sets CSS grid shape
function renderGrid() {
    const gridContainer = document.getElementById('tv-grid');
    gridContainer.innerHTML = '';
    clearTimeout(currentGlobalTimer);
    
    const targetCount = CHAOS_COUNTS[chaosLevel - 1];
    const { cols, rows, count } = getOptimalGrid(targetCount);
    
    // Toggle multi-screen specific styles
    gridContainer.classList.toggle('cctv-mode', chaosLevel > 1);
    
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    const template = document.getElementById('screen-template');
    for(let i = 0; i < count; i++) {
        const node = template.content.cloneNode(true);

        // Give each screen's CRT overlay its own random timing so they never sync
        const overlay = node.querySelector('.crt-overlay');
        const flickerDur  = (0.1  + Math.random() * 0.25).toFixed(3);
        const flickerDel  = (Math.random() * 0.3).toFixed(3);
        const driftDur    = (6    + Math.random() * 10).toFixed(1);
        const driftDel    = (Math.random() * -10).toFixed(1);
        const flickerLo   = (0.88 + Math.random() * 0.1).toFixed(2);
        overlay.style.setProperty('--flicker-dur',   `${flickerDur}s`);
        overlay.style.setProperty('--flicker-delay', `${flickerDel}s`);
        overlay.style.setProperty('--drift-dur',      `${driftDur}s`);
        overlay.style.setProperty('--drift-delay',    `${driftDel}s`);
        overlay.style.setProperty('--flicker-lo',     flickerLo);

        gridContainer.appendChild(node);
    }
    
    // Update counter — level 5 is labelled MAX
    document.getElementById('chaos-counter').textContent = chaosLevel === 5 ? 'MAX' : chaosLevel;

    // Update buttons
    document.getElementById('chaos-up').disabled = (chaosLevel === 5);
    document.getElementById('chaos-down').disabled = (chaosLevel === 1);

    if (chaosLevel === 5) {
        startMaximumChaos();
    } else {
        showNextImage(true);
    }
}

// Synchronously apply the same image to all screens but smoothly offset their loading times
function showNextImage(forceFirst = false) {
    if (chaosLevel === 5) return;
    
    const art = getNextArt(forceFirst);
    const screens = document.querySelectorAll('.tv-screen');
    
    screens.forEach(screen => {
        // Create an organic "staggered turn-on" effect randomly up to 500ms so they aren't robotic
        const organicDelay = forceFirst ? 0 : Math.random() * 500;
        
        setTimeout(() => {
            const container = screen.querySelector('.image-container');
            const imgEl = screen.querySelector('.current-image');
            const vcrEl = screen.querySelector('.vcr-osd');
            const vcrTitle = screen.querySelector('.vcr-title');
            
            container.style.opacity = '0';
            vcrTitle.textContent = art.title;
            
            // VCR OSD fades in on swap - always green
            vcrEl.style.opacity = '0.8';
            setTimeout(() => { vcrEl.style.opacity = '0'; }, 3000);

            setTimeout(() => {
                imgEl.src = art.image;
                imgEl.alt = art.title;
                container.style.opacity = '1';
            }, forceFirst ? 0 : 500); 
        }, forceFirst ? 0 : Math.random() * 500);
    });

    // Skewed: floor=6s, ceiling=12s, average≈10s (max-of-two biases toward upper end)
    const skew = Math.max(Math.random(), Math.random());
    const nextDuration = 6000 + skew * 6000;
    currentGlobalTimer = setTimeout(() => showNextImage(false), nextDuration);
}

// Maximum chaos mode: every screen gets a different image and transitions independently
function startMaximumChaos() {
    const screens = document.querySelectorAll('.tv-screen');
    
    screens.forEach((screen, index) => {
        // Offset their start times slightly so they don't all flip at the exact same millisecond
        setTimeout(() => {
            function runChaosLoop() {
                if (chaosLevel !== 5) {
                    return; // exit loop if they turned it down
                }
                // Level 5 pulls from the full pool including scrapyard trash
                const art = allImages[Math.floor(Math.random() * allImages.length)];
                const container = screen.querySelector('.image-container');
                const imgEl = screen.querySelector('.current-image');
                const vcrEl = screen.querySelector('.vcr-osd');
                const vcrTitle = screen.querySelector('.vcr-title');
                
                container.style.opacity = '0';
                vcrTitle.textContent = art.title;
                
                vcrEl.style.opacity = '0.8';
                setTimeout(() => { vcrEl.style.opacity = '0'; }, 3000);
                
                setTimeout(() => {
                    imgEl.src = art.image;
                    imgEl.alt = art.title;
                    container.style.opacity = '1';
                }, 500); // gentle crossfade
                
                // Skewed: floor=6s, ceiling=12s, average≈10s
                const skew = Math.max(Math.random(), Math.random());
                const nextDuration = 6000 + skew * 6000;
                setTimeout(runChaosLoop, nextDuration); 
            }
            runChaosLoop();
        }, index * 400); // Cascade the start times
    });
}

// Initial Boot Logic
document.getElementById('instruction-screen').addEventListener('click', () => {
    document.getElementById('instruction-screen').style.display = 'none';
    
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => console.log(err));
    }

    // Reset playlist from scratch
    playQueue = [];
    lastPlayedId = null;
    refillQueue();
    
    // Set initial button states
    document.getElementById('chaos-down').disabled = true;
    
    renderGrid();
    showNextImage(true); // boot with Bouncy Ball first
});

// Chaos Dial Interaction
document.getElementById('chaos-up').addEventListener('click', () => {
    if (chaosLevel < 5) {
        chaosLevel++;
        renderGrid();
    }
});

document.getElementById('chaos-down').addEventListener('click', () => {
    if (chaosLevel > 1) {
        chaosLevel--;
        renderGrid();
    }
});

document.getElementById('help-btn').addEventListener('click', () => {
    document.getElementById('instruction-screen').style.display = 'flex';
    clearTimeout(currentGlobalTimer);
    
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
    }
});

// Touch support: tap anywhere to briefly reveal hidden bottom controls for 3s
let touchRevealTimer = null;
document.addEventListener('touchstart', (e) => {
    // Don't trigger if they tapped a button directly
    if (e.target.closest('.bottom-controls')) return;
    const controls = document.querySelector('.bottom-controls');
    controls.style.opacity = '1';
    clearTimeout(touchRevealTimer);
    touchRevealTimer = setTimeout(() => { controls.style.opacity = '0'; }, 3000);
}, { passive: true });
