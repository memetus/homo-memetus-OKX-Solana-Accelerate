import React from 'react';
import styles from '@/components/common/card/stepCard/StepCard.module.scss';
import classNames from 'classnames/bind';
import CheckIcon from '@/public/icon/fill-check-icon.svg';
import EmptyIcon from '@/public/icon/empty-check-icon.svg';

const cx = classNames.bind(styles);

type Props = {
  step: number;
  empty: boolean;
  title: string;
  desc: string;
  currentStep: number;
  setStep: (step: number) => void;
};

const StepCard = ({
  step,
  empty,
  title,
  desc,
  currentStep,
  setStep,
}: Props) => {
  return (
    <button
      className={cx('card-wrapper', { highlight: step === currentStep })}
      disabled={step > 3}
      onClick={() => setStep(step)}
    >
      <div className={cx('left-container')}>
        <div className={cx('check-icon')}>
          {!empty ? (
            <EmptyIcon viewBox="0 0 20 20" className={cx('icon')} />
          ) : (
            <CheckIcon viewBox="0 0 20 20" className={cx('icon')} />
          )}
        </div>
        {step !== 4 && <div className={cx('check-line')}></div>}
      </div>
      <div className={cx('text-container')}>
        <p className={cx('step-index')}>STEP {step}</p>
        <p className={cx('step-title')}>{title}</p>
        <p className={cx('step-desc')}>{desc}</p>
      </div>
    </button>
  );
};

export default StepCard;
