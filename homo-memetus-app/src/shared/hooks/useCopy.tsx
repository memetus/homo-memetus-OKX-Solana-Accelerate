import { useCallback, useState } from 'react';

export const useCopy = () => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [copyText, setCopyText] = useState<string | null>(null);
  const handleTextCopy = useCallback((text: string) => {
    setCopyText(text);
    navigator.clipboard.writeText(text);

    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
      setCopyText(null);
    }, 2000);
  }, []);

  const handleImageCopy = useCallback((image: string) => {}, []);

  return {
    isCopied,
    copyText,
    textCopy: handleTextCopy,
    imageCopy: handleImageCopy,
  };
};
