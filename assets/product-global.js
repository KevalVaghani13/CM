const productContent = document.getElementsByClassName(
  'product__content'
)[0];
const sprStarRating =
  document.getElementsByClassName('spr-starrating')[0];

if (!productContent && !sprStarRating) {
  if (productContent.classList.contains('text-center')) {
    sprStarRating.style.justifyContent = 'center';
  } else if (productContent.classList.contains('text-right')) {
    sprStarRating.style.justifyContent = 'flex-end';
  } else if (productContent.classList.contains('text-left')) {
    sprStarRating.style.justifyContent = 'flex-start';
  }
}
