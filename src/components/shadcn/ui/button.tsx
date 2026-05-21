import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-item whitespace-nowrap rounded-full text-ui transition-colors duration-motion-fast ease-motion-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-none hover:bg-primary-hover",
        destructive:
          "bg-destructive text-destructive-foreground shadow-none hover:bg-destructive/90",
        outline:
          "border border-control-border bg-control shadow-none hover:bg-control-hover hover:text-text-primary",
        secondary:
          "bg-control text-text-secondary shadow-none hover:bg-control-hover hover:text-text-primary",
        ghost: "hover:bg-control-hover hover:text-text-primary",
        link: "text-link underline-offset-4 hover:text-link-hover hover:underline",
      },
      size: {
        default: "h-target px-component",
        sm: "h-control-small px-control text-label",
        lg: "h-control-large px-card",
        icon: "h-target w-target",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
