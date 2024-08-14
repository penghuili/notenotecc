import { HTTP } from '../../shared/react/HTTP';
import { appName } from '../../shared/react/initShared';

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
