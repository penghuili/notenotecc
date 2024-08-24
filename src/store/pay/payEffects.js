import { isLoggedInCat, settingsCat } from '../../shared/react/store/sharedCats';
import { setToastEffect } from '../../shared/react/store/sharedEffects';
import { isFreeTryingCat } from './payCats';
import { freeTrial } from './payNetwork';

export async function freeTrialEffect() {
  if (!isLoggedInCat.get()) {
    return;
  }

  isFreeTryingCat.set(true);

  const { data } = await freeTrial();
  if (data) {
    settingsCat.set(data);
    setToastEffect('Now you have full access for 30 days! Enjoy!');
  }

  isFreeTryingCat.set(false);
}
