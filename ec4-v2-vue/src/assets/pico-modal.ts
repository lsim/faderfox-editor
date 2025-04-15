// TODO: migrate this into Confirm.vue

// Config
const isOpenClass = 'modal-is-open';
const openingClass = 'modal-is-opening';
const closingClass = 'modal-is-closing';
const scrollbarWidthCssVar = '--pico-scrollbar-width';
const animationDuration = 200; // ms

// Open modal
export const openModal = (modal: HTMLDialogElement) => {
  const { documentElement: html } = document;
  const scrollbarWidth = getScrollbarWidth();
  if (scrollbarWidth) {
    html.style.setProperty(scrollbarWidthCssVar, `${scrollbarWidth}px`);
  }
  html.classList.add(isOpenClass, openingClass);
  setTimeout(() => {
    html.classList.remove(openingClass);
  }, animationDuration);
  modal.showModal();
};

// Close modal
export const closeModal = (modal: HTMLDialogElement) => {
  const { documentElement: html } = document;
  html.classList.add(closingClass);
  setTimeout(() => {
    html.classList.remove(closingClass, isOpenClass);
    html.style.removeProperty(scrollbarWidthCssVar);
    modal.close();
  }, animationDuration);
};

// Get scrollbar width
const getScrollbarWidth = () => {
  return window.innerWidth - document.documentElement.clientWidth;
};
