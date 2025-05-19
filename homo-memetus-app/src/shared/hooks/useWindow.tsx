import { useEffect, useMemo, useState } from 'react';
import { DeviceSizeType } from '@/shared/types/etc/size';

const useWindow = () => {
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [windowHeight, setWindowHeight] = useState<number>(0);
  const [device, setDevice] = useState<DeviceSizeType>('desktop');

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);

    const handleWidthResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleWidthResize);

    const handleHeightResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleHeightResize);

    return () => {
      window.removeEventListener('resize', handleHeightResize);
      window.removeEventListener('resize', handleWidthResize);
    };
  });

  const isMobile = useMemo(() => {
    return device === 'mobile';
  }, [windowWidth, device]);

  const isTablet = useMemo(() => {
    return device === 'tablet';
  }, [windowWidth, device]);

  const isLaptop = useMemo(() => {
    return device === 'laptop';
  }, [windowWidth, device]);

  const isDesktop = useMemo(() => {
    return device === 'desktop';
  }, [windowWidth, device]);

  useEffect(() => {
    if (windowWidth > 1440) {
      setDevice('desktop');
    } else if (windowWidth > 1200) {
      setDevice('laptop');
    } else if (windowWidth > 620) {
      setDevice('tablet');
    } else if (windowWidth <= 600) {
      setDevice('mobile');
    }
  }, [windowWidth]);

  const isLarge = useMemo(() => {
    return device === 'desktop' || device === 'laptop';
  }, [device]);

  return {
    windowWidth,
    windowHeight,
    device,
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    isLarge,
  };
};

export default useWindow;
