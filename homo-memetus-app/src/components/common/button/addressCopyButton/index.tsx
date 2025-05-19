import React from 'react';
import styles from '@/components/common/button/addressCopyButton/AddressCopyButton.module.scss';
import classNames from 'classnames/bind';
import { useCopy } from '@/shared/hooks/useCopy';
import CopyIcon from '@/public/icon/copy-icon.svg';
import CopyCheckIcon from '@/public/icon/copy-check-icon.svg';

const cx = classNames.bind(styles);

type Props = {
  name: string;
  address: string;
};

const AddressCopyButton = ({ name, address }: Props) => {
  const { isCopied, textCopy } = useCopy();
  return (
    <button className={cx('copy-button')} onClick={() => textCopy(address)}>
      <span className={cx('button-label')}>{name}</span>
      {isCopied ? (
        <CopyCheckIcon viewBox="0 0 24 24" className={cx('copy-button-icon')} />
      ) : (
        <CopyIcon viewBox="0 0 24 24" className={cx('copy-button-icon')} />
      )}
    </button>
  );
};

export default AddressCopyButton;
