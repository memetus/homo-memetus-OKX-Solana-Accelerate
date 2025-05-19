import { ColorType } from '@/shared/types/ui/color';
import { ReactNode } from 'react';

export type ButtonProps = JSX.IntrinsicElements['button'] & {
  styleType: 'fill' | 'outline' | 'none';
  primary: ColorType;
  secondary: ColorType;
  size: string;
  fontSize: number;
  loading?: boolean;
  icon?: ReactNode;
};
