export function isAndroidPhone() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android/i.test(userAgent) && /mobile/i.test(userAgent);
}

export function isIOS() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const iOS_devices = /iphone|ipad|ipod/;

  // Check if it's an iOS device
  if (iOS_devices.test(userAgent)) {
    return true;
  }

  // Special check for iPad on iOS 13+ (which reports as Mac)
  if (userAgent.includes('mac') && navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {
    return true;
  }

  return false;
}

export function isMobile() {
  return isAndroidPhone() || isIOS();
}
