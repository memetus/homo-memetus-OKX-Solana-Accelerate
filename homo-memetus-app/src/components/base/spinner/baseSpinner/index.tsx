import React from 'react';
import styles from '@/components/base/spinner/baseSpinner/BaseSpinner.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  type: 'base' | 'global';
  color: 'light' | 'dark' | 'gray';
  size: number;
};

const BaseSpinner = ({ type, size, color }: Props) => {
  return (
    <div
      className={cx(
        'container',
        type === 'global' ? 'container-global' : 'container-base',
      )}
    >
      <div style={{ width: size }} className={cx(`loader-${color}`)} />
    </div>
  );
};

export default BaseSpinner;
