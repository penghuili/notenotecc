import { HTTP } from '../../shared/react/HTTP';
import { appName } from '../../shared/react/initShared';

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
