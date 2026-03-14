document.addEventListener("DOMContentLoaded", () => {
    
    const corkboard = document.getElementById("corkboard");

    // Stack View Elements
    const stackView = document.getElementById('stack-view');
    const stackViewClose = document.getElementById('stack-view-close');
    const stackViewTitle = document.getElementById('stack-view-title');
    const stackViewContainer = document.getElementById('stack-view-container');

    // Lightbox Elements
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    if (corkboard && typeof marginsData !== 'undefined') {
        
        // Procedurally generate polaroids on the desk
        marginsData.forEach((item, index) => {
            
            const randRotation = (Math.random() * 16) - 8;
            const randX = (Math.random() * 30) - 15;
            const randY = (Math.random() * 30) - 15;

            const polaroid = document.createElement('div');
            polaroid.className = 'polaroid-scrap';
            if (item.type === 'stack' && item.photos && item.photos.length > 1) {
                polaroid.classList.add('is-stack');
            }
            
            polaroid.setAttribute('data-item', JSON.stringify(item).replace(/'/g, "&#39;"));
            
            polaroid.style.setProperty('--rand-rot', `${randRotation}deg`);
            polaroid.style.setProperty('--rand-x', `${randX}px`);
            polaroid.style.setProperty('--rand-y', `${randY}px`);

            const coverImage = item.type === 'stack' ? item.photos[0] : item.image;

            polaroid.innerHTML = `
                <div class="polaroid-img-wrapper">
                    <img src="${coverImage}" alt="${item.title}" class="polaroid-img">
                </div>
                <div class="polaroid-caption">${item.title}</div>
            `;

            corkboard.appendChild(polaroid);

            // Open either Lightbox (Single) or Stack View (Stack)
            polaroid.addEventListener('click', () => {
                if (item.type === 'stack') {
                    openStackView(item);
                } else {
                    showLightboxImage(item.image, item.title);
                }
            });
        });
    }

    // --- STACK VIEW LOGIC --- //

    function openStackView(itemData) {
        if (!stackView || !itemData.photos) return;

        stackViewTitle.textContent = itemData.title;
        stackViewContainer.innerHTML = ''; // Clear old photos

        itemData.photos.forEach((photoUrl, i) => {
            // Give them slight random rotations for the fanned look
            const randRot = (Math.random() * 10) - 5;
            const imgEl = document.createElement('div');
            imgEl.className = 'spread-photo';
            imgEl.style.transform = `rotate(${randRot}deg)`;
            imgEl.innerHTML = `<img src="${photoUrl}" alt="${itemData.title} part ${i+1}">`;
            
            // Clicking an unfurled photo opens the actual Lightbox
            imgEl.addEventListener('click', () => {
                // Pass the whole array and the current index to enable navigation
                showLightboxImage(photoUrl, itemData.title, itemData.photos, i);
            });

            stackViewContainer.appendChild(imgEl);
        });

        stackView.classList.add('active');
    }

    function closeStackView() {
        if (stackView) {
            stackView.classList.remove('active');
        }
    }

    if (stackViewClose) stackViewClose.addEventListener('click', closeStackView);


    // --- LIGHTBOX LOGIC --- //

    let currentLightboxPhotos = [];
    let currentLightboxIndex = -1;
    let currentLightboxTitle = "";

    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    function showLightboxImage(imageUrl, altText, photoArray = null, index = -1) {
        currentLightboxPhotos = photoArray;
        currentLightboxIndex = index;
        currentLightboxTitle = altText;
        
        // Show or hide navigation buttons depending on if we have a stack
        if (lightboxPrev && lightboxNext) {
            if (photoArray && photoArray.length > 1) {
                lightboxPrev.style.display = 'flex';
                lightboxNext.style.display = 'flex';
            } else {
                lightboxPrev.style.display = 'none';
                lightboxNext.style.display = 'none';
            }
        }

        if (lightboxImg) {
            lightboxImg.style.opacity = '0'; 
            lightboxImg.style.display = 'block';
            lightboxImg.src = imageUrl;
            lightboxImg.alt = altText || "Artwork";
            lightboxImg.onload = () => {
                lightboxImg.style.opacity = '1';
                lightboxImg.style.transition = 'opacity 0.3s ease';
            };
        }
        if (lightbox) lightbox.classList.add('active');
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('active');
        }
        currentLightboxPhotos = [];
        currentLightboxIndex = -1;
    }

    function navigateLightbox(direction) {
        if (!currentLightboxPhotos || currentLightboxPhotos.length <= 1 || currentLightboxIndex === -1) return;
        
        currentLightboxIndex += direction;
        
        // Wrap around logic
        if (currentLightboxIndex < 0) {
            currentLightboxIndex = currentLightboxPhotos.length - 1;
        } else if (currentLightboxIndex >= currentLightboxPhotos.length) {
            currentLightboxIndex = 0;
        }
        
        const nextUrl = currentLightboxPhotos[currentLightboxIndex];
        
        // We call showLightboxImage again to handle the transition, but we skip resetting the state completely
        // to avoid blinking buttons. We just update the image src.
        if (lightboxImg) {
            lightboxImg.style.opacity = '0';
            setTimeout(() => {
                lightboxImg.src = nextUrl;
                lightboxImg.alt = currentLightboxTitle || "Artwork";
            }, 100); // 100ms fade down
        }
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing lightbox
            navigateLightbox(-1);
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing lightbox
            navigateLightbox(1);
        });
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    
    // Close modals when clicking the dark overlay backgrounds
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
                closeLightbox();
            }
        });
    }

    if (stackView) {
        stackView.addEventListener('click', (e) => {
            if (e.target === stackView) {
                closeStackView();
            }
        });
    }

    // Keyboard Esc handling
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close Lightbox first if it's open
            if (lightbox && lightbox.classList.contains('active')) {
                closeLightbox();
            } 
            // Otherwise close Stack View if it's open
            else if (stackView && stackView.classList.contains('active')) {
                closeStackView();
            }
        } else if (e.key === 'ArrowLeft') {
            if (lightbox && lightbox.classList.contains('active')) {
                navigateLightbox(-1);
            }
        } else if (e.key === 'ArrowRight') {
            if (lightbox && lightbox.classList.contains('active')) {
                navigateLightbox(1);
            }
        }
    });

});
