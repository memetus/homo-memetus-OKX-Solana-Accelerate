import React, { useMemo } from 'react';
import styles from '@/components/common/badge/useCountBadge/UseCountBadge.module.scss';
import classNames from 'classnames/bind';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@/shared/constants/api';
import { getUsedCount } from '@/shared/api/strategy/api';
import { useWallet } from '@solana/wallet-adapter-react';
import BaseSpinner from '@/components/base/spinner/baseSpinner';
import { getCookie } from 'cookies-next';

const cx = classNames.bind(styles);

const UseCountBadge = () => {
  const accessToken = getCookie('accessToken');
  const { connected, connecting } = useWallet();
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY.GET_USED_COUNT, accessToken],
    queryFn: () => getUsedCount(accessToken),
  });

  const isOver = useMemo(() => {
    return data && data.userPromptNumber >= 5 ? true : false;
  }, [data, connected, isLoading, connecting]);

  return (
    <div className={cx('badge-container')}>
      {connecting || isLoading ? (
        <BaseSpinner type={'base'} color={'dark'} size={12} />
      ) : (
        <span className={cx('badge-text', { over: isOver })}>
          {!connected || !data ? '-' : `${data?.userPromptNumber} / 5`}
        </span>
      )}
    </div>
  );
};

export default UseCountBadge;
