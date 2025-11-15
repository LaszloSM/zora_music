import * as React from "react";
import { cn } from "../../lib/utils";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = [0], onValueChange, max = 100, step = 1, ...props }, ref) => {
    return (
      <input
        type="range"
        ref={ref}
        className={cn(
          "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb",
          className
        )}
        value={value[0]}
        onChange={(e) => onValueChange?.([parseFloat(e.target.value)])}
        max={max}
        step={step}
        {...props}
      />
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
