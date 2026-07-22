/* ==============================================
   RB Fake Orders — Modular Social Proof JS
   Namespace: window.RBProduct.FakeOrders
   ============================================== */
(function () {
  'use strict';

  window.RBProduct = window.RBProduct || {};
  window.RBProduct.FakeOrders = {
    init: function () {
      var toast = document.getElementById('RBOrderToast');
      if (!toast) return;
      var closeBtn = document.getElementById('RBToastClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () { toast.classList.add('rb-hidden'); });
      }
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    window.RBProduct.FakeOrders.init();
  });
})();
