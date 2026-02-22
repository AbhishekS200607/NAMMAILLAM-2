/**
 * NAMMA ILLAM - Global JavaScript Initialization
 * Handles: Lenis, sticky header, smooth scroll
 * Created: February 2026
 */

(function() {
  'use strict';

  // ============================================
  // LENIS SMOOTH SCROLL INITIALIZATION
  // ============================================
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }

  // ============================================
  // STICKY HEADER ON SCROLL
  // ============================================
  function initStickyHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScrollTop = 0;
    let ticking = false;

    function updateHeader() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      if (scrollTop > 50) {
        header.classList.add('sticky-header');
      } else {
        header.classList.remove('sticky-header');
      }

      lastScrollTop = scrollTop;
      ticking = false;
    }

    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
  }

  // ============================================
  // ACTIVE NAV LINK HIGHLIGHTING
  // ============================================
  function initActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-side a');
    if (!navLinks.length) return;

    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && currentPath.includes(href)) {
        link.classList.add('active');
      }
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initStickyHeader();
      initActiveNavLink();
    });
  } else {
    initStickyHeader();
    initActiveNavLink();
  }

  // ============================================
  // UTILITY: Defer scripts loading
  // ============================================
  window.deferScript = function(src) {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  };

})();
