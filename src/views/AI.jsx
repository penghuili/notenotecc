import { Button } from '@radix-ui/themes';
import React, { useCallback, useState } from 'react';

import { renderMarkdown } from '../components/MD.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { AreaField } from '../shared-private/react/AreaField.jsx';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { setToastEffect } from '../shared-private/react/store/sharedEffects.js';
import { toastTypes } from '../shared-private/react/Toast.jsx';
import { getSuggestion } from '../store/ai/aiNetwork.js';

export const AI = React.memo(() => {
  useScrollToTop();

  return (
    <PrepareData>
      <Header />

      <Form />
    </PrepareData>
  );
});

const Header = React.memo(() => {
  return <PageHeader title="AI" fixed hasBack />;
});

const Form = React.memo(() => {
  const [prefix, setPrefix] = useState(
    `Translate this to Chinese, tell me what's the orignal language first:`
  );
  const [propmt, setPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [answer, setAnswer] = useState('');

  const handleSend = useCallback(async () => {
    setIsSending(true);
    const { data } = await getSuggestion(prefix, propmt);
    if (data?.result) {
      setAnswer(data.result);
      setPrompt('');
    } else {
      setToastEffect('Something is wrong', toastTypes.error);
    }
    setIsSending(false);
  }, [prefix, propmt]);

  return (
    <ItemsWrapper>
      <AreaField label="Prompt prefix" value={prefix} onChange={setPrefix} />
      <AreaField label="What's your prompt?" value={propmt} onChange={setPrompt} />

      <Button disabled={isSending || !propmt || !prefix} onClick={handleSend}>
        Send
      </Button>

      {!!answer && renderMarkdown(answer)}
    </ItemsWrapper>
  );
});
