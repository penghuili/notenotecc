import { isLoggedInCat, settingsCat } from '../../shared/browser/store/sharedCats';
import { formatDate } from '../../shared/js/date';
import { reviewHistory } from './settingsNetwork';

export async function reviewHistoryEffect() {
  if (!isLoggedInCat.get()) {
    return;
  }

  const currentDate = settingsCat.get()?.historyReviewedOn;
  const today = formatDate(new Date());
  if (currentDate >= today) {
    return;
  }

  const { data } = await reviewHistory(today);
  if (data) {
    settingsCat.set(data);
  }
}
