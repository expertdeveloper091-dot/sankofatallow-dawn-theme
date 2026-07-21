if (!customElements.get('cart-drawer')) {
  class CartDrawer extends HTMLElement {
    constructor() {
      super();

      this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
      const overlay = this.querySelector('#CartDrawer-Overlay');
      if (overlay) overlay.addEventListener('click', this.close.bind(this));
      this.setHeaderCartIconAccessibility();
    }

    setHeaderCartIconAccessibility() {
      const cartLink = document.querySelector('#cart-icon-bubble');
      if (!cartLink) return;

      cartLink.setAttribute('role', 'button');
      cartLink.setAttribute('aria-haspopup', 'dialog');
      cartLink.addEventListener('click', (event) => {
        event.preventDefault();
        this.open(cartLink);
      });
      cartLink.addEventListener('keydown', (event) => {
        if (event.code.toUpperCase() === 'SPACE') {
          event.preventDefault();
          this.open(cartLink);
        }
      });
    }

    open(triggeredBy) {
      if (triggeredBy) this.setActiveElement(triggeredBy);
      const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
      if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
      setTimeout(() => {
        this.classList.add('animate', 'active');
      });

      this.addEventListener(
        'transitionend',
        () => {
          const containerToTrapFocusOn = this.classList.contains('is-empty')
            ? this.querySelector('.drawer__inner-empty')
            : document.getElementById('CartDrawer');
          const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
          if (typeof trapFocus === 'function') {
            trapFocus(containerToTrapFocusOn, focusElement);
          }
        },
        { once: true }
      );

      document.body.classList.add('overflow-hidden');

      this.querySelector('cart-drawer-items')?.dispatchViewEvent();
    }

    close() {
      this.classList.remove('active');
      if (typeof removeTrapFocus === 'function') {
        removeTrapFocus(this.activeElement);
      }
      document.body.classList.remove('overflow-hidden');
    }

    setSummaryAccessibility(cartDrawerNote) {
      cartDrawerNote.setAttribute('role', 'button');
      cartDrawerNote.setAttribute('aria-expanded', 'false');

      if (cartDrawerNote.nextElementSibling.getAttribute('id')) {
        cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
      }

      cartDrawerNote.addEventListener('click', (event) => {
        event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
      });

      cartDrawerNote.parentElement.addEventListener('keyup', (onKeyUp) => {
        if (onKeyUp.code.toUpperCase() !== 'ESCAPE') return;
        const openDetailsElement = onKeyUp.target.closest('details[open]');
        if (!openDetailsElement) return;

        const summaryElement = openDetailsElement.querySelector('summary');
        openDetailsElement.removeAttribute('open');
        summaryElement.setAttribute('aria-expanded', 'false');
        summaryElement.focus();
      });
    }

    renderContents(parsedState) {
      this.querySelector('.drawer__inner')?.classList.remove('is-empty');
      this.productIdToFocus = parsedState.id;
      if (parsedState.sections) {
        this.getSectionsToRender().forEach((section) => {
          const sectionElement = section.selector
            ? document.querySelector(section.selector)
            : document.getElementById(section.id);
          if (sectionElement && parsedState.sections[section.id]) {
            sectionElement.innerHTML = this.getSectionInnerHTML(
              parsedState.sections[section.id],
              section.selector
            );
          }
        });
      }

      setTimeout(() => {
        const overlay = this.querySelector('#CartDrawer-Overlay');
        if (overlay) overlay.addEventListener('click', this.close.bind(this));
        this.open();
      });
    }

    getSectionInnerHTML(html, selector = '.shopify-section') {
      return new DOMParser().parseFromString(html, 'text/html').querySelector(selector)?.innerHTML || '';
    }

    getSectionsToRender() {
      return [
        {
          id: 'CartDrawer',
          section: 'cart-drawer',
          selector: '.drawer__inner',
        },
        {
          id: 'cart-icon-bubble',
          section: 'cart-icon-bubble',
          selector: '.shopify-section',
        },
      ];
    }

    getActiveElement() {
      return this.activeElement;
    }

    setActiveElement(element) {
      this.activeElement = element;
    }
  }

  customElements.define('cart-drawer', CartDrawer);

  // Define CartDrawerItems safely extending CartItems or HTMLElement fallback
  const BaseCartItems = typeof CartItems !== 'undefined' ? CartItems : HTMLElement;
  class CartDrawerItems extends BaseCartItems {
    getSectionsToRender() {
      return [
        {
          id: 'CartDrawer',
          section: 'cart-drawer',
          selector: '.drawer__inner',
        },
        {
          id: 'cart-icon-bubble',
          section: 'cart-icon-bubble',
          selector: '.shopify-section',
        },
      ];
    }
  }

  if (!customElements.get('cart-drawer-items')) {
    customElements.define('cart-drawer-items', CartDrawerItems);
  }
}
