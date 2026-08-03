/**
 * Custom Footer Accordion JavaScript
 * Handles keyboard-accessible accordion behavior for mobile screen sizes (<= 768px).
 * Prevents native Dawn footer script interference and ensures standard compliance.
 */
document.addEventListener('DOMContentLoaded', () => {
  const customFooter = document.querySelector('.custom-footer');
  if (!customFooter) return;

  const accordionTitles = customFooter.querySelectorAll('.accordion-title');

  // Initialize accessibility attributes
  const initAccordion = () => {
    const isMobile = window.innerWidth <= 768;

    accordionTitles.forEach((title) => {
      // The newsletter column remains permanently open and is non-interactive
      if (title.closest('.newsletter')) {
        title.removeAttribute('role');
        title.removeAttribute('tabindex');
        title.removeAttribute('aria-expanded');
        title.removeAttribute('aria-controls');
        return;
      }

      const content = title.nextElementSibling;
      let contentId = '';
      if (content && content.classList.contains('accordion-content')) {
        contentId = content.id;
        if (!contentId) {
          contentId = `custom-footer-accordion-${Math.random().toString(36).substr(2, 9)}`;
          content.id = contentId;
        }
      }

      if (isMobile) {
        title.setAttribute('role', 'button');
        title.setAttribute('tabindex', '0');
        title.setAttribute('aria-controls', contentId);
        
        // Determine starting state based on 'active' class on parent
        const isExpanded = title.parentElement.classList.contains('active') ? 'true' : 'false';
        title.setAttribute('aria-expanded', isExpanded);
      } else {
        // Remove interactive properties on desktop
        title.removeAttribute('role');
        title.removeAttribute('tabindex');
        title.removeAttribute('aria-expanded');
        title.removeAttribute('aria-controls');
      }
    });
  };

  // Toggle Accordion Function
  const toggleAccordion = (title) => {
    if (window.innerWidth > 768) return;
    if (title.closest('.newsletter')) return;

    const parent = title.parentElement;
    const isCurrentlyActive = parent.classList.contains('active');

    // Toggle active state
    parent.classList.toggle('active');
    title.setAttribute('aria-expanded', !isCurrentlyActive ? 'true' : 'false');
  };

  // Setup click and keydown handlers
  customFooter.addEventListener('click', (e) => {
    const title = e.target.closest('.accordion-title');
    if (title) {
      toggleAccordion(title);
    }
  });

  customFooter.addEventListener('keydown', (e) => {
    const title = e.target.closest('.accordion-title');
    if (title && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggleAccordion(title);
    }
  });

  // Run on load and debounced resize
  initAccordion();
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initAccordion, 100);
  });
});
