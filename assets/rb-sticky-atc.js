/* ==============================================
   RB Sticky ATC — Modular JS
   Namespace: window.RBProduct.StickyATC
   ============================================== */
(function () {
  'use strict';

  window.RBProduct = window.RBProduct || {};
  window.RBProduct.StickyATC = {
    init: function () {
      var bar = document.getElementById('RBStickyBar');
      var atcRow = document.querySelector('.rb-atc-row');
      if (!bar || !atcRow) return;

      var observer = new IntersectionObserver(function (entries) {
        bar.classList.toggle('rb-visible', !entries[0].isIntersecting);
      }, { threshold: 0.1 });

      observer.observe(atcRow);
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    window.RBProduct.StickyATC.init();
  });
})();
