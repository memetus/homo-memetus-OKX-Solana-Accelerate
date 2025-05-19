import React from 'react';
import styles from '@/components/common/badge/profileBadge/ProfileBadge.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

type Props = {
  text: string;
};

const ProfileBadge = ({ text }: Props) => {
  return <div className={cx('badge-container')}>{text}</div>;
};

export default ProfileBadge;
