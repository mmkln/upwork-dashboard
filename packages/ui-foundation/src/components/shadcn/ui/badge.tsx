import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../../lib/cn"

const badgeVariants = cva(
  "inline-flex min-h-control-mini items-center justify-center gap-tag whitespace-nowrap rounded-full border px-control py-0 text-label leading-none align-middle transition-colors duration-motion-fast ease-motion-standard focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-none hover:bg-primary-hover",
        secondary:
          "border-transparent bg-block-subtle text-text-secondary hover:bg-control-hover",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-none hover:bg-destructive/80",
        outline: "text-text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
