export function isNewer(newDate, oldDate) {
  if (!newDate) {
    return false;
  }

  if (!oldDate) {
    return true;
  }

  return newDate > oldDate;
}
