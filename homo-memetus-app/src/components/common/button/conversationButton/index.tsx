import React, { useCallback, useMemo, useState } from 'react';
import styles from '@/components/common/button/conversationButton/ConversationButton.module.scss';
import classNames from 'classnames/bind';
import TargetIcon from '@/public/icon/target-icon.svg';
import ConfirmIcon from '@/public/icon/confirm-icon.svg';

const cx = classNames.bind(styles);

type Props = {
  type: 'confirm' | 'restart' | 'confirmed' | 'start' | 'strategy' | 'retry';
  onClick: () => void;
  disable?: boolean;
};

const ConversationButton = ({ type, onClick, disable = false }: Props) => {
  const buttonText = useMemo(() => {
    return type === 'confirm'
      ? 'Confirm'
      : type === 'confirmed'
        ? 'Confirmed'
        : type === 'start'
          ? 'Start'
          : type === 'restart'
            ? 'Restart'
            : type === 'retry'
              ? 'Retry'
              : 'Go to Strategy';
  }, [type]);

  const [buttonType, setButtonType] = useState<string>(buttonText);

  const buttonIcon = useCallback(() => {
    if (type === 'restart') {
      return <TargetIcon viewBox="0 0 20 20" className={cx('restart-icon')} />;
    } else if (type === 'confirm') {
      return <ConfirmIcon viewBox="0 0 18 15" className={cx('confirm-icon')} />;
    } else if (type === 'confirmed') {
      return (
        <ConfirmIcon viewBox="0 0 18 15" className={cx('confirmed-icon')} />
      );
    }
  }, [type]);

  return (
    <button
      className={cx('button-container')}
      disabled={
        type === 'confirmed' || buttonType === 'Confirmed' ? true : disable
      }
      onClick={(e) => {
        if (type === 'confirm') {
          setButtonType('Confirmed');
        }
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      {buttonIcon()}
      <span className={cx('button-text')}>{buttonType}</span>
    </button>
  );
};

export default ConversationButton;
