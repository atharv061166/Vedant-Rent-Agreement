"use client"

import { forwardRef } from "react"

// 1. Define props to include standard HTML button attributes
interface UiverseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string
}

// 2. Wrap the component in forwardRef
export const UiverseButton = forwardRef<HTMLButtonElement, UiverseButtonProps>(
  ({ text, className, ...props }, ref) => {
    return (
      <button
        // 3. Attach the ref so Radix can find this button's position
        ref={ref}
        
        // 4. Spread ...props so the 'id', 'aria-expanded', and 'onClick' from the Trigger work
        {...props}
        
        // 5. Combine your custom class with any classes passed down (optional but good practice)
        className={`uiverse-btn ${className || ""}`}
      >
        <span className="transition" />
        <span className="gradient" />
        <span className="label">{text}</span>
      </button>
    )
  }
)

// Helper for debugging in React DevTools
UiverseButton.displayName = "UiverseButton"