export function disableBodyScroll() {
  document.body.classList.add('no-scroll');
}

export function enableBodyScroll() {
  document.body.classList.remove('no-scroll');
}

export function disablePullToRefresh() {
  document.body.classList.add('no-pull-to-refresh');
}

export function enablePullToRefresh() {
  document.body.classList.remove('no-pull-to-refresh');
}
