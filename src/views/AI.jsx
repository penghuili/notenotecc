import { Button, Flex, IconButton, RadioGroup, Text } from '@radix-ui/themes';
import { RiCameraLine, RiCloseLine } from '@remixicon/react';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { FullscreenPopup } from '../components/FullscreenPopup.jsx';
import { Markdown } from '../components/MarkdownEditor/Markdown.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { TakePhoto } from '../components/TakePhoto.jsx';
import { useImageLocalUrl } from '../lib/useImageLocalUrl.js';
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
  [templateKeys.extractTextAndTranslate]: `Extract text from the image and translate the text to Chinese:`,
  [templateKeys.empty]: ``,
};

const imageCat = createCat(null);

const Form = React.memo(() => {
  const [template, setTemplate] = useState(templateKeys.chinese);
  const [prefix, setPrefix] = useState(templates[templateKeys.chinese]);
  const [propmt, setPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(true);
  const imageObject = useCat(imageCat);
  const [showImage, setShowImage] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [answer, setAnswer] = useState('');
  const [tokens, setTokens] = useState(0);
  const [showCamera, setShowCamera] = useState(false);

  const { url: imageUrl, blob: imageBlob } = useImageLocalUrl(imageObject?.hash);

  const handleSend = useCallback(async () => {
    setIsSending(true);

    let imageBase64;
    if (imageBlob) {
      imageBase64 = await inputFileToBase64(imageBlob);
    }

    const { data } = await getSuggestion(prefix, propmt, imageBase64);
    if (data?.suggestion) {
      setAnswer(data.suggestion);
      setTokens(data.totalTokens);
    } else {
      setToastEffect('Something is wrong', toastTypes.error);
    }
    setIsSending(false);
  }, [imageBlob, prefix, propmt]);

  const handleTemplateChange = useCallback(value => {
    setTemplate(value);
    imageCat.reset();

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

  const handleShowCamera = useCallback(() => {
    setShowCamera(true);
  }, []);

  const handleCloseCamera = useCallback(() => {
    setShowCamera(false);
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
        <Flex align="start" my="4" direction="column" gap="2">
          <IconButton onClick={handleShowCamera}>
            <RiCameraLine />
          </IconButton>

          {!!imageUrl && <Image src={imageUrl} alt="image" />}
        </Flex>
      )}

      <Button disabled={isSending || (!propmt && !prefix)} onClick={handleSend}>
        Send
      </Button>

      {!!answer && <Markdown markdown={answer} />}

      {!!tokens && <Text as="p">{tokens}</Text>}

      {!!showCamera && <Camera onClose={handleCloseCamera} />}
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

const Camera = React.memo(({ onClose }) => {
  const handleAddImage = useCallback(
    image => {
      imageCat.set(image);
      onClose();
    },
    [onClose]
  );

  return (
    <FullscreenPopup onBack={onClose}>
      <TakePhoto onSelect={handleAddImage} />
    </FullscreenPopup>
  );
});
