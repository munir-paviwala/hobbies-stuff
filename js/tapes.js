/* tapes.js - Cassette player logic */

document.addEventListener('DOMContentLoaded', () => {
    const shelf = document.getElementById('cassette-shelf');
    const audioPlayer = document.getElementById('audio-player');
    const nowPlayingText = document.getElementById('now-playing-text');
    const btnPrev = document.getElementById('btn-prev');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnNext = document.getElementById('btn-next');
    const btnLoop = document.getElementById('btn-loop');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const audioTimer = document.getElementById('audio-timer');

    let currentTapeId = null;
    let isPlaying = false;
    let isLooping = false;

    // Helper: format time in mm:ss
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    // 1. Render Tapes
    tapesData.forEach(tape => {
        const tapeEl = document.createElement('div');
        tapeEl.className = 'cassette-tape';
        tapeEl.dataset.id = tape.id;

        tapeEl.innerHTML = `
            <div class="tape-label" style="background-color: ${tape.color}">
                <div class="tape-name">${tape.title}</div>
                <div class="spools">
                    <div class="spool"><div class="spool-inner"></div></div>
                    <div class="spool"><div class="spool-inner"></div></div>
                </div>
                <div class="tape-line"></div>
            </div>
        `;

        tapeEl.addEventListener('click', () => loadAndPlayTape(tape));
        shelf.appendChild(tapeEl);
    });

    // 2. Player Logic
    function loadAndPlayTape(tape) {
        document.querySelectorAll('.cassette-tape').forEach(el => el.classList.remove('playing'));

        const activeTapeEl = document.querySelector(`.cassette-tape[data-id="${tape.id}"]`);
        if (activeTapeEl) {
            activeTapeEl.classList.add('playing');
        }

        currentTapeId = tape.id;

        // UI Updates
        nowPlayingText.textContent = tape.title;
        if (tape.title.length > 18) {
            nowPlayingText.classList.add('scroll');
        } else {
            nowPlayingText.classList.remove('scroll');
        }

        if (tape.file) {
            audioPlayer.src = tape.file;
        } else {
            audioPlayer.removeAttribute('src');
            audioPlayer.load();
        }

        // Maintain loop state
        audioPlayer.loop = isLooping;

        // Enable buttons
        btnPrev.disabled = false;
        btnPlayPause.disabled = false;
        btnNext.disabled = false;
        btnLoop.disabled = false;

        if (tape.file) {
            audioPlayer.play().then(() => {
                isPlaying = true;
                btnPlayPause.textContent = '⏸';
            }).catch(e => console.log('Audio play failed:', e));
        } else {
            progressBar.style.width = '0%';
            isPlaying = true;
            btnPlayPause.textContent = '⏸';
            audioTimer.textContent = "0:00 / 0:00";
        }
    }

    // Play/Pause Action
    btnPlayPause.addEventListener('click', () => {
        if (!currentTapeId) return;

        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
            btnPlayPause.textContent = '▶';
            const el = document.querySelector(`.cassette-tape[data-id="${currentTapeId}"]`);
            if (el) el.classList.remove('playing');
        } else {
            if (audioPlayer.src && !audioPlayer.src.endsWith(window.location.href)) {
                audioPlayer.play().catch(e => console.log(e));
            }
            isPlaying = true;
            btnPlayPause.textContent = '⏸';
            const el = document.querySelector(`.cassette-tape[data-id="${currentTapeId}"]`);
            if (el) el.classList.add('playing');
        }
    });

    // Prev / Next Target Logic
    function playTapeOffset(offset) {
        if (!currentTapeId) return;
        const currentIndex = tapesData.findIndex(t => t.id === currentTapeId);
        if (currentIndex === -1) return;
        
        let targetIndex = currentIndex + offset;
        // Wrap around playlist
        if (targetIndex < 0) targetIndex = tapesData.length - 1;
        if (targetIndex >= tapesData.length) targetIndex = 0;
        
        loadAndPlayTape(tapesData[targetIndex]);
    }

    btnPrev.addEventListener('click', () => playTapeOffset(-1));
    btnNext.addEventListener('click', () => playTapeOffset(1));

    // Loop Action
    btnLoop.addEventListener('click', () => {
        isLooping = !isLooping;
        audioPlayer.loop = isLooping;
        btnLoop.classList.toggle('active', isLooping);
    });

    // Progress Bar scrub feature
    progressContainer.addEventListener('click', (e) => {
        if (audioPlayer.src && audioPlayer.duration) {
            const rect = progressContainer.getBoundingClientRect();
            const clickX = Math.max(0, parseFloat(e.clientX) - parseFloat(rect.left));
            const percent = clickX / rect.width;
            audioPlayer.currentTime = percent * audioPlayer.duration;
            
            // Immediately update visual width
            progressBar.style.width = (percent * 100) + '%';
        }
    });

    // Progress Tick
    audioPlayer.addEventListener('timeupdate', () => {
        if (audioPlayer.duration) {
            const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = progressPercent + '%';
            audioTimer.textContent = `${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`;
        }
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        audioTimer.textContent = `0:00 / ${formatTime(audioPlayer.duration)}`;
    });

    // On Track Finish 
    audioPlayer.addEventListener('ended', () => {
        if (!isLooping) {
            playTapeOffset(1); // Auto-play the next tape in the queue
        }
        // HTML5 Audio handles auto-restart if audioPlayer.loop is true
    });
});
