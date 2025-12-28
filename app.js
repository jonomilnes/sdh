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
  renderGrid();
  renderFilters();
  initCanvasScroll();
  initParallax();
  initLightbox();
  initScrollHint();
  centerCanvas();
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
// Parallax Effect
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
      // Lerp towards target
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;
      
      // Apply subtle transform to grid
      gsap.set(grid, {
        rotateY: currentX * 2,
        rotateX: -currentY * 2,
        transformPerspective: 1000
      });
      
      // Apply varying parallax to individual cards based on position
      const cards = document.querySelectorAll('.artwork:not(.filtered-out)');
      cards.forEach((card, i) => {
        const depth = (i % 3) * 0.5 + 0.5; // Varying depth
        gsap.set(card, {
          x: currentX * 10 * depth,
          y: currentY * 10 * depth
        });
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
  
  // Get the card's position for the zoom animation (FLIP technique)
  const cardImg = cardElement.querySelector('.artwork__image');
  const cardImgRect = cardImg.getBoundingClientRect();
  
  // Set lightbox content
  lightboxImage.src = artwork.image;
  lightboxTitle.textContent = artwork.title;
  lightboxMeta.textContent = `${artwork.year} · ${artwork.medium}`;
  
  // Calculate target size and position
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const maxWidth = viewportWidth * 0.85;
  const maxHeight = viewportHeight * 0.7;
  
  // Calculate the scale factor from card to full size
  const scaleX = cardImgRect.width / maxWidth;
  const scaleY = cardImgRect.height / maxHeight;
  const startScale = Math.max(scaleX, scaleY);
  
  // Center positions
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2 - 30; // Slight offset for info below
  
  // Set initial state at card position
  gsap.set(lightboxContent, {
    position: 'absolute',
    left: cardImgRect.left + cardImgRect.width / 2,
    top: cardImgRect.top + cardImgRect.height / 2,
    xPercent: -50,
    yPercent: -50,
    scale: startScale,
    opacity: 1
  });
  
  // Show lightbox container
  lightbox.classList.add('active');
  
  // Create a smooth, cinematic zoom effect
  const tl = gsap.timeline();
  
  // Simultaneously zoom content and fade the canvas
  tl.to(lightboxContent, {
    left: centerX,
    top: centerY,
    scale: 1,
    duration: 0.7,
    ease: 'power2.inOut'
  }, 0);
  
  // Smoothly push other cards away (scale down and fade)
  document.querySelectorAll('.artwork').forEach((card, i) => {
    if (card !== cardElement) {
      const cardRect = card.getBoundingClientRect();
      const dx = cardRect.left - cardImgRect.left;
      const dy = cardRect.top - cardImgRect.top;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const delay = Math.min(distance / 3000, 0.15);
      
      gsap.to(card, {
        opacity: 0.15,
        scale: 0.92,
        duration: 0.5,
        delay: delay,
        ease: 'power2.out'
      });
    }
  });
  
  // Fade the clicked card as it "becomes" the lightbox
  gsap.to(cardElement, {
    opacity: 0,
    duration: 0.25
  });
  
  // Subtle zoom on the grid container for depth
  gsap.to(grid, {
    scale: 0.96,
    duration: 0.6,
    ease: 'power2.out'
  });
}

function closeLightbox() {
  if (!isLightboxOpen) return;
  
  const currentCard = document.querySelector(`.artwork[data-id="${currentArtwork.id}"]`);
  const cardImg = currentCard?.querySelector('.artwork__image');
  
  // Reset grid scale
  gsap.to(grid, {
    scale: 1,
    duration: 0.5,
    ease: 'power2.inOut'
  });
  
  // Restore all cards with stagger
  document.querySelectorAll('.artwork').forEach((card, i) => {
    const shouldShow = activeFilter === 'all' || card.dataset.medium === activeFilter;
    gsap.to(card, {
      opacity: shouldShow ? 1 : 0,
      scale: shouldShow ? 1 : 0.9,
      x: 0,
      y: 0,
      duration: 0.4,
      delay: i * 0.01,
      ease: 'power2.out'
    });
  });
  
  if (cardImg) {
    const cardImgRect = cardImg.getBoundingClientRect();
    const maxWidth = window.innerWidth * 0.85;
    const maxHeight = window.innerHeight * 0.7;
    const scaleX = cardImgRect.width / maxWidth;
    const scaleY = cardImgRect.height / maxHeight;
    const endScale = Math.max(scaleX, scaleY);
    
    // Animate back to card position
    gsap.to(lightboxContent, {
      left: cardImgRect.left + cardImgRect.width / 2,
      top: cardImgRect.top + cardImgRect.height / 2,
      scale: endScale,
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        lightbox.classList.remove('active');
        isLightboxOpen = false;
        currentArtwork = null;
      }
    });
  } else {
    // Fallback: fade out
    gsap.to(lightboxContent, {
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      onComplete: () => {
        lightbox.classList.remove('active');
        isLightboxOpen = false;
        currentArtwork = null;
        gsap.set(lightboxContent, { opacity: 1 });
      }
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
  
  // Animate transition
  gsap.to(lightboxContent, {
    opacity: 0,
    scale: 0.95,
    duration: 0.2,
    onComplete: () => {
      currentArtwork = newArtwork;
      lightboxImage.src = newArtwork.image;
      lightboxTitle.textContent = newArtwork.title;
      lightboxMeta.textContent = `${newArtwork.year} · ${newArtwork.medium}`;
      
      gsap.to(lightboxContent, {
        opacity: 1,
        scale: 1,
        duration: 0.3
      });
    }
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
  // Position canvas to show the grid somewhat centered
  // but with room to scroll in all directions
  const totalWidth = canvasInner.scrollWidth;
  const totalHeight = canvasInner.scrollHeight;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Start scrolled a bit right and down so there's content in all directions
  canvas.scrollLeft = (totalWidth - viewportWidth) * 0.3;
  canvas.scrollTop = (totalHeight - viewportHeight) * 0.3;
}

// ========================================
// Start
// ========================================
document.addEventListener('DOMContentLoaded', init);
