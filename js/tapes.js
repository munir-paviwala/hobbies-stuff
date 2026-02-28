document.addEventListener('DOMContentLoaded', () => {
    const shelf = document.getElementById('cassette-shelf');
    const audioPlayer = document.getElementById('audio-player');
    const nowPlayingText = document.getElementById('now-playing-text');
    const btnPlay = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');
    const btnStop = document.getElementById('btn-stop');
    const progressBar = document.getElementById('progress-bar');

    let currentTapeId = null;

    // 1. Render Tapes
    tapesData.forEach(tape => {
        const tapeEl = document.createElement('div');
        tapeEl.className = 'cassette-tape';
        tapeEl.dataset.id = tape.id;

        // Inner HTML of tape
        // Title -> Spools -> Line
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

        // Click event to load and play
        tapeEl.addEventListener('click', () => loadAndPlayTape(tape));

        shelf.appendChild(tapeEl);
    });

    // 2. Player Logic
    function loadAndPlayTape(tape) {
        // Remove playing class from all
        document.querySelectorAll('.cassette-tape').forEach(el => el.classList.remove('playing'));

        // Add playing class to selected
        const activeTapeEl = document.querySelector(`.cassette-tape[data-id="${tape.id}"]`);
        if (activeTapeEl) {
            activeTapeEl.classList.add('playing');
        }

        currentTapeId = tape.id;

        // Update UI
        nowPlayingText.textContent = tape.title;
        // Make it scroll if it's long
        if (tape.title.length > 18) {
            nowPlayingText.classList.add('scroll');
        } else {
            nowPlayingText.classList.remove('scroll');
        }

        // Load Audio
        if (tape.file) {
            audioPlayer.src = tape.file;
        } else {
            audioPlayer.removeAttribute('src');
            audioPlayer.load();
        }

        // Enable buttons
        btnPlay.disabled = false;
        btnPause.disabled = false;
        btnStop.disabled = false;

        // Try playing
        if (tape.file) {
            audioPlayer.play().catch(e => console.log('Audio play failed:', e));
        } else {
            console.log('No audio file provided for this tape.');
            progressBar.style.width = '0%';
        }
    }

    // Controls
    btnPlay.addEventListener('click', () => {
        if (currentTapeId) {
            const el = document.querySelector(`.cassette-tape[data-id="${currentTapeId}"]`);
            if (el) el.classList.add('playing');

            if (audioPlayer.src && !audioPlayer.src.endsWith(window.location.href)) {
                audioPlayer.play().catch(e => console.log(e));
            }
        }
    });

    btnPause.addEventListener('click', () => {
        audioPlayer.pause();
        // Stop spinning
        if (currentTapeId) {
            const el = document.querySelector(`.cassette-tape[data-id="${currentTapeId}"]`);
            if (el) el.classList.remove('playing');
        }
    });

    btnStop.addEventListener('click', () => {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        if (currentTapeId) {
            const el = document.querySelector(`.cassette-tape[data-id="${currentTapeId}"]`);
            if (el) el.classList.remove('playing');
        }
    });

    // Progress Bar (if using real audio)
    audioPlayer.addEventListener('timeupdate', () => {
        if (audioPlayer.duration) {
            const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = progressPercent + '%';
        }
    });

    // When audio ends
    audioPlayer.addEventListener('ended', () => {
        if (currentTapeId) {
            const el = document.querySelector(`.cassette-tape[data-id="${currentTapeId}"]`);
            if (el) el.classList.remove('playing');
        }
        progressBar.style.width = '0%';
    });
});
