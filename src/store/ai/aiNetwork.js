import { HTTP } from '../../shared/browser/HTTP';
import { appName } from '../../shared/browser/initShared';

export async function getSuggestion(prefix, prompt, imageBase64) {
  try {
    const data = await HTTP.post(appName, `/v1/ai`, {
      prefix,
      prompt,
      imageBase64,
    });

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
