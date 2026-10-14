if (!customElements.get('faq-accordion')) {
  class FaqAccordion extends HTMLElement {
    constructor() {
      super();
      this.onClick = this.onClick.bind(this);
      this.onKeydown = this.onKeydown.bind(this);
    }

    connectedCallback() {
      this.addEventListener('click', this.onClick);
      this.addEventListener('keydown', this.onKeydown);
    }

    disconnectedCallback() {
      this.removeEventListener('click', this.onClick);
      this.removeEventListener('keydown', this.onKeydown);
    }

    get allowMultiple() {
      return this.dataset.allowMultiple === 'true';
    }

    get buttons() {
      return Array.from(this.querySelectorAll('[data-faq-button]'));
    }

    onClick(event) {
      const button = event.target.closest('[data-faq-button]');
      if (!button || !this.contains(button)) return;

      const item = button.closest('[data-faq-item]');
      const willOpen = !item.classList.contains('active');

      if (!this.allowMultiple) {
        this.buttons.forEach((otherButton) => {
          if (otherButton !== button) this.setOpen(otherButton, false);
        });
      }

      this.setOpen(button, willOpen);
    }

    // Optional WAI-ARIA accordion keys: move focus between question buttons.
    // Enter/Space toggling is native to <button>.
    onKeydown(event) {
      const buttons = this.buttons;
      const index = buttons.indexOf(event.target);
      if (index === -1) return;

      let next;
      switch (event.key) {
        case 'ArrowDown':
          next = buttons[(index + 1) % buttons.length];
          break;
        case 'ArrowUp':
          next = buttons[(index - 1 + buttons.length) % buttons.length];
          break;
        case 'Home':
          next = buttons[0];
          break;
        case 'End':
          next = buttons[buttons.length - 1];
          break;
        default:
          return;
      }

      event.preventDefault();
      next.focus();
    }

    setOpen(button, open) {
      button.closest('[data-faq-item]').classList.toggle('active', open);
      button.setAttribute('aria-expanded', String(open));
    }
  }

  customElements.define('faq-accordion', FaqAccordion);
}
