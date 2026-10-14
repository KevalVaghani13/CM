if (!customElements.get('faq-tile')) {
  class FaqTile extends HTMLElement {
    constructor() {
      super();
      this.faqPageTitle = null;
      this.faqTileButtonDiv = null;
      this.faqPageHeader = null;
      this.allFaqTiles = [];
      this.faqTilesContainer = [];
      this.faqContentElements = [];
      this.faqListElements = [];
      this.backButton = null;
      this.sidebarElement = null;
      this.uniqueFaqTextsArray = [];
      this.subtitleTextsArray = [];
      this.subtitleContentArray = [];
      this.allTitles = [];
    }

    connectedCallback() {
      this.initElements();
      this.setupFaqTileWrapper();
      this.setupEventListeners();
      this.setupSearchFunctionality();
    }

    initElements() {
      this.faqPageTitle = document.querySelector('.faq-page-title');
      this.faqTileButtonDiv = document.querySelector('div[id*="faq_tile_button"].shopify-section');
      this.faqPageHeader = document.querySelector('.faq_header');
      this.allFaqTiles = document.querySelectorAll('.section-faq-tile');
      this.faqTilesContainer = document.querySelectorAll('.page-container .faq-tile');
      this.faqContentElements = document.querySelectorAll('.faq-tile__content');
      this.faqListElements = document.querySelectorAll('.faq-tile__list');
      this.backButton = document.querySelector('.faq-tile__list--back-button');
      this.sidebarElement = document.querySelector('.faq-tile__list--sidebar');
    }

    setupFaqTileWrapper() {
      if (this.allFaqTiles.length === 0) return;

      let wrapper = document.querySelector('.section-faq-tile-wrapper');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.classList.add('section-faq-tile-wrapper', 'container');

        const firstFaqTile = this.allFaqTiles[0];
        const parentElement = firstFaqTile.parentNode;
        parentElement.insertBefore(wrapper, firstFaqTile);
      }

      this.allFaqTiles.forEach(tile => {
        wrapper.appendChild(tile);
      });

      if (this.faqTileButtonDiv) {
        this.faqTileButtonDiv.style.display = 'none';
      }

      if (this.faqPageTitle && this.faqPageTitle.classList.contains('hidden')) {
        this.faqPageTitle.classList.remove('hidden');
        const faqPageTitleClone = this.faqPageTitle;
        this.faqPageTitle.remove();

        const faqTilesWithId = document.querySelector('div[id*="__faq_tile_"]');
        faqTilesWithId.before(faqPageTitleClone.cloneNode(true));
      }
    }

    scrollToFirstTile() {
      if (window.innerWidth < 990) {
        const faqTileWrapper = document.querySelector('.faq-tile__list');
        if (faqTileWrapper) {
          const headerHeight = document.querySelector('header')?.offsetHeight || 0;
          const offset = faqTileWrapper.getBoundingClientRect().top + window.scrollY - headerHeight - 32;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        }
      }
    }

    setupEventListeners() {
      if (this.backButton) {
        this.backButton.addEventListener('click', this.handleBackButtonClick.bind(this));
      }

      this.faqContentElements.forEach(content => {
        const urlHandle = content.dataset.urlHandle;
        const media = content.querySelector('.faq-tile__content--media');
        const text = content.querySelector('.faq-tile__content--title');

        const addUrlHandleToUrl = () => {
          if (urlHandle) {
            const currentUrl = new URL(window.location);
            currentUrl.hash = urlHandle;
            window.history.pushState({}, '', currentUrl);
          }
        };

        if (media) {
          media.addEventListener('click', event => {
            this.handleMediaClick(event);
            addUrlHandleToUrl();
          });
        }

        if (text) {
          text.addEventListener('click', event => {
            this.hideAllShowList(event);
            addUrlHandleToUrl();
          });
        }
      });
    }

    handleBackButtonClick() {
      const faqTiles = document.querySelectorAll('.faq-tile');

      if (this.faqTileButtonDiv) {
        this.faqTileButtonDiv.style.display = 'block';
      }

      if (this.faqPageHeader) {
        this.faqPageHeader.style.display = 'block';
      }

      if (this.faqTilesContainer) {
        this.faqTilesContainer.forEach(tile => {
          tile.style.width = '';
        });
      }

      this.faqListElements.forEach(list => {
        list.style.display = 'none';
      });

      if (this.faqPageTitle && this.faqPageTitle.classList.contains('hidden')) {
        this.faqPageTitle.classList.remove('hidden');
      }

      if (window.innerWidth < 989 && this.faqTilesContainer) {
        this.faqTilesContainer.forEach(tile => {
          tile.style.width = '100%';
        });
      }

      const allFaqSections = document.querySelectorAll('.faq-tile');
      allFaqSections.forEach(faqSection => {
        const shopifySection = faqSection.closest('[id^="shopify-section-template"]');
        shopifySection.style.width = '';
        shopifySection.style.flex = '';
      });

      const backButtons = document.querySelectorAll('.faq-tile__list--back-button');
      backButtons.forEach(button => {
        button.style.display = 'none';
      });

      this.faqContentElements.forEach(list => {
        list.style.display = 'flex';
      });

      faqTiles.forEach(div => {
        div.classList.add('faq-tile-wrapper');
        div.classList.remove('hidden');
      });

      // close all details elements
      const allDetails = document.querySelectorAll('.faq-details');
      allDetails.forEach(details => {
        details.removeAttribute('open');
      });
    }

    handleMediaClick(event) {
      const faqTileWrappers = document.querySelectorAll('.faq-tile-wrapper');
      const faqTiles = document.querySelectorAll('.faq-tile');

      faqTileWrappers.forEach(div => {
        div.classList.remove('faq-tile-wrapper');
      });

      faqTiles.forEach((tile, index) => {
        if (index !== faqTiles.length - 1) {
          tile.style.marginInlineEnd = '';
        }
      });

      const faqTileDiv = document.querySelector('div[id*="_faq_tile_"]');
      if (faqTileDiv) {
        faqTileDiv.style.display = 'flex';
      }

      if (this.faqPageTitle) {
        this.faqPageTitle.classList.add('hidden');
      }

      const faqContent = event.target.closest('.faq-tile__content');
      if (faqContent) {
        const titleElement = faqContent.querySelector('.faq-tile__content--title');
        titleElement.click();
      }
    }

    hideAllShowList(event) {
      this.scrollToFirstTile();

      const faqTileTitles = document.querySelectorAll('.faq-tile__content--title');
      faqTileTitles.forEach(title => {
        title.addEventListener('click', e => {
          e.stopPropagation();
          this.scrollToFirstTile();
        });
      });

      if (this.faqPageHeader) {
        this.faqPageHeader.style.display = 'none';
      }

      if (this.faqTileButtonDiv) {
        this.faqTileButtonDiv.style.display = 'block';
      }

      if (this.faqPageTitle) {
        this.faqPageTitle.classList.add('hidden');
      }

      if (this.faqTilesContainer) {
        this.faqTilesContainer.forEach(tile => {
          if (window.innerWidth <= 990) {
            tile.style.width = '100%';
          } else {
            tile.style.width = 'auto';
          }
        });
      }

      const allFaqSections = document.querySelectorAll('.faq-tile');
      allFaqSections.forEach((faqSection, index) => {
        if (index != 0) {
          faqSection.classList.add('hidden');
        }

        this.collectFaqData(faqSection);

        this.backButton.style.display = 'flex';

        const backButtons = document.querySelectorAll('.faq-tile__list--back-button');
        backButtons.forEach((button, index) => {
          if (index > 0) {
            button.style.display = 'none';
          }
        });

        const shopifySection = faqSection.closest('[id^="shopify-section-template"]');
        if (shopifySection) {
          shopifySection.style.width = '100%';
          shopifySection.style.flex = '1 0 100%';
        }
      });

      this.buildFaqList();

      const clickedTitle = event?.target.textContent.trim();
      this.highlightClickedTitle(clickedTitle);

      const contentElement = document.querySelector('.faq-tile__list--content');
      if (contentElement) {
        contentElement.innerHTML = '';
      }

      this.faqContentElements.forEach(c => {
        c.style.display = 'none';
      });

      this.faqListElements.forEach(list => {
        list.style.display = 'flex';
      });

      this.collapseSidebar();

      // update url hash
      const urlHandle = event?.target.closest('.faq-tile__content')?.dataset.urlHandle;
      if (urlHandle) {
        const currentUrl = new URL(window.location);
        currentUrl.hash = urlHandle;
        window.history.pushState({}, '', currentUrl);
      }
    }
    collectFaqData(faqSection) {
      const faqTextItems = faqSection.querySelectorAll('.faq-tile__content--title');

      faqTextItems.forEach(item => {
        const parentElement = item.parentElement;
        const urlHandle = parentElement.dataset.urlHandle;
        const text = item.textContent.trim();

        const faqItem = { text, urlHandle };

        if (!this.uniqueFaqTextsArray.some( entry => entry.text === text && entry.urlHandle === urlHandle )) {
          this.uniqueFaqTextsArray.push(faqItem);
        }
      });

      const subtitleElement = faqSection.querySelector('.faq-tile__content--subtitle');
      if (subtitleElement) {
        const subtitleItems = subtitleElement.querySelectorAll('div');
        subtitleItems.forEach(div => {
          const subtitleText = div.textContent.trim();
          if (subtitleText && !this.subtitleTextsArray.includes(subtitleText)) {
            this.subtitleTextsArray.push(subtitleText);
          }
        });
      }

      const subtitleContent = faqSection.querySelector('.faq-tile__content--subtitle-content');
      if (subtitleContent) {
        const subtitleContentItems = subtitleContent.querySelectorAll('div');
        subtitleContentItems.forEach(div => {
          const subtitleContent = div.innerHTML.trim();
          if (subtitleContent && !this.subtitleContentArray.includes(subtitleContent)) {
            this.subtitleContentArray.push(subtitleContent);
          }
        });
      }
    }

    buildFaqList() {
      const result = this.subtitleContentArray.reduce(
        (obj, htmlContent, index) => {
          obj[index] = htmlContent.split('\n');
          return obj;
        },
        {}
      );

      this.allTitles = this.uniqueFaqTextsArray.map((faq, index) => {
        return {
          title: faq.text,
          subtitle: this.subtitleTextsArray[index].split('\n'),
          description: result[index],
          urlHandle: faq.urlHandle
        };
      });

      const contentElement = document.querySelector('.faq-tile__list--content');
      if (this.sidebarElement && contentElement) {
        this.sidebarElement.innerHTML = '';
        contentElement.innerHTML = '';

        this.createFaqTitleElements(contentElement);

        this.handleUrlHash();
      }
    }

    handleUrlHash() {
      const currentHash = window.location.hash.substring(1);
      if (!currentHash) return;

      const allDetails = document.querySelectorAll('details.faq-details');
      allDetails.forEach(details => {
        details.removeAttribute('open');
        const summary = details.querySelector('summary');
        if (summary) {
          summary.classList.remove('active');
        }
      });

      const targetDetails = document.querySelector(`details.faq-details[data-url-handle="${currentHash}"]`);

      if (targetDetails) {
        targetDetails.setAttribute('open', '');
        const summary = targetDetails.querySelector('summary');
        if (summary) {
          summary.classList.add('active');
        }

        const firstSubtitle = targetDetails.querySelector('.faq-tile__list--subtitle');
        if (firstSubtitle) {
          firstSubtitle.click();
        }
      } else {
        console.warn(`Details element with data-url-handle="${currentHash}" not found.`);
      }
    }

    createChevronIcon() {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '20');
      svg.setAttribute('height', '20');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.innerHTML = `<path d="M6 9l6 6 6-6" stroke="black" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>`;
      svg.style.transition = 'transform 0.3s ease';
      svg.classList.add('large-up-hide');
      svg.classList.add('faq-chevron');
      return svg;
    }

    createFaqTitleElements(contentElement) {
      this.allTitles.forEach((item, titleIndex) => {

        const detailsElement = document.createElement('details');
        detailsElement.classList.add('faq-details');
        // add data-url-handle attribute to details element
        detailsElement.setAttribute('data-url-handle', item.urlHandle);

        const summaryElement = document.createElement('summary');
        summaryElement.textContent = item.title;
        summaryElement.classList.add('faq-tile__list--title');

        const chevronIcon = this.createChevronIcon();
        summaryElement.appendChild(chevronIcon);

        detailsElement.appendChild(summaryElement);
        this.sidebarElement.appendChild(detailsElement);

        detailsElement.addEventListener('toggle', () => {
          const isOpen = detailsElement.hasAttribute('open');

          if (isOpen) {
            summaryElement.classList.add('active');

            const allDetails = this.sidebarElement.querySelectorAll('.faq-details');
            allDetails.forEach(otherDetails => {
              if (otherDetails !== detailsElement) {
                otherDetails.removeAttribute('open');
                const otherSummary = otherDetails.querySelector('summary');
                otherSummary.classList.remove('active');
              }
            });

            const firstSubtitle = detailsElement.querySelector('.faq-tile__list--subtitle');
            if (firstSubtitle) {
              firstSubtitle.click();
            }
          } else {
            // summaryElement.classList.remove('active');
          }
        });

        this.createSubtitleElements(item, detailsElement, contentElement, titleIndex);
      });
    }

    createSubtitleElements(item, detailsElement, contentElement, titleIndex) {
      const subtitleContainer = document.createElement('div');
      subtitleContainer.classList.add('subtitle-container');

      item.subtitle.forEach((sub, subIndex) => {
        const subtitleElement = document.createElement('span');
        subtitleElement.textContent = sub;
        subtitleElement.classList.add('faq-tile__list--subtitle');

        subtitleElement.addEventListener('click', event => {
          this.handleSubtitleClick(event, sub, item, subIndex, contentElement);

          const allSubtitles = detailsElement.querySelectorAll('.faq-tile__list--subtitle');
          allSubtitles.forEach(el => {
            el.style.opacity = '0.5';
          });
          event.target.style.opacity = '1';
        });

        subtitleContainer.appendChild(subtitleElement);
      });

      detailsElement.appendChild(subtitleContainer);

      if (this.faqTileButtonDiv && titleIndex === 0) {
        this.sidebarElement.appendChild(this.faqTileButtonDiv);
      }
    }

    handleSubtitleClick(event, sub, item, subIndex, contentElement) {
      const faqTileWrappers = document.querySelectorAll('.faq-tile-wrapper');
      const faqTileDiv = document.querySelector('div[id*="_faq_tile_"]');
      const faqTiles = document.querySelectorAll('.faq-tile');

      if (faqTileDiv) {
        faqTileDiv.style.display = 'flex';
      }

      faqTileWrappers.forEach(div => {
        div.classList.remove('faq-tile-wrapper');
      });

      event.target.style.opacity = '1';

      let currentElement = event.target;
      while (currentElement.previousElementSibling) {
        currentElement = currentElement.previousElementSibling;
        if (currentElement.classList.contains('faq-tile__list--title')) {
          currentElement.style.opacity = '1';
          currentElement.classList.add('active');
          break;
        }
      }

      const allBackButtons = document.querySelectorAll('.faq-tile__list--back-button');
      allBackButtons.forEach((button, index) => {
        if (index > 0) {
          button.style.display = 'none';
        }
      });

      faqTiles.forEach((tile, index) => {
        if (index !== faqTiles.length - 1) {
          tile.style.marginInlineEnd = '';
        }
      });

      contentElement.innerHTML = '';

      const subElement = document.createElement('h3');
      subElement.textContent = sub;
      contentElement.appendChild(subElement);

      const descElement = document.createElement('div');
      descElement.innerHTML = item.description[subIndex];
      contentElement.appendChild(descElement);

      const urlHandle = item.urlHandle;
      if (urlHandle) {
        const currentUrl = new URL(window.location);
        currentUrl.hash = urlHandle;
        window.history.pushState({}, '', currentUrl);
      }
    }

    highlightClickedTitle(clickedTitle) {
      if (!clickedTitle) return;

      const sidebarTitles = document.querySelectorAll('.faq-tile__list--title');
      sidebarTitles.forEach(title => {
        if (title.textContent.trim() === clickedTitle) {
          const detailsElement = title.closest('details');
          if (detailsElement) {
            detailsElement.setAttribute('open', '');
            title.classList.add('active');

            const firstSubtitle = detailsElement.querySelector('.faq-tile__list--subtitle');
            if (firstSubtitle) {
              firstSubtitle.click();
            }
          }
        }
      });
    }

    collapseSidebar() {
      const allDetails = document.querySelectorAll('.faq-details');
      const currentHash = window.location.hash.substring(1);

      allDetails.forEach(details => {
        const urlHandle = details.getAttribute('data-url-handle');
        if (urlHandle !== currentHash) {
          details.removeAttribute('open');
          const summary = details.querySelector('summary');
          if (summary) {
            summary.classList.remove('active');
          }
        }
      });
    }

    setupSearchFunctionality() {
      const faqSearchInput = document.getElementById('page-banner-faq-search');
      const resultsContainer = document.querySelector('.faq-search-results');

      if (!faqSearchInput || !resultsContainer) return;

      faqSearchInput.addEventListener('input', this.handleSearch.bind(this, resultsContainer));
      faqSearchInput.addEventListener('focus', function () {
        if (this.value) {
          this.dispatchEvent(new Event('input'));
        }
      });

      document.addEventListener('click', event => {
        const isClickInside = faqSearchInput.contains(event.target) || resultsContainer.contains(event.target);

        if (!isClickInside) {
          resultsContainer.style.display = 'none';
        } else {
          resultsContainer.style.display = 'block';
        }
      });
    }

    handleSearch(resultsContainer, e) {
      const searchQuery = e.target.value.toLowerCase();
      resultsContainer.innerHTML = '';

      if (!searchQuery) {
        resultsContainer.style.display = 'none';
        return;
      }

      // Ensure allTitles is populated correctly
      this.collectAllFaqData();

      // Filter the allTitles array based on the search query
      const filteredFaqs = this.allTitles.filter(item =>
        item.title.toLowerCase().includes(searchQuery)
      );

      const submitButton = document.querySelector('.page-banner__faq-search--button');
      const submitButtons = document.querySelectorAll('.page-banner__faq-search--button');

      if (filteredFaqs && filteredFaqs.length > 0) {
        submitButtons.forEach(button => {
          button.style.backgroundColor = '#111111';
        });

        resultsContainer.style.display = 'block';
        if (resultsContainer.classList.contains('faq-search-message')) {
          resultsContainer.classList.remove('faq-search-message');
        }

        const fragment = document.createDocumentFragment();
        filteredFaqs.forEach(item => {
          this.createSearchResults(item, fragment, resultsContainer);
        });

        if (submitButton) {
          submitButton.addEventListener('click', () => {
            const firstSubtitleElement = document.querySelector('.faq-search-subtitle');
            if (firstSubtitleElement) {
              firstSubtitleElement.click();
            }
          });
        }
      } else {
        if (submitButton) {
          submitButton.style.backgroundColor = '#9E9A99';
        }
        resultsContainer.style.display = 'flex';
        resultsContainer.classList.add('faq-search-message');
        resultsContainer.innerHTML = `<p>No results found for "${searchQuery}"</p>`;
      }
    }

    collectAllFaqData() {
      this.uniqueFaqTextsArray = [];
      this.subtitleTextsArray = [];
      this.subtitleContentArray = [];

      const allFaqSections = document.querySelectorAll('.faq-tile');
      allFaqSections.forEach(faqSection => {
        this.collectFaqData(faqSection);
      });

      const result = this.subtitleContentArray.reduce(
        (obj, text, index) => {
          obj[index] = text.split('\n');
          return obj;
        },
        {}
      );

      // Fix: Ensure the title is correctly mapped
      this.allTitles = this.uniqueFaqTextsArray.map((faq, index) => {
        return {
          title: faq.text, // Use faq.text instead of the entire faq object
          subtitle: this.subtitleTextsArray[index].split('\n'),
          description: result[index],
          urlHandle: faq.urlHandle // Include urlHandle if needed
        };
      });
    }

    createSearchResults(item, fragment, resultsContainer) {
      item.subtitle.forEach(sub => {
        const subtitleElement = document.createElement('p');
        subtitleElement.textContent = sub;
        subtitleElement.classList.add('faq-search-subtitle');
        fragment.appendChild(subtitleElement);
        resultsContainer.appendChild(subtitleElement);

        subtitleElement.addEventListener('click', () => {
          this.hideAllShowList();
          const clickedSubtitle = subtitleElement.textContent.trim();
          const subtitleElements = document.querySelectorAll('.faq-tile__list--subtitle');

          subtitleElements.forEach(el => {
            if (el.textContent.trim() === clickedSubtitle) {
              const detailsElement = el.closest('details');
              if (detailsElement) {
                detailsElement.setAttribute('open', '');
                const summary = detailsElement.querySelector('summary');
                if (summary) {
                  summary.classList.add('active');
                }
              }
              el.click();
            }
          });

          document.querySelectorAll('.faq-tile__content').forEach(content => {
              content.style.display = 'none';
            });

          const faqTileList = document.querySelector('.faq-tile__list');
          if (faqTileList) {
            faqTileList.style.display = 'flex';
          }

          resultsContainer.style.display = 'none';
          resultsContainer.innerHTML = '';
        });
      });
    }
  }
  customElements.define('faq-tile', FaqTile);
}

document.addEventListener('DOMContentLoaded', function () {
  if (!document.querySelector('faq-tile')) {
    const faqTileElement = document.createElement('faq-tile');
    document.body.appendChild(faqTileElement);
  }
});
