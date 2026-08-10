/* ==============================================
   RB Product — Fully Dynamic JS
   Handles: variant selection, price updates,
   gallery media, inventory, sticky bar,
   live counter, fake orders, buy now
   Namespace: window.RBProduct
   ============================================== */
(function () {
  'use strict';

  var RB = window.RBProduct = window.RBProduct || {};

  /* ==========================================
     VARIANT ENGINE
     ========================================== */
  var _data = null;       // window.__rbProductData
  var _variants = [];     // all variants array
  var _currentVariant = null;
  var _selectedOptions = [];

  function initVariantEngine() {
    _data = window.__rbProductData;
    if (!_data) return;
    _variants = _data.variants || [];

    /* Seed selected options from the current server-rendered variant */
    var currentId = _data.currentVariantId;
    _currentVariant = _variants.find(function (v) { return v.id === currentId; }) || _variants[0];
    if (_currentVariant) {
      _selectedOptions = (_currentVariant.options || []).slice();
    }

    /* Attach pill click handlers */
    document.querySelectorAll('.rb-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        onPillClick(pill);
      });
    });
  }

  function onPillClick(pill) {
    var idx = parseInt(pill.getAttribute('data-option-index'), 10);
    var val = pill.getAttribute('data-value');
    var pos = parseInt(pill.getAttribute('data-option-position'), 10);

    /* Update selected options array */
    _selectedOptions[idx] = val;

    /* Update pill UI for this group */
    document.querySelectorAll('.rb-pill[data-option-index="' + idx + '"]').forEach(function (p) {
      p.classList.remove('rb-selected');
      p.setAttribute('aria-pressed', 'false');
    });
    pill.classList.add('rb-selected');
    pill.setAttribute('aria-pressed', 'true');

    /* Update label */
    var label = document.getElementById('RBOptVal' + pos);
    if (label) label.textContent = val;

    /* Find matching variant */
    var matched = findVariant(_selectedOptions);
    if (matched) {
      _currentVariant = matched;
      applyVariant(matched);
    }

    /* Sync sticky dropdowns */
    syncStickyDropdowns();
  }

  function findVariant(selectedOpts) {
    return _variants.find(function (v) {
      return (v.options || []).every(function (opt, i) {
        return opt === selectedOpts[i];
      });
    });
  }

  function applyVariant(variant) {
    updateHiddenInput(variant.id);
    updatePrice(variant);
    updateSaveBadge(variant);
    updateAvailability(variant);
    updateSku(variant);
    updateAtcButton(variant);
    updateGalleryForVariant(variant);
    updateUrl(variant);
    updateStickyPrice(variant);
  }

  /* ==========================================
     UI UPDATERS
     ========================================== */
  function updateHiddenInput(variantId) {
    var el = document.getElementById('RBVariantId');
    if (el) el.value = variantId;
  }

  function updatePrice(variant) {
    var saleEl = document.getElementById('RBPriceSale');
    var compareEl = document.getElementById('RBPriceCompare');
    if (saleEl) saleEl.textContent = formatMoney(variant.price);
    if (compareEl) {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        compareEl.textContent = formatMoney(variant.compare_at_price);
        compareEl.style.display = '';
      } else {
        compareEl.style.display = 'none';
      }
    }
  }

  function updateSaveBadge(variant) {
    var badge = document.getElementById('RBSaveBadge');
    if (!badge) return;
    var showBadge = badge.getAttribute('data-show') === 'true';
    if (!showBadge) return;
    if (variant.compare_at_price && variant.compare_at_price > variant.price) {
      var pct = Math.round((variant.compare_at_price - variant.price) * 100 / variant.compare_at_price);
      var pctEl = document.getElementById('RBSavePct');
      if (pctEl) pctEl.textContent = pct;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  function updateAvailability(variant) {
    var atcBtn = document.getElementById('RBAtcBtn');
    var buyNow = document.getElementById('RBBuyNow');
    var availEl = document.getElementById('RBMetaAvail');

    if (atcBtn) {
      var textEl = atcBtn.querySelector('.rb-atc-text');
      if (variant.available) {
        atcBtn.disabled = false;
        if (textEl) textEl.textContent = atcBtn.getAttribute('data-atc-text') || 'Add to Cart';
      } else {
        atcBtn.disabled = true;
        if (textEl) textEl.textContent = atcBtn.getAttribute('data-sold-text') || 'Sold Out';
      }
    }
    if (buyNow) buyNow.disabled = !variant.available;
    if (availEl) {
      if (variant.available) {
        availEl.innerHTML = '<span style="color:#16a34a;font-weight:700;">' + (availEl.getAttribute('data-in-stock') || 'Instock') + '</span>';
      } else {
        availEl.innerHTML = '<span style="color:#dc2626;font-weight:700;">' + (availEl.getAttribute('data-out-stock') || 'Out of Stock') + '</span>';
      }
    }
  }

  function updateSku(variant) {
    var el = document.getElementById('RBMetaSku');
    if (el) el.textContent = variant.sku || 'N/A';
  }

  function updateAtcButton(variant) {
    /* Also store texts as data attrs on first run */
    var btn = document.getElementById('RBAtcBtn');
    if (!btn) return;
    if (!btn.hasAttribute('data-atc-text')) {
      var textEl = btn.querySelector('.rb-atc-text');
      if (textEl) btn.setAttribute('data-atc-text', textEl.textContent.trim());
    }
  }

  function updateUrl(variant) {
    if (history && history.replaceState && _data) {
      var url = _data.url + '?variant=' + variant.id;
      history.replaceState({ variantId: variant.id }, '', url);
    }
  }

  function formatMoney(cents) {
    if (!cents) return '';
    var amount = (cents / 100).toFixed(2);
    /* Use Shopify money format if available */
    if (window.Shopify && window.Shopify.currency) {
      return window.Shopify.currency.active + amount;
    }
    return 'Rs.' + amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /* ==========================================
     GALLERY
     ========================================== */
  function initGallery() {
    document.querySelectorAll('.rb-thumb').forEach(function (thumb) {
      thumb.addEventListener('click', function () { activateThumb(thumb); });
      thumb.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') activateThumb(thumb);
      });
    });

    /* Expand button */
    var expandBtn = document.getElementById('RBExpandBtn');
    var mainImg = document.getElementById('RBMainImg');
    if (expandBtn && mainImg) {
      expandBtn.addEventListener('click', function () {
        var w = window.open(mainImg.src, '_blank');
        if (w) w.focus();
      });
    }
  }

  function activateThumb(thumb) {
    document.querySelectorAll('.rb-thumb').forEach(function (t) { t.classList.remove('rb-active'); });
    thumb.classList.add('rb-active');
    var src = thumb.getAttribute('data-src');
    setMainImage(src, thumb.querySelector('img') ? thumb.querySelector('img').alt : '');
  }

  function setMainImage(src, alt) {
    var img = document.getElementById('RBMainImg');
    if (!img || !src) return;
    img.style.opacity = '0.3';
    var newImg = new Image();
    newImg.src = src;
    newImg.onload = function () {
      img.src = src;
      if (alt) img.alt = alt;
      img.style.opacity = '1';
    };
  }

  function updateGalleryForVariant(variant) {
    if (!variant.featured_media || !_data) return;
    var mediaId = variant.featured_media.id;
    var matchedThumb = document.querySelector('.rb-thumb[data-media-id="' + mediaId + '"]');
    if (matchedThumb) {
      activateThumb(matchedThumb);
    }
  }

  /* ==========================================
     QTY STEPPER
     ========================================== */
  function initQty() {
    var input = document.getElementById('RBQtyInput');
    var minus = document.getElementById('RBQtyMinus');
    var plus = document.getElementById('RBQtyPlus');
    var formQty = document.getElementById('RBFormQty');
    if (!input) return;

    function updateQty(val) {
      input.value = Math.max(1, val);
      if (formQty) formQty.value = input.value;
      syncStickyQty();
    }

    minus.addEventListener('click', function () { updateQty(parseInt(input.value, 10) - 1); });
    plus.addEventListener('click', function () { updateQty(parseInt(input.value, 10) + 1); });
    input.addEventListener('change', function () {
      var v = parseInt(input.value, 10);
      updateQty(isNaN(v) ? 1 : v);
    });
  }

  /* ==========================================
     LIVE VISITOR COUNTER
     ========================================== */
  function initLiveCounter() {
    var el = document.getElementById('RBLiveCount');
    if (!el) return;
    var min = parseInt(el.getAttribute('data-min'), 10) || 8;
    var max = parseInt(el.getAttribute('data-max'), 10) || 40;
    var base = Math.floor(Math.random() * (max - min + 1)) + min;
    el.textContent = base;
    setInterval(function () {
      var delta = Math.random() > 0.5 ? 1 : -1;
      base = Math.max(min, Math.min(max, base + delta));
      el.textContent = base;
    }, 3500 + Math.random() * 2000);
  }

  /* ==========================================
     STICKY BAR
     ========================================== */
  function initStickyBar() {
    var bar = document.getElementById('RBStickyBar');
    var atcRow = document.querySelector('.rb-atc-row');
    if (!bar || !atcRow) return;

    var observer = new IntersectionObserver(function (entries) {
      bar.classList.toggle('rb-visible', !entries[0].isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(atcRow);

    /* Sticky qty */
    var stickyMinus = document.getElementById('RBStickyQtyMinus');
    var stickyPlus = document.getElementById('RBStickyQtyPlus');
    var stickyInput = document.getElementById('RBStickyQtyInput');
    if (stickyMinus && stickyInput) {
      stickyMinus.addEventListener('click', function () {
        var v = parseInt(stickyInput.value, 10) || 1;
        if (v > 1) { stickyInput.value = v - 1; syncMainQty(); }
      });
    }
    if (stickyPlus && stickyInput) {
      stickyPlus.addEventListener('click', function () {
        var v = parseInt(stickyInput.value, 10) || 1;
        stickyInput.value = v + 1;
        syncMainQty();
      });
    }

    /* Sticky option dropdowns */
    bar.querySelectorAll('.rb-sticky-option-select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var idx = parseInt(sel.getAttribute('data-option-index'), 10);
        _selectedOptions[idx] = sel.value;
        var matched = findVariant(_selectedOptions);
        if (matched) {
          _currentVariant = matched;
          applyVariant(matched);
          /* Mirror to main pills */
          var pills = document.querySelectorAll('.rb-pill[data-option-index="' + idx + '"]');
          pills.forEach(function (p) {
            var isMatch = p.getAttribute('data-value') === sel.value;
            p.classList.toggle('rb-selected', isMatch);
            p.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
          });
          /* Update label */
          var pos = idx + 1;
          var label = document.getElementById('RBOptVal' + pos);
          if (label) label.textContent = sel.value;
        }
      });
    });

    /* Sticky ATC */
    var stickyAtcBtn = document.getElementById('RBStickyAtcBtn');
    if (stickyAtcBtn) {
      stickyAtcBtn.addEventListener('click', function () {
        if (stickyInput) {
          var mainInput = document.getElementById('RBQtyInput');
          if (mainInput) mainInput.value = stickyInput.value;
          var formQty = document.getElementById('RBFormQty');
          if (formQty) formQty.value = stickyInput.value;
        }
        var mainAtc = document.getElementById('RBAtcBtn');
        if (mainAtc) mainAtc.click();
      });
    }
  }

  function syncStickyQty() {
    var main = document.getElementById('RBQtyInput');
    var sticky = document.getElementById('RBStickyQtyInput');
    if (main && sticky) sticky.value = main.value;
  }

  function syncMainQty() {
    var main = document.getElementById('RBQtyInput');
    var sticky = document.getElementById('RBStickyQtyInput');
    var form = document.getElementById('RBFormQty');
    if (main && sticky) main.value = sticky.value;
    if (form && sticky) form.value = sticky.value;
  }

  function syncStickyDropdowns() {
    if (!_currentVariant) return;
    (_currentVariant.options || []).forEach(function (val, idx) {
      var sel = document.getElementById('RBStickyOpt' + idx);
      if (sel) sel.value = val;
      /* Update sticky price */
      updateStickyPrice(_currentVariant);
    });
  }

  function updateStickyPrice(variant) {
    var el = document.getElementById('RBStickyPrice');
    if (el && variant) el.textContent = formatMoney(variant.price);
  }

  /* ==========================================
     BUY IT NOW
     ========================================== */
  function initBuyNow() {
    var btn = document.getElementById('RBBuyNow');
    if (!btn) return;
    btn.addEventListener('click', function () {
      if (!_currentVariant) return;
      var qty = document.getElementById('RBQtyInput');
      var qtyVal = qty ? qty.value : 1;
      window.location.href = '/checkout?' +
        'items[][id]=' + _currentVariant.id +
        '&items[][quantity]=' + qtyVal;
    });
  }

  /* ==========================================
     FAKE ORDERS TOAST
     ========================================== */
  function initFakeOrders() {
    var config = document.getElementById('RBFakeOrdersConfig');
    var toast = document.getElementById('RBOrderToast');
    if (!toast) return;

    var enable = !config || config.getAttribute('data-enable') !== 'false';
    if (!enable) return;

    var showDelay = config ? (parseInt(config.getAttribute('data-show-delay'), 10) || 3) : 3;
    var cycleInterval = config ? (parseInt(config.getAttribute('data-cycle'), 10) || 10) : 10;

    /* Names */
    var names = ['Hina', 'Sara', 'Amna', 'Zara', 'Nida', 'Rabia', 'Maryam', 'Fatima', 'Sana', 'Aisha'];
    var cities = ['Multan', 'Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Peshawar', 'Sialkot', 'Rawalpindi', 'Gujranwala', 'Hyderabad'];
    var times = ['2 minutes ago', '7 minutes ago', '12 minutes ago', '23 minutes ago', '44 minutes ago', '1 hour ago', '3 hours ago'];

    if (config) {
      var cn = config.getAttribute('data-custom-names');
      var cc = config.getAttribute('data-custom-cities');
      if (cn && cn.trim()) names = cn.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      if (cc && cc.trim()) cities = cc.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    }

    /* Product name — use current product title from page */
    var productTitle = document.querySelector('.rb-title') ? document.querySelector('.rb-title').textContent.trim().toUpperCase() : 'THIS PRODUCT';

    var closeBtn = document.getElementById('RBToastClose');
    if (closeBtn) closeBtn.addEventListener('click', function () { toast.classList.add('rb-hidden'); });

    var idx = 0;
    function showNext() {
      var name = names[idx % names.length];
      var city = cities[Math.floor(Math.random() * cities.length)];
      var time = times[Math.floor(Math.random() * times.length)];

      var nameEl = document.getElementById('RBToastName');
      var buyerEl = document.getElementById('RBToastBuyer');
      var prodEl = document.getElementById('RBToastProduct');
      var timeEl = document.getElementById('RBToastTime');
      var imgEl = document.getElementById('RBToastImg');

      if (nameEl) nameEl.textContent = name;
      if (buyerEl) buyerEl.textContent = name + ' (' + city + ')';
      if (prodEl) prodEl.textContent = productTitle;
      if (timeEl) timeEl.textContent = time;

      /* Use main gallery image */
      var mainImg = document.getElementById('RBMainImg');
      if (imgEl && mainImg) imgEl.src = mainImg.src;

      toast.classList.remove('rb-hidden');
      setTimeout(function () { toast.classList.add('rb-hidden'); }, 5000);

      idx++;
      setTimeout(showNext, (cycleInterval + Math.floor(Math.random() * 8)) * 1000);
    }

    setTimeout(showNext, showDelay * 1000);
  }

  /* ==========================================
     ATC FORM — AJAX support (reuse theme cart)
     ========================================== */
  function initProductForm() {
    var form = document.getElementById('rb-product-form-' + (document.querySelector('[data-section-id]') ? document.querySelector('[data-section-id]').getAttribute('data-section-id') : ''));
    if (!form) {
      /* fallback: find any rb-form */
      form = document.querySelector('.rb-form');
    }
    if (!form) return;

    form.addEventListener('submit', function (e) {
      /* If the theme has AJAX cart, delegate to it */
      if (window.routes && window.routes.cart_add_url) {
        /* Dawn theme AJAX — dispatch custom event to trigger theme cart */
        var atcBtn = document.getElementById('RBAtcBtn');
        if (atcBtn) {
          /* Allow native form submit — Dawn handles it via product-form web component */
        }
      }
    });
  }

  /* ==========================================
     INIT
     ========================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initVariantEngine();
    initGallery();
    initQty();
    initLiveCounter();
    initStickyBar();
    initBuyNow();
    initFakeOrders();
    initProductForm();
  });

})();
