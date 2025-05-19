import React from 'react';
import styles from '@/components/common/card/conversationCard/ConversationCard.module.scss';
import classNames from 'classnames/bind';
import ProfileBadge from '@/components/common/badge/profileBadge';
import ConversationButton from '@/components/common/button/conversationButton';
import ReactMarkdown from 'react-markdown';

const cx = classNames.bind(styles);

type Props = {
  type: 'user' | 'assistant';
  content: string;
  handler?: {
    name: 'confirm' | 'confirmed' | 'restart' | 'start' | 'strategy';
    onClick: () => void;
  };
};

const ConversationCard = ({ type, content, handler = undefined }: Props) => {
  return (
    <div
      className={cx(type === 'user' ? 'user-container' : 'assistant-container')}
    >
      <div className={cx('inner')}>
        {type === 'assistant' && (
          <div className={cx('badge')}>
            <ProfileBadge text="A" />
          </div>
        )}
        <span className={cx(`${type}-text`)}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </span>
        {type === 'user' && (
          <div className={cx('badge')}>
            <ProfileBadge text="U" />
          </div>
        )}
        {type === 'assistant' && handler && (
          <div
            className={cx(
              handler.name === 'strategy' ? 'button-list' : 'button-wrapper',
            )}
          >
            {handler.name === 'strategy' && (
              <ConversationButton
                type={'retry'}
                onClick={() => window.location.reload()}
              />
            )}
            <ConversationButton type={handler.name} onClick={handler.onClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationCard;
