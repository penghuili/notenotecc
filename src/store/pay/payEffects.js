import { isLoggedInCat, settingsCat } from '../../shared/react/store/sharedCats';
import { setToastEffect } from '../../shared/react/store/sharedEffects';
import { toastTypes } from '../../shared/react/Toast.jsx';
import { isFreeTryingCat, isVerifyingAppsumoCat } from './payCats';
import { freeTrial, verifyAppsumoCode } from './payNetwork';

export async function freeTrialEffect() {
  if (!isLoggedInCat.get()) {
    return;
  }

  isFreeTryingCat.set(true);

  const { data } = await freeTrial();
  if (data) {
    settingsCat.set(data);
    setToastEffect('Now you have full access for 14 days! Enjoy!');
  }

  isFreeTryingCat.set(false);
}

export async function verifyAppsumoEffect(code) {
  if (!isLoggedInCat.get()) {
    return;
  }

  isVerifyingAppsumoCat.set(true);

  const { data } = await verifyAppsumoCode(code);
  if (data) {
    settingsCat.set(data);
    setToastEffect('Your code is valid! Now you have lifetime access!');
  } else {
    setToastEffect('Your code is invalid.', toastTypes.error);
  }

  isVerifyingAppsumoCat.set(false);
}
