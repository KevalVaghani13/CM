
const sectionIds = document.querySelectorAll('.section-before-and-after');

function slideBeforeAfter(sectionId) {
  let isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  let slideValue = document.querySelector(
    `#section-before-and-after-${sectionId} input[type="range"]`
  ).value;

  if (isRTL) {
    slideValue = 100 - slideValue;
  }

  let handleValue = document.querySelector(
    `#section-before-and-after-${sectionId} .ims-slider .ims-handle-line`
  );

  document.querySelector(
    `#section-before-and-after-${sectionId} .ims-image-after`
  ).style.clipPath =
    'polygon(0 0,' +
    slideValue +
    '% 0,' +
    slideValue +
    '% 100%, 0 100%)';
  handleValue.style.left = slideValue + '%';
}

sectionIds.forEach((item, i) => {
  const sectionId = item.dataset.id;
  const inputSelector = document.querySelector(
    `#section-before-and-after-${sectionId} input[type="range"]`
  );
  inputSelector.addEventListener(
    'input',
    event => (
      slideBeforeAfter(sectionId)
    )
  );
});

if (Shopify.designMode) {

  document.addEventListener('shopify:section:load', function (event) {
    sectionIds.forEach((item, i) => {
      const sectionId = item.dataset.id;
      const inputSelector = document.querySelector(
        `#section-before-and-after-${sectionId} input[type="range"]`
      );
      inputSelector.addEventListener('input', () => slideBeforeAfter(sectionId));
    });
  });

  document.addEventListener('change', (e) => {
    if (e.target.matches('.section-before-and-after input[type="range"]')) {
      const sectionId = e.target.closest('.section-before-and-after').dataset.id;
      slideBeforeAfter(sectionId);
    }
  });

}


