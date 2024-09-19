import { HTTP } from '../../shared/react/HTTP';
import { appName } from '../../shared/react/initShared';

export async function reviewHistory(date) {
  try {
    const data = await HTTP.put(appName, `/v1/settings/history`, { date });

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
