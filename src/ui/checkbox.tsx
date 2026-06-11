import * as React from "react"
import { IconCheck } from "@tabler/icons-react"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', onCheckedChange, checked, onChange, ...props }, ref) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className={`relative flex items-center ${className}`}>
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          className="peer h-5 w-5 appearance-none rounded-md border border-white/20 bg-white/5 outline-none transition-all checked:border-indigo-500 checked:bg-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <IconCheck
          size={14}
          stroke={3}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"
