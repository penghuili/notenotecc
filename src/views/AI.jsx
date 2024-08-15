import { Button, IconButton, Text } from '@radix-ui/themes';
import { RiCloseLine } from '@remixicon/react';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { Markdown } from '../components/MarkdownEditor/MD.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { AreaField } from '../shared/react/AreaField.jsx';
import { ItemsWrapper } from '../shared/react/ItemsWrapper.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { setToastEffect } from '../shared/react/store/sharedEffects.js';
import { toastTypes } from '../shared/react/Toast.jsx';
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
  const [prefix, setPrefix] = useState(`翻译成中文:`);
  const [propmt, setPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [answer, setAnswer] = useState('');
  const [tokens, setTokens] = useState(0);

  const handleSend = useCallback(async () => {
    setIsSending(true);
    const { data } = await getSuggestion(prefix, propmt);
    if (data?.suggestion) {
      setAnswer(data.suggestion);
      setTokens(data.totalTokens);
    } else {
      setToastEffect('Something is wrong', toastTypes.error);
    }
    setIsSending(false);
  }, [prefix, propmt]);

  const handleClearPrefix = useCallback(() => {
    setPrefix('');
  }, []);

  const handleClearPrompt = useCallback(() => {
    setPrompt('');
  }, []);

  return (
    <ItemsWrapper>
      <InputWrapper>
        <AreaField label="Prompt prefix" value={prefix} onChange={setPrefix} />
        <IconWrapper>
          <IconButton onClick={handleClearPrefix} variant="ghost">
            <RiCloseLine />
          </IconButton>
        </IconWrapper>
      </InputWrapper>
      <InputWrapper>
        <AreaField label="What's your prompt?" value={propmt} onChange={setPrompt} />
        <IconWrapper>
          <IconButton onClick={handleClearPrompt} variant="ghost">
            <RiCloseLine />
          </IconButton>
        </IconWrapper>
      </InputWrapper>

      <Button disabled={isSending || !propmt || !prefix} onClick={handleSend}>
        Send
      </Button>

      {!!answer && <Markdown markdown={answer} />}

      {!!tokens && <Text as="p">{tokens}</Text>}
    </ItemsWrapper>
  );
});

const InputWrapper = styled.div`
  position: relative;
`;
const IconWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`;
