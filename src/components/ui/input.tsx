import * as React from "react"

import { cn } from "../lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <div>
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-gray-400 px-3 py-2 text-sm outline-none",
          className,
        )}
        ref={ref}
        {...props}
      />
      {props.required && !props.value &&
        <div className="text-xs text-red-500 opacity-85">
          Campo obrigatório
        </div>
      }
    </div>
  )
})
Input.displayName = "Input"

export { Input }

