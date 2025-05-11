declare module '@/components/ui/stepper' {
  import { ForwardRefExoticComponent, RefAttributes, HTMLAttributes } from 'react';
  
  export interface StepProps {
    label: string;
    description?: string;
    icon?: React.ReactNode;
    isCompleted?: boolean;
    isActive?: boolean;
  }
  
  export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
    activeStep: number;
    children: React.ReactNode;
  }
  
  export const Step: ForwardRefExoticComponent<StepProps & RefAttributes<HTMLDivElement>>;
  export const Stepper: ForwardRefExoticComponent<StepperProps & RefAttributes<HTMLDivElement>>;
}
