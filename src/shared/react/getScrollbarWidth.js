export function getScrollbarWidth() {
  // Create a temporary div element with a scrollbar
  const scrollDiv = document.createElement('div');
  scrollDiv.style.width = '100px';
  scrollDiv.style.height = '100px';
  scrollDiv.style.overflow = 'scroll';
  scrollDiv.style.position = 'absolute';
  scrollDiv.style.top = '-9999px';

  // Append the div to the body
  document.body.appendChild(scrollDiv);

  // Calculate the scrollbar width
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;

  // Remove the div from the body
  document.body.removeChild(scrollDiv);

  return scrollbarWidth;
}

export const widthWithoutScrollbar = window.innerWidth - getScrollbarWidth();
