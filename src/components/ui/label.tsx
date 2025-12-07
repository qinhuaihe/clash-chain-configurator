import * as React from "react"
import { cn } from "@/lib/utils"
// We might not have @radix-ui/react-label installed, so let's stick to a simple label for now if I don't see it in package.json.
// Checking package.json... dependencies: @radix-ui/react-slot.
// I will just make a simple Label component since I don't want to install extra deps unless needed, but wait, usually shadcn uses radix label.
// Let's implement a simple accessible label.

const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<"label">>(
    ({ className, ...props }, ref) => (
        <label
            ref={ref}
            className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                className
            )}
            {...props}
        />
    )
)
Label.displayName = "Label"

export { Label }
