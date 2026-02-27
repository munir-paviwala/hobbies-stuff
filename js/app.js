document.addEventListener("DOMContentLoaded", () => {

    // Editorial Gallery Logic
    const galleryContainer = document.getElementById('gallery-container');
    const dialogBox = document.getElementById('dialog-text');

    if (galleryContainer && typeof galleryData !== 'undefined') {
        // Render Exhibits
        galleryContainer.innerHTML = galleryData.map(item => `
            <div class="editorial-exhibit" id="exhibit-${item.id}" data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}'>
                <div class="art-canvas">
                    <img src="${item.image}" alt="${item.title}" class="pixel-art-img" id="img-${item.id}">
                    ${item.video ? `<video class="pixel-art-video" id="vid-${item.id}" muted playsinline><source src="${item.video}" type="video/mp4"></video>` : ''}
                </div>
            </div>
        `).join('');

        // Intersection Observer for graceful fading
        const exhibits = document.querySelectorAll('.editorial-exhibit');

        const textObserverOptions = {
            root: null,
            rootMargin: '-40% 0px -40% 0px', // Center of viewport
            threshold: 0
        };

        const textObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const itemData = JSON.parse(entry.target.getAttribute('data-item'));
                    let htmlContent = `
                        <div class="placard-title"><em>${itemData.title}</em></div>
                        <div class="placard-meta">by ${itemData.artist.toUpperCase()} (${itemData.date})</div>
                        <div class="placard-note">${itemData.note}</div>
                    `;

                    if (itemData.video) {
                        htmlContent += `<button class="replay-btn fade-in" data-play-id="${itemData.id}">Play Replay</button>`;
                    }
                    updateEditorialText(dialogBox, htmlContent);
                }
            });
        }, textObserverOptions);

        // Observer for animating the actual exhibits fading into view
        const visibilityObserverOptions = {
            root: null,
            rootMargin: '0px 0px -15% 0px', // Trigger slightly before it hits bottom of screen
            threshold: 0.1
        };

        const visibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    // Optional: remove class if you want them to fade out again when scrolling past
                    entry.target.classList.remove('in-view');
                }
            })
        }, visibilityObserverOptions);

        exhibits.forEach(exhibit => {
            textObserver.observe(exhibit);
            visibilityObserver.observe(exhibit);
        });

        // Watch the intro spacer to reset the text to greeting if scrolled to very top
        const introSpacer = document.querySelector('.intro-spacer');
        if (introSpacer) {
            const introObserver = new IntersectionObserver((entries) => {
                const isTop = entries[0].isIntersecting;
                document.body.classList.toggle('scrolled-past', !isTop);

                if (isTop) {
                    updateEditorialText(dialogBox, "Welcome. This is a collection of my 32x32 digital works. Take your time scrolling through the exhibits on the left.");
                }
            }, { threshold: 0.1 });
            introObserver.observe(introSpacer);
        }
    }

    // Video Replay Logic
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('replay-btn')) {
            const exhibitId = e.target.getAttribute('data-play-id');
            const imgEl = document.getElementById(`img-${exhibitId}`);
            const vidEl = document.getElementById(`vid-${exhibitId}`);

            if (imgEl && vidEl) {
                // Hide image, show video
                imgEl.style.display = 'none';
                vidEl.style.display = 'block';

                // Hide button while playing
                e.target.style.display = 'none';

                vidEl.play();

                // When video ends, swap back
                vidEl.onended = () => {
                    vidEl.style.display = 'none';
                    imgEl.style.display = 'block';
                    e.target.style.display = 'inline-flex'; // Bring button back
                };
            }
        }
    });

    // Function to gracefully fade text/HTML in and out
    function updateEditorialText(element, newHTML) {
        if (element.innerHTML === newHTML) return; // don't animate if same text

        // Fade out
        element.style.opacity = '0';

        setTimeout(() => {
            element.innerHTML = newHTML;
            // Fade in
            element.style.opacity = '1';
        }, 400); // Wait for CSS transition (0.4s) to finish before changing text
    }
});
