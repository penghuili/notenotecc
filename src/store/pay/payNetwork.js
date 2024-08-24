import { HTTP } from '../../shared/react/HTTP';
import { appName } from '../../shared/react/initShared';

export async function freeTrial() {
  try {
    const data = await HTTP.post(appName, `/v1/user/free-trial`, {});

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
