/* ==============================================
   RB Gallery — Modular JS
   Namespace: window.RBProduct.Gallery
   ============================================== */
(function () {
  'use strict';

  window.RBProduct = window.RBProduct || {};
  window.RBProduct.Gallery = {
    init: function () {
      document.querySelectorAll('.rb-thumb').forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          document.querySelectorAll('.rb-thumb').forEach(function (t) { t.classList.remove('rb-active'); });
          thumb.classList.add('rb-active');
          var src = thumb.getAttribute('data-src');
          var mainImg = document.getElementById('RBMainImg');
          if (mainImg && src) {
            mainImg.style.opacity = '0.3';
            var img = new Image();
            img.src = src;
            img.onload = function () {
              mainImg.src = src;
              mainImg.style.opacity = '1';
            };
          }
        });
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    window.RBProduct.Gallery.init();
  });
})();
