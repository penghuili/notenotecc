import toast from 'react-hot-toast';

import { httpErrorCodes } from '../../js/httpErrorCodes';
import { isValidEmail } from '../../js/regex';
import { eventEmitter, eventEmitterEvents } from '../eventEmitter';
import { HTTP } from '../HTTP';
import { idbStorage } from '../indexDB';
import { appName, resetAtoms } from '../initShared';
import { LocalStorage } from '../LocalStorage';
import { routeHelpers } from '../routeHelpers';
import { getAtomValue, updateAtomValue } from './atomHelpers';
import {
  authErrorAtom,
  isChangingEmailAtom,
  isChangingPasswordAtom,
  isCheckingRefreshTokenAtom,
  isDeletingAccountAtom,
  isDisabling2FAAtom,
  isEnabling2FAAtom,
  isGenerating2FAAtom,
  isLoadingAccountAtom,
  isLoadingSettingsAtom,
  isLoggedInAtom,
  isLoggingOutFromAllDevicesAtom,
  isResendingVerificationCodeAtom,
  isSigningInAtom,
  isSigningUpAtom,
  isSkipping2FAAtom,
  isVerifying2FAAtom,
  isVerifyingEmailAtom,
  resetAtomsShared,
  settingsAtom,
  toastTypes,
  userAtom,
} from './sharedAtoms';
import {
  changeEmail,
  changePassword,
  checkRefreshToken,
  deleteAccount,
  disable2FA,
  enable2FA,
  fetchAccount,
  fetchSettings,
  generate2FASecret,
  logoutFromAllDevices,
  resendVerificationCode,
  signIn,
  signUp,
  skip2FA,
  verify2FA,
  verifyEmail,
} from './sharedNetwork';

export function goBackEffect() {
  routeHelpers.goBack();
}

export function navigateEffect(path, isReplace) {
  if (isReplace) {
    routeHelpers.replace(path);
  } else {
    routeHelpers.navigate(path);
  }
}

export function setToastEffect(message, type) {
  if (type === toastTypes.critical) {
    toast.error(message);
  } else {
    toast.success(message);
  }
}

export function clearAuthErrorEffect() {
  updateAtomValue(authErrorAtom, null);
}

export function initEffect() {
  updateAtomValue(isCheckingRefreshTokenAtom, true);

  const { isValid } = checkRefreshToken();

  isLoggedInEffect(isValid);
  updateAtomValue(isCheckingRefreshTokenAtom, false);

  window.addEventListener('focus', async () => {
    try {
      await HTTP.refreshTokenIfNecessary(2 * 60 * 1000);
      // eslint-disable-next-line no-empty
    } catch (e) {}
  });
}

export async function signUpEffect(email, password) {
  if (email && !isValidEmail(email)) {
    updateAtomValue(authErrorAtom, 'Please use a valid email.');
    return;
  }

  updateAtomValue(isSigningUpAtom, true);
  const { error } = await signUp(email, password);

  if (error) {
    if (error.errorCode === httpErrorCodes.NO_USERNAME_OR_EMAIL) {
      updateAtomValue(authErrorAtom, 'Please enter your email.');
    } else if (error.errorCode === httpErrorCodes.ALREADY_EXISTS) {
      updateAtomValue(authErrorAtom, 'This email is used.');
    } else {
      updateAtomValue(authErrorAtom, 'Sign up failed.');
    }
  } else {
    isLoggedInEffect(true);
    navigateEffect('/');
  }

  updateAtomValue(isSigningUpAtom, false);
}

export async function resendVerificationCodeEffect() {
  updateAtomValue(isResendingVerificationCodeAtom, true);
  const { data } = await resendVerificationCode();

  if (data) {
    updateAtomValue(userAtom, data);

    setToastEffect('Verification code is sent, you should get another email.');
  } else {
    setToastEffect('Something is wrong', toastTypes.critical);
  }

  updateAtomValue(isResendingVerificationCodeAtom, false);
}

export async function verifyEmailEffect(code) {
  updateAtomValue(isVerifyingEmailAtom, true);
  const { data } = await verifyEmail(code);

  if (data) {
    updateAtomValue(userAtom, data);
    setToastEffect('Your email is verified!');
  } else {
    setToastEffect('Something is wrong', toastTypes.critical);
  }

  updateAtomValue(isVerifyingEmailAtom, false);
}

export async function signInEffect(email, password) {
  updateAtomValue(isSigningInAtom, true);

  const { data, error } = await signIn(email, password);
  if (error) {
    if (error.errorCode === httpErrorCodes.NOT_FOUND) {
      updateAtomValue(authErrorAtom, 'This user does not exist.');
    } else if (error.errorCode === httpErrorCodes.NO_PASSWORD) {
      updateAtomValue(authErrorAtom, 'Please signup first.');
    } else {
      updateAtomValue(authErrorAtom, 'Sign in failed.');
    }
  } else {
    if (data.tempToken) {
      navigateEffect('/sign-in/2fa');
    } else {
      isLoggedInEffect(!!data);
      navigateEffect('/');
    }
  }

  updateAtomValue(isSigningInAtom, false);
}

export async function skip2FAEffect() {
  updateAtomValue(isSkipping2FAAtom, true);

  const { data } = await skip2FA();
  if (data) {
    isLoggedInEffect(!!data);
    setToastEffect('2FA is skipped.');
  }

  updateAtomValue(isSkipping2FAAtom, false);
}

export async function verify2FAEffect(code) {
  updateAtomValue(isVerifying2FAAtom, true);

  const { data, error } = await verify2FA(code);
  if (error) {
    if (error.errorCode === httpErrorCodes.UNAUTHORIZED) {
      updateAtomValue(authErrorAtom, 'Your session is expired, please go back to sign in again.');
    } else if (error.errorCode === httpErrorCodes.FORBIDDEN) {
      updateAtomValue(authErrorAtom, 'Invalid code, please enter a new one.');
    } else {
      updateAtomValue(authErrorAtom, 'Sign in failed.');
    }
  } else {
    isLoggedInEffect(!!data);
    navigateEffect('/');
  }

  updateAtomValue(isVerifying2FAAtom, false);
}

export async function generate2FASecretEffect() {
  updateAtomValue(isGenerating2FAAtom, true);

  const { data } = await generate2FASecret();
  if (data) {
    updateAtomValue(userAtom, prev => ({ ...prev, twoFactorUri: data.uri }));
  }

  updateAtomValue(isGenerating2FAAtom, false);
}

export async function enable2FAEffect(code) {
  updateAtomValue(isEnabling2FAAtom, true);

  const { data } = await enable2FA(code);
  if (data) {
    updateAtomValue(userAtom, data);
    setToastEffect('2FA is enabled.');
  }

  updateAtomValue(isEnabling2FAAtom, false);
}

export async function disable2FAEffect(code) {
  updateAtomValue(isDisabling2FAAtom, true);

  const { data } = await disable2FA(code);
  if (data) {
    updateAtomValue(userAtom, data);
    setToastEffect('2FA is disabled.');
  }

  updateAtomValue(isDisabling2FAAtom, false);
}

export async function logOutEffect() {
  resetAtomsShared();

  await idbStorage.clear();
  LocalStorage.clear();
}

export async function resetEffect() {
  resetAtomsShared();
  resetAtoms();

  await idbStorage.clear();
  LocalStorage.clear();
}

export async function logOutFromAllDevicesEffect() {
  updateAtomValue(isLoggingOutFromAllDevicesAtom, true);

  const { data } = await logoutFromAllDevices();
  if (data) {
    await logOutEffect();
  }

  updateAtomValue(isLoggingOutFromAllDevicesAtom, false);
}

export function isLoggedInEffect(loggedIn) {
  updateAtomValue(isLoggedInAtom, loggedIn);

  if (loggedIn) {
    eventEmitter.emit(eventEmitterEvents.loggedIn);
    updateAtomValue(authErrorAtom, '');
    fetchAccountEffect();
    if (appName) {
      fetchSettingsEffect();
    }
  }
}

export async function fetchAccountEffect(silent) {
  const cachedAccount = LocalStorage.get(`${appName}-account`);
  if (cachedAccount) {
    updateAtomValue(userAtom, cachedAccount);
  }

  if (!silent && !cachedAccount) {
    updateAtomValue(isLoadingAccountAtom, true);
  }

  const { data } = await fetchAccount();

  if (data) {
    updateAtomValue(userAtom, data);
  }

  updateAtomValue(isLoadingAccountAtom, false);
}

export async function fetchSettingsEffect(silent) {
  const cachedSettings = LocalStorage.get(`${appName}-settings`);
  if (cachedSettings) {
    updateAtomValue(settingsAtom, cachedSettings);
  }

  if (!silent && !cachedSettings) {
    updateAtomValue(isLoadingSettingsAtom, true);
  }

  const { data } = await fetchSettings();

  if (data) {
    updateAtomValue(settingsAtom, data);

    eventEmitter.emit(eventEmitterEvents.settingsFetched, data);
  }

  if (!silent) {
    updateAtomValue(isLoadingSettingsAtom, false);
  }
}

export async function deleteAccountEffect() {
  updateAtomValue(isDeletingAccountAtom, true);

  const { data } = await deleteAccount();

  if (data) {
    logOutEffect();
    setToastEffect('Your account is deleted.');
  } else {
    setToastEffect('Something went wrong, please try again.', toastTypes.critical);
  }

  updateAtomValue(isDeletingAccountAtom, false);
}

export async function changeEmailEffect(newEmail, code, onSucceeded) {
  updateAtomValue(isChangingEmailAtom, true);

  const { data, error } = await changeEmail(newEmail, code);

  if (data) {
    updateAtomValue(userAtom, data);
    setToastEffect('Your email is changed!');
    if (onSucceeded) {
      onSucceeded();
    }
  } else {
    if (error.errorCode === httpErrorCodes.NO_USERNAME_OR_EMAIL) {
      updateAtomValue(authErrorAtom, 'Please enter your email.');
    } else if (error.errorCode === httpErrorCodes.ALREADY_EXISTS) {
      updateAtomValue(authErrorAtom, 'This email is used.');
    } else if (error.errorCode === httpErrorCodes.INVALID_CODE) {
      updateAtomValue(authErrorAtom, 'Your code is invalid anymore, please trigger it again.');
    } else {
      updateAtomValue(authErrorAtom, 'Something went wrong, please try again.');
    }
  }

  updateAtomValue(isChangingEmailAtom, false);
}

export async function changePasswordEffect(currentPassword, newPassword) {
  updateAtomValue(isChangingPasswordAtom, true);

  const { email } = getAtomValue(userAtom);
  const { data } = await changePassword(email, currentPassword, newPassword);

  if (data) {
    updateAtomValue(userAtom, data);
    setToastEffect('Your password is changed! Please login again.');
    logOutEffect();
  } else {
    setToastEffect(
      'Something went wrong, your current password may be wrong.',
      toastTypes.critical
    );
  }

  updateAtomValue(isChangingPasswordAtom, false);
}
