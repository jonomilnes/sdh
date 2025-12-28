/**
 * SDH Portfolio - Main Application
 * A spatial canvas portfolio with parallax and zoom transitions
 */

// ========================================
// State
// ========================================
let artworks = [];
let activeFilter = 'all';
let isLightboxOpen = false;
let currentArtwork = null;
let currentCard = null;
let canvasScrollPos = { left: 0, top: 0 };

// DOM Elements
const canvas = document.getElementById('canvas');
const canvasInner = document.getElementById('canvas-inner');
const grid = document.getElementById('grid');
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightbox-content');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxMeta = document.getElementById('lightbox-meta');
const lightboxClose = document.getElementById('lightbox-close');
const filtersContainer = document.getElementById('filters');
const scrollHint = document.getElementById('scroll-hint');

// ========================================
// Initialize
// ========================================
async function init() {
  await loadArtworks();
  calculateGridLayout();
  renderGrid();
  renderFilters();
  initCanvasScroll();
  initParallax();
  initLightbox();
  initScrollHint();
  
  // Wait for images to start loading, then center
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      centerCanvas();
    });
  });
}

// ========================================
// Calculate Grid Layout
// ========================================
function calculateGridLayout() {
  const count = artworks.length;
  
  // Calculate optimal columns for a roughly square-ish grid
  // Aim for slightly more columns than rows for landscape feel
  const columns = Math.ceil(Math.sqrt(count * 1.5));
  const rows = Math.ceil(count / columns);
  
  // Set CSS variable
  document.documentElement.style.setProperty('--grid-columns', columns);
  document.documentElement.style.setProperty('--grid-rows', rows);
}

// ========================================
// Data Loading
// ========================================
async function loadArtworks() {
  try {
    const response = await fetch('artworks.json');
    artworks = await response.json();
  } catch (error) {
    console.error('Failed to load artworks:', error);
    artworks = [];
  }
}

// ========================================
// Render Grid
// ========================================
function renderGrid() {
  grid.innerHTML = '';
  
  artworks.forEach((artwork, index) => {
    const card = document.createElement('div');
    card.className = 'artwork';
    card.dataset.id = artwork.id;
    card.dataset.medium = artwork.medium;
    card.dataset.index = index;
    
    card.innerHTML = `
      <div class="artwork__image-wrapper">
        <img 
          class="artwork__image" 
          src="${artwork.image}" 
          alt="${artwork.title}"
          loading="lazy"
        >
      </div>
      <div class="artwork__info">
        <h3 class="artwork__title">${artwork.title}</h3>
        <p class="artwork__meta">${artwork.year} · ${artwork.medium}</p>
      </div>
    `;
    
    // Handle image load
    const img = card.querySelector('.artwork__image');
    img.onload = () => {
      img.classList.add('loaded');
      card.classList.add('loaded');
    };
    
    // Click handler for lightbox
    card.addEventListener('click', () => openLightbox(artwork, card));
    
    grid.appendChild(card);
  });
}

// ========================================
// Filters
// ========================================
function renderFilters() {
  // Get unique mediums from artworks
  const mediums = [...new Set(artworks.map(a => a.medium))];
  
  // Create filter buttons
  const allBtn = createFilterButton('all', 'All');
  filtersContainer.appendChild(allBtn);
  
  mediums.forEach(medium => {
    const btn = createFilterButton(medium, medium);
    filtersContainer.appendChild(btn);
  });
}

function createFilterButton(value, label) {
  const btn = document.createElement('button');
  btn.className = `filter-btn ${value === 'all' ? 'active' : ''}`;
  btn.textContent = label;
  btn.addEventListener('click', () => setFilter(value));
  return btn;
}

function setFilter(filter) {
  activeFilter = filter;
  
  // Update button states
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === filter);
  });
  
  // Filter artworks with animation
  const cards = document.querySelectorAll('.artwork');
  
  cards.forEach((card, i) => {
    const medium = card.dataset.medium;
    const shouldShow = filter === 'all' || medium === filter;
    
    // Stagger the animation slightly
    gsap.to(card, {
      opacity: shouldShow ? 1 : 0,
      scale: shouldShow ? 1 : 0.9,
      duration: 0.4,
      delay: i * 0.02,
      ease: 'power2.out',
      onComplete: () => {
        card.classList.toggle('filtered-out', !shouldShow);
      }
    });
  });
}

// ========================================
// Canvas Scrolling (Drag to scroll)
// ========================================
function initCanvasScroll() {
  let isDown = false;
  let startX, startY;
  let scrollLeft, scrollTop;
  let velocity = { x: 0, y: 0 };
  let lastMove = { x: 0, y: 0, time: 0 };
  
  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    if (e.target.closest('.artwork')) return;
    
    isDown = true;
    canvas.style.cursor = 'grabbing';
    startX = e.pageX - canvas.offsetLeft;
    startY = e.pageY - canvas.offsetTop;
    scrollLeft = canvas.scrollLeft;
    scrollTop = canvas.scrollTop;
    velocity = { x: 0, y: 0 };
  });
  
  canvas.addEventListener('mouseleave', () => {
    if (isDown) applyMomentum();
    isDown = false;
    canvas.style.cursor = 'grab';
  });
  
  canvas.addEventListener('mouseup', () => {
    if (isDown) applyMomentum();
    isDown = false;
    canvas.style.cursor = 'grab';
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    
    // Track velocity for momentum
    const now = Date.now();
    if (lastMove.time) {
      const dt = now - lastMove.time;
      if (dt > 0) {
        velocity.x = (scrollLeft - walkX - canvas.scrollLeft) / dt * 16;
        velocity.y = (scrollTop - walkY - canvas.scrollTop) / dt * 16;
      }
    }
    lastMove = { x, y, time: now };
    
    canvas.scrollLeft = scrollLeft - walkX;
    canvas.scrollTop = scrollTop - walkY;
  });
  
  // Touch events for mobile
  let touchStartX, touchStartY, touchScrollLeft, touchScrollTop;
  
  canvas.addEventListener('touchstart', (e) => {
    if (e.target.closest('.artwork')) return;
    
    const touch = e.touches[0];
    touchStartX = touch.pageX;
    touchStartY = touch.pageY;
    touchScrollLeft = canvas.scrollLeft;
    touchScrollTop = canvas.scrollTop;
    velocity = { x: 0, y: 0 };
  }, { passive: true });
  
  canvas.addEventListener('touchmove', (e) => {
    if (!touchStartX) return;
    
    const touch = e.touches[0];
    const walkX = touch.pageX - touchStartX;
    const walkY = touch.pageY - touchStartY;
    
    canvas.scrollLeft = touchScrollLeft - walkX;
    canvas.scrollTop = touchScrollTop - walkY;
  }, { passive: true });
  
  canvas.addEventListener('touchend', () => {
    touchStartX = null;
    touchStartY = null;
  });
  
  // Smooth scroll with mouse wheel
  canvas.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      canvas.scrollLeft += e.deltaX;
    } else {
      if (e.shiftKey) {
        canvas.scrollLeft += e.deltaY;
      } else {
        canvas.scrollTop += e.deltaY;
      }
    }
  }, { passive: true });
  
  // Momentum scrolling
  function applyMomentum() {
    if (Math.abs(velocity.x) < 0.5 && Math.abs(velocity.y) < 0.5) return;
    
    gsap.to(canvas, {
      scrollLeft: canvas.scrollLeft - velocity.x * 20,
      scrollTop: canvas.scrollTop - velocity.y * 20,
      duration: 0.8,
      ease: 'power2.out'
    });
  }
}

// ========================================
// Parallax Effect (subtle opposite movement)
// ========================================
function initParallax() {
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  
  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    if (isLightboxOpen) return;
    
    // Normalize to -1 to 1
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  
  // Smooth animation loop
  function animate() {
    if (!isLightboxOpen) {
      // Lerp towards target (smooth easing)
      currentX += (mouseX - currentX) * 0.06;
      currentY += (mouseY - currentY) * 0.06;
      
      // Move grid in OPPOSITE direction of mouse (subtle)
      gsap.set(grid, {
        x: -currentX * 15,
        y: -currentY * 15
      });
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// ========================================
// Lightbox with Zoom Transition
// ========================================
function initLightbox() {
  lightboxClose.addEventListener('click', closeLightbox);
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox__backdrop')) {
      closeLightbox();
    }
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!isLightboxOpen) return;
    
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      navigateLightbox(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      navigateLightbox(-1);
    }
  });
}

function openLightbox(artwork, cardElement) {
  if (isLightboxOpen) return;
  
  isLightboxOpen = true;
  currentArtwork = artwork;
  currentCard = cardElement;
  
  // Get the card's image and its position
  const cardImg = cardElement.querySelector('.artwork__image');
  const cardImgRect = cardImg.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  
  // Viewport center
  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;
  
  // Card center relative to viewport
  const cardCenterX = cardImgRect.left + cardImgRect.width / 2;
  const cardCenterY = cardImgRect.top + cardImgRect.height / 2;
  
  // Calculate zoom scale (make image fill ~60% of viewport height)
  const targetHeight = window.innerHeight * 0.55;
  const targetWidth = window.innerWidth * 0.7;
  const scaleByHeight = targetHeight / cardImgRect.height;
  const scaleByWidth = targetWidth / cardImgRect.width;
  const zoomScale = Math.min(scaleByHeight, scaleByWidth);
  
  // Calculate translation needed to center the card after scaling
  // After scaling, the card center moves. We need to compensate.
  const translateX = (viewportCenterX - cardCenterX);
  const translateY = (viewportCenterY - cardCenterY) - 30; // Small offset for metadata
  
  // Store original scroll position
  canvasScrollPos = { 
    left: canvas.scrollLeft, 
    top: canvas.scrollTop 
  };
  
  // Disable canvas scrolling during lightbox
  canvas.style.overflow = 'hidden';
  
  // Show lightbox (for backdrop)
  lightbox.classList.add('active');
  
  // Fade out filters, then show metadata
  gsap.to(filtersContainer, {
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in',
    onComplete: () => {
      filtersContainer.classList.add('hidden');
      showArtworkMeta(artwork);
    }
  });
  
  // Set transform origin to the card's center position relative to canvasInner
  const canvasInnerRect = canvasInner.getBoundingClientRect();
  const originX = cardCenterX - canvasInnerRect.left;
  const originY = cardCenterY - canvasInnerRect.top;
  
  // Zoom the canvas into the artwork
  gsap.to(canvasInner, {
    scale: zoomScale,
    x: translateX,
    y: translateY,
    duration: 0.8,
    ease: 'power3.inOut',
    transformOrigin: `${originX}px ${originY}px`
  });
  
  // Fade out OTHER artworks only (keep selected at full opacity)
  document.querySelectorAll('.artwork').forEach((card) => {
    if (card !== cardElement) {
      gsap.to(card, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  });
  
  // Ensure selected card stays fully visible
  gsap.to(cardElement, {
    opacity: 1,
    duration: 0.3
  });
}

function closeLightbox() {
  if (!isLightboxOpen) return;
  
  // Fade out metadata first
  const metaEl = document.getElementById('artwork-meta');
  if (metaEl) {
    gsap.to(metaEl, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        metaEl.remove();
        // Then fade in filters
        filtersContainer.classList.remove('hidden');
        gsap.fromTo(filtersContainer, 
          { opacity: 0 }, 
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
      }
    });
  } else {
    filtersContainer.classList.remove('hidden');
  }
  
  // Zoom the canvas back out
  gsap.to(canvasInner, {
    scale: 1,
    x: 0,
    y: 0,
    duration: 0.7,
    ease: 'power3.inOut',
    onComplete: () => {
      lightbox.classList.remove('active');
      isLightboxOpen = false;
      currentArtwork = null;
      currentCard = null;
      
      // Re-enable canvas scrolling
      canvas.style.overflow = 'auto';
    }
  });
  
  // Restore all cards
  document.querySelectorAll('.artwork').forEach((card) => {
    const shouldShow = activeFilter === 'all' || card.dataset.medium === activeFilter;
    gsap.to(card, {
      opacity: shouldShow ? 1 : 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  });
}

// ========================================
// Artwork Metadata Display (in footer)
// ========================================
function showArtworkMeta(artwork) {
  // Create or get the metadata element
  let metaEl = document.getElementById('artwork-meta');
  if (!metaEl) {
    metaEl = document.createElement('div');
    metaEl.id = 'artwork-meta';
    metaEl.className = 'artwork-meta';
    document.getElementById('footer').appendChild(metaEl);
  }
  
  metaEl.innerHTML = `
    <span class="artwork-meta__title">${artwork.title}</span>
    <span class="artwork-meta__details">${artwork.year} · ${artwork.medium}</span>
  `;
  
  // Animate in
  gsap.fromTo(metaEl, 
    { opacity: 0 },
    { opacity: 1, duration: 0.4, delay: 0.2, ease: 'power2.out' }
  );
}

function hideArtworkMeta() {
  const metaEl = document.getElementById('artwork-meta');
  if (metaEl) {
    gsap.to(metaEl, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => metaEl.remove()
    });
  }
}

function navigateLightbox(direction) {
  const visibleArtworks = artworks.filter(a => 
    activeFilter === 'all' || a.medium === activeFilter
  );
  
  const currentIndex = visibleArtworks.findIndex(a => a.id === currentArtwork.id);
  let newIndex = currentIndex + direction;
  
  // Loop around
  if (newIndex < 0) newIndex = visibleArtworks.length - 1;
  if (newIndex >= visibleArtworks.length) newIndex = 0;
  
  const newArtwork = visibleArtworks[newIndex];
  const newCard = document.querySelector(`.artwork[data-id="${newArtwork.id}"]`);
  
  if (!newCard) return;
  
  // Fade out old, fade in new
  const oldCard = currentCard;
  
  gsap.to(oldCard, { opacity: 0, duration: 0.25 });
  gsap.to(newCard, { opacity: 1, duration: 0.25 });
  
  // Update state
  currentArtwork = newArtwork;
  currentCard = newCard;
  
  // Update metadata with crossfade
  const metaEl = document.getElementById('artwork-meta');
  if (metaEl) {
    gsap.to(metaEl, {
      opacity: 0,
      duration: 0.15,
      onComplete: () => {
        metaEl.innerHTML = `
          <span class="artwork-meta__title">${newArtwork.title}</span>
          <span class="artwork-meta__details">${newArtwork.year} · ${newArtwork.medium}</span>
        `;
        gsap.to(metaEl, { opacity: 1, duration: 0.2 });
      }
    });
  }
  
  // Get new card position
  const cardImg = newCard.querySelector('.artwork__image');
  const cardImgRect = cardImg.getBoundingClientRect();
  
  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;
  const cardCenterX = cardImgRect.left + cardImgRect.width / 2;
  const cardCenterY = cardImgRect.top + cardImgRect.height / 2;
  
  // Additional translation needed
  const additionalX = viewportCenterX - cardCenterX;
  const additionalY = (viewportCenterY - cardCenterY) - 30;
  
  // Get current x/y and add to them
  const currentX = gsap.getProperty(canvasInner, 'x');
  const currentY = gsap.getProperty(canvasInner, 'y');
  
  gsap.to(canvasInner, {
    x: currentX + additionalX,
    y: currentY + additionalY,
    duration: 0.5,
    ease: 'power2.inOut'
  });
}

// ========================================
// Scroll Hint
// ========================================
function initScrollHint() {
  let hasScrolled = false;
  
  canvas.addEventListener('scroll', () => {
    if (!hasScrolled) {
      hasScrolled = true;
      scrollHint.classList.add('hidden');
    }
  });
  
  // Also hide on drag
  canvas.addEventListener('mousedown', () => {
    if (!hasScrolled) {
      hasScrolled = true;
      scrollHint.classList.add('hidden');
    }
  });
}

// ========================================
// Center Canvas Initially
// ========================================
function centerCanvas() {
  // Get the actual dimensions
  const totalWidth = canvasInner.scrollWidth;
  const totalHeight = canvasInner.scrollHeight;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Center the canvas so the middle of the grid is in the middle of the viewport
  canvas.scrollLeft = (totalWidth - viewportWidth) / 2;
  canvas.scrollTop = (totalHeight - viewportHeight) / 2;
}

// ========================================
// Start
// ========================================
document.addEventListener('DOMContentLoaded', init);
