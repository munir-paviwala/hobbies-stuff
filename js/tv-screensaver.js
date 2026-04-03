let currentGlobalTimer = null;
let lastImageId = null;
let isFirstImage = true;
let chaosLevel = 1; // 1 to 5. 5 is max chaos

const validImages = galleryData.filter(item => item.image && item.status !== "trash");

function getRandomArt() {
    if (isFirstImage) {
        isFirstImage = false;
        const intro = validImages.find(img => img.title.toLowerCase().includes('bouncy ball'));
        if (intro) {
            lastImageId = intro.id;
            return intro;
        }
    }
    let art;
    do {
        art = validImages[Math.floor(Math.random() * validImages.length)];
    } while (art.id === lastImageId && validImages.length > 1);
    
    lastImageId = art.id;
    return art;
}

// Spawns nodes and sets CSS grid shape
function renderGrid() {
    const gridContainer = document.getElementById('tv-grid');
    gridContainer.innerHTML = ''; // clear existing
    clearTimeout(currentGlobalTimer);
    
    let cols, rows, count;
    if (chaosLevel === 1) { cols = 1; rows = 1; count = 1; }
    else if (chaosLevel === 2) { cols = 2; rows = 2; count = 4; }
    else if (chaosLevel === 3) { cols = 3; rows = 3; count = 9; }
    else if (chaosLevel >= 4) { cols = 4; rows = 4; count = 16; }
    
    // Toggle multi-screen specific styles
    gridContainer.classList.toggle('cctv-mode', chaosLevel > 1);
    
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    const template = document.getElementById('screen-template');
    for(let i = 0; i < count; i++) {
        gridContainer.appendChild(template.content.cloneNode(true));
    }
    
    // Update counter
    document.getElementById('chaos-counter').textContent = chaosLevel;

    // Update buttons
    document.getElementById('chaos-up').disabled = (chaosLevel === 5);
    document.getElementById('chaos-down').disabled = (chaosLevel === 1);

    if (chaosLevel === 5) {
        startMaximumChaos();
    } else {
        showNextImage(true); // force immediate show
    }
}

// Synchronously apply the same image to all screens but smoothly offset their loading times
function showNextImage(immediate = false) {
    if (chaosLevel === 5) return; // Break out if we entered chaos mode
    
    const art = getRandomArt();
    const screens = document.querySelectorAll('.tv-screen');
    
    screens.forEach(screen => {
        // Create an organic "staggered turn-on" effect randomly up to 500ms so they aren't robotic
        const organicDelay = immediate ? 0 : Math.random() * 500;
        
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
            }, immediate ? 0 : 500); 
        }, organicDelay);
    });

    const nextDuration = Math.random() * (12000 - 5000) + 5000;
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
                const art = validImages[Math.floor(Math.random() * validImages.length)];
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
                
                // Normal reading speed timer, just running completely independent
                const nextDuration = Math.random() * (12000 - 5000) + 5000;
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

    isFirstImage = true;
    chaosLevel = 1;
    
    // Set initial button states
    document.getElementById('chaos-down').disabled = true;
    
    renderGrid();
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
