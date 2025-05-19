import React from 'react';
import styles from '@/components/common/input/agentGenInput/AgentGenInput.module.scss';
import classNames from 'classnames/bind';
import { useInput } from '@/states/partial/input/InputContext';

const cx = classNames.bind(styles);

const AgentGenInput = () => {
  const { value, setValue } = useInput();

  const key = 'strategy-generate-input';
  const placeholder = 'How do you want your agent to invest...';

  return (
    <div className={cx('input-container')}>
      <textarea
        value={value}
        name={key}
        id={key}
        className={cx('input')}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
      ></textarea>
    </div>
  );
};

export default AgentGenInput;
