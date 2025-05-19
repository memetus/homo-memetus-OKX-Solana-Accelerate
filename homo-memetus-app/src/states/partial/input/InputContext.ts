import { Context, createContext, useContext } from 'react';

export type InputContextShape = {
  value: string;
  setValue: (value: string) => void;
};

const defaultValue: InputContextShape = {
  value: '',
  setValue: () => {},
};

export const InputContext: Context<InputContextShape> =
  createContext<InputContextShape>(defaultValue);

export const useInput = () => {
  return useContext(InputContext);
};
