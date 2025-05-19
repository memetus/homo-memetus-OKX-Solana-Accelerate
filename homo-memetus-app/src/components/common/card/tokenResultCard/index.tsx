import React from 'react';
import styles from '@/components/common/card/tokenResultCard/TokenResultCard.module.scss';
import classNames from 'classnames/bind';
import ProfileBadge from '@/components/common/badge/profileBadge';
import { getShortenAddr } from '@/shared/utils/format';
import { useCopy } from '@/shared/hooks/useCopy';
import CopyIcon from '@/public/icon/copy-icon.svg';
import CopyCheckIcon from '@/public/icon/copy-check-icon.svg';
import ConversationButton from '@/components/common/button/conversationButton';
import { ConversationTokenResult } from '@/shared/types/data/conversation.type';

const cx = classNames.bind(styles);

type Props = ConversationTokenResult & {
  handler: {
    name: 'restart';
    onClick: () => void;
  };
};

const TokenResultCard = ({ coins, handler }: Props) => {
  const { textCopy, copyText } = useCopy();

  return (
    <div className={cx('assistant-container')}>
      <div className={cx('inner')}>
        <div className={cx('badge')}>
          <ProfileBadge text="A" />
        </div>
        <div className={cx('wrapper')}>
          <div className={cx('strategy-wrapper')}>
            <p className={cx('strategy-text')}>
              {'Here is my recommendation based on you requirement.'}
            </p>
          </div>
          <table className={cx('table')}>
            <thead className={cx('t-header')}>
              <tr className={cx('t-row')}>
                <th className={cx('token-text')}>Token</th>
                <th className={cx('address-text')}>CA</th>
                <th className={cx('comment-text')}>Investment Opinion</th>
              </tr>
            </thead>
            <tbody className={cx('t-body')}>
              {coins.map((token) => {
                return (
                  <tr key={token.address} className={cx('t-row')}>
                    <td className={cx('token-text')}>{token.name}</td>
                    <td className={cx('address-text')}>
                      {getShortenAddr(token.address)}
                      <button
                        className={cx('copy-button')}
                        onClick={() => textCopy(token.address)}
                      >
                        {copyText === token.address ? (
                          <CopyCheckIcon
                            viewBox="0 0 24 24"
                            className={cx('copy-button-icon')}
                          />
                        ) : (
                          <CopyIcon
                            viewBox="0 0 24 24"
                            className={cx('copy-button-icon')}
                          />
                        )}
                      </button>
                    </td>
                    <td className={cx('body-comment-text')}>
                      {token.analysis}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className={cx('button-wrapper')}>
          <ConversationButton type={'restart'} onClick={handler.onClick} />
        </div>
      </div>
    </div>
  );
};

export default TokenResultCard;
