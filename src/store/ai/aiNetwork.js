import { HTTP } from '../../shared-private/react/HTTP';
import { appName } from '../../shared-private/react/initShared';

export async function getSuggestion(prefix, prompt) {
  try {
    const data = await HTTP.post(appName, `/v1/ai`, {
      prefix,
      prompt,
    });

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
