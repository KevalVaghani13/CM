class AnnouncementBarDropdown extends HTMLElement {
  constructor() {
    super();
    const toggleButton = document.querySelector(
      '.bar__content-container-dropdown'
    );
    const closeButton = this.querySelector(
      '#NavClose-AnnouncementDropdown'
    );
    toggleButton.addEventListener('click', e => {
      e.preventDefault();
      this.openDropdown(toggleButton);
    });
    closeButton.addEventListener('click', e => {
      e.preventDefault();
      this.closeDropdown(toggleButton);
    });
  }
  openDropdown(toggleButton) {
    const isDropdownOpen = this.hasAttribute('open');
    const isMobile = window.innerWidth <= 750;
    if (!isDropdownOpen) {
      this.setAttribute('open', '');
      this.classList.add('dropdown-open');
      toggleButton.classList.add('is-active');
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      this.removeAttribute('open');
      this.classList.remove('dropdown-open');
      toggleButton.classList.remove('is-active');
      if (isMobile) {
        document.body.style.overflow = '';
      }
    }
  }
  closeDropdown(toggleButton) {
    const isDropdownOpen = this.hasAttribute('open');
    const isMobile = window.innerWidth <= 750;
    if (isDropdownOpen) {
      this.removeAttribute('open');
      this.classList.remove('dropdown-open');
      toggleButton.classList.remove('is-active');
      if (isMobile) {
        document.body.style.overflow = '';
      }
    }
  }
}

customElements.define('announcement-bar-dropdown', AnnouncementBarDropdown);
