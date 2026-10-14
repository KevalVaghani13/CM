
const createCookie = (name, value, days) => {
  var expires = '';
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
};
/**
 * Get cookie data.
 * @param {String} name
 * @returns {String|Null}|
 */
const getUserCookie = name => {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0)
      return c.substring(nameEQ.length, c.length);
  }
  return null;
};
class AgeVerificationPopup extends ModalDialog {
  constructor() {
    super();
    this.closed = getUserCookie('age-verification-closed');
    this.newsletterPopup = document.getElementById(
      'NewsletterModal-newsletter-popup'
    );
    if (!this.closed && !Shopify.designMode) {
      document.body.style.pointerEvents = 'none';
    }
  }

  connectedCallback() {
    if (Shopify.designMode) {
      if (this.dataset.openInDesignMode === 'true') {
        this.show();
      }
      return;
    }

    setTimeout(() => {
      if (this.closed !== null) return;
      if (this.newsletterPopup) {
        this.newsletterPopup.classList.add(
          'newsletter-popup-is-hidden'
        );
      }
      this.show();
    }, 1000);
  }

  hide() {
    super.hide();
    document.body.style.pointerEvents = '';
    this.newsletterPopup?.classList.remove(
      'newsletter-popup-is-hidden'
    );
    createCookie('age-verification-closed', 'true');
  }
}

customElements.define('age-verification-popup', AgeVerificationPopup);
