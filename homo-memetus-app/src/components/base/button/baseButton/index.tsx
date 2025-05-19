import React, { useMemo } from 'react';
import styles from '@/components/base/button/baseButton/BaseButton.module.scss';
import classNames from 'classnames/bind';
import { ButtonProps } from '@/shared/types/ui/button';
import { COLOR } from '@/shared/constants/color';

const cx = classNames.bind(styles);

const BaseButton = ({
  title,
  type = 'button',
  role = 'button',
  styleType,
  primary,
  secondary,
  size,
  fontSize,
  loading = false,
  icon = undefined,
  onClick,
  ...rest
}: ButtonProps) => {
  const buttonStyle = useMemo(() => {
    return {
      backgroundColor: COLOR[secondary],
      borderColor: COLOR[primary],
      padding: size,
    };
  }, [primary, secondary, size, loading]);

  const textStyle = useMemo(() => {
    return {
      color: COLOR[primary],
      fontSize: `${fontSize}px`,
    };
  }, [primary, fontSize]);

  return (
    <button
      onClick={onClick}
      type={type}
      role={role}
      className={cx('button')}
      {...rest}
      style={buttonStyle}
    >
      {icon && icon}
      <span style={textStyle} className={cx('text', { loading })}>
        {title}
      </span>
      {loading && <div></div>}
    </button>
  );
};

export default BaseButton;
