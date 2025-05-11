"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StepProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  isCompleted?: boolean;
  isActive?: boolean;
}

export const Step = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & StepProps
>(({ label, description, icon, isCompleted, isActive, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium",
          isActive && "border-primary bg-primary text-primary-foreground",
          isCompleted && "border-primary bg-primary text-primary-foreground",
          !isActive && !isCompleted && "border-muted-foreground/20 bg-background text-muted-foreground"
        )}
      >
        {icon || (isCompleted ? "✓" : label.charAt(0))}
      </div>
      <div className="mt-2 text-center">
        <div className={cn(
          "text-sm font-medium",
          isActive && "text-foreground",
          !isActive && "text-muted-foreground"
        )}>
          {label}
        </div>
        {description && (
          <div className="text-xs text-muted-foreground">{description}</div>
        )}
      </div>
    </div>
  );
});

Step.displayName = "Step";

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep: number;
  children: React.ReactNode;
}

export const Stepper = React.forwardRef<
  HTMLDivElement,
  StepperProps
>(({ activeStep, children, className, ...props }, ref) => {
  const steps = React.Children.toArray(children);

  return (
    <div
      ref={ref}
      className={cn(
        "flex w-full justify-between",
        className
      )}
      {...props}
    >
      {steps.map((step, index) => {
        if (React.isValidElement<React.HTMLAttributes<HTMLDivElement> & StepProps>(step)) {
          // Preserve the original props and add our new ones
          return React.cloneElement(step, {
            ...step.props,
            key: index,
            isActive: activeStep === index,
            isCompleted: activeStep > index,
          });
        }
        return step;
      })}
    </div>
  );
});

Stepper.displayName = "Stepper";
