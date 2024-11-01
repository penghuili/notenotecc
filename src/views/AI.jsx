import { Button, Radio, RadioGroup, TextArea, Typography } from '@douyinfe/semi-ui';
import { RiCameraLine, RiCloseLine } from '@remixicon/react';
import React, { useCallback, useState } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { FullscreenPopup } from '../components/FullscreenPopup.jsx';
import { Markdown } from '../components/MarkdownEditor/Markdown.jsx';
import { TakePhoto } from '../components/TakePhoto.jsx';
import { useImageLocalUrl } from '../lib/useImageLocalUrl.js';
import { inputFileToBase64 } from '../shared/browser/file.js';
import { PageContent } from '../shared/browser/PageContent.jsx';
import { setToastEffect } from '../shared/browser/store/sharedEffects.js';
import { toastTypes } from '../shared/browser/Toast.jsx';
import { Flex } from '../shared/semi/Flex.jsx';
import { IconButton } from '../shared/semi/IconButton.jsx';
import { ItemsWrapper } from '../shared/semi/ItemsWrapper.jsx';
import { PageHeader } from '../shared/semi/PageHeader.jsx';
import { getSuggestion } from '../store/ai/aiNetwork.js';

export const AI = fastMemo(() => {
  return (
    <PageContent>
      <Header />

      <Form />
    </PageContent>
  );
});

const Header = fastMemo(() => {
  return <PageHeader title="AI" hasBack />;
});

const templateKeys = {
  chinese: 'chinese',
  extractTextAndTranslate: 'extractTextAndTranslate',
  empty: 'empty',
};
const templates = {
  [templateKeys.chinese]: `翻译成中文:`,
  [templateKeys.extractTextAndTranslate]: `Extract the text from this image, after you get the text, let me know the language, no need to send the original text back, but please translate the text to Chinese:`,
  [templateKeys.empty]: ``,
};

const imageCat = createCat(null);

const Form = fastMemo(() => {
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
      <RadioGroup
        value={template}
        onChange={e => handleTemplateChange(e.target.value)}
        mode="advanced"
      >
        <Radio value={templateKeys.chinese}>Translate to Chinese</Radio>
        <Radio value={templateKeys.extractTextAndTranslate}>
          Extract Text and Translate to Chinese
        </Radio>
        <Radio value={templateKeys.empty}>Custom</Radio>
      </RadioGroup>

      <InputWrapper>
        <TextArea label="Prompt prefix" value={prefix} onChange={v => setPrefix(v)} />
        <IconWrapper>
          <IconButton onClick={handleClearPrefix} icon={<RiCloseLine />} />
        </IconWrapper>
      </InputWrapper>

      {showPrompt && (
        <InputWrapper>
          <TextArea label="What's your prompt?" value={propmt} onChange={v => setPrompt(v)} />
          <IconWrapper>
            <IconButton onClick={handleClearPrompt} icon={<RiCloseLine />} />
          </IconWrapper>
        </InputWrapper>
      )}

      {showImage && (
        <Flex align="start" direction="column" gap="0.5rem" m="2rem 0">
          <IconButton onClick={handleShowCamera} icon={<RiCameraLine />} />

          {!!imageUrl && <Image src={imageUrl} alt="image" />}
        </Flex>
      )}

      <Button disabled={isSending || (!propmt && !prefix)} onClick={handleSend}>
        Send
      </Button>

      {!!answer && <Markdown markdown={answer} />}

      {!!tokens && <Typography.Paragraph>{tokens}</Typography.Paragraph>}

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

const Camera = fastMemo(({ onClose }) => {
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
