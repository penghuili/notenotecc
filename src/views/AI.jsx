import { Button, Flex, IconButton, RadioGroup, Text } from '@radix-ui/themes';
import { RiCameraLine, RiCloseLine } from '@remixicon/react';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { FilePicker } from '../components/FilePicker.jsx';
import { Markdown } from '../components/MarkdownEditor/Markdown.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { fileTypes } from '../lib/constants.js';
import { convertImageTo } from '../lib/convertImage.js';
import { AreaField } from '../shared/react/AreaField.jsx';
import { inputFileToBase64 } from '../shared/react/file.js';
import { ItemsWrapper } from '../shared/react/ItemsWrapper.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { useScrollToTop } from '../shared/react/ScrollToTop.jsx';
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
  return <PageHeader title="AI" hasBack />;
});

const templateKeys = {
  chinese: 'chinese',
  extractTextAndTranslate: 'extractTextAndTranslate',
  empty: 'empty',
};
const templates = {
  [templateKeys.chinese]: `翻译成中文:`,
  [templateKeys.extractTextAndTranslate]: `提取照片里的文本并翻译成中文:`,
  [templateKeys.empty]: ``,
};

const Form = React.memo(() => {
  const [template, setTemplate] = useState(templateKeys.chinese);
  const [prefix, setPrefix] = useState(templates[templateKeys.chinese]);
  const [propmt, setPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(true);
  const [image, setImage] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [answer, setAnswer] = useState('');
  const [tokens, setTokens] = useState(0);

  const handleSend = useCallback(async () => {
    setIsSending(true);

    let imageBase64;
    if (image) {
      const imageBlob = new Blob([image], { type: image.type });
      const webpImage = await convertImageTo(imageBlob, fileTypes.webp);
      imageBase64 = await inputFileToBase64(webpImage);
    }

    const { data } = await getSuggestion(prefix, propmt, imageBase64);
    if (data?.suggestion) {
      setAnswer(data.suggestion);
      setTokens(data.totalTokens);
    } else {
      setToastEffect('Something is wrong', toastTypes.error);
    }
    setIsSending(false);
  }, [image, prefix, propmt]);

  const handleTemplateChange = useCallback(value => {
    setTemplate(value);

    if (value === templateKeys.empty) {
      setPrefix('');
      setPrompt('');
      setShowPrompt(true);
      setShowImage(true);
    } else if (value === templateKeys.extractTextAndTranslate) {
      setPrefix(templates[templateKeys.extractTextAndTranslate]);
      setPrompt('');
      setShowPrompt(false);
      setShowImage(true);
    } else if (value === templateKeys.chinese) {
      setPrefix(templates[templateKeys.chinese]);
      setPrompt('');
      setShowPrompt(true);
      setShowImage(false);
    }
  }, []);

  const handleClearPrefix = useCallback(() => {
    setPrefix('');
  }, []);

  const handleClearPrompt = useCallback(() => {
    setPrompt('');
  }, []);

  const handlePickPhoto = useCallback(files => {
    setImage(files[0]);
  }, []);

  return (
    <ItemsWrapper>
      <RadioGroup.Root value={template} onValueChange={handleTemplateChange} name="template">
        <RadioGroup.Item value={templateKeys.chinese}>Translate to Chinese</RadioGroup.Item>
        <RadioGroup.Item value={templateKeys.extractTextAndTranslate}>
          Extract Text and Translate to Chinese
        </RadioGroup.Item>
        <RadioGroup.Item value={templateKeys.empty}>Custom</RadioGroup.Item>
      </RadioGroup.Root>

      <InputWrapper>
        <AreaField label="Prompt prefix" value={prefix} onChange={setPrefix} />
        <IconWrapper>
          <IconButton onClick={handleClearPrefix} variant="ghost">
            <RiCloseLine />
          </IconButton>
        </IconWrapper>
      </InputWrapper>

      {showPrompt && (
        <InputWrapper>
          <AreaField label="What's your prompt?" value={propmt} onChange={setPrompt} />
          <IconWrapper>
            <IconButton onClick={handleClearPrompt} variant="ghost">
              <RiCloseLine />
            </IconButton>
          </IconWrapper>
        </InputWrapper>
      )}

      {showImage && (
        <Flex align="start" my="4">
          <FilePicker takePhoto onSelect={handlePickPhoto}>
            <IconButton text="Pick">
              <RiCameraLine />
            </IconButton>
          </FilePicker>

          {!!image && <Image src={URL.createObjectURL(image)} alt="image" />}
        </Flex>
      )}

      <Button disabled={isSending || (!propmt && !prefix)} onClick={handleSend}>
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

const Image = styled.img`
  width: 300px;
`;
