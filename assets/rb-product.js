/* ============================================================
   RB DESIGN SYSTEM JAVASCRIPT (Clay Theme Namespace Isolation)
   Namespace: window.RBProduct
   ============================================================ */

(function() {
  'use strict';

  window.RBProduct = {
    changeGalleryImage: function(element, newSrc) {
      var mainImg = document.getElementById('RBMainFeaturedImage');
      if (mainImg) {
        mainImg.src = newSrc;
      }
      var thumbs = document.querySelectorAll('.rb-thumb-item');
      thumbs.forEach(function(thumb) {
        thumb.classList.remove('rb-active');
      });
      if (element) {
        element.classList.add('rb-active');
      }
    },

    updateQuantity: function(delta) {
      var input = document.getElementById('RBQtyInput');
      if (!input) return;
      var current = parseInt(input.value, 10) || 1;
      var next = Math.max(1, current + delta);
      input.value = next;
    },

    initLiveVisitors: function() {
      var liveEl = document.getElementById('RBLiveCounter');
      if (!liveEl) return;
      setInterval(function() {
        var current = parseInt(liveEl.textContent, 10) || 16;
        var diff = Math.floor(Math.random() * 3) - 1;
        var next = Math.max(8, Math.min(38, current + diff));
        liveEl.textContent = next;
      }, 5000);
    },

    openAskModal: function() {
      var modal = document.getElementById('RBAskModal');
      if (modal) {
        modal.style.display = 'flex';
      }
    },

    closeAskModal: function() {
      var modal = document.getElementById('RBAskModal');
      if (modal) {
        modal.style.display = 'none';
      }
    },

    init: function() {
      this.initLiveVisitors();
      
      var askBtn = document.getElementById('RBAskBtn');
      if (askBtn) {
        askBtn.addEventListener('click', this.openAskModal.bind(this));
      }
    }
  };

  document.addEventListener('DOMContentLoaded', function() {
    window.RBProduct.init();
  });
})();
