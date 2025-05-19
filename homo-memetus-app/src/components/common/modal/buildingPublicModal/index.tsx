import React, { useEffect, useRef, useState } from 'react';
import styles from '@/components/common/modal/buildingPublicModal/BuildingPublicModal.module.scss';
import classNames from 'classnames/bind';
import { ModalParamManager } from '@/shared/types/ui/modal';
import StepCard from '@/components/common/card/stepCard';
import DropdownDirectionIcon from '@/public/icon/dropdown-up-arrow-icon.svg';
import { getCookie, setCookie } from 'cookies-next';

const cx = classNames.bind(styles);

type Props = {
  step: number;
  setStep: (step: number) => void;
  params: (typeof ModalParamManager)['buildingpublic-modal'];
};

const BuildingPublicModal = ({ params, step, setStep }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const value = getCookie('homo-memetus-public');
  const [open, setOpen] = useState<boolean>(value === 'true' || !value);
  const [anim, setAnim] = useState<boolean>(false);

  return (
    <div className={cx('modal-wrapper')}>
      <div
        className={cx('modal', {
          open: open && anim,
          close: !open && anim,
          none: !open && !anim,
        })}
        ref={modalRef}
      >
        <StepCard
          step={1}
          empty={true}
          currentStep={step}
          setStep={setStep}
          title="AAA (Ask Agent Anything)"
          desc="Users input their desired trading strategy, which the AI tunes and confirms, recommending appropriate tokens."
        />
        <StepCard
          step={2}
          empty={true}
          currentStep={step}
          setStep={setStep}
          title="Best VIRTual Practice Dashboard"
          desc="A virtual trading dashboard is created based on top strategies. AI agents invest according to these strategies, providing daily token investment suggestions based on top-performing virtual funds."
        />
        <StepCard
          step={3}
          empty={true}
          currentStep={step}
          setStep={setStep}
          title="Survivals Begin"
          desc={`AI agents develop unique traits and undergo natural selection. Fund tokens based on top AI agents compete weekly, with the bottom 20% eliminated and top 20% "breeding" new strategies.`}
        />
        <StepCard
          step={4}
          empty={false}
          currentStep={step}
          setStep={setStep}
          title="Open for Everyone"
          desc="Users can create their own strategy tokens and raise funds. Successful user-generated tokens are deployed on Raydium DEX and join the competition, creating an open ecosystem for both AI and human-generated strategies."
        />
      </div>
      <button
        className={cx('dropdown-button')}
        onClick={() => {
          if (open) {
            setCookie('homo-memetus-public', false);
          } else {
            setCookie('homo-memetus-public', true);
          }
          setOpen(!open);
          setAnim(true);
        }}
      >
        <DropdownDirectionIcon
          viewBox="0 0 330.002 330.002"
          className={cx('dropdown-icon', { open })}
        />
      </button>
    </div>
  );
};

export default BuildingPublicModal;
