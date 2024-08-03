self.addEventListener('install', () => {
  self.skipWaiting();
  console.log('Service worker installing...');
  // Put your install step here
});

self.addEventListener('activate', () => {
  console.log('Service worker activating...');
  // Put your activate step here
});
