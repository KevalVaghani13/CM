/**
 * Shoppable Product Card Thumbs - Toggle Cards & Dots
 */
if (!customElements.get('shoppable-product-card-thumb')) {
  class ShoppableProductCardThumb extends HTMLElement {
    constructor() {
      super();
      if (Shopify.designMode) {
        window.addEventListener('shopify:section:load', this.init.bind(this));
      }
      this.init();
    }

    init() {
      this.parentDiv = this.closest('section');
      this.isListLayout = this.parentDiv.className.includes('shoppable-section__list')
      this.toggleState = false;
      this.productHolderElement = this.getProductHolderElement();
      this.productHolderDrawer = this.closest('shoppable-drawer')?.querySelector('.shoppable-drawer__product--holder');
      this.blockProductId = this.getAttribute('data-card-id');
      this.productHandle = this.getAttribute('data-product');
      this.querySelector('.button__shoppable-product-card').addEventListener(
        'click',
        this.toggle.bind(this)
      )
    }

    toggle(event) {
      this.reset();
      if (!this.toggleState) {
        this.open(event);
      } else {
        this.close();
      }
    }

    open(event) {
      this.showProduct();
      this.toggleState = true;
      this.classList.add('is--active');
      this.parentElement.classList.add('is--active');
      if (this.productHandle !== 'placeholder')
        document.getElementById(`shoppable__dot-${this.blockProductId}`)?.classList.add('is--active');
      this.toggleAriaExpanded(event);
    }

    close() {
      this.hideProduct();
      this.toggleState = false;
      this.classList.remove('is--active');
      this.parentElement.classList.remove('is--active');
      if (this.productHandle !== 'placeholder')
        document.getElementById(`shoppable__dot-${this.blockProductId}`)?.classList.remove('is--active');
      this.toggleAriaExpanded();
      if (window.innerWidth >= 989) {
        requestAnimationFrame(() => {
          const shoppableBlock = this.closest('.shoppable-block');
          if (shoppableBlock) {
            shoppableBlock.removeAttribute('style');
          }
        });
      }
    }

    toggleAriaExpanded(event) {
      if (event) {
        event.target.closest('button').setAttribute('aria-expanded', true);
        document.querySelectorAll('.button__shoppable-product-card--back').forEach((button) => {
          button.setAttribute('aria-expanded', true);
        });
      } else {
        document.querySelectorAll('[aria-controls="shoppable-product-card-thumb"]').forEach((button) => {
          button.setAttribute('aria-expanded', false);
        });
      }
    }

    reset() {
      this.closest('.shoppable-block')?.querySelectorAll('shoppable-product-card-thumb').forEach(el => {
        if (this.blockProductId !== el.getAttribute('data-card-id')) {
          el.close();
        }
      });
    }

    showProduct() {
      this.productCard = this.closest('.shopify-section').querySelector('.shoppable__product-card--holder').querySelector(
        `[data-product-handle='${this.productHandle}']`
      ).cloneNode(true);

      this.productCard.setAttribute('data-card-id', this.blockProductId);
      this.productCard.querySelector('button.button__shoppable-product-card--back').addEventListener('click', this.close.bind(this));
      if (window.innerWidth > 990) {
        this.productHolderElement?.appendChild(this.productCard);
      } else {
        if (this.isListLayout) {
          this.productHolderDrawer = this.closest(`#${this.parentDiv.id}`).querySelector('.shoppable-drawer__product--holder');
          this.productHolderDrawer.innerHTML = '';
          this.productHolderDrawer.appendChild(this.productCard);
          this.closest(`#${this.parentDiv.id}`).querySelector('shoppable-drawer').openProduct();
        } else {
          this.productHolderDrawer.innerHTML = '';
          this.productHolderDrawer.appendChild(this.productCard);
          this.closest('shoppable-drawer').openProduct();
        }
      }

      this.closest('.shopify-section').addEventListener('slideChanged', () => {
        this.close();
      })

      requestAnimationFrame(() => {
        if (window.innerWidth > 989 && this.isListLayout) {
          const productSelector = this.productCard.querySelector('.product-selector__variant-picker');
          if (productSelector && productSelector.offsetHeight > 0) {
            const shoppableBlock = productSelector.closest('.shoppable-block');
            if (shoppableBlock) {
              shoppableBlock.style.setProperty('--shoppable-block-padding-block', '0');
              shoppableBlock.style.paddingBlock = '96px 150px';
            }
          }
        }
      });
    }

    hideProduct() {
      if (window.innerWidth > 990) {
        this.productHolderElement.innerHTML = '';
      } else if (this.isListLayout) {
        this.closest(`#${this.parentDiv.id}`).querySelector('shoppable-drawer').closeProduct();
      } else {
        this.closest('shoppable-drawer').closeProduct();
      }
    }

    getProductHolderElement() {
      if (this.closest('.shoppable-block__products'))
       return this.closest('.shoppable-block__products').querySelector('.shoppable-block__product--holder');
    }

  }

  customElements.define('shoppable-product-card-thumb', ShoppableProductCardThumb );
}

/**
 * Shoppable Product Card Extended - Variants & Cart Form
 */
if (!customElements.get('shoppable-product-card')) {
  class ShoppableProductCard extends HTMLElement {
    constructor() {
      super();
      if (Shopify.designMode) {
        window.addEventListener('shopify:section:load', this.init.bind(this));
      }
      this.init();
    }

    init() {
      if (this.closest('.shoppable__product-card--holder')) { return; }
      // variants
      if (this.querySelector('.product-selector')) this.initVariantSelector();
      // form
      this.querySelector('form').addEventListener(
        'submit',
        this.submitForm.bind(this)
      )
    }

    /**
     * Set variants changes
     */
    initVariantSelector() {
      if (this.querySelector('[type="application/json"]')) {
        this.variants = JSON.parse(this.querySelector('[type="application/json"]').textContent);
      }
      this.querySelector('.product-selector').addEventListener('change', this.onVariantChange.bind(this));
      // this.onVariantChange();
    }

    onVariantChange() {
      this.updateOptions();
      if (this.currentVariant === this.getVariantData()) return;
      this.updateVariant();
      this.updateVariantStatuses();
      this.updateVariantImage();
    }

    updateOptions() {
      this.querySelectorAll('input[type="radio"]').forEach(input => {
        input.nextElementSibling.classList.toggle(
          'is-active',
          input.checked
        );
      });
      this.options = Array.from(
        this.querySelectorAll('input[type="radio"]:checked'),
        el => ({ name: el.dataset.name || el.name, value: el.value })
      );
    }

    updateVariant() {
      this.currentVariant = this.getVariantData();
      this.querySelector('[name="id"]').value = this.currentVariant.id;
      if (this.currentVariant.available) {
        this.querySelector('button[type="submit"]').disabled = false;
      } else {
        this.querySelector('button[type="submit"]').disabled = true;
      }
    }

    updateVariantImage() {
      this.querySelectorAll('[data-product-images]').forEach(el => {
        el.classList.toggle('hidden',
        !el.getAttribute('data-product-images').includes(this.currentVariant.id));
      });
    }

    getVariantData() {
      return this.options.length
        ? this.variants.find(variant => !variant.options.map((option, index) => this.options[index] && this.options[index].value === option).includes(false))
        : this.variants[0];
    }

    updateVariantStatuses() {
      const optionOneValue = this.querySelector('.product-selector fieldset').querySelector(':checked').value;
      const selectedOptionOneVariants = this.variants.filter(variant => optionOneValue === variant.option1);
      const inputWrappers = [...this.querySelectorAll('.product-selector fieldset')];
      inputWrappers.forEach((option, index) => {
        if (index === 0) return;
        const previousOptionSelected =
          inputWrappers[index - 1].querySelector(':checked').value;
        const listOfAvailableOptions = selectedOptionOneVariants
          .filter(
            variant =>
              variant.available &&
              variant[`option${index}`] === previousOptionSelected
          )
          .map(variantOption => variantOption[`option${index + 1}`]);
        option.querySelectorAll('input[type="radio"]').forEach(input => {
          const inputIsDisabled = !listOfAvailableOptions.includes(input.value);
          input.disabled = inputIsDisabled;
        });
      });
    }

    /**
     * Submit add to cart form
     */
    submitForm(event) {
      event.preventDefault();
      this.submitButton = this.querySelector('button[type="submit"]')

      const formData = new FormData(event.target);
      formData.delete('options[Size]');
      for (let [key, value] of formData) {
        if (key.includes('options')) formData.delete(key);
      }
      formData.append(
        'sections',
        document.querySelector('cart-drawer')
          .getSectionsToRender()
          .map(section => section.section)
      );

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];
      config.body = formData;

      this.submitButton.classList.add('disabled');

      fetch(`${routes.cart_add_url}`, config)
        .then(response => response.json())
        .then(response => {
          if (response.status) {
            this.handleErrorMessage(response.description);
            return;
          }

        document.querySelector('cart-drawer').renderContents(response);
        })
        .catch(error => {
          console.error(error);
        })
        .finally(() => {
          this.submitButton.classList.remove('disabled');
        });
    }

    handleErrorMessage(errorMessage = false) {
      const errorWrapper = this.querySelector('[data-error-wrapper]');
      if (!errorWrapper) return;
      errorWrapper.classList.toggle('hidden', !errorMessage);
      errorWrapper.textContent = errorMessage || '';
      setTimeout(() => {
        errorWrapper.textContent = '';
        errorWrapper.classList.toggle('hidden');
      }, 5000);
    }
  }

  customElements.define('shoppable-product-card', ShoppableProductCard );
}
