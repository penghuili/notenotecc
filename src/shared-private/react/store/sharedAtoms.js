import { atom } from 'jotai';

import { updateAtomValue } from './atomHelpers';

export const toastTypes = {
  normal: 'normal',
  critical: 'critical',
};

export const isCheckingRefreshTokenAtom = atom(true);
export const isLoggedInAtom = atom(false);
export const authErrorAtom = atom(null);
export const isSigningUpAtom = atom(false);
export const isResendingVerificationCodeAtom = atom(false);
export const userAtom = atom({});
export const isVerifyingEmailAtom = atom(false);
export const isSigningInAtom = atom(false);
export const isSkipping2FAAtom = atom(false);
export const isVerifying2FAAtom = atom(false);
export const isGenerating2FAAtom = atom(false);
export const isEnabling2FAAtom = atom(false);
export const isDisabling2FAAtom = atom(false);
export const isLoggingOutFromAllDevicesAtom = atom(false);
export const isLoadingAccountAtom = atom(false);
export const settingsAtom = atom(null);
export const isLoadingSettingsAtom = atom(false);
export const isUpdatingSettingsAtom = atom(false);
export const isDeletingAccountAtom = atom(false);
export const isChangingEmailAtom = atom(false);
export const isChangingPasswordAtom = atom(false);

export const expiresAtAtom = atom(get => {
  const settings = get(settingsAtom);
  return settings?.expiresAt;
});
export const twoFactorEnabledAtom = atom(get => {
  const user = get(userAtom);
  return user?.twoFactorEnabled;
});
export const isEmailVerifiedAtom = atom(get => {
  const user = get(userAtom);
  return user?.verified;
});

export function resetAtomsShared() {
  updateAtomValue(isCheckingRefreshTokenAtom, false);
  updateAtomValue(isLoggedInAtom, false);
  updateAtomValue(authErrorAtom, null);
  updateAtomValue(isSigningUpAtom, false);
  updateAtomValue(isResendingVerificationCodeAtom, false);
  updateAtomValue(userAtom, {});
  updateAtomValue(isVerifyingEmailAtom, false);
  updateAtomValue(isSigningInAtom, false);
  updateAtomValue(isSkipping2FAAtom, false);
  updateAtomValue(isVerifying2FAAtom, false);
  updateAtomValue(isGenerating2FAAtom, false);
  updateAtomValue(isEnabling2FAAtom, false);
  updateAtomValue(isDisabling2FAAtom, false);
  updateAtomValue(isLoggingOutFromAllDevicesAtom, false);
  updateAtomValue(isLoadingAccountAtom, false);
  updateAtomValue(settingsAtom, null);
  updateAtomValue(isLoadingSettingsAtom, false);
  updateAtomValue(isUpdatingSettingsAtom, false);
  updateAtomValue(isDeletingAccountAtom, false);
  updateAtomValue(isChangingEmailAtom, false);
  updateAtomValue(isChangingPasswordAtom, false);
}
