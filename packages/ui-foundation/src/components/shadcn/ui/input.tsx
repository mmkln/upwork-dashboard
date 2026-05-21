import * as React from "react"

import { cn } from "../../../lib/cn"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-target w-full rounded-control border border-control-border bg-control px-component text-ui text-text-primary shadow-none transition-colors duration-motion-fast ease-motion-standard file:border-0 file:bg-transparent file:text-label file:text-text-primary placeholder:text-text-placeholder hover:bg-control-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-control-selected disabled:text-text-muted",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
