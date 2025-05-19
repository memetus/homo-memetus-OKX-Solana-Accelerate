import React from 'react';
import styles from '@/components/common/card/loadingChatCard/LoadingChatCard.module.scss';
import classNames from 'classnames/bind';
import ProfileBadge from '../../badge/profileBadge';

const cx = classNames.bind(styles);

const LoadingChatCard = () => {
  return (
    <div className={cx('assistant-container')}>
      <div className={cx('inner')}>
        <div className={cx('badge')}>
          <ProfileBadge text="A" />
        </div>
        <span className={cx('assistant-text')}>
          Searching for suitable memecoins...
        </span>
      </div>
    </div>
  );
};

export default LoadingChatCard;
