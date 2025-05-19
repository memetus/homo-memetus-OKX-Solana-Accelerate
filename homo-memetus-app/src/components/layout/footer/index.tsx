import React from 'react';
import styles from '@/components/layout/footer/Footer.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const Footer = () => {
  return <footer className={cx('footer-container')}></footer>;
};

export default Footer;
