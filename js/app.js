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
            rootMargin: '-20% 0px -40% 0px', // Shift trigger area to upper center to accommodate mobile masthead
            threshold: 0
        };

        const textObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const itemData = JSON.parse(entry.target.getAttribute('data-item'));
                    let htmlContent = `
                        <div class="placard-title"><em>${itemData.title}</em></div>
                        <div class="placard-meta">Pixel Art &bull; ${itemData.size} &bull; ${itemData.date}</div>
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
        // Capture whatever text is currently in the HTML so you can edit it freely there!
        const initialGreetingHTML = dialogBox ? dialogBox.innerHTML : "";

        if (introSpacer) {
            const introObserver = new IntersectionObserver((entries) => {
                const isTop = entries[0].isIntersecting;
                document.body.classList.toggle('scrolled-past', !isTop);

                if (isTop) {
                    updateEditorialText(dialogBox, initialGreetingHTML);
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

    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVideo = document.getElementById('lightbox-video');
    const lightboxInfoBtn = document.getElementById('lightbox-info-btn');
    const lightboxInfoPanel = document.getElementById('lightbox-info-panel');
    const lightboxClose = document.getElementById('lightbox-close');

    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxMeta = document.getElementById('lightbox-meta');
    const lightboxNote = document.getElementById('lightbox-note');

    let currentLightboxIndex = -1;

    function showLightboxItem(index) {
        if (index < 0 || index >= galleryData.length) return;
        currentLightboxIndex = index;
        const itemData = galleryData[index];

        // Populate text
        if (lightboxTitle) lightboxTitle.innerHTML = `<em>${itemData.title}</em>`;
        if (lightboxMeta) lightboxMeta.innerHTML = `Pixel Art &bull; ${itemData.size} &bull; ${itemData.date}`;
        if (lightboxNote) lightboxNote.innerHTML = itemData.note;

        // Always start with the image so the user can zoom into it
        if (lightboxVideo) {
            lightboxVideo.style.display = 'none';
            lightboxVideo.pause();
        }

        // Image loading state
        if (lightboxImg) {
            lightboxImg.style.opacity = '0'; // start hidden for fade effect
            lightboxImg.style.display = 'block';
            lightboxImg.src = itemData.image;
            lightboxImg.alt = itemData.title;
            lightboxImg.onload = () => {
                lightboxImg.style.opacity = '1';
                lightboxImg.style.transition = 'opacity 0.3s ease';
            };
        }

        // Show Lightbox and make sure info panel is hidden to start
        if (lightboxInfoPanel) lightboxInfoPanel.classList.remove('visible');
        if (lightbox) lightbox.classList.add('active');
    }

    // Open Lightbox
    document.addEventListener('click', (e) => {
        // Check if we are clicking a replay button so we don't open the lightbox then
        if (e.target.classList.contains('replay-btn')) return;

        // Find closest art-canvas element
        const canvas = e.target.closest('.art-canvas');
        if (canvas) {
            const exhibit = canvas.closest('.editorial-exhibit');
            if (exhibit && lightbox && typeof galleryData !== 'undefined') {
                const itemData = JSON.parse(exhibit.getAttribute('data-item'));
                const index = galleryData.findIndex(item => item.id === itemData.id);
                showLightboxItem(index);
            }
        }
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                if (currentLightboxIndex > 0) showLightboxItem(currentLightboxIndex - 1);
            } else if (e.key === 'ArrowRight') {
                if (currentLightboxIndex < galleryData.length - 1) showLightboxItem(currentLightboxIndex + 1);
            }
        }
    });

    // Close Lightbox
    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('active');
            if (lightboxInfoPanel) lightboxInfoPanel.classList.remove('visible');
            if (lightboxVideo) lightboxVideo.pause();
        }
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Close when clicking outside content (on the dark background)
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
                closeLightbox();
            }
        });
    }

    // Toggle Info Panel
    if (lightboxInfoBtn && lightboxInfoPanel) {
        lightboxInfoBtn.addEventListener('click', () => {
            lightboxInfoPanel.classList.toggle('visible');
        });
    }
});
