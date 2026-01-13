import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        // Priority variants
        high: "border-transparent bg-priority-high/10 text-priority-high",
        medium: "border-transparent bg-priority-medium/10 text-priority-medium",
        low: "border-transparent bg-priority-low/10 text-priority-low",
        // Status variants
        completed: "border-transparent bg-status-completed/10 text-status-completed",
        "in-progress": "border-transparent bg-status-in-progress/10 text-status-in-progress",
        "not-started": "border-transparent bg-status-not-started/10 text-status-not-started",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
