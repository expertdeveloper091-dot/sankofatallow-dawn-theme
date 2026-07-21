/* ==============================================
   RB Product — JavaScript
   Live counter, Qty, Sticky Bar, Fake Orders
   Window namespace: window.RBProduct
   ============================================== */
(function () {
  'use strict';

  window.RBProduct = window.RBProduct || {};

  /* ---- Qty Stepper (main form) ---- */
  function initQty() {
    var input = document.getElementById('RBQtyInput');
    var minus = document.getElementById('RBQtyMinus');
    var plus = document.getElementById('RBQtyPlus');
    if (!input) return;
    minus.addEventListener('click', function () {
      var v = parseInt(input.value, 10) || 1;
      if (v > 1) input.value = v - 1;
      syncStickyQty();
    });
    plus.addEventListener('click', function () {
      var v = parseInt(input.value, 10) || 1;
      input.value = v + 1;
      syncStickyQty();
    });
    input.addEventListener('change', function () {
      if (parseInt(input.value, 10) < 1 || isNaN(parseInt(input.value, 10))) input.value = 1;
      syncStickyQty();
    });
  }

  /* ---- Sync main qty to sticky bar ---- */
  function syncStickyQty() {
    var mainQty = document.getElementById('RBQtyInput');
    var stickyQty = document.getElementById('RBStickyQtyInput');
    if (mainQty && stickyQty) stickyQty.value = mainQty.value;
  }

  /* ---- Sticky Bar Qty ---- */
  function initStickyQty() {
    var input = document.getElementById('RBStickyQtyInput');
    var minus = document.getElementById('RBStickyQtyMinus');
    var plus = document.getElementById('RBStickyQtyPlus');
    if (!input) return;
    minus.addEventListener('click', function () {
      var v = parseInt(input.value, 10) || 1;
      if (v > 1) input.value = v - 1;
    });
    plus.addEventListener('click', function () {
      var v = parseInt(input.value, 10) || 1;
      input.value = v + 1;
    });
  }

  /* ---- Live Visitor Counter ---- */
  function initLiveCounter() {
    var el = document.getElementById('RBLiveCount');
    if (!el) return;
    var base = Math.floor(Math.random() * 20) + 8;
    el.textContent = base;
    setInterval(function () {
      var delta = Math.random() > 0.5 ? 1 : -1;
      base = Math.max(5, Math.min(99, base + delta));
      el.textContent = base;
    }, 4000);
  }

  /* ---- Sticky Bar: separate option dropdowns ---- */
  function initStickyBar() {
    var bar = document.getElementById('RBStickyBar');
    var atcSection = document.querySelector('.rb-atc-row');
    if (!bar || !atcSection) return;

    /* Show/hide bar on scroll using IntersectionObserver */
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          bar.classList.add('rb-visible');
        } else {
          bar.classList.remove('rb-visible');
        }
      });
    }, { threshold: 0.1 });
    observer.observe(atcSection);

    /* When sticky option selects change, update variant & price */
    var stickySelects = bar.querySelectorAll('.rb-sticky-variant-select');
    if (stickySelects.length > 0 && window.__rbVariants) {
      stickySelects.forEach(function (sel) {
        sel.addEventListener('change', function () {
          syncStickyVariant();
          /* Mirror selection to main page pills */
          var pos = parseInt(sel.getAttribute('data-option-position'), 10);
          var val = sel.value;
          var mainPills = document.querySelectorAll('.rb-pill[data-option="' + pos + '"]');
          mainPills.forEach(function (p) {
            if (p.getAttribute('data-value') === val) {
              p.click();
            }
          });
        });
      });
    }

    /* Sticky ATC click — update hidden variant input then submit main form */
    var stickyAtcBtn = document.getElementById('RBStickyAtcBtn');
    if (stickyAtcBtn) {
      stickyAtcBtn.addEventListener('click', function () {
        syncStickyVariant();
        var mainAtcBtn = document.getElementById('RBAtcBtn');
        if (mainAtcBtn) mainAtcBtn.click();
      });
    }
  }

  /* Find matching variant from sticky option selects and update price */
  function syncStickyVariant() {
    if (!window.__rbVariants) return;
    var stickySelects = document.querySelectorAll('#RBStickyBar .rb-sticky-variant-select');
    var selectedOptions = [];
    stickySelects.forEach(function (sel) {
      selectedOptions.push(sel.value);
    });

    var matched = window.__rbVariants.find(function (v) {
      return v.options.every(function (opt, i) {
        return opt === selectedOptions[i];
      });
    });

    if (matched) {
      /* Update hidden input on main form */
      var hiddenId = document.getElementById('RBVariantId');
      if (hiddenId) hiddenId.value = matched.id;
      /* Update sticky price */
      var stickyPrice = document.getElementById('RBStickyPrice');
      if (stickyPrice && matched.price) {
        stickyPrice.textContent = formatMoney(matched.price);
      }
    }
  }

  function formatMoney(cents) {
    return 'Rs.' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /* ---- Gallery Thumbnails ---- */
  function initGallery() {
    var thumbs = document.querySelectorAll('.rb-thumb');
    var mainImg = document.getElementById('RBMainImg');
    if (!mainImg) return;
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        thumbs.forEach(function (t) { t.classList.remove('rb-active'); });
        thumb.classList.add('rb-active');
        var src = thumb.getAttribute('data-src');
        if (src) {
          mainImg.style.opacity = '0.4';
          setTimeout(function () {
            mainImg.src = src;
            mainImg.style.opacity = '1';
          }, 120);
        }
      });
    });
  }

  /* ---- Variant Pills ---- */
  function initVariantPills() {
    var pills = document.querySelectorAll('.rb-pill');
    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var group = pill.closest('.rb-option-group');
        if (group) {
          group.querySelectorAll('.rb-pill').forEach(function (p) { p.classList.remove('rb-selected'); });
        }
        pill.classList.add('rb-selected');
      });
    });
  }

  /* ---- FAKE ORDERS TOAST ---- */
  var fakeOrders = [
    { name: 'Hina', city: 'Multan', product: 'BAKRA EID DINNER SET', time: '44 minutes ago' },
    { name: 'Sara', city: 'Lahore', product: 'ANCIENT WISDOM SKIN SET', time: '12 minutes ago' },
    { name: 'Amna', city: 'Karachi', product: 'CLAY FACE MASK', time: '3 minutes ago' },
    { name: 'Zara', city: 'Islamabad', product: 'TALLOW MOISTURIZER', time: '27 minutes ago' },
    { name: 'Nida', city: 'Faisalabad', product: 'HERBAL GLOW SERUM', time: '1 hour ago' },
    { name: 'Rabia', city: 'Peshawar', product: 'SANKOFA CREAM SET', time: '58 minutes ago' },
    { name: 'Maryam', city: 'Sialkot', product: 'SKIN REVIVE PACK', time: '15 minutes ago' },
    { name: 'Fatima', city: 'Rawalpindi', product: 'TALLOW LIP BUTTER', time: '6 minutes ago' },
  ];

  function showToast(order) {
    var toast = document.getElementById('RBOrderToast');
    if (!toast) return;
    var img = toast.querySelector('.rb-toast-img');
    var top = toast.querySelector('.rb-toast-top');
    var buyer = toast.querySelector('.rb-toast-buyer');
    var prod = toast.querySelector('.rb-toast-product');
    var time = toast.querySelector('.rb-toast-time-text');

    if (top) top.textContent = 'purchased';
    if (buyer) buyer.textContent = order.name + ' (' + order.city + ')';
    if (prod) prod.textContent = order.product;
    if (time) time.textContent = order.time;

    /* Use product featured image if available */
    var featuredImg = document.getElementById('RBMainImg');
    if (img && featuredImg) img.src = featuredImg.src;

    toast.classList.remove('rb-hidden');
    setTimeout(function () { toast.classList.add('rb-hidden'); }, 5500);
  }

  function initFakeOrders() {
    var toast = document.getElementById('RBOrderToast');
    if (!toast) return;

    var closeBtn = document.getElementById('RBToastClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () { toast.classList.add('rb-hidden'); });
    }

    var idx = 0;
    function nextOrder() {
      showToast(fakeOrders[idx % fakeOrders.length]);
      idx++;
      var delay = 7000 + Math.floor(Math.random() * 8000);
      setTimeout(nextOrder, delay);
    }

    /* First toast after 3 seconds */
    setTimeout(nextOrder, 3000);
  }

  /* ---- INIT ---- */
  document.addEventListener('DOMContentLoaded', function () {
    initQty();
    initStickyQty();
    initStickyBar();
    initLiveCounter();
    initGallery();
    initVariantPills();
    initFakeOrders();
  });

})();
