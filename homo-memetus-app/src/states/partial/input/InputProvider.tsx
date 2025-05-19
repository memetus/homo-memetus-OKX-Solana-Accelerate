import React, { ReactNode, useMemo, useState } from 'react';
import { InputContext } from '@/states/partial/input/InputContext';

type Props = {
  children: ReactNode;
};

const InputProvider = ({ children }: Props) => {
  const [value, setValue] = useState<string>('');

  const contextValue = useMemo(() => {
    return {
      value,
      setValue,
    };
  }, [value]);
  return (
    <InputContext.Provider value={contextValue}>
      {children}
    </InputContext.Provider>
  );
};

export default InputProvider;
